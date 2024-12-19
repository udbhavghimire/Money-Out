import React, { useRef, useEffect, useState } from 'react';
import { Button } from './button';
import { X, Camera, RotateCcw, Upload } from 'lucide-react';

export function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const fallbackConstraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log("Falling back to any available camera");
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);
    
    // Store the captured image data URL
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.95));
    
    // Stop the camera stream after capture
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleUpload = () => {
    // Convert data URL to File object
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "receipt.jpg", {
          type: "image/jpeg",
          lastModified: Date.now()
        });
        onCapture(file);
      });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className="relative w-[90%] max-w-sm bg-white rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {capturedImage ? (
          // Show captured image preview
          <div className="h-[80vh] flex flex-col">
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="w-full h-full object-contain"
            />
            
            {/* Preview Actions */}
            <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleRetake}
                  className="h-14 px-6 bg-white hover:bg-gray-100 text-black rounded-full flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Retake
                </Button>
                <Button
                  onClick={handleUpload}
                  className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Upload
                </Button>
              </div>
              
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-white hover:text-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Show camera view
          <div className="h-[80vh]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Camera Actions */}
            <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-4">
              <Button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center"
              >
                <Camera className="h-8 w-8 text-black" />
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="text-white hover:text-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
