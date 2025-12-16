"use client";

import { BarcodeDisplay } from "@/components/common/BarcodeDisplay";
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
import { generateBarcodePDF } from "@/lib/utils/pdf-generator";
import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import { ArrowLeft, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { items, users, updateItem, deleteItem, fetchUsers, fetchItems } =
    useAppStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchItems();
  }, [fetchUsers, fetchItems]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const itemId = params.id as string;
  const item = items.find((i) => i.id === itemId);

  if (!user || !item) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Item not found or access denied.</p>
      </div>
    );
  }

  const canEdit =
    (user.role === "ADMIN" || user.role === "AGENT") && !item.isLocked;
  const canDelete = user.role === "ADMIN";

  const clients = users.filter((u) => u.role === "CLIENT");

  const handleSubmit = (data: any) => {
    updateItem(itemId, data);
    toast.success("Item updated successfully");
  };

  const handleDeleteConfirm = () => {
    deleteItem(itemId);
    toast.success("Item deleted");
    setDeleteDialogOpen(false);
    router.push("/dashboard/items");
  };

  const openGallery = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setGalleryOpen(true);
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
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
                    onClick={() => generateBarcodePDF(item)}
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
                  {item.photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <Image
                        src={photo}
                        alt={`Item photo ${index + 1}`}
                        className="object-cover w-full h-full rounded-md border"
                        width={100}
                        height={100}
                        onClick={(e) => openGallery(e, index)}
                      />
                      {canEdit && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const updatedPhotos = item.photos.filter(
                              (_, i) => i !== index
                            );
                            updateItem(itemId, { photos: updatedPhotos });
                            toast.success("Photo removed");
                          }}
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
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{item.name}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
