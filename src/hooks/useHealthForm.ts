import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HealthFormData {
  id?: string;
  patient_profile_id: string;
  blood_type?: string | null;
  height_cm?: string | null;
  weight_kg?: string | null;
  allergies?: string | null;
  chronic_conditions?: string | null;
  current_medications?: string | null;
  surgeries?: string | null;
  family_history?: string | null;
  lifestyle?: string | null;
  vaccination_notes?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  additional_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useHealthForm(profileId: string | undefined) {
  return useQuery({
    queryKey: ["health-form", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data, error } = await (supabase as any)
        .from("health_forms")
        .select("*")
        .eq("patient_profile_id", profileId)
        .maybeSingle();
      if (error) throw error;
      return data as HealthFormData | null;
    },
    enabled: !!profileId,
  });
}

export function useUpsertHealthForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: HealthFormData) => {
      const { id, created_at, updated_at, ...rest } = values;

      const { data: existing } = await (supabase as any)
        .from("health_forms")
        .select("id")
        .eq("patient_profile_id", values.patient_profile_id)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any)
          .from("health_forms")
          .update(rest)
          .eq("patient_profile_id", values.patient_profile_id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("health_forms")
          .insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["health-form", variables.patient_profile_id] });
    },
  });
}
