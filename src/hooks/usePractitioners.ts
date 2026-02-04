import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Specialty {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Practitioner {
  id: string;
  first_name: string;
  last_name: string;
  specialty_id: string | null;
  facility_id: string | null;
  avatar_url: string | null;
  bio: string | null;
  languages: string[];
  accepts_new_patients: boolean;
  teleconsultation_enabled: boolean;
  rating: number | null;
  review_count: number;
  consultation_price: number | null;
  next_availability: string | null;
  specialty?: Specialty;
  facility?: Facility;
}

export function useSpecialties() {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialties")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Specialty[];
    },
  });
}

export function usePractitioners(filters?: {
  specialtyId?: string;
  teleconsultationOnly?: boolean;
  query?: string;
}) {
  return useQuery({
    queryKey: ["practitioners", filters],
    queryFn: async () => {
      let query = supabase
        .from("practitioners")
        .select(`
          *,
          specialty:specialties(*),
          facility:facilities(*)
        `)
        .order("rating", { ascending: false, nullsFirst: false });

      if (filters?.specialtyId) {
        query = query.eq("specialty_id", filters.specialtyId);
      }

      if (filters?.teleconsultationOnly) {
        query = query.eq("teleconsultation_enabled", true);
      }

      const { data, error } = await query;

      if (error) throw error;

      let practitioners = data as Practitioner[];

      // Client-side filtering for name search
      if (filters?.query) {
        const searchLower = filters.query.toLowerCase();
        practitioners = practitioners.filter(
          (p) =>
            p.first_name.toLowerCase().includes(searchLower) ||
            p.last_name.toLowerCase().includes(searchLower) ||
            p.specialty?.name.toLowerCase().includes(searchLower)
        );
      }

      return practitioners;
    },
  });
}

export function usePractitioner(id: string) {
  return useQuery({
    queryKey: ["practitioner", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practitioners")
        .select(`
          *,
          specialty:specialties(*),
          facility:facilities(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Practitioner;
    },
    enabled: !!id,
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Facility[];
    },
  });
}
