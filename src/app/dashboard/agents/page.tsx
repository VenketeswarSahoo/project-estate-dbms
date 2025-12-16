"use client";

import { AgentForm } from "@/components/forms/AgentForm";
import { AgentTable } from "@/components/tables/AgentTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/store";
import { User } from "@/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AgentsPage() {
  const { users, fetchUsers, addUser, updateUser, deleteUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const agents = users.filter((u) => u.role === "AGENT");

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
  }) => {
    try {
      if (editingAgent) {
        const updateData: any = { name: data.name, email: data.email };
        if (data.password) updateData.password = data.password;
        if (data.avatar) updateData.avatar = data.avatar;

        await updateUser(editingAgent.id, updateData);
        toast.success("Agent updated successfully");
      } else {
        await addUser({
          ...data,
          role: "AGENT",
          password: data.password || "password123",
        });
        toast.success("Agent created successfully");
      }
      setIsOpen(false);
      setEditingAgent(null);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleAction = async (agent: User, action: "edit" | "delete") => {
    if (action === "edit") {
      setEditingAgent(agent);
      setIsOpen(true);
    } else {
      await deleteUser(agent.id);
      toast.success("Agent deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Agents</h2>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingAgent(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Edit Agent" : "Add New Agent"}
              </DialogTitle>
            </DialogHeader>
            <AgentForm
              initialData={editingAgent || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <AgentTable agents={agents} onAction={handleAction} />
    </div>
  );
}
