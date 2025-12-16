"use client";

import { ExecutorForm } from "@/components/forms/ExecutorForm";
import { ExecutorTable } from "@/components/tables/ExecutorTable";
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

export default function ExecutorsPage() {
  const { users, fetchUsers, addUser, updateUser, deleteUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const executors = users.filter((u) => u.role === "EXECUTOR");

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
  }) => {
    try {
      if (editingExecutor) {
        const updateData: any = { name: data.name, email: data.email };
        if (data.password) updateData.password = data.password;
        if (data.avatar) updateData.avatar = data.avatar;

        await updateUser(editingExecutor.id, updateData);
        toast.success("Executor updated successfully");
      } else {
        await addUser({
          ...data,
          role: "EXECUTOR",
          password: data.password || "password123",
        });
        toast.success("Executor created successfully");
      }
      setIsOpen(false);
      setEditingExecutor(null);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleAction = async (executor: User, action: "edit" | "delete") => {
    if (action === "edit") {
      setEditingExecutor(executor);
      setIsOpen(true);
    } else {
      await deleteUser(executor.id);
      toast.success("Executor deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Executors</h2>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingExecutor(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Plus className="mr-2 h-4 w-4" /> Add Executor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExecutor ? "Edit Executor" : "Add New Executor"}
              </DialogTitle>
            </DialogHeader>
            <ExecutorForm
              initialData={editingExecutor || undefined}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ExecutorTable executors={executors} onAction={handleAction} />
    </div>
  );
}
