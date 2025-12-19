"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";
import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
}

export function BarcodeScanner({
  onScanSuccess,
  onScanError,
  onClose,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
        } else {
          setError("No cameras found on this device");
        }
      })
      .catch((err) => {
        setError("Unable to access camera. Please check permissions.");
        console.error("Camera error:", err);
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode("barcode-reader");
      scannerRef.current = html5QrCode;

      const cameraId =
        cameras.length > 1
          ? cameras.find((cam) => cam.label.toLowerCase().includes("back"))
              ?.id || cameras[0].id
          : cameras[0]?.id;

      if (!cameraId) {
        throw new Error("No camera available");
      }

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 240, height: 120 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          setError(errorMessage);
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to start camera");
      setIsScanning(false);
      onScanError?.(err.message);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose?.();
  };

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <div
          id="barcode-reader"
          className="w-full rounded-lg overflow-hidden border"
          style={{ minHeight: "32vh" }}
        />

        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Button onClick={startScanning} className="w-[172px] text-sm">
              <Camera className="mr-2 h-5 w-5" />
              Start Camera
            </Button>
          </div>
        )}
      </div>

      {isScanning && (
        <div className="text-center text-sm text-muted-foreground">
          Position barcode within the frame
        </div>
      )}
    </>
  );
}
