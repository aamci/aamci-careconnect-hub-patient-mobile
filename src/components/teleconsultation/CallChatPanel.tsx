import { useEffect, useRef, useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateMessageThread,
  useThreadMessages,
  useSendMessage,
} from "@/hooks/useMessages";

interface CallChatPanelProps {
  open: boolean;
  onClose: () => void;
  patientProfileId?: string | null;
  practitionerId?: string | null;
  practitionerName?: string;
  appointmentId?: string;
}

export function CallChatPanel({
  open,
  onClose,
  patientProfileId,
  practitionerId,
  practitionerName,
  appointmentId,
}: CallChatPanelProps) {
  const [threadId, setThreadId] = useState<string | undefined>();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const createThread = useCreateMessageThread();
  const { data: messages, isLoading } = useThreadMessages(threadId);
  const sendMessage = useSendMessage();

  // Ouvre (ou crée) le fil de discussion lié à la consultation
  useEffect(() => {
    if (!open || threadId || !patientProfileId || !practitionerId) return;
    let cancelled = false;
    createThread
      .mutateAsync({ patientProfileId, practitionerId, appointmentId })
      .then((t) => {
        if (!cancelled) setThreadId(t.id);
      })
      .catch(() => {
        if (!cancelled) setError("Messagerie indisponible pour le moment");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patientProfileId, practitionerId, threadId]);

  // Temps réel
  useEffect(() => {
    if (!threadId) return;
    const channel = supabase
      .channel(`call-chat-${threadId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        () => queryClient.invalidateQueries({ queryKey: ["messages", threadId] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, queryClient]);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      closeRef.current?.focus();
    }
  }, [open, messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSend = async () => {
    const content = value.trim();
    if (!content || !threadId) return;
    setValue("");
    try {
      await sendMessage.mutateAsync({ threadId, content });
    } catch {
      setValue(content);
      setError("Envoi impossible, réessayez");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Messagerie avec ${practitionerName ?? "le praticien"}`}
      className="absolute inset-0 z-40 flex flex-col bg-black/80 backdrop-blur-md pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 shrink-0">
        <p className="text-sm font-semibold text-white truncate">
          Messagerie {practitionerName ? `— ${practitionerName}` : ""}
        </p>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Fermer la messagerie"
          className="min-h-11 min-w-11 flex items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" aria-live="polite">
        {isLoading || (!threadId && !error) ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white/70" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-white/70">{error}</p>
        ) : messages?.length ? (
          messages.map((m) => {
            const isPatient = m.sender_type === "patient";
            return (
              <div key={m.id} className={cn("flex", isPatient ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    isPatient
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-white/15 text-white rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <span className="block text-[10px] opacity-70 text-right mt-1">
                    {format(new Date(m.created_at), "HH:mm")}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-white/60 py-8">
            Aucun message. Écrivez au praticien pendant la consultation.
          </p>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shrink-0">
        <div className="flex items-end gap-2">
          <label htmlFor="call-chat-input" className="sr-only">
            Votre message
          </label>
          <textarea
            id="call-chat-input"
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Votre message..."
            className="flex-1 resize-none rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/50 px-4 py-2.5 text-sm min-h-[44px] max-h-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || !threadId || sendMessage.isPending}
            aria-label="Envoyer le message"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
