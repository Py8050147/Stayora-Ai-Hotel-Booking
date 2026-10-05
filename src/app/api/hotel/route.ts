import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ZodError } from "zod";
import { db } from "../../../../prisma/db";
import { createSchema } from "@/lib/schema/hotelSchema";
import { checkUser } from "@/lib/checkUser";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    + '-' + Date.now();
}

export async function GET() {
  try {
    const User = await currentUser();
    if (!User) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hotels = await db.orm.public.Hotel.where({
      ownerId: dbUser.id,
    }).all();

    return NextResponse.json(hotels, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const User = await currentUser();
  if (!User) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await checkUser();
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsedData = createSchema.parse(body);

    const newHotel = await db.orm.public.Hotel.create({
      ownerId: dbUser.id,
      name: parsedData.name,
      slug: generateSlug(parsedData.name),
      description: parsedData.description,
      starRating: parsedData.starRating,
      checkInTime: parsedData.checkInTime,
      checkOutTime: parsedData.checkOutTime,
      images: (rel) => rel.create(parsedData.images.map((url, index) => ({
        imageUrl: url,
        sortOrder: index,
        isPrimary: index === 0,
      }))),
      address: (rel) => rel.create({
        addressLine: parsedData.address.addressLine,
        city: parsedData.address.city,
        state: parsedData.address.state,
        country: parsedData.address.country,
        postalCode: parsedData.address.postalCode,
        latitude: parsedData.address.latitude !== undefined ? String(parsedData.address.latitude) : undefined,
        longitude: parsedData.address.longitude !== undefined ? String(parsedData.address.longitude) : undefined,
      }),
      amenities: (rel) => rel.create(parsedData.amenityIds.map((amenityId) => ({ amenityId }))),
    });

    return NextResponse.json(newHotel, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    console.error("Error creating hotel:", error);
    return NextResponse.json(
      { error: "Failed to create hotel" },
      { status: 500 },
    );
  }
}
