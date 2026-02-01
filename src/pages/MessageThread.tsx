import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Paperclip, Image, FileText } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/Avatar";
import { messageThreads, messagesThread1 } from "@/data/mockData";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

export default function MessageThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const thread = messageThreads.find(t => t.id === threadId);
  const messages = threadId === "thread-1" ? messagesThread1 : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!thread) {
    return (
      <PageContainer>
        <Header title="Conversation" showBack />
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Conversation non trouvée</p>
        </div>
      </PageContainer>
    );
  }

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return `Hier ${format(date, "HH:mm")}`;
    return format(date, "d MMM HH:mm", { locale: fr });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt);
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

  const messageGroups = groupMessagesByDate(messages);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In a real app, this would send the message to the backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <Header 
          showBack
          title=""
          rightElement={
            <div className="flex items-center gap-3">
              <Avatar
                src={thread.practitioner?.avatarUrl}
                alt={`${thread.practitioner?.firstName} ${thread.practitioner?.lastName}`}
                size="sm"
              />
              <div>
                <p className="text-sm font-semibold">
                  Dr. {thread.practitioner?.firstName} {thread.practitioner?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {thread.practitioner?.specialty.name}
                </p>
              </div>
            </div>
          }
        />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messageGroups.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              
              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isPatient = message.senderType === 'patient';
                  
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
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isPatient ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {formatMessageDate(new Date(message.createdAt))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card p-4 safe-area-bottom">
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message..."
                rows={1}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary max-h-32"
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
              disabled={!newMessage.trim()}
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
