"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { Item, User } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface ComposeMessageDialogProps {
  users: User[];
  items: Item[];
  onOpenChange?: (open: boolean) => void;
}

export function ComposeMessageDialog({
  users,
  items,
  onOpenChange,
}: ComposeMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { addMessage, clients } = useAppStore();

  const [receiverId, setReceiverId] = useState("");
  const [itemId, setItemId] = useState("");
  const [content, setContent] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.uid.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const handleSubmit = () => {
    if (!user || !receiverId || !content || !itemId) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newMessage = {
      id: `msg-${uuidv4()}`,
      senderId: user.id,
      receiverId,
      itemId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    addMessage(newMessage);
    toast.success("Message sent!");
    setOpen(false);
    onOpenChange?.(false);

    // Reset form
    setReceiverId("");
    setItemId("");
    setContent("");
    setItemSearch("");
  };

  const potentialReceivers = users.filter((u) => {
    if (u.id === user?.id) return false;

    // RBAC Logic
    switch (user?.role) {
      case "ADMIN":
        return true; // Admin can message everyone
      case "AGENT":
        return u.role === "EXECUTOR" || u.role === "BENEFICIARY";
      case "EXECUTOR":
        // Can only message Agents, or Beneficiaries of Clients they manage
        if (u.role === "AGENT") return true;
        if (u.role === "BENEFICIARY") {
          const myClients = clients.filter((c) => c.executorId === user.id);
          return myClients.some((c) => c.beneficiaryIds.includes(u.id));
        }
        return false;
      case "BENEFICIARY":
        // Can only message the Executor of their Client
        if (u.role === "EXECUTOR") {
          const myClient = clients.find((c) =>
            c.beneficiaryIds.includes(user.id)
          );
          return myClient?.executorId === u.id;
        }
        return false;
      default:
        return false;
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg p-0"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="receiver" className="text-sm font-medium">
              To:
            </label>
            <Select value={receiverId} onValueChange={setReceiverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Recipient" />
              </SelectTrigger>
              <SelectContent>
                {potentialReceivers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="item" className="text-sm font-medium">
              Related Item:
            </label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    itemId
                      ? items.find((i) => i.id === itemId)?.name
                      : "Select Item"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {filteredItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.uid})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="content" className="text-sm font-medium">
              Message:
            </label>
            <Textarea
              id="content"
              placeholder="Type your message here..."
              className="h-32"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
