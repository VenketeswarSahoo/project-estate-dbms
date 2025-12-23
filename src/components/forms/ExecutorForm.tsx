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
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const executorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Password must be at least 6 characters",
    }),
  avatar: z.string().optional(),
});

type ExecutorFormValues = z.infer<typeof executorSchema>;

interface ExecutorFormProps {
  initialData?: User;
  onSubmit: (data: ExecutorFormValues) => void;
  loading?: boolean;
}

export function ExecutorForm({
  initialData,
  onSubmit,
  loading,
}: ExecutorFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { avatarPreview, setAvatarPreview, isUploading, handleAvatarUpload } =
    useAvatarUpload({
      onUploadSuccess: (url) => form.setValue("avatar", url),
    });

  const form = useForm<ExecutorFormValues>({
    resolver: zodResolver(executorSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      avatar: initialData?.avatar || "",
    },
  });

  useEffect(() => {
    if (initialData?.avatar) {
      setAvatarPreview(initialData.avatar);
    }
  }, [initialData, setAvatarPreview]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Executor Name"
                  {...field}
                  type="text"
                  maxLength={50}
                  minLength={2}
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
                  placeholder="executor@example.com"
                  {...field}
                  type="email"
                  maxLength={254}
                  minLength={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {initialData
                  ? "Password (leave blank to keep current)"
                  : "Password"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={initialData ? "••••••••" : "Password"}
                  {...field}
                  maxLength={64}
                  minLength={8}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" loading={loading}>
            Save Executor
          </Button>
        </div>
      </form>
    </Form>
  );
}
