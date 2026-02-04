import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PatientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  gender: "male" | "female" | "other" | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  social_security_number: string | null;
  profile_type: "self" | "child" | "dependent";
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePatientProfiles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["patient-profiles", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("profile_type");

      if (error) throw error;
      return data as PatientProfile[];
    },
    enabled: !!user,
  });
}

export function usePatientProfile(id: string) {
  return useQuery({
    queryKey: ["patient-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PatientProfile;
    },
    enabled: !!id,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profile: {
      first_name: string;
      last_name: string;
      birth_date?: string | null;
      gender?: "male" | "female" | "other" | null;
      phone?: string | null;
      email?: string | null;
      street?: string | null;
      city?: string | null;
      postal_code?: string | null;
      country?: string | null;
      social_security_number?: string | null;
      profile_type: "self" | "child" | "dependent";
      avatar_url?: string | null;
      is_active?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("patient_profiles")
        .insert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          birth_date: profile.birth_date,
          gender: profile.gender,
          phone: profile.phone,
          email: profile.email,
          street: profile.street,
          city: profile.city,
          postal_code: profile.postal_code,
          country: profile.country,
          social_security_number: profile.social_security_number,
          profile_type: profile.profile_type,
          avatar_url: profile.avatar_url,
          is_active: profile.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profiles"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      id: string;
      first_name?: string;
      last_name?: string;
      birth_date?: string | null;
      gender?: "male" | "female" | "other" | null;
      phone?: string | null;
      email?: string | null;
      street?: string | null;
      city?: string | null;
      postal_code?: string | null;
      country?: string | null;
      social_security_number?: string | null;
      avatar_url?: string | null;
      is_active?: boolean;
    }) => {
      const { id, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from("patient_profiles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["patient-profile", variables.id] });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("patient_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profiles"] });
    },
  });
}
