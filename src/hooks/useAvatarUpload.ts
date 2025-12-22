"use client";

import { storage } from "@/lib/auth/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
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

      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `avatars/${fileName}`;
      const storageRef = ref(storage, filePath);

      await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Avatar upload: ${progress.toFixed(0)}%`);
          },
          (error) => {
            console.error("Firebase avatar upload error:", error);
            toast.dismiss();
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              toast.dismiss();
              resolve(url);
            } catch (error) {
              toast.dismiss();
              reject(error);
            }
          }
        );
      });

      setAvatarPreview(filePath);
      onUploadSuccess?.(filePath);
      toast.success("Avatar uploaded successfully");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Upload failed");
      onUploadError?.(error);
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
