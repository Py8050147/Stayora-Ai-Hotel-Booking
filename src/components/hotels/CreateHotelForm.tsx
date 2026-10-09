"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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

type FormValues = z.infer<typeof createSchema>;

export default function CreateHotelForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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

  const latitude = watch("address.latitude");
  const longitude = watch("address.longitude");
  const currentImages = watch("images") || [];

  async function onSubmit(values: FormValues) {
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

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create hotel");
      }

      toast.success("Your hotel has been created successfully.");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create New Hotel</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                onValueChange={(value) => setValue("starRating", parseInt(value))}
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
                <p className="text-sm text-destructive">{errors.starRating.message}</p>
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
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Address Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-lg font-semibold">Address Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine">Address Line</Label>
                  <Input id="addressLine" placeholder="123 Main St" {...register("address.addressLine")} />
                  {errors.address?.addressLine && (
                    <p className="text-sm text-destructive">{errors.address.addressLine.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" {...register("address.city")} />
                  {errors.address?.city && (
                    <p className="text-sm text-destructive">{errors.address.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="NY" {...register("address.state")} />
                  {errors.address?.state && (
                    <p className="text-sm text-destructive">{errors.address.state.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="USA" {...register("address.country")} />
                  {errors.address?.country && (
                    <p className="text-sm text-destructive">{errors.address.country.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" placeholder="10001" {...register("address.postalCode")} />
                  {errors.address?.postalCode && (
                    <p className="text-sm text-destructive">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Location on Map</Label>
                  <span className="text-sm text-muted-foreground">
                    {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Click on the map to set location"}
                  </span>
                </div>
                <MapPicker
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={(lat, lng) => {
                    setValue("address.latitude", lat);
                    setValue("address.longitude", lng);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hotel Images</h3>
            <ImageUploader
              images={currentImages}
              onImagesChange={(newImages) => setValue("images", newImages, { shouldValidate: true })}
            />
            {errors.images && (
              <p className="text-sm text-destructive">{errors.images.message}</p>
            )}
          </div>

          {/* Amenities Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Amenities</h3>
            <div className="space-y-2">
              <Label htmlFor="amenityIds">Amenity IDs (Comma separated UUIDs)</Label>
              <Input
                id="amenityIds"
                placeholder="uuid1, uuid2, uuid3"
                onChange={(e) => {
                  const value = e.target.value;
                  setValue("amenityIds", value.split(",").map(id => id.trim()).filter(Boolean));
                }}
              />
              {errors.amenityIds && (
                <p className="text-sm text-destructive">{errors.amenityIds.message}</p>
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
