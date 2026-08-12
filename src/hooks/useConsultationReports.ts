import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ConsultationReport {
  id: string;
  appointment_id: string | null;
  patient_profile_id: string;
  practitioner_id: string | null;
  title: string;
  summary: string;
  reason: string | null;
  symptoms: string | null;
  observations: string | null;
  recommendations: string | null;
  treatment: string | null;
  follow_up: string | null;
  follow_up_date: string | null;
  source: "ai_generated" | "practitioner" | "patient_note";
  is_read: boolean;
  created_at: string;
  updated_at: string;
  practitioner?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    specialty?: { name: string } | null;
  } | null;
  appointment?: {
    id: string;
    scheduled_at: string;
    type: "in_person" | "teleconsultation";
    reason: string;
  } | null;
}

const SELECT = `
  *,
  practitioner:practitioners(first_name, last_name, avatar_url, specialty:specialties(name)),
  appointment:appointments(id, scheduled_at, type, reason)
`;

async function getProfileIds(userId: string) {
  const { data } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", userId);
  return (data ?? []).map((p) => p.id);
}

export function useConsultationReports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["consultation-reports", user?.id],
    queryFn: async () => {
      if (!user) return [] as ConsultationReport[];
      const profileIds = await getProfileIds(user.id);
      if (!profileIds.length) return [] as ConsultationReport[];

      const { data, error } = await supabase
        .from("consultation_reports")
        .select(SELECT)
        .in("patient_profile_id", profileIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as ConsultationReport[];
    },
    enabled: !!user,
  });
}

export function useConsultationReport(id?: string) {
  return useQuery({
    queryKey: ["consultation-report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultation_reports")
        .select(SELECT)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as ConsultationReport | null;
    },
    enabled: !!id,
  });
}

export function useMarkReportRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consultation_reports")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-reports"] });
    },
  });
}

/**
 * Generates (via AI) and stores the consultation report for a completed appointment.
 * Returns the existing report if one was already generated.
 */
export function useGenerateConsultationReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const { data: existing } = await supabase
        .from("consultation_reports")
        .select("id")
        .eq("appointment_id", appointmentId)
        .maybeSingle();
      if (existing) return existing.id as string;

      const { data: appointment, error: aptError } = await supabase
        .from("appointments")
        .select(`
          id, scheduled_at, type, reason, notes, duration,
          patient_profile_id, practitioner_id,
          practitioner:practitioners(first_name, last_name, specialty:specialties(name)),
          patient_profile:patient_profiles(first_name, last_name)
        `)
        .eq("id", appointmentId)
        .single();
      if (aptError) throw aptError;

      // Conversation attached to this appointment (if any)
      const { data: threads } = await supabase
        .from("message_threads")
        .select("id")
        .eq("appointment_id", appointmentId);

      let transcript: { sender: string; content: string }[] = [];
      if (threads?.length) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("sender_type, content, created_at")
          .in("thread_id", threads.map((t) => t.id))
          .order("created_at", { ascending: true })
          .limit(200);
        transcript = (msgs ?? []).map((m) => ({
          sender: m.sender_type,
          content: m.content,
        }));
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-consultation-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ appointment, transcript }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Génération du compte rendu impossible");
      }

      const report = await res.json();

      const { data: inserted, error } = await supabase
        .from("consultation_reports")
        .insert({
          appointment_id: appointmentId,
          patient_profile_id: appointment.patient_profile_id,
          practitioner_id: appointment.practitioner_id,
          title: report.title || "Compte rendu de consultation",
          summary: report.summary || "",
          reason: report.reason ?? appointment.reason,
          symptoms: report.symptoms ?? null,
          observations: report.observations ?? null,
          recommendations: report.recommendations ?? null,
          treatment: report.treatment ?? null,
          follow_up: report.follow_up ?? null,
          source: "ai_generated" as const,
        })
        .select("id")
        .single();

      if (error) throw error;
      return inserted.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-reports"] });
    },
  });
}

export function useAddPatientNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      patient_profile_id: string;
      title: string;
      summary: string;
      practitioner_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("consultation_reports")
        .insert({
          patient_profile_id: input.patient_profile_id,
          practitioner_id: input.practitioner_id ?? null,
          title: input.title,
          summary: input.summary,
          source: "patient_note" as const,
          is_read: true,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultation-reports"] });
    },
  });
}
