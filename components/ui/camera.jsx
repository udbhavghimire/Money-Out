import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw } from "lucide-react";

export function CameraCapture({ onCapture, onClose }) {
  const webcamRef = useRef(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setIsCaptured(true);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setIsCaptured(false);
  };

  const accept = () => {
    // Convert base64 to file
    fetch(imgSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        onCapture(file);
        onClose();
      });
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
        {!isCaptured ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full"
          />
        ) : (
          <img src={imgSrc} alt="captured" className="w-full" />
        )}
      </div>

      <div className="flex justify-center gap-2">
        {!isCaptured ? (
          <Button onClick={capture} className="gap-2">
            <Camera className="h-4 w-4" />
            Capture Photo
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={retake} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
            <Button onClick={accept}>Use Photo</Button>
          </>
        )}
      </div>
    </div>
  );
}
