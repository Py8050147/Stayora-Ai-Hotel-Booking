import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../../prisma/db";
import { checkUser } from "@/lib/checkUser";
import { ZodError } from "zod";
import { createSchema } from "@/lib/schema/hotelSchema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const User = await currentUser();
    if (!User) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsedData = createSchema.parse(body);

    // Verify ownership
    const hotel = await db.orm.public.Hotel.where({ id }).first();
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (hotel.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this hotel" },
        { status: 403 },
      );
    }

    const addressData = parsedData.address;

    // Update address separately if it exists, otherwise create it
    if (hotel.address && addressData) {
      await db.orm.public.Address.where({ id: hotel.address.id }).update({
        addressLine: addressData.addressLine,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postalCode: addressData.postalCode,
        latitude:
          addressData.latitude !== undefined
            ? String(addressData.latitude)
            : undefined,
        longitude:
          addressData.longitude !== undefined
            ? String(addressData.longitude)
            : undefined,
      });
    }

    const updatedHotel = await db.orm.public.Hotel.where({ id }).update({
      name: parsedData.name,
      description: parsedData.description,
      starRating: parsedData.starRating,
      images: (rel) => {
        rel.disconnect();
        return rel.create(
          parsedData.images.map((url, index) => ({
            imageUrl: url,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        );
      },
      address:
        !hotel.address && addressData
          ? (rel) =>
              rel.create({
                addressLine: addressData.addressLine,
                city: addressData.city,
                state: addressData.state,
                country: addressData.country,
                postalCode: addressData.postalCode,
                latitude:
                  addressData.latitude !== undefined
                    ? String(addressData.latitude)
                    : undefined,
                longitude:
                  addressData.longitude !== undefined
                    ? String(addressData.longitude)
                    : undefined,
              })
          : undefined,
      amenities: (rel) => {
        rel.disconnect();
        return rel.create(
          parsedData.amenityIds.map((amenityId) => ({ amenityId })),
        );
      },
    });

    return NextResponse.json(updatedHotel, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Error updating hotel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const User = await currentUser();
    if (!User) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const hotel = await db.orm.public.Hotel.where({ id }).first();
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    if (hotel.ownerId !== dbUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this hotel" },
        { status: 403 },
      );
    }

    await db.orm.public.Hotel.where({ id }).delete();

    return NextResponse.json(
      { message: "Hotel deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
