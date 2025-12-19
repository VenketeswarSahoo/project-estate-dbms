"use client";

import { MessageThread } from "@/components/messages/MessageThread";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useItems } from "@/lib/hooks/useItems";
import { useMessageMutation, useMessages } from "@/lib/hooks/useMessages";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Item, Message } from "@/types";
import { Loader, Mic, MicOff, Send } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function MessageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const { user } = useAppStore();

  const { data: messages = [], isLoading: isMessagesLoading } = useMessages();
  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const messageMutation = useMessageMutation();

  const [replyContent, setReplyContent] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMobile = useIsMobile();

  const isLoading = isMessagesLoading || isItemsLoading || isUsersLoading;

  const cursorRef = useRef<number>(0);

  const insertText = (
    original: string,
    textToInsert: string,
    index: number
  ) => {
    const pos = Math.min(Math.max(index, 0), original.length);
    return original.slice(0, pos) + textToInsert + original.slice(pos);
  };

  const {
    isListening,
    interimResult,
    startListening,
    stopListening,
    resetSpeechContext,
    isSupported,
    error,
  } = useSpeechToText({
    language: "en-US",
    onFinal: (text) => {
      const newFragment = text + " ";

      setReplyContent((prev) => {
        const updated = insertText(prev, newFragment, cursorRef.current);
        cursorRef.current += newFragment.length;
        return updated;
      });
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(`Speech Error: ${error}`);
    }
  }, [error]);

  const updateCursorPosition = (
    e: React.SyntheticEvent<HTMLTextAreaElement>
  ) => {
    cursorRef.current = e.currentTarget.selectionStart;
  };

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault();
        if (!isSupported) {
          toast.error("Speech recognition is not supported in this browser.");
          return;
        }
        isListening ? stopListening() : startListening();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [isListening, startListening, stopListening, isSupported]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const itemId = params.itemId as string;
  const item = items.find((i: Item) => i.id === itemId);
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold mb-4">Item not found</div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const threadMessages = useMemo(
    () =>
      messages.filter(
        (m: Message) =>
          (m.senderId === user.id || m.receiverId === user.id) &&
          m.itemId === itemId &&
          (!targetUserId ||
            m.senderId === targetUserId ||
            m.receiverId === targetUserId)
      ),
    [messages, user, itemId, targetUserId]
  );

  const lastIncomingMsg = useMemo(
    () =>
      [...threadMessages]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .find((m) => m.senderId !== user.id),
    [threadMessages, user]
  );

  const lastOutgoingMsg = useMemo(
    () =>
      [...threadMessages]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .find((m) => m.senderId === user.id),
    [threadMessages, user]
  );

  const replyReceiverId =
    lastIncomingMsg?.senderId || lastOutgoingMsg?.receiverId;

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const scrollArea = scrollContainerRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      else
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    if (!replyReceiverId) {
      toast.error("Cannot determine recipient for reply.");
      return;
    }

    await messageMutation.mutateAsync(
      {
        senderId: user.id,
        receiverId: replyReceiverId,
        itemId: item.id,
        content: replyContent,
        read: false,
      },
      {
        onSuccess: () => {
          toast.success("Reply sent");
          setReplyContent("");
          cursorRef.current = 0;
          setTimeout(scrollToBottom, 50);
        },
        onError: () => {
          toast.error("Failed to send reply");
        },
      }
    );
  };

  const displayValue = useMemo(() => {
    if (isListening && interimResult) {
      return insertText(replyContent, interimResult, cursorRef.current);
    }
    return replyContent;
  }, [replyContent, isListening, interimResult]);

  return (
    <div className="flex flex-col h-[calc(100dvh-9rem)] md:h-[calc(100vh-8rem)] bg-background rounded-lg border-0 sm:border overflow-hidden -mx-4 -my-4 sm:mx-0 sm:my-0 pb-16 sm:pb-0">
      <div className="flex-1 overflow-hidden relative">
        <MessageThread
          ref={scrollContainerRef}
          item={item}
          messages={threadMessages}
          currentUser={user}
          users={users}
        />
      </div>

      <div className="p-3 md:p-4 bg-background border-t">
        <div className="flex gap-2 max-w-3xl mx-auto items-end w-full">
          <div className="relative flex-1">
            <Textarea
              placeholder="Type a reply or use voice..."
              ref={textareaRef}
              onKeyDown={(e) => {
                updateCursorPosition(e);
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (replyContent.trim() && replyReceiverId) {
                    handleReply();
                  }
                }
              }}
              value={displayValue}
              onSelect={updateCursorPosition}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onChange={(e) => {
                setReplyContent(e.target.value);
                updateCursorPosition(e);

                if (isListening) {
                  resetSpeechContext();
                }
              }}
              className="min-h-[44px] md:min-h-[60px] max-h-[160px] resize-none pr-10 overflow-y-auto custom-scrollbar text-base"
              disabled={messageMutation.isPending}
            />

            <button
              type="button"
              onClick={() => {
                if (!isSupported) {
                  toast.error(
                    "Speech recognition is not supported in this browser."
                  );
                  return;
                }
                if (isListening) stopListening();
                else startListening();
              }}
              className={`absolute right-2 bottom-2 p-2 rounded-full transition ${
                !isSupported
                  ? "text-gray-300 cursor-not-allowed"
                  : isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={
                !isSupported
                  ? "Speech recognition not supported"
                  : "Voice input"
              }
              disabled={messageMutation.isPending}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          </div>

          <Button
            onClick={handleReply}
            size={isMobile ? "icon" : "default"}
            disabled={!replyContent.trim() || messageMutation.isPending}
            className="shrink-0 h-11 w-11 md:h-10 md:w-auto"
            loading={messageMutation.isPending}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Send</span>
          </Button>
        </div>

        {!replyReceiverId && threadMessages.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            No conversation history. Use the "New Message" button to start a
            thread.
          </p>
        )}
      </div>
    </div>
  );
}
