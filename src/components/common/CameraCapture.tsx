"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Check, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  const confirm = () => {
    if (imgSrc) {
      onCapture(imgSrc);
      setIsOpen(false);
      setImgSrc(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-xs">
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt="Captured"
              className="rounded-md w-full"
              width={500}
              height={500}
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "environment" }}
              className="rounded-md w-full"
            />
          )}

          <div className="flex gap-4">
            {imgSrc ? (
              <>
                <Button variant="outline" onClick={retake}>
                  <X className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={confirm}>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </>
            ) : (
              <Button onClick={capture}>
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
