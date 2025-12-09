"use client";

import { MessageThread } from "@/components/messages/MessageThread";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function MessageDetailPage() {
  const params = useParams();
  const { messages, items, users, addMessage } = useAppStore();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!user) return null;

  const itemId = params.itemId as string;
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return <div>Item not found</div>;
  }

  // Filter messages for current user and item
  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === user.id || m.receiverId === user.id) &&
      m.itemId === itemId
  );

  // Determine receiver for reply (Logic: Last person who isn't me)
  const lastIncomingMsg = [...threadMessages]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .find((m) => m.senderId !== user.id);

  const replyReceiverId = lastIncomingMsg?.senderId;

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const scrollArea = scrollContainerRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      } else {
        // Fallback to the container itself
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [threadMessages]);

  // Also scroll to bottom when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

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
    toast.success("Reply sent");

    // Scroll to bottom after message is sent
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background rounded-lg border overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        {/* Pass ref using forwardRef pattern */}
        <MessageThread
          ref={scrollContainerRef}
          item={item}
          messages={threadMessages}
          currentUser={user}
          users={users}
        />
      </div>

      {/* Quick Reply Box */}
      <div className="p-4 bg-background border-t">
        <div className="flex gap-2 max-w-3xl mx-auto items-end">
          <Textarea
            placeholder={
              replyReceiverId ? "Type a reply..." : "Start a conversation..."
            }
            ref={textareaRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (replyContent.trim() && replyReceiverId) {
                  handleReply();
                }
              }
            }}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <Button onClick={handleReply} disabled={!replyContent.trim()}>
            <Send className="h-4 w-4" />
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
