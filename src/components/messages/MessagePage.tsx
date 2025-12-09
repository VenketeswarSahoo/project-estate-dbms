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
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { Search } from "lucide-react";
import { useState } from "react";

export default function MessagesPage() {
  const { messages, items, users } = useAppStore();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState<string>("ALL");

  if (!user) return null;

  // Filter messages for current user
  const myMessages = messages.filter(
    (m) => m.senderId === user.id || m.receiverId === user.id
  );

  // Identify relevant items (threads)
  const myItemIds = new Set(
    myMessages.map((m) => m.itemId).filter(Boolean) as string[]
  );

  // Apply Search
  let filteredItems = items.filter(
    (item) =>
      myItemIds.has(item.id) &&
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.uid.toLowerCase().includes(search.toLowerCase()))
  );

  // Apply User Filter
  if (userFilter !== "ALL") {
    filteredItems = filteredItems.filter((item) => {
      const itemMsgs = myMessages.filter((m) => m.itemId === item.id);
      return itemMsgs.some(
        (m) => m.senderId === userFilter || m.receiverId === userFilter
      );
    });
  }

  // Identify Interlocutors for Filter
  const myInterlocutorIds = new Set<string>();
  myMessages.forEach((m) => {
    if (m.senderId !== user.id) myInterlocutorIds.add(m.senderId);
    if (m.receiverId !== user.id) myInterlocutorIds.add(m.receiverId);
  });
  const myInterlocutors = users.filter((u) => myInterlocutorIds.has(u.id));

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search threads..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Conversations</SelectItem>
                {myInterlocutors.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="flex-1">
        <MessageList items={filteredItems} messages={myMessages} />
      </Card>

      <ComposeMessageDialog users={users} items={items} />
    </div>
  );
}
