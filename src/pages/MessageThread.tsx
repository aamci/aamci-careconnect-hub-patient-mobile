import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Paperclip, Loader2, Check, CheckCheck, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/Avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessageThreads, useThreadMessages, useSendMessage, useMarkThreadAsRead } from "@/hooks/useMessages";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageStatus = Database["public"]["Enums"]["message_status"];

const statusIcons: Record<MessageStatus, React.ReactNode> = {
  sending: <Loader2 className="h-3 w-3 animate-spin" />,
  sent: <Check className="h-3 w-3" />,
  delivered: <CheckCheck className="h-3 w-3" />,
  read: <CheckCheck className="h-3 w-3 text-primary" />,
  failed: <AlertCircle className="h-3 w-3 text-destructive" />,
};

export default function MessageThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: threads, isLoading: threadsLoading } = useMessageThreads();
  const { data: messages, isLoading: messagesLoading } = useThreadMessages(threadId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkThreadAsRead();

  const thread = threads?.find(t => t.id === threadId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (threadId && thread && (thread.unread_count || 0) > 0) {
      markAsRead.mutate(threadId);
    }
  }, [threadId, thread]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  if (threadsLoading) {
    return (
      <div className="flex flex-col h-dvh bg-background">
        <Header showBack title="Chargement..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col h-dvh bg-background">
        <Header title="Conversation" showBack />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Conversation non trouvée</p>
            <Button variant="outline" onClick={() => navigate("/messages")} className="mt-4">
              Retour aux messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Hier ${format(date, "HH:mm")}`;
    return format(date, "d MMM HH:mm", { locale: fr });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    msgs.forEach((message) => {
      const messageDate = new Date(message.created_at);
      let dateLabel: string;
      
      if (isToday(messageDate)) {
        dateLabel = "Aujourd'hui";
      } else if (isYesterday(messageDate)) {
        dateLabel = "Hier";
      } else {
        dateLabel = format(messageDate, "EEEE d MMMM", { locale: fr });
      }
      
      const existingGroup = groups.find(g => g.date === dateLabel);
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: dateLabel, messages: [message] });
      }
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages || []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !threadId) return;
    
    const content = newMessage.trim();
    setNewMessage("");
    
    try {
      await sendMessage.mutateAsync({ threadId, content });
    } catch (error) {
      console.error("Erreur envoi message:", error);
      setNewMessage(content); // Restore message on error
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Header */}
      <Header 
        showBack
        title=""
        rightElement={
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar
              src={thread.practitioner?.avatar_url || undefined}
              alt={`${thread.practitioner?.first_name} ${thread.practitioner?.last_name}`}
              size="sm"
              className="shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                Dr. {thread.practitioner?.first_name} {thread.practitioner?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {thread.practitioner?.specialty?.name}
              </p>
            </div>
          </div>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messagesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : messageGroups.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-12">
            <div>
              <p className="text-muted-foreground">Aucun message</p>
              <p className="text-sm text-muted-foreground mt-1">
                Commencez la conversation avec Dr. {thread.practitioner?.last_name}
              </p>
            </div>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              
              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isPatient = message.sender_type === 'patient';
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isPatient ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          isPatient
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <div className={cn(
                          "flex items-center gap-1 justify-end mt-1",
                          isPatient ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          <span className="text-[10px]">
                            {formatMessageDate(new Date(message.created_at))}
                          </span>
                          {isPatient && (
                            <span className="text-[10px]">
                              {statusIcons[message.status]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-end gap-2 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground shrink-0 h-10 w-10"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Votre message..."
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[44px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          
          <Button
            size="icon"
            disabled={!newMessage.trim() || sendMessage.isPending}
            onClick={handleSendMessage}
            className="shrink-0 h-10 w-10"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
