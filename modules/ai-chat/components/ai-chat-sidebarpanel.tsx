"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { toast } from "sonner";
import {
  AlertCircle,
  Brain,
  Code,
  Copy,
  Download,
  Filter,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import "katex/dist/katex.min.css";

type ChatMode = "chat" | "review" | "fix" | "optimize";
type MessageType =
  | "chat"
  | "code_review"
  | "error_fix"
  | "optimization";

type ChatResponse = {
  response?: string;
  tokens?: number;
  model?: string;
  provider?: string;
  error?: string;
  details?: string;
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
  type: MessageType;
  tokens?: number;
  model?: string;
  provider?: string;
}

interface AIChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const chatModes: Record<
  ChatMode,
  {
    label: string;
    icon: typeof MessageSquare;
    messageType: MessageType;
    description: string;
    loadingText: string;
    prompt: (content: string) => string;
    suggestions: string[];
  }
> = {
  chat: {
    label: "Chat",
    icon: MessageSquare,
    messageType: "chat",
    description: "Ask questions about the codebase or current implementation.",
    loadingText: "Thinking through your request...",
    prompt: (content) => content,
    suggestions: [
      "Explain this component in plain English",
      "Suggest a cleaner folder structure",
      "Find edge cases I should handle",
      "Write a short implementation plan",
    ],
  },
  review: {
    label: "Review",
    icon: Code,
    messageType: "code_review",
    description: "Focus on bugs, regressions, maintainability, and tests.",
    loadingText: "Reviewing the code path and likely risks...",
    prompt: (content) =>
      `Review this code or implementation idea. Prioritize bugs, security, maintainability, and missing tests.\n\n${content}`,
    suggestions: [
      "Review this API route for production risks",
      "Check this React hook for stale state issues",
      "Audit this save flow for data loss",
      "Find missing validation in this handler",
    ],
  },
  fix: {
    label: "Fix",
    icon: RefreshCw,
    messageType: "error_fix",
    description: "Describe an error and get a practical repair path.",
    loadingText: "Tracing the issue and preparing a fix...",
    prompt: (content) =>
      `Help fix this issue. Explain the likely cause, then give concrete changes.\n\n${content}`,
    suggestions: [
      "Fix this TypeScript error",
      "Debug why this request returns 500",
      "Explain why this state does not update",
      "Resolve this build failure",
    ],
  },
  optimize: {
    label: "Optimize",
    icon: Zap,
    messageType: "optimization",
    description: "Improve performance, clarity, or bundle/runtime behavior.",
    loadingText: "Looking for practical optimizations...",
    prompt: (content) =>
      `Analyze this code for useful optimizations. Keep recommendations grounded and explain tradeoffs.\n\n${content}`,
    suggestions: [
      "Optimize this component render path",
      "Reduce repeated network work here",
      "Make this database query cheaper",
      "Improve this WebContainer startup flow",
    ],
  },
};

const filterOptions: { value: "all" | MessageType; label: string }[] = [
  { value: "all", label: "All messages" },
  { value: "chat", label: "Chat" },
  { value: "code_review", label: "Reviews" },
  { value: "error_fix", label: "Fixes" },
  { value: "optimization", label: "Optimizations" },
];

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as ChatResponse;
    if (data.details) {
      return `${data.error || "AI request failed"}: ${data.details}`;
    }
    return data.error || `AI request failed with status ${response.status}`;
  } catch {
    return `AI request failed with status ${response.status}`;
  }
}

function MessageTypeIndicator({ message }: { message: ChatMessage }) {
  const config =
    Object.values(chatModes).find(
      (mode) => mode.messageType === message.type
    ) || chatModes.chat;
  const Icon = config.icon;
  const modelLabel = [message.provider, message.model].filter(Boolean).join(" ");

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
        <Icon className="h-3.5 w-3.5 text-zinc-400" />
        <span>{config.label}</span>
      </div>
      {(modelLabel || message.tokens) && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {modelLabel && <span>{modelLabel}</span>}
          {message.tokens ? <span>{message.tokens} tokens</span> : null}
        </div>
      )}
    </div>
  );
}

export function AIChatSidePanel({ isOpen, onClose }: AIChatSidePanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | MessageType>("all");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMode = chatModes[chatMode];

  const filteredMessages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesType =
        filterType === "all" || message.type === filterType;
      const matchesSearch =
        !normalizedSearch ||
        message.content.toLowerCase().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [filterType, messages, searchTerm]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  const sendCurrentMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmedInput,
      timestamp: new Date(),
      id: createId(),
      type: activeMode.messageType,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: activeMode.prompt(trimmedInput),
          history: messages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as ChatResponse;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.response ||
            "The AI provider returned successfully, but no response text was included.",
          timestamp: new Date(),
          id: createId(),
          type: activeMode.messageType,
          tokens: data.tokens,
          model: data.model,
          provider: data.provider,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The AI provider could not be reached.";

      setErrorMessage(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I could not reach the configured AI provider. Check the server logs and verify the Ollama service is running.",
          timestamp: new Date(),
          id: createId(),
          type: activeMode.messageType,
          provider: "Ollama",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendCurrentMessage();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  };

  const copyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Message copied");
  };

  const exportChat = () => {
    const chatData = {
      messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `forge-chat-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-4xl flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Forge AI assistant"
      >
        <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/95">
          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                  <Image src="/logo.svg" alt="" width={26} height={26} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-100">
                      Forge Assistant
                    </h2>
                    <Badge
                      variant="outline"
                      className="border-zinc-700 bg-zinc-900 text-zinc-300"
                    >
                      Ollama
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    Server-side AI help for reviews, fixes, explanations, and optimization.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                      aria-label="Chat actions"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={exportChat}
                      disabled={messages.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export transcript
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setMessages([])}
                      disabled={messages.length === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  aria-label="Close AI assistant"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Tabs
                value={chatMode}
                onValueChange={(value) => {
                  if (value in chatModes) {
                    setChatMode(value as ChatMode);
                  }
                }}
              >
                <TabsList className="grid w-full grid-cols-4 lg:w-[430px]">
                  {Object.entries(chatModes).map(([value, mode]) => {
                    const Icon = mode.icon;
                    return (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="gap-1.5"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {mode.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-9 border-zinc-800 bg-zinc-900 pl-8 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      aria-label="Filter messages"
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {filterOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                      >
                        {option.label}
                        {filterType === option.value ? (
                          <span className="ml-auto text-xs text-zinc-500">
                            Active
                          </span>
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-sm text-zinc-500">{activeMode.description}</p>
          </div>
        </header>

        {errorMessage && (
          <div className="border-b border-amber-900/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100 sm:px-6">
            <div className="flex gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-4 sm:p-6">
            {messages.length === 0 && !isLoading && (
              <div className="mx-auto flex max-w-2xl flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                  <Brain className="h-7 w-7 text-zinc-300" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Start with a concrete coding question
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
                  The assistant uses the server configured provider. Paste the relevant code, error, or plan for the strongest answer.
                </p>
                <div className="mt-6 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {activeMode.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setInput(suggestion)}
                      className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && filteredMessages.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center text-zinc-400">
                <Search className="mb-3 h-8 w-8 text-zinc-600" />
                <p className="font-medium text-zinc-300">
                  No matching messages
                </p>
                <p className="mt-1 text-sm">
                  Clear the search or change the filter to see more of the transcript.
                </p>
              </div>
            )}

            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                    <Brain className="h-4 w-4 text-zinc-300" />
                  </div>
                )}

                <div
                  className={cn(
                    "group max-w-[85%] rounded-xl px-4 py-3 shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md border border-zinc-800 bg-zinc-900 text-zinc-100"
                  )}
                >
                  {message.role === "assistant" && (
                    <MessageTypeIndicator message={message} />
                  )}

                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code: ({ children, className }) => {
                          const isBlockCode = className?.startsWith("language-");

                          if (!isBlockCode) {
                            return (
                              <code className="rounded bg-zinc-800 px-1 py-0.5 text-sm">
                                {children}
                              </code>
                            );
                          }

                          return (
                            <pre className="my-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-100">
                              <code className={className}>{children}</code>
                            </pre>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  <div
                    className={cn(
                      "mt-3 flex items-center justify-between gap-3 border-t pt-2 text-xs",
                      message.role === "user"
                        ? "border-blue-500/60 text-blue-100"
                        : "border-zinc-800 text-zinc-500"
                    )}
                  >
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void copyMessage(message.content)}
                        className="h-6 w-6 text-inherit hover:bg-white/10"
                        aria-label="Copy message"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setInput(message.content)}
                        className="h-6 w-6 text-inherit hover:bg-white/10"
                        aria-label="Reuse message"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-9 w-9 shrink-0 border border-zinc-700 bg-zinc-800">
                    <AvatarFallback className="bg-zinc-700 text-zinc-300">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                  <Brain className="h-4 w-4 text-zinc-300" />
                </div>
                <div className="flex items-center gap-3 rounded-xl rounded-bl-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span>{activeMode.loadingText}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-1" />
          </div>
        </div>

        <form
          onSubmit={handleSendMessage}
          className="shrink-0 border-t border-zinc-800 bg-zinc-950/95 p-4 sm:p-5"
        >
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <Textarea
                placeholder={`Ask Forge to ${activeMode.label.toLowerCase()}...`}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                disabled={isLoading}
                className="max-h-40 min-h-12 resize-none border-zinc-800 bg-zinc-900 pr-24 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-blue-500/30"
                rows={1}
              />
              <kbd className="absolute bottom-3 right-3 hidden rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500 sm:inline-block">
                Ctrl+Enter
              </kbd>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-12 px-4"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </aside>
    </>
  );
}
