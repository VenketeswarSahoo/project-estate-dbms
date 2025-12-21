"use client";

import HeadingText from "@/components/common/HeadingText";
import { ExecutorForm } from "@/components/forms/ExecutorForm";
import { ExecutorTable } from "@/components/tables/ExecutorTable";
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
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function ExecutorsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingExecutor, setEditingExecutor] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [executorToDelete, setExecutorToDelete] = useState<User | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const executors = users.filter((u: User) => u.role === "EXECUTOR");

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
        id: editingExecutor?.id,
        ...formData,
        role: "EXECUTOR" as const,
        password: formData.password || "password123",
      },
      {
        onSuccess: () => {
          toast.success(
            editingExecutor
              ? "Executor updated successfully"
              : "Executor created successfully"
          );
          setIsOpen(false);
          setEditingExecutor(null);
        },
        onError: () => {
          toast.error("Operation failed");
        },
      }
    );
  };

  const handleAction = useCallback(
    (executor: User, action: "edit" | "delete" | "view") => {
      if (action === "edit") {
        setEditingExecutor(executor);
        setIsOpen(true);
      } else {
        setExecutorToDelete(executor);
        setDeleteDialogOpen(true);
      }
    },
    []
  );

  const handleDeleteConfirm = async () => {
    if (executorToDelete) {
      await deleteMutation.mutateAsync(executorToDelete.id, {
        onSuccess: () => {
          toast.success("Executor deleted");
          setDeleteDialogOpen(false);
          setExecutorToDelete(null);
        },
        onError: () => {
          toast.error("Delete failed");
        },
      });
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        deleteDialogOpen &&
        !deleteMutation.isPending &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        handleDeleteConfirm();
      }
    },
    [deleteDialogOpen, deleteMutation.isPending]
  );

  useState(() => {
    if (deleteDialogOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <HeadingText
          title={isMobile ? "Executors" : "Executor Management"}
          subtitle={
            isMobile ? "" : "Manage and track all your executors efficiently."
          }
        />
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingExecutor(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-fit" disabled={isLoading}>
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
              loading={userMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ExecutorTable executors={executors} onAction={handleAction} />

      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Executor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{executorToDelete?.name}"</span>?
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
