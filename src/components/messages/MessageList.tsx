"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/useIs-tablet";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Message, User } from "@/types";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "../ui/avatar";

interface MessageListProps {
  messages: Message[];
  users: User[];
  selectedUserId?: string | null;
  onSelectThread?: (itemId: string | null, userId: string) => void;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function MessageList({
  messages,
  users,
  selectedUserId,
  onSelectThread,
}: MessageListProps) {
  const router = useRouter();
  const { user } = useAppStore();
  const isMobile = useIsMobile();
  const isTab = useIsTablet();

  if (!user) return null;

  const getInterlocutorId = (msg: Message) => {
    return msg.senderId === user.id ? msg.receiverId : msg.senderId;
  };

  const threadMap = new Map<
    string,
    {
      interlocutor: User;
      messages: Message[];
      hasUnread: boolean;
      lastMessage: Message;
    }
  >();

  messages.forEach((msg) => {
    const interlocutorId = getInterlocutorId(msg);
    // Group by interlocutorId only
    const key = interlocutorId;

    if (!threadMap.has(key)) {
      const interlocutor = users.find((u) => u.id === interlocutorId);

      if (interlocutor) {
        threadMap.set(key, {
          interlocutor,
          messages: [],
          hasUnread: false,
          lastMessage: msg,
        });
      }
    }

    const thread = threadMap.get(key);
    if (thread) {
      thread.messages.push(msg);
      if (!msg.read && msg.receiverId === user.id) {
        thread.hasUnread = true;
      }
    }
  });

  const threads = Array.from(threadMap.values())
    .map((thread) => {
      thread.messages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      thread.lastMessage = thread.messages[0];
      return thread;
    })
    .sort((a, b) => {
      return (
        new Date(b.lastMessage.timestamp).getTime() -
        new Date(a.lastMessage.timestamp).getTime()
      );
    });

  const handleThreadClick = (userId: string) => {
    router.push(`/dashboard/messages?userId=${userId}`);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {threads.map((thread) => {
          const isSelected = selectedUserId === thread.interlocutor.id;

          return (
            <div
              key={thread.interlocutor.id}
              onClick={() => handleThreadClick(thread.interlocutor.id)}
              className={cn(
                "group relative flex items-center gap-4 border-b px-4 py-4 cursor-pointer transition-all duration-200",
                "hover:bg-accent/50 hover:shadow-sm",
                thread.hasUnread
                  ? "bg-primary/5 border-l-4 border-l-primary"
                  : "border-l-4 border-l-transparent",
                isSelected && "bg-accent/80 shadow-inner"
              )}
            >
              {/* Avatar Section */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12 shadow-sm">
                  <AvatarImage
                    src={thread.interlocutor.avatar}
                    alt={thread.interlocutor.name}
                  />
                  {!thread.interlocutor.avatar && (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                      {thread.interlocutor.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </Avatar>
                {thread.hasUnread && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-background animate-pulse" />
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3
                      className={cn(
                        "font-semibold text-sm truncate",
                        thread.hasUnread && "text-primary"
                      )}
                    >
                      {thread.interlocutor.name}
                    </h3>
                    {thread.hasUnread && (
                      <Badge
                        variant="default"
                        className="h-5 px-1.5 text-xs font-medium"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                    {formatTimeAgo(new Date(thread.lastMessage.timestamp))}
                  </time>
                </div>

                {/* Role Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate font-medium text-xs">
                    {thread.interlocutor.role}
                  </span>
                </div>

                {/* Last Message */}
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "text-xs truncate flex-1 md:max-w-[20vw] max-w-[50vw]",
                      thread.hasUnread
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {thread.lastMessage.content}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {thread.messages.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute inset-y-0 right-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}

        {threads.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No conversations yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start a conversation by messaging someone.
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
