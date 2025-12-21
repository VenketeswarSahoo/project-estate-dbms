"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const clientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." }),
  executorId: z.string().optional(),
  beneficiaryIds: z.array(z.string()).optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Client;
  users: User[];
  onSubmit: (data: ClientFormValues) => void;
  isReadOnly?: boolean;
  loading?: boolean;
}

export function ClientForm({
  initialData,
  users,
  onSubmit,
  isReadOnly = false,
  loading = false,
}: ClientFormProps) {
  const executors = users.filter((u) => u.role === "EXECUTOR");
  const beneficiaries = users.filter((u) => u.role === "BENEFICIARY");

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      executorId: initialData?.executorId || "",
      beneficiaryIds: initialData?.beneficiaryIds || [],
    },
  });

  const handleSubmit = (data: ClientFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            const target = e.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();

            if (tagName === "input" || tagName === "textarea") {
              e.preventDefault();
              form.handleSubmit(handleSubmit)();
            }
          }
        }}
        className="space-y-4 md:space-y-6"
      >
        {/* Mobile-first grid with responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Client Name - Full width on mobile, half on tablet+ */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel className="text-sm sm:text-base">
                    Client / Estate Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="The Smith Estate"
                      {...field}
                      readOnly={isReadOnly}
                      disabled={loading}
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Email - Full width on mobile, half on tablet+ */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel className="text-sm sm:text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="client@estate.com"
                      {...field}
                      readOnly={isReadOnly}
                      disabled={loading}
                      className="text-sm sm:text-base h-10 sm:h-11"
                      type="email"
                      inputMode="email"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Address - Full width on all devices */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel className="text-sm sm:text-base">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Maple Ave..."
                      {...field}
                      readOnly={isReadOnly}
                      disabled={loading}
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Executor - Full width on mobile, half on tablet+ */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <FormField
              control={form.control}
              name="executorId"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel className="text-sm sm:text-base">
                    Executor
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isReadOnly || loading}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                        <SelectValue
                          placeholder="Select an executor"
                          className="text-muted-foreground"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      className="max-h-[300px] sm:max-h-[400px]"
                      position="popper"
                      align="start"
                    >
                      {executors.map((executor) => (
                        <SelectItem
                          key={executor.id}
                          value={executor.id}
                          className="text-sm sm:text-base"
                        >
                          {executor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Beneficiaries - Full width on mobile, half on tablet+ */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <FormField
              control={form.control}
              name="beneficiaryIds"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormLabel className="text-sm sm:text-base">
                    Beneficiaries
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between h-10 sm:h-11 text-sm sm:text-base font-normal"
                          disabled={isReadOnly || loading}
                          type="button"
                        >
                          <span className="truncate mr-2">
                            {field.value && field.value.length > 0
                              ? `${field.value.length} beneficiar${
                                  field.value.length === 1 ? "y" : "ies"
                                } selected`
                              : "Select beneficiaries"}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[calc(100vw-32px)] sm:w-full p-0 max-w-sm sm:max-w-md"
                      align="start"
                      collisionPadding={16}
                    >
                      <div className="max-h-[50vh] sm:max-h-64 overflow-y-auto p-3 sm:p-4">
                        {beneficiaries.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-2 text-center">
                            No beneficiaries available
                          </p>
                        ) : (
                          <div className="space-y-2 sm:space-y-3">
                            {beneficiaries.map((beneficiary) => (
                              <div
                                key={beneficiary.id}
                                className="flex items-center space-x-2 sm:space-x-3 p-1 hover:bg-accent rounded-md"
                              >
                                <Checkbox
                                  id={`beneficiary-${beneficiary.id}`}
                                  checked={field.value?.includes(
                                    beneficiary.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    if (checked) {
                                      field.onChange([
                                        ...currentValue,
                                        beneficiary.id,
                                      ]);
                                    } else {
                                      field.onChange(
                                        currentValue.filter(
                                          (id) => id !== beneficiary.id
                                        )
                                      );
                                    }
                                  }}
                                  disabled={isReadOnly || loading}
                                  className="h-4 w-4 sm:h-5 sm:w-5"
                                />
                                <label
                                  htmlFor={`beneficiary-${beneficiary.id}`}
                                  className="text-sm sm:text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 truncate py-1"
                                  onClick={() => {
                                    if (isReadOnly || loading) return;
                                    const currentValue = field.value || [];
                                    const isSelected = currentValue.includes(
                                      beneficiary.id
                                    );
                                    if (isSelected) {
                                      field.onChange(
                                        currentValue.filter(
                                          (id) => id !== beneficiary.id
                                        )
                                      );
                                    } else {
                                      field.onChange([
                                        ...currentValue,
                                        beneficiary.id,
                                      ]);
                                    }
                                  }}
                                >
                                  {beneficiary.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="border-t p-3 sm:p-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs sm:text-sm"
                            onClick={() => field.onChange([])}
                            disabled={isReadOnly || loading}
                          >
                            Clear selection
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit button with responsive sizing */}
        <div className="flex justify-end pt-2 sm:pt-4">
          {!isReadOnly && (
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-8"
              size="lg"
            >
              Save Client
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
