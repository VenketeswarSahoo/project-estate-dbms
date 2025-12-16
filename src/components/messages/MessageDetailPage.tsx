"use client";

import { MessageThread } from "@/components/messages/MessageThread";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { Mic, MicOff, Send } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function MessageDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const { messages, items, users, addMessage, fetchMessages } = useAppStore();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Track cursor position for inserting speech text
  const cursorRef = useRef<number>(0);

  // Helper: insert text at current cursor position
  const insertText = (
    original: string,
    textToInsert: string,
    index: number
  ) => {
    // Ensure index is within bounds
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
      // On final result, commit it to state
      const newFragment = text + " ";

      setReplyContent((prev) => {
        const updated = insertText(prev, newFragment, cursorRef.current);
        // Advance cursor position to after the inserted text
        cursorRef.current += newFragment.length;
        return updated;
      });

      // Since we modified content programmatically, we should ensure the cursor in DOM needs update?
      // React controlled input usually handles value, but cursor position might jump to end.
      // We might need to restore cursor.
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(`Speech Error: ${error}`);
    }
  }, [error]);

  // Effect to restore cursor position after programmatic update
  useEffect(() => {
    if (textareaRef.current && isListening) {
      // This is tricky in React.
      // If we type, React keeps cursor. If we set state, cursor might jump.
      // However, for speech append, simpler is usually fine.
      // If needed, we could use useLayoutEffect with selectionStart setting.
    }
  }, [replyContent, isListening]);

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

  if (!user) return null;

  const itemId = params.itemId as string;
  const item = items.find((i) => i.id === itemId);
  if (!item) return <div>Item not found</div>;

  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === user.id || m.receiverId === user.id) &&
      m.itemId === itemId &&
      (!targetUserId ||
        m.senderId === targetUserId ||
        m.receiverId === targetUserId)
  );

  const lastIncomingMsg = [...threadMessages]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .find((m) => m.senderId !== user.id);

  const lastOutgoingMsg = [...threadMessages]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .find((m) => m.senderId === user.id);

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

  const handleReply = () => {
    if (!replyContent.trim()) return;
    if (!replyReceiverId) {
      toast.error("Cannot determine recipient for reply.");
      return;
    }
    const newMessage = {
      id: `msg-${uuidv4()}`,
      senderId: user.id,
      receiverId: replyReceiverId,
      itemId: item.id,
      content: replyContent,
      timestamp: new Date().toISOString(),
      read: false,
    };
    addMessage(newMessage);
    setReplyContent("");
    cursorRef.current = 0;
    toast.success("Reply sent");
    setTimeout(scrollToBottom, 50);
  };

  // Calculate display value
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
                // Determine new text content
                setReplyContent(e.target.value);
                updateCursorPosition(e);

                if (isListening) {
                  resetSpeechContext();
                }
              }}
              className="min-h-[44px] md:min-h-[60px] max-h-[160px] resize-none pr-10 overflow-y-auto custom-scrollbar text-base"
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
            disabled={!replyContent.trim()}
            size="icon"
            className="shrink-0 h-11 w-11 md:h-10 md:w-auto"
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
