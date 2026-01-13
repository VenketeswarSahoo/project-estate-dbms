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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteItem, useItemMutation, useItems } from "@/lib/hooks/useItems";
import { useUsers } from "@/lib/hooks/useUsers";
import {
  generateBarcodeDataUrl,
  generateBarcodePDF,
  generateBarcodePDFBlobUrl,
} from "@/lib/utils/pdf-generator";
import { useAppStore } from "@/store/useAppStore";
import { Item, User } from "@/types";
import {
  Check,
  ChevronLeft,
  Copy,
  Loader,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppStore();

  const { data: items = [], isLoading: isItemsLoading } = useItems();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const itemMutation = useItemMutation();
  const deleteMutation = useDeleteItem();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [printSettingsOpen, setPrintSettingsOpen] = useState(false);
  const [printQuantity, setPrintQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const itemId = params.id as string;
  const item = items.find((i: Item) => i.id === itemId);
  const isLoading = isItemsLoading || isUsersLoading;

  const handleCopyUID = () => {
    navigator.clipboard.writeText(item.uid);
    setCopied(true);
    toast.success("UID copied to clipboard");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  useEffect(() => {
    if (!isLoading && !item) {
      toast.error("Item not found");
      router.push("/dashboard/items");
    }
  }, [isLoading, item, router]);

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
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [deleteDialogOpen, deleteMutation.isPending]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
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

  const handlePrintButtonClick = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      setPrintQuantity(item.pieces || 1);
      setPrintSettingsOpen(true);
    } else {
      setPdfModalOpen(true);
    }
  };

  const handlePrintWithQuantity = (quantity: number) => {
    const imageUrl = generateBarcodeDataUrl(item);
    const dateStr = new Date().toLocaleDateString();

    const oldIframe = document.getElementById("print-iframe");
    if (oldIframe) {
      document.body.removeChild(oldIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "print-iframe";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    let imagesHtml = "";
    for (let i = 0; i < quantity; i++) {
      imagesHtml += `
        <div class="label-container" style="page-break-after: always; page-break-inside: avoid;">
            <!-- Zone 1: Header -->
            <div class="header-zone">
                <div class="indicator-box">E</div>
                <div class="header-info">
                    <div class="company-title">ONARACH ESTATE APP</div>
                    <div class="meta-info">UID: ${item.uid}</div>
                    <div class="meta-info">DATE: ${dateStr}</div>
                </div>
            </div>

            <!-- Zone 2: Banner -->
            <div class="banner-zone">
                OFFICIAL INVENTORY
            </div>

            <!-- Zone 3: Address / Details -->
            <div class="address-zone">
                <div class="item-name">${item.name}</div>
                <div class="piece-count">PIECE ${i + 1} OF ${quantity}</div>
            </div>

            <!-- Zone 4: Barcode -->
            <div class="barcode-zone">
                <div class="tracking-label">TRACKING #</div>
                <div class="barcode-img-wrapper">
                    <img src="${imageUrl}" />
                </div>
            </div>
        </div>`;
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Print Labels - ${item.name}</title>
            <style>
                @page { 
                    size: 4in 6in; 
                    margin: 0; 
                }
                
                @media print {
                    body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: sans-serif; 
                        width: 4in; 
                        background: white;
                    }
                    html { 
                        margin: 0; 
                        padding: 0; 
                        width: 4in; 
                    }
                    
                    * { box-sizing: border-box; }

                    .label-container { 
                        width: 4in;
                        height: 6in;
                        padding: 0.15in;
                        position: relative;
                        page-break-after: always;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: column;
                        border: 1px solid #ccc;
                        background: white;
                    }
                    .label-container:last-child {
                        page-break-after: auto;
                    }

                    /* Zone 1 */
                    .header-zone {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 0.08in;
                    }
                    .indicator-box {
                        width: 0.7in;
                        height: 0.7in;
                        border: 2px solid black;
                        font-size: 32pt;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 0.15in;
                        flex-shrink: 0;
                    }
                    .header-info {
                        flex: 1;
                        padding-top: 0.08in;
                    }
                    .company-title { 
                        font-size: 10pt; 
                        font-weight: bold; 
                        margin-bottom: 0.04in; 
                    }
                    .meta-info { 
                        font-family: monospace; 
                        font-size: 8pt; 
                        margin-bottom: 0.04in; 
                    }

                    /* Zone 2 */
                    .banner-zone {
                        border-top: 0.06in solid black;
                        border-bottom: 0.02in solid black;
                        padding: 0.08in 0;
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        margin-bottom: 0.15in;
                    }

                    /* Zone 3 */
                    .address-zone {
                        flex: 1;
                        padding-left: 0.08in;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .item-name { 
                        font-size: 20pt; 
                        font-weight: bold; 
                        line-height: 1.1; 
                        margin-bottom: 0.08in; 
                        text-transform: uppercase;
                        word-wrap: break-word;
                    }
                    .piece-count { 
                        font-size: 10pt; 
                        color: #555; 
                    }

                    /* Zone 4 */
                    .barcode-zone {
                        height: 1.8in;
                        border-top: 0.08in solid black;
                        padding-top: 0.08in;
                        display: flex;
                        flex-direction: column;
                    }
                    .tracking-label { 
                        font-size: 9pt; 
                        font-weight: bold; 
                        margin-bottom: 0.04in; 
                    }
                    .barcode-img-wrapper {
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .barcode-img-wrapper img {
                        max-width: 95%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                }

                @media screen {
                    body {
                        background: #f5f5f5;
                        padding: 20px;
                    }
                    .label-container {
                        width: 4in;
                        height: 6in;
                        padding: 0.15in;
                        margin: 0 auto 20px;
                        background: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        display: flex;
                        flex-direction: column;
                        border: 1px solid #ccc;
                    }
                    .header-zone {
                        display: flex;
                        align-items: flex-start;
                        margin-bottom: 0.08in;
                    }
                    .indicator-box {
                        width: 0.7in;
                        height: 0.7in;
                        border: 2px solid black;
                        font-size: 32pt;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 0.15in;
                        flex-shrink: 0;
                    }
                    .header-info {
                        flex: 1;
                        padding-top: 0.08in;
                    }
                    .company-title { 
                        font-size: 10pt; 
                        font-weight: bold; 
                        margin-bottom: 0.04in; 
                    }
                    .meta-info { 
                        font-family: monospace; 
                        font-size: 8pt; 
                        margin-bottom: 0.04in; 
                    }
                    .banner-zone {
                        border-top: 0.06in solid black;
                        border-bottom: 0.02in solid black;
                        padding: 0.08in 0;
                        text-align: center;
                        font-size: 14pt;
                        font-weight: bold;
                        margin-bottom: 0.15in;
                    }
                    .address-zone {
                        flex: 1;
                        padding-left: 0.08in;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .item-name { 
                        font-size: 20pt; 
                        font-weight: bold; 
                        line-height: 1.1; 
                        margin-bottom: 0.08in; 
                        text-transform: uppercase;
                        word-wrap: break-word;
                    }
                    .piece-count { 
                        font-size: 10pt; 
                        color: #555; 
                    }
                    .barcode-zone {
                        height: 1.8in;
                        border-top: 0.08in solid black;
                        padding-top: 0.08in;
                        display: flex;
                        flex-direction: column;
                    }
                    .tracking-label { 
                        font-size: 9pt; 
                        font-weight: bold; 
                        margin-bottom: 0.04in; 
                    }
                    .barcode-img-wrapper {
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .barcode-img-wrapper img {
                        max-width: 95%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                }
            </style>
        </head>
        <body>
            ${imagesHtml}
            <script>
                window.addEventListener('load', function() {
                    console.log('Page loaded with ${quantity} labels');
                });
            </script>
        </body>
        </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 1000);
    }

    setPrintSettingsOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/items")}
            aria-label="Go back"
            title="Navigate back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Item Details
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              View and edit item details
            </p>
          </div>
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
            <CardContent className="space-y-6">
              <div>
                <div className="space-y-0.5 mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unique Identifier
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    System-generated ID for tracking
                  </p>
                </div>

                <div className="relative">
                  <Input
                    value={item.uid}
                    readOnly
                    className="pr-12 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={handleCopyUID}
                    title={copied ? "Copied!" : "Copy UID"}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-500 animate-in fade-in" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 animate-in fade-in" />
                    )}
                    <span className="sr-only">Copy UID</span>
                  </Button>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Barcode Section */}
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Barcode
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Item identification code
                  </p>
                </div>

                <BarcodeDisplay value={item.barcode} />

                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={handlePrintButtonClick}
                  disabled={itemMutation.isPending}
                >
                  <Printer className="h-3.5 w-3.5 mr-2" />
                  Generate Barcode PDF
                </Button>
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
                  <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Settings Dialog for Android */}
      <Dialog open={printSettingsOpen} onOpenChange={setPrintSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Print Settings</DialogTitle>
            <DialogDescription>
              Configure print settings for {item.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Number of Labels</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="999"
                value={printQuantity}
                onChange={(e) =>
                  setPrintQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Each label will be numbered (e.g., PIECE 1 OF {printQuantity})
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <p className="text-sm font-medium">Print Instructions:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>In print preview, tap "More options" or settings icon</li>
                <li>Set paper size to "Index Card 4x6" or "4 x 6 inches"</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPrintSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handlePrintWithQuantity(printQuantity)}
              className="w-full"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print {printQuantity} Label{printQuantity > 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BarcodePDFSheet
        item={item}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </div>
  );
}
