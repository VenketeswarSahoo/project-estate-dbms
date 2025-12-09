"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const clientSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters." }),
  executorId: z.string().min(1, { message: "Executor is required." }),
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

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name || "",
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
          name="address"
          render={({ field }) => (
            <FormItem>
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
                defaultValue={field.value}
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

        <div className="flex justify-end">
          {!isReadOnly && <Button type="submit">Save Client</Button>}
        </div>
      </form>
    </Form>
  );
}
