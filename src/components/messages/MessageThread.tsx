"use client";

import React, { forwardRef } from "react";
import { Message, Item, User } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface MessageThreadProps {
  item: Item;
  messages: Message[];
  currentUser: User;
  users: User[];
}

export const MessageThread = forwardRef<HTMLDivElement, MessageThreadProps>(
  function MessageThread({ item, messages, currentUser, users }, ref) {
    const router = useRouter();
    const sortedMessages = [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const getUserName = (id: string) =>
      users.find((u) => u.id === id)?.name || "Unknown";

    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-start gap-4 text-sm flex-1">
            <Avatar>
              <AvatarFallback>{item.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <h2 className="font-semibold text-lg leading-none">
                {item.name}
              </h2>
              <div className="text-sm text-muted-foreground md:block hidden">
                Conversations regarding Item: {item.uid}
              </div>
              <div className="text-sm text-muted-foreground md:hidden block">
                Item: {item.uid}
              </div>
            </div>
          </div>
        </div>

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
                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                        isMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-white dark:bg-primary/10 border rounded-tl-none"
                      )}
                    >
                      {message.content}
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
