import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface HealthMetric {
  id: string;
  patient_profile_id: string;
  metric_type: string;
  value: number;
  secondary_value: number | null;
  unit: string;
  note: string | null;
  measured_at: string;
  created_at: string;
}

export const METRIC_TYPES = [
  { key: "weight", label: "Poids", unit: "kg", dual: false, min: 20, max: 300 },
  { key: "blood_pressure", label: "Tension artérielle", unit: "mmHg", dual: true, min: 40, max: 250 },
  { key: "heart_rate", label: "Fréquence cardiaque", unit: "bpm", dual: false, min: 30, max: 220 },
  { key: "glucose", label: "Glycémie", unit: "g/L", dual: false, min: 0.2, max: 6 },
  { key: "temperature", label: "Température", unit: "°C", dual: false, min: 33, max: 43 },
  { key: "oxygen", label: "Saturation O₂", unit: "%", dual: false, min: 50, max: 100 },
] as const;

export type MetricTypeKey = (typeof METRIC_TYPES)[number]["key"];

export function metricLabel(key: string) {
  return METRIC_TYPES.find((m) => m.key === key)?.label ?? key;
}

export function useHealthMetrics(metricType?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["health-metrics", user?.id, metricType ?? "all"],
    queryFn: async () => {
      if (!user) return [] as HealthMetric[];
      const { data: profiles } = await supabase
        .from("patient_profiles")
        .select("id")
        .eq("user_id", user.id);
      const profileIds = (profiles ?? []).map((p) => p.id);
      if (!profileIds.length) return [] as HealthMetric[];

      let query = supabase
        .from("health_metrics")
        .select("*")
        .in("patient_profile_id", profileIds)
        .order("measured_at", { ascending: true });

      if (metricType) query = query.eq("metric_type", metricType);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as HealthMetric[];
    },
    enabled: !!user,
  });
}

export function useAddHealthMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      patient_profile_id: string;
      metric_type: string;
      value: number;
      secondary_value?: number | null;
      unit: string;
      note?: string | null;
      measured_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("health_metrics")
        .insert({
          ...input,
          secondary_value: input.secondary_value ?? null,
          note: input.note ?? null,
          measured_at: input.measured_at ?? new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as HealthMetric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
    },
  });
}

export function useDeleteHealthMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("health_metrics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-metrics"] });
    },
  });
}
