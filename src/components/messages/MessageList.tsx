"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Item, Message, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "../ui/avatar";

interface MessageListProps {
  items: Item[];
  messages: Message[];
  users: User[];
}

export function MessageList({ items, messages, users }: MessageListProps) {
  const router = useRouter();
  const { user } = useAppStore();

  if (!user) return null;

  const getInterlocutorId = (msg: Message) => {
    return msg.senderId === user.id ? msg.receiverId : msg.senderId;
  };

  const threadMap = new Map<
    string,
    {
      item: Item;
      interlocutor: User;
      messages: Message[];
      hasUnread: boolean;
      lastMessage: Message;
    }
  >();

  const itemIds = new Set(items.map((i) => i.id));

  messages.forEach((msg) => {
    if (!msg.itemId || !itemIds.has(msg.itemId)) return;

    const interlocutorId = getInterlocutorId(msg);
    const key = `${msg.itemId}-${interlocutorId}`;

    if (!threadMap.has(key)) {
      const item = items.find((i) => i.id === msg.itemId);
      const interlocutor = users.find((u) => u.id === interlocutorId);

      if (item && interlocutor) {
        threadMap.set(key, {
          item,
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

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {threads.map((thread) => (
          <div
            key={`${thread.item.id}-${thread.interlocutor.id}`}
            onClick={() =>
              router.push(
                `/dashboard/messages/${thread.item.id}?userId=${thread.interlocutor.id}`
              )
            }
            className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b p-4 cursor-pointer hover:bg-muted/50 transition-colors",
              thread.hasUnread ? "bg-muted/20" : ""
            )}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[200px]">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={thread.interlocutor.avatar}
                  alt={thread.interlocutor.name}
                />
                {!thread.interlocutor.avatar && (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    {thread.interlocutor.name?.charAt(0) || "?"}
                  </div>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm truncate">
                  {thread.interlocutor.name}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {thread.item.name} ({thread.item.uid})
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 max-w-[60vw]">
                <span className="font-medium text-sm truncate">
                  {thread.lastMessage.content}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {thread.messages.length} messages
              </div>
            </div>

            <div className="text-xs text-muted-foreground whitespace-nowrap min-w-[80px] text-right">
              {formatDistanceToNow(new Date(thread.lastMessage.timestamp), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}

        {threads.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No conversations found.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
