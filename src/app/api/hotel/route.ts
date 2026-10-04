import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";
import { db } from "../../../../prisma/db";
import { createSchema } from "@/lib/schema/hotelSchema";
import { checkUser } from "@/lib/checkUser";

export async function POST(req: Request) {
  const { userId } = await auth();
  console.log("userId", userId);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("userId", userId);

  const dbUser = await checkUser();
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  console.log("dbUser", dbUser);

  try {
    const body = await req.json();
    const parsedData = createSchema.parse(body);

    const newHotel = await db.orm.public.Hotel.create({
      data: {
        ownerId: dbUser.id,
        name: parsedData.name,
        description: parsedData.description,
        starRating: parsedData.starRating,
        images: parsedData.images,
        address: {
          create: {
            addressLine: parsedData.address.addressLine,
            city: parsedData.address.city,
            state: parsedData.address.state,
            country: parsedData.address.country,
            postalCode: parsedData.address.postalCode,
            latitude: parsedData.address.latitude,
            longitude: parsedData.address.longitude,
          },
        },
        amenities: {
          connect: parsedData.amenityIds.map((id) => ({ id })),
        },
      },
      include: { address: true, amenities: true },
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
