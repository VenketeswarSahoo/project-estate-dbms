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
}

export function ClientForm({
  initialData,
  users,
  onSubmit,
  isReadOnly = false,
}: ClientFormProps) {
  const executors = users.filter((u) => u.role === "EXECUTOR");
  const beneficiaries = users.filter((u) => u.role === "BENEFICIARY");

  console.log(beneficiaries);
  console.log(initialData);

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
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client / Estate Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="The Smith Estate"
                    {...field}
                    readOnly={isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="client@estate.com"
                    {...field}
                    readOnly={isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Maple Ave..."
                    {...field}
                    readOnly={isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="executorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Executor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isReadOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an executor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {executors.map((executor) => (
                      <SelectItem key={executor.id} value={executor.id}>
                        {executor.name}
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
            name="beneficiaryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficiaries</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                        disabled={isReadOnly}
                        type="button"
                      >
                        {field.value && field.value.length > 0
                          ? `${field.value.length} beneficiar${
                              field.value.length === 1 ? "y" : "ies"
                            } selected`
                          : "Select beneficiaries"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <div className="max-h-64 overflow-y-auto p-4">
                      {beneficiaries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No beneficiaries available
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {beneficiaries.map((beneficiary) => (
                            <div
                              key={beneficiary.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                checked={field.value?.includes(beneficiary.id)}
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
                                disabled={isReadOnly}
                              />
                              <label
                                htmlFor={beneficiary.id}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                onClick={() => {
                                  if (isReadOnly) return;
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
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          {!isReadOnly && <Button type="submit">Save Client</Button>}
        </div>
      </form>
    </Form>
  );
}
