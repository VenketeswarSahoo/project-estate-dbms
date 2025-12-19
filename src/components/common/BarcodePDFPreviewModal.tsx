"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { generateBarcodePDF } from "@/lib/utils/pdf-generator";
import { Item } from "@/types";
import { Download, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface BarcodePDFSheetProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodePDFSheet({
  item,
  isOpen,
  onClose,
}: BarcodePDFSheetProps) {
  const [count, setCount] = useState(item.pieces || 1);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && item) {
      const url = generateBarcodePDF(item, count);
      setPdfUrl(url);
    }
  }, [isOpen, count]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${item.uid}-barcodes.pdf`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl);
    printWindow?.print();
  };

  const increase = () => setCount((prev) => prev + 1);
  const decrease = () => setCount((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="sm:max-w-xl w-full px-4">
        <SheetHeader>
          <SheetTitle className="font-bold">Generate Barcode PDF</SheetTitle>
        </SheetHeader>

        <div className="border rounded-md overflow-hidden h-[480px]">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Barcode PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Generating preview...
            </div>
          )}
        </div>

        <div className="flex justify-between items-end mt-6">
          <div>
            <span className="text-sm font-medium">Number of Barcodes:</span>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="icon" onClick={decrease}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={count}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow only digits
                  if (/^\d*$/.test(value)) {
                    setCount(value === "" ? 1 : parseInt(value, 10));
                  }
                }}
                className="w-16 text-center"
              />

              <Button variant="outline" size="icon" onClick={increase}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
