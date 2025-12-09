"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types";
import { Separator } from "../ui/separator";

interface ItemCommunicationLogProps {
  itemId: string;
}

export function ItemCommunicationLog({ itemId }: ItemCommunicationLogProps) {
  const { user } = useAuth();
  const { messages, users, addMessage } = useAppStore();
  const [content, setContent] = useState("");

  if (!user) return null;

  const itemMessages = messages
    .filter((m) => m.itemId === itemId)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  const handleSendMessage = () => {
    if (!content.trim()) return;

    let receiverId = "";

    if (user.role === "AGENT") {
      const executor = users.find((u) => u.role === "EXECUTOR");
      if (executor) receiverId = executor.id;
    } else if (user.role === "EXECUTOR") {
      const agent = users.find((u) => u.role === "AGENT");
      if (agent) receiverId = agent.id;
    } else if (user.role === "BENEFICIARY") {
      const executor = users.find((u) => u.role === "EXECUTOR");
      if (executor) receiverId = executor.id;
    } else if (user.role === "ADMIN") {
      const agent = users.find((u) => u.role === "AGENT");
      if (agent) receiverId = agent.id;
    }

    if (!receiverId) {
      toast.error("Could not determine recipient.");
      return;
    }

    addMessage({
      id: uuidv4(),
      senderId: user.id,
      receiverId: receiverId,
      itemId: itemId,
      content: content,
      timestamp: new Date().toISOString(),
      read: false,
    });

    setContent("");
    toast.success("Message sent");
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Communication Log</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <ScrollArea className="flex-1 pr-4">
          {itemMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages for this item.
            </div>
          ) : (
            <div className="space-y-4">
              {itemMessages.map((msg) => {
                const isMe = msg.senderId === user.id;
                const sender = users.find((u) => u.id === msg.senderId);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-xs font-bold">
                          {sender?.name} ({sender?.role})
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="pt-4 mt-4 border-t space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex justify-end mt-4">
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
