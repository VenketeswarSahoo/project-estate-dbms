"use client";

import { CameraCapture } from "@/components/common/CameraCapture";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useItemPhotosUpload } from "@/hooks/use-item-photos-upload";
import { useAppStore } from "@/store/useAppStore";
import { Client, Item } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GalleryModal } from "../slider/gallery-modal";
import { Checkbox } from "../ui/checkbox";

const itemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  clientId: z.string().min(1, { message: "Client is required." }),
  isLocked: z.boolean().default(false),
  pieces: z.coerce
    .number()
    .min(1, { message: "Must be at least 1 piece." })
    .default(1),
  action: z.enum(["SALE", "DISTRIBUTE", "DONATE", "OTHER"]).optional(),
  actionNote: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  initialData?: Item;
  clients: Client[];
  onSubmit: (data: ItemFormValues) => void;
  isReadOnly?: boolean;
  loading?: boolean;
}

export function ItemForm({
  initialData,
  clients = [],
  onSubmit,
  isReadOnly = false,
  loading = false,
}: ItemFormProps) {
  const { user } = useAppStore();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [galleryOpen, setGalleryOpen] = React.useState(false);

  // Initialize the photo upload hook
  const {
    photoPreviews,
    setPhotoPreviews,
    isUploading,
    uploadProgress,
    handleMultiPhotoUpload,
    handleCameraCaptureUpload,
    removePhoto: hookRemovePhoto,
  } = useItemPhotosUpload<ItemFormValues>({
    onUploadSuccess: (urls) => {
      console.log("Uploaded URLs:", urls);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
    },
    maxSizeKB: 500,
    maxFiles: 20,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleMultiPhotoUpload(e, form.setValue, "photos");
  };

  const handleCameraCapture = (imageSrc: string) => {
    handleCameraCaptureUpload(imageSrc, form.setValue, "photos");
  };

  const removePhoto = (index: number) => {
    const newPhotos = hookRemovePhoto(index);
    form.setValue("photos", newPhotos);
  };

  const handleSubmit = (data: ItemFormValues) => {
    onSubmit(data);
  };

  const effectiveReadOnly = isReadOnly && !isUnlocked;
  const canUnlock = user?.role === "ADMIN" || user?.role === "AGENT";

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      clientId: initialData?.clientId || "",
      isLocked: initialData?.isLocked || false,
      pieces: initialData?.pieces || 1,
      action: initialData?.action,
      actionNote: initialData?.actionNote || "",
      photos: initialData?.photos || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        clientId: initialData.clientId,
        isLocked: initialData.isLocked,
        pieces: initialData.pieces,
        action: initialData.action,
        actionNote: initialData.actionNote,
        photos: initialData.photos,
      });
      setPhotoPreviews(initialData.photos || []);
    }
  }, [initialData, form, setPhotoPreviews]);

  const openGallery = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setGalleryOpen(true);
    setCurrentIndex(index);
  };

  const currentPhotos = form.watch("photos") || [];

  return (
    <>
      <Form {...form}>
        {isReadOnly && !isUnlocked && canUnlock && (
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUnlocked(true)}
              disabled={loading}
            >
              Unlock for Edit
            </Button>
          </div>
        )}
        <form
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (e.target instanceof HTMLTextAreaElement) {
                e.preventDefault();
                form.handleSubmit(handleSubmit)();
              } else if (
                e.target instanceof HTMLInputElement &&
                e.target.type !== "file"
              ) {
                e.preventDefault();
                form.handleSubmit(handleSubmit)();
              }
            }
          }}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Item Name"
                      {...field}
                      type="text"
                      allowNumbers
                      readOnly={effectiveReadOnly}
                      disabled={loading}
                      maxLength={120}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={effectiveReadOnly || loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Item description..."
                    className="h-24 resize-none"
                    {...field}
                    readOnly={effectiveReadOnly}
                    disabled={loading}
                    maxLength={500}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="pieces"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Pieces</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      readOnly={effectiveReadOnly}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={effectiveReadOnly || loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SALE">Sale</SelectItem>
                      <SelectItem value="DISTRIBUTE">Distribute</SelectItem>
                      <SelectItem value="DONATE">Donate</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="actionNote"
              render={({ field }) => {
                const action = form.watch("action");
                const clientId = form.watch("clientId");
                const currentClient = clients.find((c) => c.id === clientId);

                const showBeneficiarySelect =
                  action === "DISTRIBUTE" && clientId;
                const showDonationSelect = action === "DONATE" && clientId;
                const showCustomActionSelect = action === "OTHER" && clientId;

                return (
                  <FormItem>
                    <FormLabel>
                      {action === "DISTRIBUTE"
                        ? "Beneficiary Name"
                        : action === "DONATE"
                        ? "Donation Recipient"
                        : action === "OTHER"
                        ? "Custom Action"
                        : "Action Note"}
                    </FormLabel>
                    <FormControl>
                      {showBeneficiarySelect ? (
                        <div className="relative">
                          <Input
                            list="saved-beneficiaries"
                            placeholder="Type or select Beneficiary..."
                            {...field}
                            readOnly={effectiveReadOnly}
                            disabled={loading}
                            type="text"
                            allowNumbers
                            maxLength={50}
                          />
                        </div>
                      ) : showDonationSelect ? (
                        <div className="relative">
                          <Input
                            list="saved-donations"
                            placeholder="Type or select Recipient..."
                            {...field}
                            readOnly={effectiveReadOnly}
                            disabled={loading}
                            type="text"
                            allowNumbers
                            maxLength={50}
                          />
                          <datalist id="saved-donations">
                            {currentClient?.savedDonationRecipients?.map(
                              (name) => (
                                <option key={name} value={name} />
                              )
                            )}
                          </datalist>
                        </div>
                      ) : showCustomActionSelect ? (
                        <div className="relative">
                          <Input
                            list="saved-actions"
                            placeholder="Type or select Action..."
                            {...field}
                            readOnly={effectiveReadOnly}
                            disabled={loading}
                            type="text"
                            allowNumbers
                            maxLength={50}
                          />
                        </div>
                      ) : (
                        <Input
                          placeholder="Details..."
                          {...field}
                          readOnly={effectiveReadOnly}
                          disabled={loading}
                          type="text"
                          allowNumbers
                          maxLength={50}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <FormField
            control={form.control}
            name="isLocked"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-8">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={effectiveReadOnly || loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Lock Item</FormLabel>
                  <FormDescription>
                    Prevent further edits to this item.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Photos Section */}
          <div className="space-y-4">
            <FormLabel>Photos</FormLabel>
            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                disabled={effectiveReadOnly || isUploading || loading}
              />

              {!effectiveReadOnly && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || loading}
                  >
                    {isUploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photos
                      </>
                    )}
                  </Button>
                  <CameraCapture onCapture={handleCameraCapture} />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {currentPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-md overflow-hidden border"
                >
                  <Image
                    src={photo}
                    alt={`Item photo ${index + 1}`}
                    className="object-cover w-full h-full cursor-pointer"
                    width={200}
                    height={200}
                    onClick={(e) => openGallery(e, index)}
                  />
                  {!effectiveReadOnly && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity"
                      disabled={isUploading || loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {currentPhotos.length === 0 && (
                <div className="col-span-2 md:col-span-4 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <p>No photos added yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            {!effectiveReadOnly && (
              <Button
                type="submit"
                disabled={isUploading || loading}
                loading={loading}
              >
                {isUploading ? "Uploading..." : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </Form>
      <GalleryModal
        images={currentPhotos}
        title={form.watch("name")}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={currentIndex}
      />
    </>
  );
}
