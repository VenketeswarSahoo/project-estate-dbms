"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FieldPath, UseFormSetValue } from "react-hook-form";

interface UseItemPhotosUploadOptions {
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: any) => void;
  maxSizeKB?: number; // default 500 KB per file
  maxFiles?: number; // maximum number of files to upload
}

export function useItemPhotosUpload<T extends Record<string, any>>({
  onUploadSuccess,
  onUploadError,
  maxSizeKB = 500,
  maxFiles = 10, // default max 10 files
}: UseItemPhotosUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  /**
   * Upload a single file to the API
   */
  const uploadSingleFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file); // Note: singular "file" as per API

    try {
      const response = await fetch(
        "https://staging-maskwa-api.synapsismedical.com/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.fileUrl || data.url || null;
    } catch (error) {
      console.error("Upload error for file:", file.name, error);
      throw error;
    }
  };

  /**
   * Validate files before uploading
   */
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

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  /**
   * Handle multiple photo uploads by uploading each file individually
   */
  const handleMultiPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue?: UseFormSetValue<T>,
    fieldName?: FieldPath<T>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to array
    const fileArray = Array.from(files);

    // Validate files
    const validation = validateFiles(fileArray);
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      e.target.value = ""; // reset input
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    try {
      // Upload files sequentially to maintain order
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        try {
          toast.loading(`Uploading ${i + 1}/${fileArray.length}: ${file.name}`);

          const fileUrl = await uploadSingleFile(file);

          if (fileUrl) {
            uploadedUrls.push(fileUrl);
            toast.dismiss();
            toast.success(`Uploaded: ${file.name}`);
          } else {
            failedFiles.push(file.name);
            toast.dismiss();
            toast.error(`Failed to upload: ${file.name}`);
          }
        } catch (error) {
          failedFiles.push(file.name);
          toast.dismiss();
          toast.error(`Failed to upload: ${file.name}`);
          console.error(`Error uploading ${file.name}:`, error);
        }

        // Update progress
        setUploadProgress(((i + 1) / fileArray.length) * 100);
      }

      // Update state with all successfully uploaded URLs
      if (uploadedUrls.length > 0) {
        // Combine existing photos with new ones
        const allPhotos = [...photoPreviews, ...uploadedUrls];
        setPhotoPreviews(allPhotos);

        if (setValue && fieldName) {
          setValue(fieldName, allPhotos as any);
        }

        onUploadSuccess?.(uploadedUrls);

        if (failedFiles.length > 0) {
          toast.warning(
            `Uploaded ${uploadedUrls.length} files. Failed: ${failedFiles.length} file(s)`
          );
        } else {
          toast.success(`Successfully uploaded ${uploadedUrls.length} file(s)`);
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
      e.target.value = ""; // Clear input
    }
  };

  /**
   * Handle camera capture (base64) by converting to File and uploading
   */
  const handleCameraCaptureUpload = async (
    base64Image: string,
    setValue?: UseFormSetValue<T>,
    fieldName?: FieldPath<T>
  ) => {
    setIsUploading(true);

    try {
      // Convert base64 to blob
      const response = await fetch(base64Image);
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], `camera-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      toast.loading("Uploading camera photo...");

      const fileUrl = await uploadSingleFile(file);

      if (fileUrl) {
        // Add to existing photos
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

  /**
   * Handle removal of a photo by index
   */
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
