// "use client";

// import React from "react";
// import { useAuth } from "@/providers/auth";
// import { DashboardStats } from "@/components/dashboard/DashboardStats";
// import { RecentItemsList } from "@/components/dashboard/RecentItemsList";
// import { RecentMessagesList } from "@/components/dashboard/RecentMessagesList";
// import { ChartBarDefault } from "@/components/dashboard/chat-area-interactive";
// import { ChartLineDefault } from "@/components/dashboard/chat-line-default";
// import { ChartPieDonutText } from "@/components/dashboard/chat-pie-donut-text";
// import { SectionCards } from "@/components/dashboard/section-cards";

// export default function DashboardPage() {
//   const { user } = useAuth();

//   if (!user) return null;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
//       </div>
//       <SectionCards />

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <ChartBarDefault />
//         {/* <ChartLineDefault /> */}
//         <ChartPieDonutText />
//         <RecentMessagesList />
//         <RecentItemsList />
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Camera } from "lucide-react";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/common/barcode-scanner";

export default function ScanPage() {
  const router = useRouter();
  const [manualInput, setManualInput] = useState("");

  const handleScanSuccess = async (decodedText: string) => {
    console.log("Scanned:", decodedText);

    // Validate UID format
    // if (!isValidUID(decodedText)) {
    //   toast.error('Invalid barcode format');
    //   return;
    // }

    // Show success message
    toast.success(`Barcode scanned: ${decodedText}`);

    // Redirect to item detail page
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

    // if (!isValidUID(manualInput.trim())) {
    //   toast.error('Invalid UID format. Expected format: EST-XXXXXX');
    //   return;
    // }

    // Redirect to item detail page
    router.push(`/items/${manualInput.trim()}`);
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scan Barcode</h1>
        <p className="text-muted-foreground">
          Scan an item's barcode or enter UID manually
        </p>
      </div>

      <Tabs defaultValue="scan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">
            <Camera className="mr-2 h-4 w-4" />
            Scan
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Search className="mr-2 h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <BarcodeScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card className="p-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="uid">Item UID</Label>
                <Input
                  id="uid"
                  placeholder="EST-XXXXXX"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.toUpperCase())}
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
    </div>
  );
}
