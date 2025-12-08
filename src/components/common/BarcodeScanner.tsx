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
import { Input } from "@/components/ui/input";
import { Scan, Search } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/store";
import { useRouter } from "next/navigation";

export function BarcodeScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { items } = useAppStore();

  const [manualBarcode, setManualBarcode] = useState("");

  const handleManualSearch = () => {
    if (!manualBarcode) return;

    const foundItem = items.find((i) => i.barcode === manualBarcode);
    if (foundItem) {
      toast.success(`Item found: ${foundItem.name}`);
      setIsOpen(false);
      router.push(`/dashboard/items/${foundItem.id}`);
      setManualBarcode("");
    } else {
      toast.error("Barcode not found.");
    }
  };

  const handleSimulateScan = () => {
    // Pick a completely random item
    if (items.length === 0) {
      toast.error("No items in database.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    const randomItem = items[randomIndex];

    if (randomItem) {
      toast.success(`Detected: ${randomItem.barcode} (${randomItem.name})`);
      setIsOpen(false);
      router.push(`/dashboard/items/${randomItem.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          title="Scan Barcode"
          className="text-sm w-[180px]"
        >
          <Scan className="h-5 w-5" />
          Scan Barcode
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Enter Barcode manually..."
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
            />
            <Button onClick={handleManualSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
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
            Point camera at a barcode or enter manually.
          </p>
          <Button
            variant="secondary"
            onClick={handleSimulateScan}
            className="w-full"
          >
            Simulate Random Scan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
