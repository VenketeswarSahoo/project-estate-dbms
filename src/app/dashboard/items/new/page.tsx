"use client";

import { ItemForm } from "@/components/forms/ItemForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useItemMutation } from "@/lib/hooks/useItems";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAuth } from "@/providers/auth";
import { User } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewItemPage() {
  const router = useRouter();
  const { user } = useAuth();

  // React Query hooks
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const itemMutation = useItemMutation();

  if (!user) return null;

  const clients = users.filter((u: User) => u.role === "CLIENT");

  const handleSubmit = async (formData: any) => {
    await itemMutation.mutateAsync(
      {
        ...formData,
        uid: `ITEM-${Math.floor(Math.random() * 10000)}`,
        barcode: Math.floor(Math.random() * 10000000000).toString(),
      },
      {
        onSuccess: () => {
          toast.success("Item created successfully");
          router.push("/dashboard/items");
        },
        onError: () => {
          toast.error("Failed to create item");
        },
      }
    );
  };

  if (isUsersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">New Item</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm
            clients={clients}
            onSubmit={handleSubmit}
            loading={itemMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
