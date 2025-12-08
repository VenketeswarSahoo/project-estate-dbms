"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileScanDialog } from "./mobile-scan-dialog";

export function FloatingScanButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button visible only on mobile and tablet */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "lg:hidden" // hide on desktop
        )}
      >
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg bg-primary text-white hover:scale-105 transition-transform duration-200"
          onClick={() => setOpen(true)}
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialog itself */}
      <MobileScanDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
