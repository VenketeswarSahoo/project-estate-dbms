"use client";

import HeadingText from "@/components/common/HeadingText";
import { AgentForm } from "@/components/forms/AgentForm";
import { AgentTable } from "@/components/tables/AgentTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteUser, useUserMutation, useUsers } from "@/lib/hooks/useUsers";
import { User } from "@/types";
import { Loader, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function AgentsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<User | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const agents = users.filter((u: User) => u.role === "AGENT");

  const userMutation = useUserMutation();
  const deleteMutation = useDeleteUser();
  const isMobile = useIsMobile();

  const handleSubmit = async (formData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
  }) => {
    await userMutation.mutateAsync(
      {
        id: editingAgent?.id,
        ...formData,
        role: "AGENT" as const,
        password: formData.password || "password123",
      },
      {
        onSuccess: () => {
          toast.success(
            editingAgent
              ? "Agent updated successfully"
              : "Agent created successfully"
          );
          setIsOpen(false);
          setEditingAgent(null);
        },
        onError: () => {
          toast.error("Operation failed");
        },
      }
    );
  };

  const handleAction = useCallback(
    (agent: User, action: "edit" | "delete" | "view") => {
      if (action === "edit") {
        setEditingAgent(agent);
        setIsOpen(true);
      } else {
        setAgentToDelete(agent);
        setDeleteDialogOpen(true);
      }
    },
    []
  );

  const handleDeleteConfirm = async () => {
    if (agentToDelete) {
      await deleteMutation.mutateAsync(agentToDelete.id, {
        onSuccess: () => {
          toast.success("Agent deleted");
          setDeleteDialogOpen(false);
          setAgentToDelete(null);
        },
        onError: () => {
          toast.error("Delete failed");
        },
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        deleteDialogOpen &&
        !deleteMutation.isPending &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        handleDeleteConfirm();
      }
    };

    if (deleteDialogOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [deleteDialogOpen, deleteMutation.isPending]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <HeadingText
          title={isMobile ? "Agents" : "Agent Management"}
          subtitle={
            isMobile ? "" : "Manage and track all your agents efficiently."
          }
        />
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingAgent(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-fit" disabled={isLoading}>
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
              loading={userMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <AgentTable agents={agents} onAction={handleAction} />

      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{agentToDelete?.name}"</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80 flex items-center gap-2"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
