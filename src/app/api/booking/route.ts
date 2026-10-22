import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../prisma/db";
import { checkUser } from "@/lib/checkUser";
import { ZodError } from "zod";
import {
  createBookingSchema,
  bookingQuerySchema,
} from "@/lib/schema/bookingSchema";
import { nightsBetween, dateStr } from "@/lib/data";

function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BKG-${timestamp}-${random}`;
}

async function calculateBookingTotals(
  hotelId: string,
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
  rooms: number,
  couponCode?: string,
) {
  const nights = nightsBetween(checkIn, checkOut).length;

  // Get room inventory for the date range
  const inventory = await db.orm.public.RoomInventory.where({
    roomTypeId,
    date: { in: nightsBetween(checkIn, checkOut) },
    isClosed: false,
  }).all();

  if (inventory.length !== nights) {
    throw new Error("Room not available for all nights");
  }

  // Check availability
  const minAvailable = Math.min(...inventory.map((i) => i.availableRooms));
  if (minAvailable < rooms) {
    throw new Error(`Only ${minAvailable} rooms available`);
  }

  // Calculate price
  const totalPrice = inventory.reduce(
    (sum, inv) => sum + Number(inv.price) * rooms,
    0,
  );

  // Apply coupon if provided
  let discount = 0;
  let couponId: string | undefined;

  if (couponCode) {
    const coupon = await db.orm.public.Coupon.where({
      code: couponCode,
      status: "ACTIVE",
      validFrom: { lte: new Date() },
      validTo: { gte: new Date() },
    }).first();

    if (
      coupon &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
    ) {
      if (coupon.discountType === "PERCENTAGE") {
        discount = (totalPrice * Number(coupon.discountValue)) / 100;
      } else {
        discount = Number(coupon.discountValue);
      }
      couponId = coupon.id;
    }
  }

  const subtotal = totalPrice;
  const tax = subtotal * 0.18; // 18% GST
  const totalAmount = subtotal + tax - discount;

  return {
    subtotal,
    tax,
    discount,
    totalAmount,
    couponId,
    nights,
    pricePerNight: inventory[0] ? Number(inventory[0].price) : 0,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = bookingQuerySchema.parse(Object.fromEntries(searchParams));

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause
    const where: Record<string, unknown> = {};

    // Regular users can only see their own bookings
    if (dbUser.role === "CUSTOMER") {
      where.userId = dbUser.id;
    } else if (
      query.userId &&
      (dbUser.role === "ADMIN" ||
        dbUser.role === "HOTEL_OWNER" ||
        dbUser.role === "HOTEL_MANAGER")
    ) {
      where.userId = query.userId;
    }

    if (query.status) where.status = query.status;
    if (query.hotelId) where.hotelId = query.hotelId;

    if (query.checkInFrom || query.checkInTo) {
      where.checkIn = {};
      if (query.checkInFrom) where.checkIn.gte = query.checkInFrom;
      if (query.checkInTo) where.checkIn.lte = query.checkInTo;
    }

    const bookings = await db.orm.public.Booking.where(where)
      .include("roomLines")
      .include("payments")
      .include("hotel", { include: ["images"] })
      .include("user")
      .offset((query.page - 1) * query.pageSize)
      .limit(query.pageSize)
      .orderBy({ createdAt: "desc" })
      .all();

    const total = await db.orm.public.Booking.where(where).count();

    return NextResponse.json(
      {
        bookings,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsedData = createBookingSchema.parse(body);

    // Verify hotel exists and is active
    const hotel = await db.orm.public.Hotel.where({
      id: parsedData.hotelId,
      status: "ACTIVE",
    }).first();

    if (!hotel) {
      return NextResponse.json(
        { error: "Hotel not found or not available" },
        { status: 404 },
      );
    }

    // Verify room type belongs to hotel
    const roomType = await db.orm.public.RoomType.where({
      id: parsedData.roomTypeId,
      hotelId: parsedData.hotelId,
    }).first();

    if (!roomType) {
      return NextResponse.json(
        { error: "Room type not found" },
        { status: 404 },
      );
    }

    // Validate capacity
    const totalGuests = parsedData.adults + parsedData.children;
    if (totalGuests > roomType.maxAdults + roomType.maxChildren) {
      return NextResponse.json(
        {
          error: `Room accommodates max ${roomType.maxAdults} adults and ${roomType.maxChildren} children`,
        },
        { status: 400 },
      );
    }

    // Calculate totals and check availability
    const totals = await calculateBookingTotals(
      parsedData.hotelId,
      parsedData.roomTypeId,
      parsedData.checkIn,
      parsedData.checkOut,
      parsedData.rooms,
      parsedData.couponCode,
    );

    // Create booking in a transaction
    const bookingNumber = generateBookingNumber();

    const newBooking = await db.orm.public.Booking.create({
      bookingNumber,
      userId: dbUser.id,
      hotelId: parsedData.hotelId,
      couponId: totals.couponId,
      checkIn: parsedData.checkIn,
      checkOut: parsedData.checkOut,
      adults: parsedData.adults,
      children: parsedData.children,
      rooms: parsedData.rooms,
      subtotal: totals.subtotal,
      tax: totals.tax,
      discount: totals.discount,
      totalAmount: totals.totalAmount,
      status: "PENDING",
      paymentStatus: "PENDING",
      holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes hold
      roomLines: (rel) =>
        rel.create({
          roomTypeId: parsedData.roomTypeId,
          quantity: parsedData.rooms,
          pricePerNight: totals.pricePerNight,
          nights: totals.nights,
          subtotal: totals.subtotal,
        }),
    });

    // Update room inventory (reduce available rooms)
    const dates = nightsBetween(parsedData.checkIn, parsedData.checkOut);
    for (const date of dates) {
      await db.orm.public.RoomInventory.where({
        roomTypeId: parsedData.roomTypeId,
        date,
      }).update({
        availableRooms: { decrement: parsedData.rooms },
      });
    }

    // Update coupon usage if applied
    if (totals.couponId) {
      await db.orm.public.Coupon.where({ id: totals.couponId }).update({
        usedCount: { increment: 1 },
      });
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      if (
        error.message.includes("available") ||
        error.message.includes("accommodates")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
