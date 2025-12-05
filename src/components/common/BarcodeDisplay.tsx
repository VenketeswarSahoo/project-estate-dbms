"use client";

import React from "react";
import Barcode from "react-barcode";

interface BarcodeDisplayProps {
  value: string;
}

export function BarcodeDisplay({ value }: BarcodeDisplayProps) {
  return (
    <div className="flex justify-center p-2 bg-white rounded-md">
      <Barcode value={value} width={1.5} height={50} fontSize={12} />
    </div>
  );
}
