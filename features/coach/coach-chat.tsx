"use client";

import { useState, useRef, useEffect } from "react";
import { sendCoachMessage, clearCoachHistory } from "@/actions/coach-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Coach</h1>
          <p className="text-sm text-muted-foreground">
            Ask about interviews, career advice, or resume tips.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          <ScrollArea className="flex-1 px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center py-20 text-sm text-muted-foreground">
                Start a conversation with your AI coach.
              </div>
            ) : (
              <div className="space-y-4">
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
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
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
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button size="icon" onClick={handleSend} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
