"use client";

import { BeneficiaryForm } from "@/components/forms/BeneficiaryForm";
import { BeneficiaryTable } from "@/components/tables/BeneficiaryTable";
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

export default function BeneficiariesPage() {
  const { users, fetchUsers, addUser, updateUser, deleteUser } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<User | null>(
    null
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const beneficiaries = users.filter((u) => u.role === "BENEFICIARY");

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
  }) => {
    try {
      if (editingBeneficiary) {
        const updateData: any = { name: data.name, email: data.email };
        if (data.password) updateData.password = data.password;
        if (data.avatar) updateData.avatar = data.avatar;

        await updateUser(editingBeneficiary.id, updateData);
        toast.success("Beneficiary updated successfully");
      } else {
        await addUser({
          ...data,
          role: "BENEFICIARY",
          password: data.password || "password123",
        });
        toast.success("Beneficiary created successfully");
      }
      setIsOpen(false);
      setEditingBeneficiary(null);
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleAction = async (beneficiary: User, action: "edit" | "delete") => {
    if (action === "edit") {
      setEditingBeneficiary(beneficiary);
      setIsOpen(true);
    } else {
      await deleteUser(beneficiary.id);
      toast.success("Beneficiary deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Beneficiaries</h2>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setEditingBeneficiary(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-fit">
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
            />
          </DialogContent>
        </Dialog>
      </div>

      <BeneficiaryTable beneficiaries={beneficiaries} onAction={handleAction} />
    </div>
  );
}
