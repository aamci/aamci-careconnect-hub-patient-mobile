import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Facility {
  id: string;
  name: string;
  type: "clinic" | "hospital" | "cabinet" | "laboratory";
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
}

export function useFacility(facilityId: string) {
  return useQuery({
    queryKey: ["facility", facilityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .eq("id", facilityId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Facility | null;
    },
    enabled: !!facilityId,
  });
}

export const FACILITY_TYPE_LABELS: Record<string, string> = {
  clinic: "Clinique",
  hospital: "Hôpital",
  cabinet: "Cabinet médical",
  laboratory: "Laboratoire",
};
