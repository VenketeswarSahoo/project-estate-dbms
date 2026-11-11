"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseAvatarUploadOptions {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: any) => void;
  maxSizeKB?: number;
}

export function useAvatarUpload({
  onUploadSuccess,
  onUploadError,
  maxSizeKB = 2048,
}: UseAvatarUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      toast.error(`File size exceeds ${maxSizeKB} KB limit`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      toast.loading("Uploading avatar...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "avatars");
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      const fileUrl: string = result.url;
      toast.dismiss();

      setAvatarPreview(fileUrl); // ✅ use the URL, not the path
      onUploadSuccess?.(fileUrl); // ✅ return URL to parent
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Upload failed");
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // reset input
    }
  };

  return {
    avatarPreview,
    setAvatarPreview,
    isUploading,
    handleAvatarUpload,
  };
}
