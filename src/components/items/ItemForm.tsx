"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Item, Client } from "@/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from "uuid";

const itemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  category: z.string().min(1, { message: "Category is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  value: z.coerce
    .number()
    .min(0, { message: "Value must be a positive number." }),
  clientId: z.string().min(1, { message: "Client is required." }),
  isLocked: z.boolean().default(false),
  pieces: z.coerce
    .number()
    .min(1, { message: "Must be at least 1 piece." })
    .default(1),
  action: z.enum(["SALE", "DISTRIBUTE", "DONATE", "OTHER"]).optional(),
  actionNote: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  initialData?: Item;
  clients: Client[];
  onSubmit: (data: ItemFormValues) => void;
  isReadOnly?: boolean;
}

import { useAppStore } from "@/store/store";
import { useAuth } from "@/providers/auth";

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
      category: initialData?.category || "",
      location: initialData?.location || "",
      value: initialData?.value || 0,
      clientId: initialData?.clientId || "",
      isLocked: initialData?.isLocked || false,
      pieces: initialData?.pieces || 1,
      action: initialData?.action,
      actionNote: initialData?.actionNote || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        category: initialData.category,
        location: initialData.location,
        value: initialData.value,
        clientId: initialData.clientId,
        isLocked: initialData.isLocked,
        pieces: initialData.pieces,
        action: initialData.action,
        actionNote: initialData.actionNote,
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Category"
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Location"
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
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
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
        </div>

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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Item description..."
                  className="resize-none"
                  {...field}
                  readOnly={effectiveReadOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!effectiveReadOnly && <Button type="submit">Save Changes</Button>}
      </form>
    </Form>
  );
}
