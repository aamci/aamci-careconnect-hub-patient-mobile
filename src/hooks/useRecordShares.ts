import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RecordShare {
  id: string;
  patient_profile_id: string;
  practitioner_id: string | null;
  share_reports: boolean;
  share_documents: boolean;
  share_metrics: boolean;
  share_health_form: boolean;
  message: string | null;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  practitioner?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    specialty?: { name: string } | null;
  } | null;
  patient_profile?: { first_name: string; last_name: string } | null;
}

export function useRecordShares() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["record-shares", user?.id],
    queryFn: async () => {
      if (!user) return [] as RecordShare[];
      const { data: profiles } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id);
      const profileIds = (profiles ?? []).map((p) => p.id);
      if (!profileIds.length) return [] as RecordShare[];

      const { data, error } = await supabase
        .from("record_shares")
        .select(`
          *,
          practitioner:practitioners(first_name, last_name, avatar_url, specialty:specialties(name)),
          patient_profile:patient_profiles(first_name, last_name)
        `)
        .in("patient_profile_id", profileIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as RecordShare[];
    },
    enabled: !!user,
  });
}

export function useCreateRecordShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      patient_profile_id: string;
      practitioner_id: string;
      share_reports: boolean;
      share_documents: boolean;
      share_metrics: boolean;
      share_health_form: boolean;
      message?: string | null;
      duration_days: number;
    }) => {
      const expires = new Date();
      expires.setDate(expires.getDate() + input.duration_days);

      const { duration_days: _ignored, ...rest } = input;
      const { data, error } = await supabase
        .from("record_shares")
        .insert({
          ...rest,
          message: input.message ?? null,
          expires_at: expires.toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as RecordShare;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["record-shares"] });
    },
  });
}

export function useRevokeRecordShare() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("record_shares")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["record-shares"] });
    },
  });
}

export function isShareActive(share: RecordShare) {
  return !share.revoked_at && new Date(share.expires_at) > new Date();
}
