import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          practitioner_id,
          created_at,
          practitioner:practitioners(
            id, first_name, last_name, avatar_url, rating, review_count,
            teleconsultation_enabled, consultation_price,
            specialty:specialties(name, color)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useIsFavorite(practitionerId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorite', user?.id, practitionerId],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('practitioner_id', practitionerId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!practitionerId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (practitionerId: string) => {
      if (!user) throw new Error("Non authentifié");

      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('practitioner_id', practitionerId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, practitioner_id: practitionerId });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite'] });
    },
  });
}
