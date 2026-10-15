import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";
import { db } from "../../../prisma/db";
import { createSchema } from "@/lib/schema/hotelSchema";
import { checkUser } from "@/lib/checkUser";
import {
  uploadFileToNeonS3,
  uploadBase64ToNeonS3,
  getSignedImageUrl,
} from "@/lib/s3client";

function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseSlug || "hotel"}-${Date.now()}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mineOnly = searchParams.get("mine") === "true";

    let hotels;

    if (mineOnly) {
      // Dashboard view: fetch hotels owned by the logged-in user
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const dbUser = await checkUser();
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      hotels = await db.orm.public.Hotel.where({
        ownerId: dbUser.id,
      })
        .include("images")
        .include("address")
        .all();
    } else {
      // Public booking view: fetch all hotels for guests/customers
      hotels = await db.orm.public.Hotel.include("images")
        .include("address")
        .all();
    }

    // Generate temporary signed S3 viewing URLs for all hotel images
    const hotelsWithSignedUrls = await Promise.all(
      hotels.map(async (hotel) => {
        const sortedImages = [...(hotel.images || [])].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );

        const signedImages = await Promise.all(
          sortedImages.map(async (img) => ({
            ...img,
            imageUrl: await getSignedImageUrl(img.imageUrl),
          })),
        );

        return {
          ...hotel,
          images: signedImages,
        };
      }),
    );

    return NextResponse.json(hotelsWithSignedUrls, { status: 200 });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    // Case 1: FormData upload (Files)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("images") as File[];
      const rawData = formData.get("data") as string;

      const uploadedKeys = await Promise.all(
        files
          .filter((f) => f instanceof File && f.size > 0)
          .map((f) => uploadFileToNeonS3(f)),
      );

      body = {
        ...(rawData ? JSON.parse(rawData) : {}),
        images: uploadedKeys,
      };
    } else {
      // Case 2: JSON payload (Base64 strings or URLs)
      body = await req.json();

      if (Array.isArray(body.images)) {
        body.images = await Promise.all(
          body.images.map((img: string) => uploadBase64ToNeonS3(img)),
        );
      }
    }

    const parsedData = createSchema.parse(body);

    const newHotel = await db.orm.public.Hotel.create({
      ownerId: dbUser.id,
      name: parsedData.name,
      slug: generateSlug(parsedData.name),
      description: parsedData.description,
      starRating: parsedData.starRating,
      images: (rel) =>
        rel.create(
          parsedData.images.map((keyOrUrl, index) => ({
            imageUrl: keyOrUrl,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        ),
      address: (rel) =>
        rel.create({
          addressLine: parsedData.address.addressLine,
          city: parsedData.address.city,
          state: parsedData.address.state,
          country: parsedData.address.country,
          postalCode: parsedData.address.postalCode,
          ...(parsedData.address.latitude !== undefined && {
            latitude: String(parsedData.address.latitude),
          }),
          ...(parsedData.address.longitude !== undefined && {
            longitude: String(parsedData.address.longitude),
          }),
        }),
      ...(parsedData.amenityIds &&
        parsedData.amenityIds.length > 0 && {
          amenities: (rel) =>
            rel.create(
              parsedData.amenityIds.map((amenityId) => ({ amenityId })),
            ),
        }),
    });

    console.log("New hotel created successfully:", newHotel.id);
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
