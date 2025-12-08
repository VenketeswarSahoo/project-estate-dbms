"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Camera, Search } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/common/barcode-scanner";

export function ScanDialog() {
  const router = useRouter();
  const [manualInput, setManualInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    toast.success(`Barcode scanned: ${decodedText}`);
    setOpen(false);
    router.push(`/items/${decodedText}`);
  };

  const handleScanError = (error: string) => {
    toast.error(`Scan error: ${error}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error("Please enter a UID");
      return;
    }
    setOpen(false);
    router.push(`/items/${manualInput.trim()}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Camera className="mr-2 h-4 w-4" />
          Scan / Search Item
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Find Item</DialogTitle>
          <DialogDescription>
            Scan a barcode or enter UID manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="scan" className="w-full mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="scan">
              <Camera className="mr-2 h-4 w-4" /> Scan
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Search className="mr-2 h-4 w-4" /> Manual Entry
            </TabsTrigger>
          </TabsList>

          {/* SCAN TAB */}
          <TabsContent value="scan" className="mt-4 space-y-4">
            <Card className="p-4">
              <BarcodeScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                onClose={() => setOpen(false)}
              />
            </Card>
          </TabsContent>

          {/* MANUAL TAB */}
          <TabsContent value="manual" className="mt-4 space-y-4">
            <Card className="p-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="uid">Item UID</Label>
                  <Input
                    id="uid"
                    placeholder="EST-XXXXXX"
                    value={manualInput}
                    onChange={(e) =>
                      setManualInput(e.target.value.toUpperCase())
                    }
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the UID in format: EST-XXXXXX
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  Search Item
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
