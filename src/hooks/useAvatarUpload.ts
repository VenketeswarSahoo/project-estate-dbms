"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseAvatarUploadOptions {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: any) => void;
  maxSizeKB?: number; // default 500 KB
}

export function useAvatarUpload({
  onUploadSuccess,
  onUploadError,
  maxSizeKB = 500,
}: UseAvatarUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Validate file size (in KB)
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      toast.error(`File size exceeds ${maxSizeKB} KB limit`);
      e.target.value = ""; // reset input
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://staging-maskwa-api.synapsismedical.com/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.fileUrl;

        if (imageUrl) {
          // ✅ Only set preview when upload is successful
          setAvatarPreview(imageUrl);
          onUploadSuccess?.(imageUrl);
          toast.success("Image uploaded successfully");
        }
      } else {
        console.error("Upload failed");
        toast.error("Failed to upload image");
        onUploadError?.("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload error");
      onUploadError?.(error);

      // fallback to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        onUploadSuccess?.(base64);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    avatarPreview,
    setAvatarPreview,
    isUploading,
    handleAvatarUpload,
  };
}
