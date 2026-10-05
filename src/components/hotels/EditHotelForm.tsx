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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof createSchema>;

interface EditHotelFormProps {
  hotel: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditHotelForm({ hotel, onSuccess, onCancel }: EditHotelFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: hotel.name,
      description: hotel.description || "",
      starRating: hotel.starRating,
      checkInTime: hotel.checkInTime || "",
      checkOutTime: hotel.checkOutTime || "",
      address: {
        addressLine: hotel.address?.addressLine || "",
        city: hotel.address?.city || "",
        state: hotel.address?.state || "",
        country: hotel.address?.country || "",
        postalCode: hotel.address?.postalCode || "",
        latitude: hotel.address?.latitude ? parseFloat(hotel.address.latitude) : undefined,
        longitude: hotel.address?.longitude ? parseFloat(hotel.address.longitude) : undefined,
      },
      images: hotel.images || [],
      amenityIds: hotel.amenities?.map((a: any) => a.id) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotel/${hotel.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update hotel");
      }

      toast.success("Hotel updated successfully.");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 min-w-[300px] min-h-fit flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Hotel Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="starRating">Star Rating</Label>
          <Select
            onValueChange={(value) => setValue("starRating", parseInt(value))}
            defaultValue={hotel.starRating?.toString()}
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
          {errors.starRating && <p className="text-sm text-destructive">{errors.starRating.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="checkInTime">Check-in Time (HH:MM)</Label>
          <Input id="checkInTime" placeholder="14:00" {...register("checkInTime")} />
          {errors.checkInTime && <p className="text-sm text-destructive">{errors.checkInTime.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkOutTime">Check-out Time (HH:MM)</Label>
          <Input id="checkOutTime" placeholder="11:00" {...register("checkOutTime")} />
          {errors.checkOutTime && <p className="text-sm text-destructive">{errors.checkOutTime.message}</p>}
        </div>
      </div>

      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-lg font-semibold">Address Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine">Address Line</Label>
            <Input id="addressLine" {...register("address.addressLine")} />
            {errors.address?.addressLine && <p className="text-sm text-destructive">{errors.address.addressLine.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("address.city")} />
            {errors.address?.city && <p className="text-sm text-destructive">{errors.address.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input id="state" {...register("address.state")} />
            {errors.address?.state && <p className="text-sm text-destructive">{errors.address.state.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("address.country")} />
            {errors.address?.country && <p className="text-sm text-destructive">{errors.address.country.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" {...register("address.postalCode")} />
            {errors.address?.postalCode && <p className="text-sm text-destructive">{errors.address.postalCode.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hotel Images</h3>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input {...register(`images.${index}` as const)} />
                {errors.images?.[index] && <p className="text-sm text-destructive">Invalid URL</p>}
              </div>
              <Button type="button" variant="outline" onClick={() => remove(index)}>Remove</Button>
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={() => append("")}>Add Image URL</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Amenities</h3>
        <div className="space-y-2">
          <Label htmlFor="amenityIds">Amenity IDs (Comma separated UUIDs)</Label>
          <Input
            id="amenityIds"
            onChange={(e) => {
              const value = e.target.value;
              setValue("amenityIds", value.split(",").map(id => id.trim()).filter(Boolean));
            }}
          />
          {errors.amenityIds && <p className="text-sm text-destructive">{errors.amenityIds.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Hotel"}
        </Button>
      </div>
    </form>
  );
}
