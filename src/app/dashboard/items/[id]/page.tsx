"use client";

import { BarcodeDisplay } from "@/components/common/BarcodeDisplay";
import { BarcodePDFSheet } from "@/components/common/BarcodePDFPreviewModal";
import { ItemForm } from "@/components/forms/ItemForm";
import { GalleryModal } from "@/components/slider/gallery-modal";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteItem, useItemMutation, useItems } from "@/lib/hooks/useItems";
import { useUsers } from "@/lib/hooks/useUsers";
import { useAuth } from "@/providers/auth";
import { Item, User } from "@/types";
import { ArrowLeft, Loader, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // React Query hooks
  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const itemMutation = useItemMutation();
  const deleteMutation = useDeleteItem();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const itemId = params.id as string;
  const item = items.find((i: Item) => i.id === itemId);

  const isLoading = isItemsLoading || isUsersLoading;

  useEffect(() => {
    // If item not found and not loading, redirect
    if (!isLoading && !item) {
      toast.error("Item not found");
      router.push("/dashboard/items");
    }
  }, [isLoading, item, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold mb-4">Item not found</div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/items")}
        >
          Go Back to Items
        </Button>
      </div>
    );
  }

  const canEdit =
    (user.role === "ADMIN" || user.role === "AGENT") && !item.isLocked;
  const canDelete = user.role === "ADMIN";

  const clients = users.filter((u: User) => u.role === "CLIENT");

  const handleSubmit = async (formData: any) => {
    await itemMutation.mutateAsync(
      {
        id: itemId,
        ...formData,
      },
      {
        onSuccess: () => {
          toast.success("Item updated successfully");
        },
        onError: () => {
          toast.error("Failed to update item");
        },
      }
    );
  };

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync(itemId, {
      onSuccess: () => {
        toast.success("Item deleted");
        setDeleteDialogOpen(false);
        router.push("/dashboard/items");
      },
      onError: () => {
        toast.error("Delete failed");
      },
    });
  };

  const handlePhotoDelete = async (index: number) => {
    const updatedPhotos = item.photos.filter(
      (_: any, i: number) => i !== index
    );
    await itemMutation.mutateAsync(
      {
        id: itemId,
        photos: updatedPhotos,
      },
      {
        onSuccess: () => {
          toast.success("Photo removed");
        },
        onError: () => {
          toast.error("Failed to remove photo");
        },
      }
    );
  };

  const openGallery = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setGalleryOpen(true);
    setCurrentIndex(index);
  };

  // Keyboard shortcut for Enter key in delete dialog
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            disabled={itemMutation.isPending}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="lg:text-2xl text-xl font-bold tracking-tight">
            Item Details
          </h2>
        </div>
        {canDelete && (
          <Button
            variant="destructive"
            className="w-[120px]"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={itemMutation.isPending || deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemForm
                initialData={item}
                clients={clients}
                onSubmit={handleSubmit}
                isReadOnly={!canEdit}
                loading={itemMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">UID:</span>
                <span className="font-mono">{item.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Barcode:</span>
                <div className="flex flex-col items-end gap-2">
                  <BarcodeDisplay value={item.barcode} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPdfModalOpen(true)}
                    disabled={itemMutation.isPending}
                  >
                    Print PDF
                  </Button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[298px]">
            <CardHeader className="flex flex-row pb-2">
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {item.photos.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No photos attached.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {item.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative group aspect-square">
                      <Image
                        src={photo}
                        alt={`Item photo ${index + 1}`}
                        className="object-cover w-full h-full rounded-md border cursor-pointer"
                        width={100}
                        height={100}
                        onClick={(e) => openGallery(e, index)}
                      />
                      {canEdit && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handlePhotoDelete(index)}
                          disabled={itemMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <GalleryModal
        images={item.photos}
        title={item.name}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={currentIndex}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{item.name}"</span>? This action
              cannot be undone.
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

      <BarcodePDFSheet
        item={item}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </div>
  );
}
