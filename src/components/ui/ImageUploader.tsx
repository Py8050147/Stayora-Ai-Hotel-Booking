"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadImage = async (file: File): Promise<string> => {
    // Use placeholder image URL for now (base64 can be too large for database)
    return `/placeholder-image.jpg`;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length === 0) {
        toast.error("Please drop image files only");
        return;
      }

      if (images.length + files.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      for (let i = 0; i < files.length; i++) {
        setUploadingIndex(images.length + i);
        try {
          const url = await uploadImage(files[i]);
          onImagesChange([...images, url]);
        } catch {
          toast.error(`Failed to upload ${files[i].name}`);
        }
      }
      setUploadingIndex(null);
    },
    [images, maxImages, onImagesChange]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      setUploadingIndex(images.length + i);
      try {
        const url = await uploadImage(files[i]);
        onImagesChange([...images, url]);
      } catch {
        toast.error(`Failed to upload ${files[i].name}`);
      }
    }
    setUploadingIndex(null);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
          ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          <div
            className={`
            p-4 rounded-full transition-colors
            ${isDragging ? "bg-primary text-primary-foreground" : "bg-muted"}
          `}
          >
            {uploadingIndex !== null ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="font-medium text-foreground">
              {isDragging
                ? "Drop images here"
                : "Drag & drop images here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse from your device
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 5MB each ({images.length}/{maxImages} images)
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-border group"
            >
              <img
                src={image}
                alt={`Hotel image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image number badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <ImageIcon className="w-5 h-5 mr-2" />
          <span className="text-sm">No images uploaded yet</span>
        </div>
      )}
    </div>
  );
}
