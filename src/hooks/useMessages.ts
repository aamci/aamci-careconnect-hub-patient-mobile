import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMessageThreads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['message-threads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: profiles } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id);
      
      if (!profiles?.length) return [];
      
      const profileIds = profiles.map(p => p.id);
      
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          practitioner:practitioners(
            id,
            first_name,
            last_name,
            avatar_url,
            specialty:specialties(name)
          ),
          patient_profile:patient_profiles(id, first_name, last_name)
        `)
        .in('patient_profile_id', profileIds)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useThreadMessages(threadId: string | undefined) {
  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: async () => {
      if (!threadId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!threadId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      threadId, 
      content,
      attachments
    }: { 
      threadId: string; 
      content: string;
      attachments?: string[];
    }) => {
      if (!user) throw new Error("Non authentifié");
      
      // Get patient profile for this thread
      const { data: thread } = await supabase
        .from('message_threads')
        .select('patient_profile_id')
        .eq('id', threadId)
        .single();
      
      if (!thread) throw new Error("Thread non trouvé");
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          content,
          sender_id: thread.patient_profile_id,
          sender_type: 'patient',
          status: 'sent',
          attachments: attachments || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update thread's updated_at
      await supabase
        .from('message_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.threadId] });
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });
}

export function useMarkThreadAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (threadId: string) => {
      // Update unread count to 0
      const { error } = await supabase
        .from('message_threads')
        .update({ unread_count: 0 })
        .eq('id', threadId);
      
      if (error) throw error;
      
      // Mark all messages as read
      await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('thread_id', threadId)
        .eq('sender_type', 'practitioner');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });
}

export function useCreateMessageThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      patientProfileId, 
      practitionerId,
      appointmentId
    }: { 
      patientProfileId: string; 
      practitionerId: string;
      appointmentId?: string;
    }) => {
      // Check if thread already exists
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select('id')
        .eq('patient_profile_id', patientProfileId)
        .eq('practitioner_id', practitionerId)
        .single();
      
      if (existingThread) {
        return existingThread;
      }
      
      const { data, error } = await supabase
        .from('message_threads')
        .insert({
          patient_profile_id: patientProfileId,
          practitioner_id: practitionerId,
          appointment_id: appointmentId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] });
    },
  });
}
