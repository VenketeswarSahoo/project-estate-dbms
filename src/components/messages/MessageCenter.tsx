"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export function MessageCenter() {
  const { user } = useAuth();
  const { messages, users, items, addMessage, fetchMessages } = useAppStore();
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("general");
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (!user) return null;

  const myMessages = messages
    .filter((m) => m.senderId === user.id || m.receiverId === user.id)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  const recipients = users.filter((u) => {
    if (u.id === user.id) return false;
    if (user.role === "ADMIN") return true;

    if (user.role === "AGENT") {
      return (
        u.role === "EXECUTOR" || u.role === "BENEFICIARY" || u.role === "ADMIN"
      );
    }

    if (user.role === "EXECUTOR") {
      return u.role === "AGENT" || u.role === "ADMIN";
    }

    if (user.role === "BENEFICIARY") {
      return u.role === "EXECUTOR" || u.role === "ADMIN";
    }

    return false;
  });

  const handleSendMessage = () => {
    if (!selectedRecipient || !messageContent.trim()) {
      toast.error("Please select a recipient and enter a message.");
      return;
    }

    if (selectedItem === "general") {
      toast.error("All messages must be linked to an item.");
      return;
    }

    addMessage({
      senderId: user.id,
      receiverId: selectedRecipient,
      itemId: selectedItem,
      content: messageContent,
      timestamp: new Date().toISOString(),
      read: false,
    });

    setMessageContent("");
    toast.success("Message sent");
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 h-[600px]">
      {/* Sidebar / Contact List could go here, for now just a simple list */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">To:</label>
            <Select
              value={selectedRecipient}
              onValueChange={setSelectedRecipient}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} ({r.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Regarding Item (Required):
            </label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general" disabled>
                  Select an Item...
                </SelectItem>
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name} ({i.uid})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message..."
              className="h-32"
            />
          </div>

          <Button onClick={handleSendMessage} className="w-full">
            Send Message
          </Button>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="md:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>Conversation History</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            {myMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                No messages yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myMessages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  const sender = users.find((u) => u.id === msg.senderId);
                  const item = msg.itemId
                    ? items.find((i) => i.id === msg.itemId)
                    : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <span className="text-xs font-bold">
                            {isMe ? "You" : sender?.name}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {item && (
                          <div className="text-xs mb-2 p-1 bg-black/10 rounded">
                            Ref: {item.name} ({item.uid})
                          </div>
                        )}
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
