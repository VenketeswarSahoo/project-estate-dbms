"use client";

import { useEffect } from "react";

import { ItemForm } from "@/components/forms/ItemForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function NewItemPage() {
  const router = useRouter();
  const { addItem, users, fetchUsers } = useAppStore();
  const clients = users.filter((u) => u.role === "CLIENT");
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (!user) return null;

  const handleSubmit = (data: any) => {
    const newItem = {
      id: uuidv4(),
      ...data,
      uid: `ITEM-${Math.floor(Math.random() * 10000)}`,
      barcode: Math.floor(Math.random() * 10000000000).toString(),
      photos: data.photos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(newItem);
    toast.success("Item created successfully");
    router.push("/dashboard/items");
  };

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
          <ItemForm clients={clients} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
