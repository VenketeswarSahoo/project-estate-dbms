"use client";

import React from "react";
import { Message, Item, Client, User } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageSidebarProps {
  items: Item[]; // Items act as thread contexts
  messages: Message[];
  selectedItemId: string | null;
  onSelectThread: (itemId: string) => void;
  users: User[];
  clients: Client[];
}

export function MessageSidebar({
  items,
  messages,
  selectedItemId,
  onSelectThread,
  users,
  clients,
}: MessageSidebarProps) {
  // Group messages by item
  const threads = items
    .map((item) => {
      const itemMessages = messages.filter((m) => m.itemId === item.id);
      if (itemMessages.length === 0) return null;

      const lastMessage = itemMessages.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      return {
        item,
        lastMessage,
        count: itemMessages.length,
        hasUnread: itemMessages.some((m) => !m.read), // Logic would need current user context for true unread
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by last message date
      return (
        new Date(b!.lastMessage.timestamp).getTime() -
        new Date(a!.lastMessage.timestamp).getTime()
      );
    });

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {threads.map((thread) => (
          <button
            key={thread!.item.id}
            onClick={() => onSelectThread(thread!.item.id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              selectedItemId === thread!.item.id && "bg-accent"
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{thread!.item.name}</div>
                  {!thread!.hasUnread && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(thread!.lastMessage.timestamp),
                    {
                      addSuffix: true,
                    }
                  )}
                </div>
              </div>
              <div className="text-xs font-medium">{thread!.item.uid}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {thread!.lastMessage.content}
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-xs bg-muted px-2 py-0-5 rounded">
                Items: {thread?.count}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
