"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Message, User } from "@/types";
import { format } from "date-fns";
import { forwardRef } from "react";

interface MessageThreadProps {
  messages: Message[];
  currentUser: User;
  users: User[];
}

export const MessageThread = forwardRef<HTMLDivElement, MessageThreadProps>(
  function MessageThread({ messages, currentUser, users }, ref) {
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(messages);

    const getUserName = (id: string) =>
      users.find((u) => u.id === id)?.name || "Unknown";

    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex-1 overflow-hidden" ref={ref}>
          <ScrollArea className="h-full p-4">
            <div className="space-y-6 max-w-3xl mx-auto">
              {sortedMessages.map((message) => {
                const isMe = message.senderId === currentUser.id;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex flex-col gap-1 max-w-[80%]",
                      isMe ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {isMe ? "You" : getUserName(message.senderId)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {format(new Date(message.timestamp), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm transition-all duration-200",
                        isMe
                          ? "bg-gradient-to-br from-primary via-primary/90 to-[#B8860B] text-primary-foreground shadow-lg shadow-primary/20 rounded-tr-none relative overflow-hidden"
                          : "bg-gradient-to-br from-white to-white/90 dark:from-card dark:to-card/80 border border-border/50 shadow-md rounded-tl-none"
                      )}
                    >
                      {isMe && (
                        <div className="absolute inset-0 border-t-[2px] border-white/50 rounded-2xl rounded-tr-none scale-[0.98] pointer-events-none" />
                      )}

                      {!isMe && (
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 rounded-2xl rounded-tl-none opacity-50 pointer-events-none" />
                      )}

                      <div className="relative z-10">{message.content}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }
);
