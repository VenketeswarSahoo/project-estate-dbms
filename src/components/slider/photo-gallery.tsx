// components/photo-gallery.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GalleryModal } from "./gallery-modal";

interface PhotoGalleryProps {
  photos: string[];
  title: string;
  canEdit?: boolean;
  onDeletePhoto?: (index: number) => void;
}

export function PhotoGallery({
  photos,
  title,
  canEdit = false,
  onDeletePhoto,
}: PhotoGalleryProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openGallery = (index: number) => {
    setSelectedIndex(index);
    setGalleryOpen(true);
  };

  if (photos.length === 0) {
    return (
      <Card className="min-h-[298px]">
        <CardHeader className="flex flex-row pb-2">
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-4">
            No photos attached.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="min-h-[298px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Photos ({photos.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => openGallery(0)}>
            <Maximize2 className="h-4 w-4 mr-2" />
            View Gallery
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={photo}
                  alt={`${title} photo ${index + 1}`}
                  className="object-cover w-full h-full rounded-md border cursor-pointer hover:opacity-90 transition-opacity"
                  width={200}
                  height={200}
                  onClick={() => openGallery(index)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />

                {/* Delete Button */}
                {canEdit && onDeletePhoto && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhoto(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}

                {/* Image Number */}
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Modal */}
      <GalleryModal
        images={photos}
        title={title}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={selectedIndex}
      />
    </>
  );
}
