import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type DocumentType = Database["public"]["Enums"]["document_type"];

export function useDocuments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: profiles } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (!profiles?.length) return [];
      
      const profileIds = profiles.map(p => p.id);
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          practitioner:practitioners(first_name, last_name),
          patient_profile:patient_profiles(first_name, last_name)
        `)
        .in('patient_profile_id', profileIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      file,
      name,
      type,
      patientProfileId,
      description,
      practitionerId,
      appointmentId
    }: { 
      file: File;
      name: string;
      type: DocumentType;
      patientProfileId: string;
      description?: string;
      practitionerId?: string;
      appointmentId?: string;
    }) => {
      if (!user) throw new Error("Non authentifié");
      
      // For now, create a placeholder URL since storage bucket isn't set up
      // In production, you would upload to Supabase Storage
      const fileUrl = URL.createObjectURL(file);
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          name,
          type,
          file_url: fileUrl,
          patient_profile_id: patientProfileId,
          description,
          practitioner_id: practitionerId || null,
          appointment_id: appointmentId || null,
          mime_type: file.type,
          size: file.size,
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
