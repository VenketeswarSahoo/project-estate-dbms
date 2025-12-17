"use client";

import { ItemTable } from "@/components/tables/ItemTable";
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
import { useDeleteItem, useItems } from "@/lib/hooks/useItems";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAuth } from "@/providers/auth";
import { Item, User } from "@/types";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ItemsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // React Query hooks
  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const deleteMutation = useDeleteItem();

  const isLoading = isItemsLoading || isUsersLoading;

  // Filter clients
  const clients = useMemo(
    () => users.filter((u: User) => u.role === "CLIENT"),
    [users]
  );

  // Filter items based on user role
  const visibleItems = useMemo(() => {
    if (!user || isLoading) return [];

    if (user.role === "EXECUTOR") {
      const myClient = users.find((c: User) => c.executorId === user.id);
      return myClient
        ? items.filter((i: Item) => i.clientId === myClient.id)
        : [];
    } else if (user.role === "BENEFICIARY") {
      const myClient = users.find((c: User) =>
        c.beneficiaryIds?.includes(user.id)
      );
      return myClient
        ? items.filter((i: Item) => i.clientId === myClient.id)
        : [];
    }

    return items;
  }, [user, items, users, isLoading]);

  const visibleClients = useMemo(() => {
    if (!user || isLoading) return [];

    if (user.role === "EXECUTOR") {
      const myClient = users.find((c: User) => c.executorId === user.id);
      return myClient ? [myClient] : [];
    } else if (user.role === "BENEFICIARY") {
      const myClient = users.find((c: User) =>
        c.beneficiaryIds?.includes(user.id)
      );
      return myClient ? [myClient] : [];
    }

    return clients;
  }, [user, users, clients, isLoading]);

  const canEdit = user?.role === "ADMIN" || user?.role === "AGENT";

  const handleAction = useCallback(
    (item: Item, action: "edit" | "delete" | "view") => {
      if (action === "edit") {
        router.push(`/dashboard/items/${item.id}`);
      } else if (action === "view") {
        router.push(`/dashboard/items/${item.id}`);
      } else if (action === "delete") {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
      }
    },
    [router]
  );

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteMutation.mutateAsync(itemToDelete.id, {
        onSuccess: () => {
          toast.success("Item deleted");
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        },
        onError: () => {
          toast.error("Delete failed");
        },
      });
    }
  };

  // Keyboard shortcut for Enter key
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

  // Add event listener for keyboard shortcuts
  useState(() => {
    if (deleteDialogOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Estate Items</h2>
        {canEdit && (
          <>
            <div className="lg:hidden block">
              <Button
                className="flex items-center gap-2"
                onClick={() => router.push("/dashboard/items/new")}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ItemTable
          items={visibleItems}
          clients={visibleClients}
          onAction={handleAction}
          canEdit={canEdit}
        />
      )}

      {/* Delete Dialog - Now outside DataTable */}
      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{itemToDelete?.name}"</span>?
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
