"use client";

import React, { useState } from "react";
import { useForm, useWatch, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSchema } from "@/lib/schema/hotelSchema";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import ImageUploader from "@/components/ui/ImageUploader";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

// Separate Input and Output types for schemas with .default(), .transform(), or .coerce
type FormInput = z.input<typeof createSchema>;
type FormOutput = z.output<typeof createSchema>;

export default function CreateHotelForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      starRating: undefined,
      address: {
        addressLine: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        latitude: undefined,
        longitude: undefined,
      },
      images: [],
      amenityIds: [],
    },
  });

  // Using useWatch instead of watch() satisfies the React Compiler lint rule
  const rawLatitude = useWatch({ control, name: "address.latitude" });
  const rawLongitude = useWatch({ control, name: "address.longitude" });
  const starRating = useWatch({ control, name: "starRating" });
  const currentImages = useWatch({ control, name: "images" }) ?? [];

  // Safely narrow latitude & longitude to numbers for MapPicker and .toFixed()
  const latitude = typeof rawLatitude === "number" ? rawLatitude : undefined;
  const longitude = typeof rawLongitude === "number" ? rawLongitude : undefined;

  // Extracts either the root array error or the first element's error message
  const getArrayErrorMessage = (fieldError: unknown): string | undefined => {
    if (!fieldError || typeof fieldError !== "object") return undefined;
    if ("message" in fieldError && typeof fieldError.message === "string") {
      return fieldError.message;
    }
    if (Array.isArray(fieldError)) {
      const firstErr = fieldError.find((item) => item?.message);
      return firstErr?.message;
    }
    return undefined;
  };

  // Triggered when Zod validation fails on click so it never fails silently
  function onInvalid(validationErrors: FieldErrors<FormInput>) {
    console.error("Form validation failed:", validationErrors);
    toast.error("Please fix the highlighted fields before creating the hotel.");
  }

  async function onSubmit(values: FormOutput) {
    setIsLoading(true);
    try {
      console.log("Submitting form with values:", values);

      const response = await fetch("/api/hotel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Server returned ${response.status} (${response.statusText}). Make sure your API route is at /api/hotel.`
        );
      }

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        const firstDetail =
          data.details && Object.values(data.details).flat().find(Boolean);
        throw new Error(
          (typeof firstDetail === "string" ? firstDetail : data.error) ||
          "Failed to create hotel"
        );
      }

      toast.success("Your hotel has been created successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      console.error("Form submission error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const imagesError = getArrayErrorMessage(errors.images);
  const amenitiesError = getArrayErrorMessage(errors.amenityIds);

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Hotel</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-8"
        >
          {/* General Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Hotel Name</Label>
              <Input
                id="name"
                placeholder="Grand Plaza Hotel"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="starRating">Star Rating</Label>
              <Select
                value={starRating !== undefined ? String(starRating) : undefined}
                onValueChange={(value) =>
                  setValue("starRating", parseInt(value, 10), {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger id="starRating">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SelectItem key={star} value={star.toString()}>
                      {star} Star{star > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.starRating && (
                <p className="text-sm text-destructive">
                  {errors.starRating.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Tell guests about your hotel..."
              className="min-h-[120px]"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Address Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold">Address Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine">Address Line</Label>
                  <Input
                    id="addressLine"
                    placeholder="123 Main St"
                    {...register("address.addressLine")}
                  />
                  {errors.address?.addressLine && (
                    <p className="text-sm text-destructive">
                      {errors.address.addressLine.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    {...register("address.city")}
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-destructive">
                      {errors.address.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    {...register("address.state")}
                  />
                  {errors.address?.state && (
                    <p className="text-sm text-destructive">
                      {errors.address.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    {...register("address.country")}
                  />
                  {errors.address?.country && (
                    <p className="text-sm text-destructive">
                      {errors.address.country.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="10001"
                    {...register("address.postalCode")}
                  />
                  {errors.address?.postalCode && (
                    <p className="text-sm text-destructive">
                      {errors.address.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Location on Map</Label>
                  <span className="text-sm text-muted-foreground">
                    {latitude !== undefined && longitude !== undefined
                      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                      : "Click on the map to set location"}
                  </span>
                </div>
                <MapPicker
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={(lat, lng) => {
                    setValue("address.latitude", lat, { shouldValidate: true });
                    setValue("address.longitude", lng, { shouldValidate: true });
                  }}
                />
                {(errors.address?.latitude || errors.address?.longitude) && (
                  <p className="text-sm text-destructive">
                    {errors.address?.latitude?.message ||
                      errors.address?.longitude?.message ||
                      "Please select a location on the map"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Images Section (4 to 5 Images) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hotel Images</h3>
            <ImageUploader
              images={currentImages}
              maxImages={5}
              onImagesChangeAction={(newImages) =>
                setValue("images", newImages, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            {imagesError && (
              <p className="text-sm text-destructive">{imagesError}</p>
            )}
          </div>

          {/* Amenities Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Amenities (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="amenityIds">
                Amenity IDs (Comma separated UUIDs, or leave blank)
              </Label>
              <Input
                id="amenityIds"
                placeholder="Leave blank, or enter valid UUIDs separated by commas"
                onChange={(e) => {
                  const value = e.target.value;
                  setValue(
                    "amenityIds",
                    value
                      .split(",")
                      .map((id) => id.trim())
                      .filter(Boolean),
                    { shouldValidate: true }
                  );
                }}
              />
              {amenitiesError && (
                <p className="text-sm text-destructive">{amenitiesError}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Hotel"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
// import { zodResolver } from "@hookform/resolvers/zod";
// import { createSchema } from "@/lib/schema/hotelSchema";
// import { z } from "zod";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";
// import { Loader2 } from "lucide-react";
// import dynamic from "next/dynamic";
// import ImageUploader from "@/components/ui/ImageUploader";

// const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

// type FormInput = z.input<typeof createSchema>;
// type FormOutput = z.output<typeof createSchema>;

// export default function CreateHotelForm() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     control,
//     setValue,
//     formState: { errors },
//   } = useForm<FormInput, unknown, FormOutput>({
//     resolver: zodResolver(createSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       starRating: undefined,
//       address: {
//         addressLine: "",
//         city: "",
//         state: "",
//         country: "",
//         postalCode: "",
//         latitude: undefined,
//         longitude: undefined,
//       },
//       images: [],
//       amenityIds: [],
//     },
//   });

//   const rawLatitude = useWatch({ control, name: "address.latitude" });
//   const rawLongitude = useWatch({ control, name: "address.longitude" });
//   const starRating = useWatch({ control, name: "starRating" });
//   const currentImages = useWatch({ control, name: "images" }) ?? [];

//   const latitude = typeof rawLatitude === "number" ? rawLatitude : undefined;
//   const longitude = typeof rawLongitude === "number" ? rawLongitude : undefined;

//   // Extracts either the root array error or the first element's error
//   const getArrayErrorMessage = (fieldError: unknown): string | undefined => {
//     if (!fieldError || typeof fieldError !== "object") return undefined;
//     if ("message" in fieldError && typeof fieldError.message === "string") {
//       return fieldError.message;
//     }
//     if (Array.isArray(fieldError)) {
//       const firstErr = fieldError.find((item) => item?.message);
//       return firstErr?.message;
//     }
//     return undefined;
//   };

//   async function onSubmit(values: FormOutput) {
//     setIsLoading(true);
//     try {
//       const response = await fetch("/api/hotel", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(values),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         const firstDetail =
//           data.details &&
//           Object.values(data.details).flat().find(Boolean);
//         throw new Error(
//           (typeof firstDetail === "string" ? firstDetail : data.error) ||
//           "Failed to create hotel"
//         );
//       }

//       toast.success("Your hotel has been created successfully.");
//       router.push("/dashboard");
//       router.refresh();
//     } catch (error: unknown) {
//       console.error("Form submission error:", error);
//       const errorMessage =
//         error instanceof Error ? error.message : "Something went wrong";
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   const imagesError = getArrayErrorMessage(errors.images);
//   const amenitiesError = getArrayErrorMessage(errors.amenityIds);

//   return (
//     <Card className="max-w-4xl mx-auto">
//       <CardHeader>
//         <CardTitle className="text-2xl font-bold">Create New Hotel</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//           {/* General Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-2">
//               <Label htmlFor="name">Hotel Name</Label>
//               <Input
//                 id="name"
//                 placeholder="Grand Plaza Hotel"
//                 {...register("name")}
//               />
//               {errors.name && (
//                 <p className="text-sm text-destructive">{errors.name.message}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="starRating">Star Rating</Label>
//               <Select
//                 value={starRating !== undefined ? String(starRating) : undefined}
//                 onValueChange={(value) =>
//                   setValue("starRating", parseInt(value, 10), {
//                     shouldValidate: true,
//                     shouldDirty: true,
//                   })
//                 }
//               >
//                 <SelectTrigger id="starRating">
//                   <SelectValue placeholder="Select rating" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <SelectItem key={star} value={star.toString()}>
//                       {star} Star{star > 1 ? "s" : ""}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {errors.starRating && (
//                 <p className="text-sm text-destructive">
//                   {errors.starRating.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Tell guests about your hotel..."
//               className="min-h-[120px]"
//               {...register("description")}
//             />
//             {errors.description && (
//               <p className="text-sm text-destructive">
//                 {errors.description.message}
//               </p>
//             )}
//           </div>

//           {/* Address Section */}
//           <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
//             <h3 className="text-lg font-semibold">Address Details</h3>
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="addressLine">Address Line</Label>
//                   <Input
//                     id="addressLine"
//                     placeholder="123 Main St"
//                     {...register("address.addressLine")}
//                   />
//                   {errors.address?.addressLine && (
//                     <p className="text-sm text-destructive">
//                       {errors.address.addressLine.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="city">City</Label>
//                   <Input
//                     id="city"
//                     placeholder="New York"
//                     {...register("address.city")}
//                   />
//                   {errors.address?.city && (
//                     <p className="text-sm text-destructive">
//                       {errors.address.city.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="state">State/Province</Label>
//                   <Input
//                     id="state"
//                     placeholder="NY"
//                     {...register("address.state")}
//                   />
//                   {errors.address?.state && (
//                     <p className="text-sm text-destructive">
//                       {errors.address.state.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="country">Country</Label>
//                   <Input
//                     id="country"
//                     placeholder="USA"
//                     {...register("address.country")}
//                   />
//                   {errors.address?.country && (
//                     <p className="text-sm text-destructive">
//                       {errors.address.country.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="postalCode">Postal Code</Label>
//                   <Input
//                     id="postalCode"
//                     placeholder="10001"
//                     {...register("address.postalCode")}
//                   />
//                   {errors.address?.postalCode && (
//                     <p className="text-sm text-destructive">
//                       {errors.address.postalCode.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label className="text-base">Location on Map</Label>
//                   <span className="text-sm text-muted-foreground">
//                     {latitude !== undefined && longitude !== undefined
//                       ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
//                       : "Click on the map to set location"}
//                   </span>
//                 </div>
//                 <MapPicker
//                   latitude={latitude}
//                   longitude={longitude}
//                   onLocationChange={(lat, lng) => {
//                     setValue("address.latitude", lat, { shouldValidate: true });
//                     setValue("address.longitude", lng, { shouldValidate: true });
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Images Section */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Hotel Images</h3>
//             <ImageUploader
//               images={currentImages}
//               onImagesChange={(newImages) =>
//                 setValue("images", newImages, { shouldValidate: true })
//               }
//             />
//             {imagesError && (
//               <p className="text-sm text-destructive">{imagesError}</p>
//             )}
//           </div>

//           {/* Amenities Section */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Amenities</h3>
//             <div className="space-y-2">
//               <Label htmlFor="amenityIds">
//                 Amenity IDs (Comma separated UUIDs)
//               </Label>
//               <Input
//                 id="amenityIds"
//                 placeholder="uuid1, uuid2, uuid3"
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   setValue(
//                     "amenityIds",
//                     value
//                       .split(",")
//                       .map((id) => id.trim())
//                       .filter(Boolean),
//                     { shouldValidate: true }
//                   );
//                 }}
//               />
//               {amenitiesError && (
//                 <p className="text-sm text-destructive">{amenitiesError}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-end gap-4">
//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full md:w-auto"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 "Create Hotel"
//               )}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }