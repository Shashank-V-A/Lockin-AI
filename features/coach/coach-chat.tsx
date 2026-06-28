"use client";

import { useState, useRef, useEffect } from "react";
import { sendCoachMessage, clearCoachHistory } from "@/actions/coach-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import { Loader2, Send, Trash2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendCoachMessage(input);
      setMessages((prev) => [...prev, response]);
    } catch {
      toast.error("Failed to get response");
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
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <PageHeader title="AI Coach" description="Ask about interviews, career advice, or resume tips.">
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </PageHeader>

      <div className="surface-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Bot className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <p className="mt-4 text-sm font-medium">Start a conversation</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Ask about behavioral questions, system design, or how to improve your resume.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Bot className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="rounded-xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              rows={2}
              className="resize-none border-border/80 bg-background"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              variant="accent"
              size="icon"
              className="shrink-0"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
