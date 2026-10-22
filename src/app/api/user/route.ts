import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../prisma/db";
import { checkUser } from "@/lib/checkUser";
import { ZodError } from "zod";
import { userSchema, updateUserSchema } from "@/lib/schema/userSchema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Admin only endpoint - verify admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    const users = await db.orm.public.User.where(where)
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .orderBy({ createdAt: "desc" })
      .all();

    const total = await db.orm.public.User.where(where).count();

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching users:", error);
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

    const body = await req.json();
    const parsedData = userSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.orm.public.User.where({
      OR: [{ clerkId: parsedData.clerkId }, { email: parsedData.email }],
    }).first();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or Clerk ID already exists" },
        { status: 409 },
      );
    }

    const newUser = await db.orm.public.User.create({
      clerkId: parsedData.clerkId,
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      role: parsedData.role,
      status: parsedData.status,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
