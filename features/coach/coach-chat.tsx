"use client";

import { useState, useRef, useEffect } from "react";
import { sendCoachMessage, clearCoachHistory } from "@/actions/coach-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { CoachMarkdown } from "@/components/coach/coach-markdown";
import { toast } from "sonner";
import { Loader2, Send, Trash2, Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "Explain Two Sum with a Python solution and complexity analysis",
  "How should I answer 'Tell me about yourself' in a SWE interview?",
  "Walk me through designing a URL shortener (system design)",
  "What are common mistakes in binary search implementations?",
];

interface CoachChatProps {
  initialMessages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
  }[];
}

/** AI Coach chat interface. */
export function CoachChat({ initialMessages }: CoachChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendCoachMessage(text.trim());
      setMessages((prev) => [...prev, response]);
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await clearCoachHistory();
    setMessages([]);
    toast.success("Conversation cleared");
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-4 overflow-hidden">
      <PageHeader
        title="AI Coach"
        description="Interview prep, coding help, system design, and career advice — with structured answers."
        className="shrink-0"
      >
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </PageHeader>

      <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="chat-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6"
        >
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Sparkles className="h-5 w-5 text-accent" strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-sm font-medium">What can I help you with?</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Ask coding questions, behavioral prep, system design, or resume advice.
                Responses are formatted with headings, code blocks, and step-by-step explanations.
              </p>
              <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-accent/30 hover:bg-muted/50 hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Bot className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "min-w-0 rounded-xl",
                      msg.role === "user"
                        ? "max-w-[85%] bg-foreground px-3.5 py-2.5 text-sm leading-relaxed text-background"
                        : "max-w-full flex-1 bg-muted/60 px-4 py-3",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <CoachMarkdown content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                  </div>
                  <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a coding question, interview tip, or career question..."
              rows={2}
              className="resize-none border-border/80 bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <Button
              variant="accent"
              size="icon"
              className="shrink-0 self-end"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
