import { useNavigate } from "react-router-dom";
import { MessageCircle, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

function useMessageThreads() {
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
          )
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

export default function MessagesPage() {
  const navigate = useNavigate();
  const { data: threads, isLoading } = useMessageThreads();

  const sortedThreads = threads || [];

  return (
    <>
      <PageContainer noPadding className="overflow-x-hidden">
        <Header title="Messages" />
        
        <div className="px-4 pb-4 max-w-lg mx-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="flat" className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : sortedThreads.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Aucun message"
              description="Vos conversations avec les praticiens apparaîtront ici"
            />
          ) : (
            <div className="space-y-2">
              {sortedThreads.map((thread) => (
                <Card 
                  key={thread.id} 
                  hover
                  variant="flat"
                  className={cn(
                    "p-3 sm:p-4",
                    (thread.unread_count || 0) > 0 && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => navigate(`/messages/${thread.id}`)}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <Avatar
                        src={thread.practitioner?.avatar_url || undefined}
                        alt={`${thread.practitioner?.first_name} ${thread.practitioner?.last_name}`}
                        size="md"
                      />
                      {(thread.unread_count || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className={cn(
                            "font-semibold text-foreground text-sm sm:text-base truncate",
                            (thread.unread_count || 0) > 0 && "text-primary"
                          )}>
                            Dr. {thread.practitioner?.first_name} {thread.practitioner?.last_name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {thread.practitioner?.specialty?.name}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(thread.updated_at), { 
                            addSuffix: false, 
                            locale: fr 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 self-center" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
      <BottomNavigation />
    </>
  );
}
