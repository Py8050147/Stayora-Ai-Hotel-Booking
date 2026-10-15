"use client";

import React, { useRef } from "react";
import { ImagePlus, X, Star } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onImagesChangeAction: (images: string[]) => void; // <-- Renamed to end with "Action"
  maxImages?: number;
}

export default function ImageUploader({
  images = [],
  onImagesChangeAction,
  maxImages = 5,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only upload up to ${maxImages} images.`);
    }

    const filesToProcess = files.slice(0, remainingSlots);

    const base64Promises = filesToProcess.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is larger than 5MB`);
            return resolve("");
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    const newBase64Images = (await Promise.all(base64Promises)).filter(Boolean);
    onImagesChangeAction([...images, ...newBase64Images]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChangeAction(images.filter((_, idx) => idx !== indexToRemove));
  };

  const setAsPrimary = (indexToMakePrimary: number) => {
    if (indexToMakePrimary === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(indexToMakePrimary, 1);
    updated.unshift(selected);
    onImagesChangeAction(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Upload 4 to {maxImages} high-quality photos. The first photo is the main cover image.
        </p>
        <span className="text-sm font-medium">
          {images.length} / {maxImages} uploaded
        </span>
      </div>

      {/* Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {images.map((imgSrc, index) => (
          <div
            key={index}
            className="relative group aspect-[4/3] rounded-lg overflow-hidden border bg-muted"
          >
            <img
              src={imgSrc}
              alt={`Hotel preview ${index + 1}`}
              className="w-full h-full object-cover"
            />

            {index === 0 ? (
              <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                <Star className="h-3 w-3 fill-current" /> Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAsPrimary(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded hover:bg-black"
              >
                Make Cover
              </button>
            )}

            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-90 hover:opacity-100 shadow"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Button Slot */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/40 hover:border-primary flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">Add Photos</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}// "use client";

// import React, { useCallback, useState } from "react";
// import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// interface ImageUploaderProps {
//   images: string[];
//   onImagesChange: (images: string[]) => void;
//   maxImages?: number;
// }

// export default function ImageUploader({
//   images = [],
//   onImagesChange,
//   maxImages = 10,
// }: ImageUploaderProps) {
//   const [isDragging, setIsDragging] = useState(false);
//   const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   }, []);

//   const uploadImage = async (file: File): Promise<string> => {
//     // Use placeholder image URL for now (base64 can be too large for database)
//     return `/placeholder-image.jpg`;
//   };

//   const handleDrop = useCallback(
//     async (e: React.DragEvent) => {
//       e.preventDefault();
//       setIsDragging(false);

//       const files = Array.from(e.dataTransfer.files).filter((file) =>
//         file.type.startsWith("image/")
//       );

//       if (files.length === 0) {
//         toast.error("Please drop image files only");
//         return;
//       }

//       if (images.length + files.length > maxImages) {
//         toast.error(`Maximum ${maxImages} images allowed`);
//         return;
//       }

//       for (let i = 0; i < files.length; i++) {
//         setUploadingIndex(images.length + i);
//         try {
//           const url = await uploadImage(files[i]);
//           onImagesChange([...images, url]);
//         } catch {
//           toast.error(`Failed to upload ${files[i].name}`);
//         }
//       }
//       setUploadingIndex(null);
//     },
//     [images, maxImages, onImagesChange]
//   );

//   const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []).filter((file) =>
//       file.type.startsWith("image/")
//     );

//     if (files.length === 0) return;

//     if (images.length + files.length > maxImages) {
//       toast.error(`Maximum ${maxImages} images allowed`);
//       return;
//     }

//     for (let i = 0; i < files.length; i++) {
//       setUploadingIndex(images.length + i);
//       try {
//         const url = await uploadImage(files[i]);
//         onImagesChange([...images, url]);
//       } catch {
//         toast.error(`Failed to upload ${files[i].name}`);
//       }
//     }
//     setUploadingIndex(null);
//     e.target.value = "";
//   };

//   const removeImage = (index: number) => {
//     onImagesChange(images.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="space-y-4">
//       {/* Drop Zone */}
//       <div
//         onDragOver={handleDragOver}
//         onDragLeave={handleDragLeave}
//         onDrop={handleDrop}
//         className={`
//           relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
//           ${isDragging
//             ? "border-primary bg-primary/5 scale-[1.02]"
//             : "border-border hover:border-primary/50 hover:bg-muted/50"
//           }
//         `}
//       >
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           onChange={handleFileSelect}
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//         />

//         <div className="flex flex-col items-center gap-3">
//           <div
//             className={`
//             p-4 rounded-full transition-colors
//             ${isDragging ? "bg-primary text-primary-foreground" : "bg-muted"}
//           `}
//           >
//             {uploadingIndex !== null ? (
//               <Loader2 className="w-8 h-8 animate-spin" />
//             ) : (
//               <Upload className="w-8 h-8" />
//             )}
//           </div>

//           <div>
//             <p className="font-medium text-foreground">
//               {isDragging
//                 ? "Drop images here"
//                 : "Drag & drop images here"}
//             </p>
//             <p className="text-sm text-muted-foreground mt-1">
//               or click to browse from your device
//             </p>
//           </div>

//           <p className="text-xs text-muted-foreground">
//             PNG, JPG, WEBP up to 5MB each ({images.length}/{maxImages} images)
//           </p>
//         </div>
//       </div>

//       {/* Image Preview Grid */}
//       {images.length > 0 && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {images.map((image, index) => (
//             <div
//               key={index}
//               className="relative aspect-square rounded-lg overflow-hidden border border-border group"
//             >
//               <img
//                 src={image}
//                 alt={`Hotel image ${index + 1}`}
//                 className="w-full h-full object-cover transition-transform group-hover:scale-105"
//               />

//               {/* Overlay on hover */}
//               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                 <button
//                   type="button"
//                   onClick={() => removeImage(index)}
//                   className="p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Image number badge */}
//               <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
//                 {index + 1}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Empty State */}
//       {images.length === 0 && (
//         <div className="flex items-center justify-center py-8 text-muted-foreground">
//           <ImageIcon className="w-5 h-5 mr-2" />
//           <span className="text-sm">No images uploaded yet</span>
//         </div>
//       )}
//     </div>
//   );
// }
