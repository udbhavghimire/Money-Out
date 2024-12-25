import { X, Image as ImageIcon, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

export function ReceiptImages({ files, onRemove, onAddMore, onTakePhoto }) {
  const [expandedImage, setExpandedImage] = useState(null);

  const handleImageClick = (file) => {
    setExpandedImage(file);
  };

  return (
    <div className="w-full max-w-[280px]">
      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="aspect-square bg-gray-100 rounded-lg relative group cursor-pointer overflow-hidden"
            onClick={() => handleImageClick(file)}
          >
            {file instanceof File ? (
              <Image
                src={URL.createObjectURL(file)}
                alt={`Receipt ${index + 1}`}
                fill
                className="object-cover"
              />
            ) : (
              <Image
                src={file}
                alt={`Receipt ${index + 1}`}
                fill
                className="object-cover"
              />
            )}
            
            {/* Remove Button Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="text-white hover:text-red-400 hover:bg-black/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}

        {/* Add More Buttons */}
        <div className="aspect-square bg-gray-50 rounded-lg flex flex-col gap-2 p-2">
          <button
            type="button"
            onClick={onTakePhoto}
            className="flex-1 rounded-md border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center"
          >
            <Camera className="h-5 w-5 text-gray-400" />
          </button>
          <button
            type="button"
            onClick={onAddMore}
            className="flex-1 rounded-md border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center"
          >
            <Upload className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative w-[90%] max-w-2xl aspect-[3/4] m-4">
            <Image
              src={typeof expandedImage === 'string' ? expandedImage : URL.createObjectURL(expandedImage)}
              alt="Receipt full view"
              fill
              className="object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 