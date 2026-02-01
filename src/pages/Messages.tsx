import { useNavigate } from "react-router-dom";
import { MessageCircle, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { messageThreads } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const navigate = useNavigate();

  const sortedThreads = [...messageThreads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <>
      <PageContainer noPadding>
        <Header title="Messages" />
        
        <div className="px-4 pb-4">
          {sortedThreads.length === 0 ? (
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
                    "p-4",
                    thread.unreadCount > 0 && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => navigate(`/messages/${thread.id}`)}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <Avatar
                        src={thread.practitioner?.avatarUrl}
                        alt={`${thread.practitioner?.firstName} ${thread.practitioner?.lastName}`}
                        size="lg"
                      />
                      {thread.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={cn(
                            "font-semibold text-foreground",
                            thread.unreadCount > 0 && "text-primary"
                          )}>
                            Dr. {thread.practitioner?.firstName} {thread.practitioner?.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {thread.practitioner?.specialty.name}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {thread.lastMessage && formatDistanceToNow(new Date(thread.lastMessage.createdAt), { 
                            addSuffix: false, 
                            locale: fr 
                          })}
                        </span>
                      </div>
                      
                      {thread.lastMessage && (
                        <p className={cn(
                          "text-sm mt-1 line-clamp-2",
                          thread.unreadCount > 0 
                            ? "text-foreground font-medium" 
                            : "text-muted-foreground"
                        )}>
                          {thread.lastMessage.senderType === 'patient' && "Vous : "}
                          {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
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
