import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Practitioner, Facility } from "./usePractitioners";

export interface Appointment {
  id: string;
  patient_profile_id: string;
  practitioner_id: string;
  facility_id: string | null;
  scheduled_at: string;
  duration: number;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  type: "in_person" | "teleconsultation";
  reason: string;
  notes: string | null;
  pre_consultation_answers: Record<string, string> | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  practitioner?: Practitioner;
  facility?: Facility;
}

export function useAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get user's patient profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id);

      if (profilesError) throw profilesError;

      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length === 0) return [];

      // Then get appointments for those profiles
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          practitioner:practitioners(
            *,
            specialty:specialties(*)
          ),
          facility:facilities(*)
        `)
        .in("patient_profile_id", profileIds)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          practitioner:practitioners(
            *,
            specialty:specialties(*)
          ),
          facility:facilities(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: {
      patient_profile_id: string;
      practitioner_id: string;
      facility_id?: string;
      scheduled_at: string;
      duration?: number;
      type: "in_person" | "teleconsultation";
      reason: string;
      notes?: string;
      pre_consultation_answers?: Record<string, string>;
    }) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", variables.id] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduled_at }: { id: string; scheduled_at: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update({ scheduled_at })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", variables.id] });
    },
  });
}
