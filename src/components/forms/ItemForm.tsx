"use client";

import { CameraCapture } from "@/components/common/CameraCapture";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Client, Item } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
}

import { useAuth } from "@/providers/auth";
import { useAppStore } from "@/store/store";
import Image from "next/image";

export function ItemForm({
  initialData,
  clients,
  onSubmit,
  isReadOnly = false,
}: ItemFormProps) {
  const { user } = useAuth();
  const { addClientBeneficiary, addClientDonationRecipient, addClientAction } =
    useAppStore();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const currentPhotos = form.getValues("photos") || [];
          form.setValue("photos", [...currentPhotos, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCameraCapture = (imageSrc: string) => {
    const currentPhotos = form.getValues("photos") || [];
    form.setValue("photos", [...currentPhotos, imageSrc]);
  };

  const removePhoto = (index: number) => {
    const currentPhotos = form.getValues("photos") || [];
    const newPhotos = [...currentPhotos];
    newPhotos.splice(index, 1);
    form.setValue("photos", newPhotos);
  };

  const handleSubmit = (data: ItemFormValues) => {
    if (data.clientId) {
      if (data.action === "DISTRIBUTE" && data.actionNote) {
        addClientBeneficiary(data.clientId, data.actionNote);
      }
      if (data.action === "DONATE" && data.actionNote) {
        addClientDonationRecipient(data.clientId, data.actionNote);
      }
      if (data.action === "OTHER" && data.actionNote) {
        addClientAction(data.clientId, data.actionNote);
      }
    }
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
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      {isReadOnly && !isUnlocked && canUnlock && (
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsUnlocked(true)}
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
                    readOnly={effectiveReadOnly}
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
                  disabled={effectiveReadOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
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
                  className="h-24 resize-none "
                  {...field}
                  readOnly={effectiveReadOnly}
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
                  disabled={effectiveReadOnly}
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

              const showBeneficiarySelect = action === "DISTRIBUTE" && clientId;
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
                        />
                        <datalist id="saved-beneficiaries">
                          {currentClient?.savedBeneficiaries?.map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                      </div>
                    ) : showDonationSelect ? (
                      <div className="relative">
                        <Input
                          list="saved-donations"
                          placeholder="Type or select Recipient..."
                          {...field}
                          readOnly={effectiveReadOnly}
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
                        />
                        <datalist id="saved-actions">
                          {currentClient?.savedActions?.map((act) => (
                            <option key={act} value={act} />
                          ))}
                        </datalist>
                      </div>
                    ) : (
                      <Input
                        placeholder="Details..."
                        {...field}
                        readOnly={effectiveReadOnly}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Photos Section */}
        <div className="space-y-4">
          <FormLabel>Photos</FormLabel>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              disabled={effectiveReadOnly}
            />

            {!effectiveReadOnly && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
                <CameraCapture onCapture={handleCameraCapture} />
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {form.watch("photos")?.map((photo, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-md overflow-hidden border"
              >
                <Image
                  src={photo}
                  alt={`Item photo ${index + 1}`}
                  className="object-cover w-full h-full"
                  width={200}
                  height={200}
                />
                {!effectiveReadOnly && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {(!form.watch("photos") || form.watch("photos")?.length === 0) && (
              <div className="col-span-2 md:col-span-4 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-muted-foreground">
                <ImageIcon className="h-8 w-8 mb-2" />
                <p>No photos added yet</p>
              </div>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="isLocked"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={effectiveReadOnly}
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

        <div className="flex justify-end">
          {!effectiveReadOnly && <Button type="submit">Save Changes</Button>}
        </div>
      </form>
    </Form>
  );
}
