"use client";

import { storage } from "@/lib/auth/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { FieldPath, UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

interface UseItemPhotosUploadOptions {
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: any) => void;
  maxSizeKB?: number;
  maxFiles?: number;
}

export function useItemPhotosUpload<T extends Record<string, any>>({
  onUploadSuccess,
  onUploadError,
  maxSizeKB = 2048,
  maxFiles = 10,
}: UseItemPhotosUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadSingleFile = async (file: File): Promise<string | null> => {
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `items/${fileName}`;
    const storageRef = ref(storage, filePath);

    return new Promise<string | null>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress for ${file.name}: ${progress}%`);
        },
        (error) => {
          console.error("Firebase upload error for file:", file.name, error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (error) {
            console.error("Error getting download URL:", error);
            reject(error);
          }
        }
      );
    });
  };

  const validateFiles = (
    files: File[]
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(
        `Maximum ${maxFiles} files allowed. You selected ${files.length}.`
      );
      return { valid: false, errors };
    }

    for (const file of files) {
      const fileSizeKB = file.size / 1024;
      if (fileSizeKB > maxSizeKB) {
        errors.push(`"${file.name}" exceeds ${maxSizeKB} KB limit`);
      }
      if (
        !["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type
        )
      ) {
        errors.push(
          `"${file.name}" is not a supported image type (JPEG, PNG, WebP only)`
        );
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleMultiPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue?: UseFormSetValue<T>,
    fieldName?: FieldPath<T>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    const validation = validateFiles(fileArray);
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    try {
      const uploadPromises = fileArray.map((file, index) =>
        uploadSingleFileWithToast(file, index + 1, fileArray.length)
      );

      const results = await Promise.allSettled(uploadPromises);

      results.forEach((result, index) => {
        const file = fileArray[index];

        if (result.status === "fulfilled" && result.value) {
          uploadedUrls.push(result.value);
          toast.success(`Uploaded: ${file.name}`);
        } else {
          failedFiles.push(file.name);
          toast.error(`Failed to upload: ${file.name}`);
          console.error(
            `Error uploading ${file.name}:`,
            result.status === "rejected" ? result.reason : "Unknown error"
          );
        }
      });

      setUploadProgress(100);

      if (uploadedUrls.length > 0) {
        const allPhotos = [...photoPreviews, ...uploadedUrls];
        setPhotoPreviews(allPhotos);

        if (setValue && fieldName) {
          setValue(fieldName, allPhotos as any);
        }

        onUploadSuccess?.(uploadedUrls);

        if (failedFiles.length > 0) {
          toast.warning(
            `Uploaded ${uploadedUrls.length}/${fileArray.length} files`
          );
        } else {
          toast.success(
            `Successfully uploaded all ${uploadedUrls.length} files`
          );
        }
      } else {
        toast.error("No files were uploaded successfully");
        onUploadError?.("All uploads failed");
      }
    } catch (error) {
      console.error("Batch upload error:", error);
      toast.error("Upload process failed");
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const uploadSingleFileWithToast = async (
    file: File,
    current: number,
    total: number
  ): Promise<string | null> => {
    toast.loading(`Uploading ${current}/${total}: ${file.name}`);

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `items/${fileName}`;
    const storageRef = ref(storage, filePath);

    return new Promise<string | null>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(
            `[${current}/${total}] ${file.name}: ${progress.toFixed(0)}%`
          );
        },
        (error) => {
          console.error("Firebase upload error:", error);
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
  };

  const handleCameraCaptureUpload = async (
    base64Image: string,
    setValue?: UseFormSetValue<T>,
    fieldName?: FieldPath<T>
  ) => {
    setIsUploading(true);

    try {
      const response = await fetch(base64Image);
      const blob = await response.blob();

      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      toast.loading("Uploading camera photo...");

      const fileUrl = await uploadSingleFile(file);

      if (fileUrl) {
        const allPhotos = [...photoPreviews, fileUrl];
        setPhotoPreviews(allPhotos);

        if (setValue && fieldName) {
          setValue(fieldName, allPhotos as any);
        }

        toast.dismiss();
        toast.success("Camera photo uploaded successfully");
        onUploadSuccess?.([fileUrl]);
      } else {
        toast.dismiss();
        toast.error("Failed to upload camera photo");
      }
    } catch (error) {
      console.error("Camera upload error:", error);
      toast.error("Failed to upload camera photo");
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photoPreviews];
    newPhotos.splice(index, 1);
    setPhotoPreviews(newPhotos);
    return newPhotos;
  };

  return {
    photoPreviews,
    setPhotoPreviews,
    isUploading,
    uploadProgress,
    handleMultiPhotoUpload,
    handleCameraCaptureUpload,
    removePhoto,
  };
}
