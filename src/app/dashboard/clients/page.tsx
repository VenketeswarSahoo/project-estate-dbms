"use client";

import HeadingText from "@/components/common/HeadingText";
import { ClientTable } from "@/components/tables/ClientTable";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteUser, useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { User } from "@/types";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAppStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<User | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const isMobile = useIsMobile();

  const clients = users.filter((u: User) => u.role === "CLIENT");

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Access Denied. Only Admins can manage clients.
      </div>
    );
  }

  const handleAction = useCallback(
    (client: User, action: "edit" | "delete" | "view") => {
      if (action === "edit") {
        router.push(`/dashboard/clients/${client.id}`);
      } else {
        setClientToDelete(client);
        setDeleteDialogOpen(true);
      }
    },
    [router]
  );

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      await deleteMutation.mutateAsync(clientToDelete.id, {
        onSuccess: () => {
          toast.success("Client deleted");
          setDeleteDialogOpen(false);
          setClientToDelete(null);
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
          title={isMobile ? "Clients" : "Clients Management"}
          subtitle={
            isMobile ? "" : "Manage and track all your clients efficiently."
          }
        />

        <Button
          onClick={() => router.push("/dashboard/clients/new")}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <ClientTable clients={clients} users={users} onAction={handleAction} />

      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{clientToDelete?.name}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
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
