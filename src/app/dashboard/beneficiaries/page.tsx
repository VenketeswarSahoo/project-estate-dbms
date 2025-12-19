"use client";

import HeadingText from "@/components/common/HeadingText";
import { BeneficiaryForm } from "@/components/forms/BeneficiaryForm";
import { BeneficiaryTable } from "@/components/tables/BeneficiaryTable";
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
import { useDeleteUser, useUserMutation, useUsers } from "@/lib/hooks/useUsers";
import { User } from "@/types";
import { Loader, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function BeneficiariesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<User | null>(
    null
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<User | null>(
    null
  );

  const { data: users = [], isLoading } = useUsers();
  const beneficiaries = users.filter((u: User) => u.role === "BENEFICIARY");

  const userMutation = useUserMutation();
  const deleteMutation = useDeleteUser();

  const handleSubmit = async (formData: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
  }) => {
    await userMutation.mutateAsync(
      {
        id: editingBeneficiary?.id,
        ...formData,
        role: "BENEFICIARY" as const,
        password: formData.password || "password123",
      },
      {
        onSuccess: () => {
          toast.success(
            editingBeneficiary
              ? "Beneficiary updated successfully"
              : "Beneficiary created successfully"
          );
          setIsOpen(false);
          setEditingBeneficiary(null);
        },
        onError: () => {
          toast.error("Operation failed");
        },
      }
    );
  };

  const handleAction = useCallback(
    (beneficiary: User, action: "edit" | "delete" | "view") => {
      if (action === "edit") {
        setEditingBeneficiary(beneficiary);
        setIsOpen(true);
      } else {
        setBeneficiaryToDelete(beneficiary);
        setDeleteDialogOpen(true);
      }
    },
    []
  );

  const handleDeleteConfirm = async () => {
    if (beneficiaryToDelete) {
      await deleteMutation.mutateAsync(beneficiaryToDelete.id, {
        onSuccess: () => {
          toast.success("Beneficiary deleted");
          setDeleteDialogOpen(false);
          setBeneficiaryToDelete(null);
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
          title="Beneficiaries Management"
          subtitle="Manage and track all your beneficiaries efficiently."
        />
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingBeneficiary(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-fit" disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" /> Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBeneficiary
                  ? "Edit Beneficiary"
                  : "Add New Beneficiary"}
              </DialogTitle>
            </DialogHeader>
            <BeneficiaryForm
              initialData={editingBeneficiary || undefined}
              onSubmit={handleSubmit}
              loading={userMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <BeneficiaryTable beneficiaries={beneficiaries} onAction={handleAction} />

      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Beneficiary</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                "{beneficiaryToDelete?.name}"
              </span>
              ?
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
