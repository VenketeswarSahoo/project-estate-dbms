"use client";

import React, { useState } from "react";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/store";
import { useRouter } from "next/navigation";

export function BarcodeScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { items } = useAppStore();

  const handleSimulateScan = () => {
    const randomItem = items[0];
    if (randomItem) {
      toast.success(`Barcode detected: ${randomItem.barcode}`);
      setIsOpen(false);
      router.push(`/dashboard/items/${randomItem.id}`);
    } else {
      toast.error("No items found to scan.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Scan Barcode">
          <Scan className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
            {isOpen && (
              <Webcam
                audio={false}
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white/50 rounded-lg"></div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Point camera at a barcode.
          </p>
          <Button onClick={handleSimulateScan} className="w-full">
            Simulate Scan Detection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
