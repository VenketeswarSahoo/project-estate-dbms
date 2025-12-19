"use client";

import { ComposeMessageDialog } from "@/components/messages/ComposeMessageDialog";
import { MessageList } from "@/components/messages/MessageList";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useItems } from "@/lib/hooks/useItems";
import { useMessages } from "@/lib/hooks/useMessages";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Item, Message, User } from "@/types";
import { Loader, Search } from "lucide-react";
import { useMemo, useState } from "react";
import HeadingText from "../common/HeadingText";

export default function MessagesPage() {
  const { user } = useAppStore();
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState<string>("ALL");

  const { data: messages = [], isLoading: isMessagesLoading } = useMessages();
  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();

  const isLoading = isMessagesLoading || isItemsLoading || isUsersLoading;

  if (!user) return null;

  const myMessages = useMemo(
    () =>
      messages.filter(
        (m: Message) => m.senderId === user.id || m.receiverId === user.id
      ),
    [messages, user]
  );

  const myItemIds = useMemo(
    () =>
      new Set(
        myMessages.map((m: Message) => m.itemId).filter(Boolean) as string[]
      ),
    [myMessages]
  );

  let filteredItems = useMemo(
    () =>
      items.filter(
        (item: Item) =>
          myItemIds.has(item.id) &&
          (item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.uid.toLowerCase().includes(search.toLowerCase()))
      ),
    [items, myItemIds, search]
  );

  if (userFilter !== "ALL") {
    filteredItems = filteredItems.filter((item: Item) => {
      const itemMsgs = myMessages.filter((m: Message) => m.itemId === item.id);
      return itemMsgs.some(
        (m: Message) => m.senderId === userFilter || m.receiverId === userFilter
      );
    });
  }

  const myInterlocutorIds = useMemo(() => {
    const ids = new Set<string>();
    myMessages.forEach((m: Message) => {
      if (m.senderId !== user.id) ids.add(m.senderId);
      if (m.receiverId !== user.id) ids.add(m.receiverId);
    });
    return ids;
  }, [myMessages, user]);

  const myInterlocutors = useMemo(
    () => (users || []).filter((u: User) => myInterlocutorIds.has(u.id)),
    [users, myInterlocutorIds]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 h-[calc(100dvh-9rem)] md:h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <HeadingText
          title="Messages"
          subtitle="Manage and track your conversations with other users."
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              className="pl-8 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Conversations</SelectItem>
                {myInterlocutors.map((u: User) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="flex-1 p-0 overflow-hidden">
        <MessageList
          items={filteredItems}
          messages={myMessages}
          users={users}
        />
      </Card>

      <ComposeMessageDialog users={users} items={items} />
    </div>
  );
}
