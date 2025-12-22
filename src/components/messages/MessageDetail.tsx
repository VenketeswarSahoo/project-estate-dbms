"use client";

import { MessageThread } from "@/components/messages/MessageThread";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/useIs-tablet";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useMessageMutation, useMessages } from "@/lib/hooks/useMessages";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Message, User } from "@/types";
import { Loader, Mic, MicOff, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface MessageDetailProps {
  targetUserId: string;
  onClose?: () => void;
}

export function MessageDetail({ targetUserId, onClose }: MessageDetailProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const { data: messages = [], isLoading: isMessagesLoading } = useMessages();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const messageMutation = useMessageMutation();

  const [replyContent, setReplyContent] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isMobile = useIsMobile();
  const isTab = useIsTablet();

  const isLoading = isMessagesLoading || isUsersLoading;

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

  const targetUser = users.find((u: User) => u.id === targetUserId);

  if (!targetUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-semibold mb-4">User not found</div>
      </div>
    );
  }

  const threadMessages = useMemo(
    () =>
      messages.filter(
        (m: Message) =>
          (m.senderId === user.id && m.receiverId === targetUserId) ||
          (m.senderId === targetUserId && m.receiverId === user.id)
      ),
    [messages, user, targetUserId]
  );

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

    await messageMutation.mutateAsync(
      {
        senderId: user.id,
        receiverId: targetUserId,
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

  const handleBackOrClose = () => {
    if (isMobile || isTab) {
      router.back();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - shown on all screens */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={targetUser.avatar} alt={targetUser.name} />
            <AvatarFallback>
              {targetUser.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold lg:text-base text-sm">
              {targetUser.name}
            </h2>
            <p className="text-xs text-muted-foreground">{targetUser.role}</p>
          </div>
        </div>

        {/* Close button - different icon based on device */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackOrClose}
          className="h-8 w-8 hover:bg-muted"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-hidden">
        <MessageThread
          ref={scrollContainerRef}
          messages={threadMessages}
          currentUser={user}
          users={users}
        />
      </div>

      {/* Reply Input */}
      <div className="p-4 bg-background border-t">
        <div className="flex gap-2 items-end w-full">
          <div className="relative flex-1">
            <Textarea
              placeholder="Type a reply or use voice..."
              ref={textareaRef}
              onKeyDown={(e) => {
                updateCursorPosition(e);
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (replyContent.trim()) {
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
              className="min-h-[44px] max-h-[120px] resize-none pr-10 md:text-sm text-sm"
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
            size="default"
            disabled={!replyContent.trim() || messageMutation.isPending}
            loading={messageMutation.isPending}
            className="flex items-center gap-2 md:w-[120px] w-fit h-[44px]"
          >
            <Send className="h-4 w-4" />
            <span className="md:block hidden">Send</span>
          </Button>
        </div>

        {threadMessages.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            No conversation history. Start by sending a message.
          </p>
        )}
      </div>
    </div>
  );
}
