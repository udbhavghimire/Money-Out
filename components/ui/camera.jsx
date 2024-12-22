"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Button } from './button';
import { X, Camera, RotateCcw, Upload } from 'lucide-react';

export function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Check if we already have permission stored
    const checkStoredPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        setPermissionStatus(result.state);
        
        if (result.state === 'granted') {
          startCamera();
        }
      } catch (error) {
        console.log('Permission query not supported, falling back to getUserMedia');
        startCamera();
      }
    };

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setPermissionStatus('granted');
      } catch (error) {
        console.error("Error accessing camera:", error);
        setPermissionStatus('denied');
      }
    };

    checkStoredPermission();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
      onCapture(file);
    }, "image/jpeg");
  };

  const handleRetake = () => {
    capturePhoto();
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
