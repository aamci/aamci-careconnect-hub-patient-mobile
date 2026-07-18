import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, AlertTriangle, Pill, HeartPulse, Stethoscope, FileQuestion } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PageContainer } from "@/components/layout/PageContainer";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

const quickQuestions = [
  { icon: Stethoscope, label: "Préparer un RDV", prompt: "Comment bien préparer ma prochaine consultation médicale ? Quelles questions poser à mon médecin ?" },
  { icon: Pill, label: "Médicaments", prompt: "Comment bien lire et comprendre une ordonnance médicale ?" },
  { icon: HeartPulse, label: "Prévention santé", prompt: "Quels sont les examens de prévention recommandés pour un adulte ?" },
  { icon: FileQuestion, label: "Résultats d'analyses", prompt: "Comment comprendre les résultats d'une prise de sang ? Quels sont les indicateurs importants ?" },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: content.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur ${resp.status}`);
      }

      if (!resp.body) throw new Error("Pas de réponse");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              assistantSoFar += deltaContent;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) {
              assistantSoFar += c;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e: any) {
      setError(e.message || "Une erreur est survenue");
      console.error("AI Assistant error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => sendMessage(input);

  return (
    <>
      <PageContainer noPadding className="overflow-hidden" fullHeight>
        <div className="flex flex-col h-dvh">
          <Header title="Assistant Patient" showBack />

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
                {/* Welcome */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center max-w-xs">
                 <h2 className="text-lg font-semibold font-display mb-2">Assistant Patient IA</h2>
                  <p className="text-sm text-muted-foreground">
                    Disponible 24h/24 pour vous accompagner dans votre parcours de santé. Je ne remplace jamais un avis médical.
                  </p>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => sendMessage(q.prompt)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-center min-h-[72px]"
                    >
                      <q.icon className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground leading-tight">{q.label}</span>
                    </button>
                  ))}
                </div>

                {/* Disclaimer */}
                <Card className="p-3 max-w-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Cet assistant ne pose aucun diagnostic et ne prescrit aucun traitement. En cas d'urgence, appelez le 15 (SAMU).
                    </p>
                  </div>
                </Card>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Assistant</span>
                        </div>
                      )}
                      {msg.role === "assistant" ? (
                        <>
                          <div className="text-sm break-words leading-relaxed prose prose-sm prose-neutral dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.content && !(isLoading && i === messages.length - 1) && (
                            <div className="mt-2 -ml-1">
                              <AudioPlayer text={msg.content} label="Écouter" />
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Réflexion...</span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-center">
                    <Card className="p-3 border-destructive/30 bg-destructive/5 max-w-xs">
                      <p className="text-xs text-destructive text-center">{error}</p>
                    </Card>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border bg-card p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <div className="flex items-end gap-2 max-w-lg mx-auto">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question santé..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[44px] max-h-[120px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>
              <Button
                size="icon"
                disabled={!input.trim() || isLoading}
                onClick={handleSubmit}
                className="shrink-0 h-10 w-10"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
