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
import { useItems } from "@/lib/hooks/useItems";
import { useMessageMutation } from "@/lib/hooks/useMessages";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { Item, User } from "@/types";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface ComposeMessageDialogProps {
  users?: User[];
  items?: Item[];
  onOpenChange?: (open: boolean) => void;
}

export function ComposeMessageDialog({
  users: initialUsers = [],
  items: initialItems = [],
  onOpenChange,
}: ComposeMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAppStore();
  const messageMutation = useMessageMutation();

  const { data: usersData = [] } = useUsers();
  const { data: itemsData = [] } = useItems();

  const users = initialUsers.length > 0 ? initialUsers : usersData;
  const items = initialItems.length > 0 ? initialItems : itemsData;

  const [receiverId, setReceiverId] = useState("");
  const [itemId, setItemId] = useState("");
  const [content, setContent] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const filteredItems = useMemo(
    () =>
      (items || []).filter(
        (item: Item) =>
          item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
          item.uid.toLowerCase().includes(itemSearch.toLowerCase())
      ),
    [items, itemSearch]
  );

  const handleSubmit = async () => {
    if (!user || !receiverId || !content || !itemId) {
      toast.error("Please fill in all fields.");
      return;
    }

    await messageMutation.mutateAsync(
      {
        senderId: user.id,
        receiverId,
        itemId,
        content,
        read: false,
      },
      {
        onSuccess: () => {
          toast.success("Message sent!");
          setOpen(false);
          onOpenChange?.(false);

          setReceiverId("");
          setItemId("");
          setContent("");
          setItemSearch("");
        },
        onError: () => {
          toast.error("Failed to send message");
        },
      }
    );
  };

  const clients = useMemo(
    () => (users || []).filter((u: User) => u.role === "CLIENT"),
    [users]
  );

  const potentialReceivers = useMemo(
    () =>
      (users || []).filter((u: User) => {
        if (!user || u.id === user.id) return false;

        switch (user.role) {
          case "ADMIN":
            return true; // Admin can message everyone
          case "AGENT":
            return u.role === "EXECUTOR" || u.role === "BENEFICIARY";
          case "EXECUTOR":
            // Can only message Agents, or Beneficiaries of Clients they manage
            if (u.role === "AGENT") return true;
            if (u.role === "BENEFICIARY") {
              const myClients = clients.filter(
                (c: User) => c.executorId === user.id
              );
              return myClients.some((c: User) =>
                c.beneficiaryIds?.includes(u.id)
              );
            }
            return false;
          case "BENEFICIARY":
            // Can only message the Executor of their Client
            if (u.role === "EXECUTOR") {
              const myClient = clients.find((c: User) =>
                c.beneficiaryIds?.includes(user.id)
              );
              return myClient?.executorId === u.id;
            }
            return false;
          default:
            return false;
        }
      }),
    [users, user, clients]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed lg:bottom-8 bottom-28 right-8 h-14 w-14 rounded-full shadow-lg p-0"
          size="icon"
          disabled={messageMutation.isPending}
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
            <Select
              value={receiverId}
              onValueChange={setReceiverId}
              disabled={messageMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Recipient" />
              </SelectTrigger>
              <SelectContent>
                {potentialReceivers.map((u: User) => (
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
            <Select
              value={itemId}
              onValueChange={setItemId}
              disabled={messageMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    itemId
                      ? items.find((i: Item) => i.id === itemId)?.name
                      : "Select Item"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {filteredItems.map((item: Item) => (
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
              disabled={messageMutation.isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            loading={messageMutation.isPending}
            disabled={messageMutation.isPending}
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
