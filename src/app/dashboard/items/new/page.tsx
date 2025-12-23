"use client";

import { ItemForm } from "@/components/forms/ItemForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useItemMutation } from "@/lib/hooks/useItems";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAppStore } from "@/store/useAppStore";
import { User } from "@/types";
import { ChevronLeft, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewItemPage() {
  const router = useRouter();
  const { user } = useAppStore();

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
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
          title="Navigate back"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create New Item
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add a new item to your inventory
          </p>
        </div>
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
