import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PractitionerReview {
  id: string;
  appointment_id: string | null;
  practitioner_id: string;
  patient_profile_id: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  is_visible: boolean;
  report_count: number;
  created_at: string;
  updated_at: string;
  patient_profile?: { first_name: string; last_name: string; avatar_url: string | null };
}

export interface FacilityReview {
  id: string;
  facility_id: string;
  patient_profile_id: string;
  rating: number;
  cleanliness_rating: number | null;
  reception_rating: number | null;
  equipment_rating: number | null;
  comment: string | null;
  is_anonymous: boolean;
  is_visible: boolean;
  report_count: number;
  created_at: string;
  updated_at: string;
  patient_profile?: { first_name: string; last_name: string; avatar_url: string | null };
}

// Practitioner reviews
export function usePractitionerReviews(practitionerId: string) {
  return useQuery({
    queryKey: ["practitioner-reviews", practitionerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioner_reviews" as any)
        .select("*, patient_profile:patient_profiles(first_name, last_name, avatar_url)")
        .eq("practitioner_id", practitionerId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PractitionerReview[];
    },
    enabled: !!practitionerId,
  });
}

export function useHasReviewedAppointment(appointmentId: string) {
  return useQuery({
    queryKey: ["has-reviewed", appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioner_reviews" as any)
        .select("id")
        .eq("appointment_id", appointmentId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!appointmentId,
  });
}

export function useCreatePractitionerReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      appointment_id?: string;
      practitioner_id: string;
      patient_profile_id: string;
      rating: number;
      comment?: string;
      is_anonymous?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("practitioner_reviews" as any)
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["practitioner-reviews", variables.practitioner_id] });
      queryClient.invalidateQueries({ queryKey: ["has-reviewed"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// Facility reviews
export function useFacilityReviews(facilityId: string) {
  return useQuery({
    queryKey: ["facility-reviews", facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_reviews" as any)
        .select("*, patient_profile:patient_profiles(first_name, last_name, avatar_url)")
        .eq("facility_id", facilityId)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as FacilityReview[];
    },
    enabled: !!facilityId,
  });
}

export function useCreateFacilityReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (review: {
      facility_id: string;
      patient_profile_id: string;
      rating: number;
      cleanliness_rating?: number;
      reception_rating?: number;
      equipment_rating?: number;
      comment?: string;
      is_anonymous?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("facility_reviews" as any)
        .insert(review)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["facility-reviews", variables.facility_id] });
    },
  });
}

// Reports
export function useCreateReport() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (report: {
      target_type: "practitioner" | "review" | "facility" | "technical";
      target_id?: string;
      reason: "inappropriate" | "spam" | "harassment" | "misinformation" | "technical_issue" | "other";
      description?: string;
    }) => {
      if (!user) throw new Error("Non authentifié");
      const { data, error } = await supabase
        .from("reports" as any)
        .insert({ ...report, reporter_user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUserReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-reports", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports" as any)
        .select("*")
        .eq("reporter_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Array<{
        id: string;
        target_type: string;
        target_id: string | null;
        reason: string;
        description: string | null;
        status: string;
        created_at: string;
      }>;
    },
    enabled: !!user,
  });
}
