"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { clearCoachHistory, editCoachMessage, prepareCoachRegenerate, loadMoreCoachMessages } from "@/actions/coach-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { toast } from "sonner";
import { Send, Trash2, User, Pencil, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AiCoachIcon } from "@/components/icons/ai-coach-icon";

const CoachMarkdown = dynamic(
  () => import("@/components/coach/coach-markdown").then((m) => m.CoachMarkdown),
  {
    loading: () => <Skeleton className="h-20 w-full rounded-lg" />,
  },
);

const DEFAULT_PROMPTS = [
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
  hasMore?: boolean;
  suggestedPrompts?: string[];
  personalizedPrompts?: boolean;
}

/** AI Coach chat with edit, regenerate, streaming, and pagination. */
export function CoachChat({
  initialMessages,
  hasMore = false,
  suggestedPrompts = DEFAULT_PROMPTS,
  personalizedPrompts = false,
}: CoachChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const streamResponse = useCallback(async (text: string, skipUserMessage = false) => {
    const assistantId = `stream-${Date.now()}`;
    if (!skipUserMessage) {
      const userMsg = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: text.trim(),
        createdAt: new Date(),
      };
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "", createdAt: new Date() },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", createdAt: new Date() },
      ]);
    }

    setLoading(true);

    try {
      const res = await fetch("/api/coach/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), skipUserMessage }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "Failed to get response");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6)) as {
            delta?: string;
            done?: boolean;
            id?: string;
            error?: string;
          };

          if (payload.error) throw new Error(payload.error);
          if (payload.delta) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + payload.delta } : m,
              ),
            );
          }
          if (payload.done && payload.id) {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, id: payload.id! } : m)),
            );
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      if (!skipUserMessage) setInput(text.trim());
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    try {
      await streamResponse(text);
    } catch {
      /* toast shown in streamResponse */
    }
  };

  const handleEditSave = async (messageId: string) => {
    if (!editText.trim() || loading) return;
    try {
      await editCoachMessage(messageId, editText.trim());
      const idx = messages.findIndex((m) => m.id === messageId);
      setMessages((prev) =>
        prev
          .slice(0, idx + 1)
          .map((m) => (m.id === messageId ? { ...m, content: editText.trim() } : m)),
      );
      setEditingId(null);
      setEditText("");
      await streamResponse(editText.trim(), true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to edit message");
    }
  };

  const handleRegenerate = async (assistantMessageId: string) => {
    const idx = messages.findIndex((m) => m.id === assistantMessageId);
    const userMsg = messages[idx - 1];
    if (!userMsg || userMsg.role !== "user" || loading) return;

    try {
      await prepareCoachRegenerate(assistantMessageId);
      setMessages((prev) => prev.slice(0, idx));
      await streamResponse(userMsg.content, true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to regenerate");
    }
  };

  const handleClear = async () => {
    await clearCoachHistory();
    setMessages([]);
    setCanLoadMore(false);
    toast.success("Conversation cleared");
  };

  const handleLoadMore = async () => {
    if (!messages.length || loadingMore) return;
    setLoadingMore(true);
    try {
      const older = await loadMoreCoachMessages(messages[0].createdAt.toISOString());
      if (older.length === 0) {
        setCanLoadMore(false);
        return;
      }
      setMessages((prev) => [...older, ...prev]);
      if (older.length < 30) setCanLoadMore(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load messages");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-4 overflow-hidden">
      <PageHeader
        eyebrow="Coach"
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
          {canLoadMore && messages.length > 0 && (
            <div className="mb-4 flex justify-center">
              <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load older messages"}
              </Button>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <AiCoachIcon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-medium">What can I help you with?</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                {personalizedPrompts
                  ? "Suggested from your weak areas — tap a prompt to start."
                  : "Ask coding questions, behavioral prep, system design, or resume advice."}
              </p>
              <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {suggestedPrompts.map((prompt) => (
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
                    "group flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <AiCoachIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "relative min-w-0 rounded-xl",
                      msg.role === "user"
                        ? "max-w-[85%] bg-foreground px-3.5 py-2.5 text-sm leading-relaxed text-background"
                        : "max-w-full flex-1 bg-muted/60 px-4 py-3",
                    )}
                  >
                    {msg.role === "user" && editingId === msg.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="resize-none border-border/50 bg-background text-foreground"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleEditSave(msg.id)}>
                            Save & resend
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : msg.role === "assistant" ? (
                      <CoachMarkdown content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {msg.role === "user" && editingId !== msg.id && !msg.id.startsWith("temp-") && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(msg.id);
                          setEditText(msg.content);
                        }}
                        className="absolute -left-8 top-1 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
                        title="Edit message"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}

                    {msg.role === "assistant" && msg.content && !msg.id.startsWith("stream-") && (
                      <button
                        type="button"
                        onClick={() => handleRegenerate(msg.id)}
                        disabled={loading}
                        className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Regenerate
                      </button>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <User className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
                    <AiCoachIcon className="h-4 w-4 animate-pulse" />
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
            Enter to send · Shift+Enter for new line · Hover messages to edit or regenerate
          </p>
        </div>
      </div>
    </div>
  );
}
