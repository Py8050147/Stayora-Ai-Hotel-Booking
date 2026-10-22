import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "../prisma/db";
import type { Models } from "../prisma/contract";

export type UserRole = Models["public_User"]["role"];
export type UserStatus = Models["public_User"]["status"];

export interface AuthResult {
  userId: string | null;
  dbUser: DbUser | null;
  error: NextResponse | null;
}

export interface DbUser {
  id: string;
  clerkId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleCheckOptions {
  allowCustomer?: boolean;
  allowHotelOwner?: boolean;
  allowHotelManager?: boolean;
  allowAdmin?: boolean;
}

const DEFAULT_ROLE_CHECK: RoleCheckOptions = {
  allowCustomer: true,
  allowHotelOwner: true,
  allowHotelManager: true,
  allowAdmin: true,
};

export async function getAuth(): Promise<AuthResult> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return {
      userId: null,
      dbUser: null,
      error: new Response(JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return {
      userId: clerkUserId,
      dbUser: null,
      error: new Response(JSON.stringify({ success: false, error: { code: "USER_NOT_FOUND", message: "Clerk user not found" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  const name = clerkUser.fullName ?? clerkUser.firstName ?? email?.split("@")[0] ?? "User";
  const phone = clerkUser.primaryPhoneNumber?.phoneNumber ?? null;

  let dbUser = await db.orm.public.User.where((u) => u.clerkId.eq(clerkUserId)).first();

  if (!dbUser && email) {
    const existingByEmail = await db.orm.public.User.where((u) => u.email.eq(email)).first();
    if (existingByEmail) {
      await db.orm.public.User.where((u) => u.id.eq(existingByEmail.id)).update({
        clerkId: clerkUserId,
        name,
        phone,
      });
      dbUser = { ...existingByEmail, clerkId: clerkUserId, name, phone };
    }
  }

  if (!dbUser && email) {
    try {
      dbUser = await db.orm.public.User.create({
        clerkId: clerkUserId,
        name,
        email,
        phone,
        role: "CUSTOMER",
        status: "ACTIVE",
      });
    } catch {
      dbUser = await db.orm.public.User.where((u) => u.clerkId.eq(clerkUserId)).first();
      if (!dbUser && email) {
        dbUser = await db.orm.public.User.where((u) => u.email.eq(email)).first();
      }
    }
  }

  if (!dbUser) {
    return {
      userId: clerkUserId,
      dbUser: null,
      error: new Response(JSON.stringify({ success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (dbUser.status === "SUSPENDED") {
    return {
      userId: clerkUserId,
      dbUser,
      error: new Response(JSON.stringify({ success: false, error: { code: "SUSPENDED", message: "Account suspended" } }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  if (dbUser.status === "DELETED") {
    return {
      userId: clerkUserId,
      dbUser,
      error: new Response(JSON.stringify({ success: false, error: { code: "DELETED", message: "Account deleted" } }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return { userId: clerkUserId, dbUser, error: null };
}

export function checkRole(dbUser: DbUser, options: RoleCheckOptions = DEFAULT_ROLE_CHECK): boolean {
  const roleChecks: Record<UserRole, keyof RoleCheckOptions> = {
    CUSTOMER: "allowCustomer",
    HOTEL_OWNER: "allowHotelOwner",
    HOTEL_MANAGER: "allowHotelManager",
    ADMIN: "allowAdmin",
  };

  const checkKey = roleChecks[dbUser.role];
  return options[checkKey] ?? false;
}

export function requireRole(dbUser: DbUser, options: RoleCheckOptions): NextResponse | null {
  if (!checkRole(dbUser, options)) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}

export function isAdmin(dbUser: DbUser): boolean {
  return dbUser.role === "ADMIN";
}

export function isHotelOwner(dbUser: DbUser): boolean {
  return dbUser.role === "HOTEL_OWNER";
}

export function isHotelManager(dbUser: DbUser): boolean {
  return dbUser.role === "HOTEL_MANAGER";
}

export function isCustomer(dbUser: DbUser): boolean {
  return dbUser.role === "CUSTOMER";
}

export function isManagement(dbUser: DbUser): boolean {
  return dbUser.role === "HOTEL_OWNER" || dbUser.role === "HOTEL_MANAGER" || dbUser.role === "ADMIN";
}

export async function checkHotelOwnership(hotelId: string, userId: string, dbUser: DbUser): Promise<NextResponse | null> {
  if (isAdmin(dbUser)) return null;

  const hotel = await db.orm.public.Hotel.where((h) => h.id.eq(hotelId)).first();
  if (!hotel) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Hotel not found" } }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (hotel.ownerId !== userId && !isManagement(dbUser)) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "FORBIDDEN", message: "You do not own this hotel" } }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return null;
}

export async function checkBookingAccess(bookingId: string, userId: string, dbUser: DbUser): Promise<NextResponse | null> {
  if (isAdmin(dbUser)) return null;

  const booking = await db.orm.public.Booking.where((b) => b.id.eq(bookingId)).first();
  if (!booking) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Booking not found" } }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const isOwner = booking.userId === userId;
  const isHotelManagement = isManagement(dbUser) && await checkHotelManagementAccess(booking.hotelId, userId, dbUser);

  if (!isOwner && !isHotelManagement) {
    return new Response(
      JSON.stringify({ success: false, error: { code: "FORBIDDEN", message: "Access denied" } }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return null;
}

export async function checkHotelManagementAccess(hotelId: string, userId: string, dbUser: DbUser): Promise<boolean> {
  if (isAdmin(dbUser)) return true;
  if (!isManagement(dbUser)) return false;

  const hotel = await db.orm.public.Hotel.where((h) => h.id.eq(hotelId)).first();
  if (!hotel) return false;

  return hotel.ownerId === userId;
}

export async function getUserById(userId: string): Promise<DbUser | null> {
  return db.orm.public.User.where((u) => u.id.eq(userId)).first();
}

export function serializeUser(user: DbUser) {
  return {
    id: user.id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}