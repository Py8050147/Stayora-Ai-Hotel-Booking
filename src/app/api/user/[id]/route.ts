import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../prisma/db";
import { checkUser } from "@/lib/checkUser";
import { ZodError } from "zod";
import { updateUserSchema } from "@/lib/schema/userSchema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Verify user can access this endpoint
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Users can only view their own profile unless admin
    if (dbUser.id !== id && dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await db.orm.public.User.where({ id }).first();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsedData = updateUserSchema.parse(body);

    // Verify authentication and authorization
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await checkUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Users can only update their own profile unless admin
    if (dbUser.id !== id && dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const existingUser = await db.orm.public.User.where({ id }).first();
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent non-admins from changing role/status
    if (dbUser.role !== "ADMIN") {
      delete parsedData.role;
      delete parsedData.status;
    }

    // Check for email uniqueness if email is being updated
    if (parsedData.email && parsedData.email !== existingUser.email) {
      const emailConflict = await db.orm.public.User.where({
        email: parsedData.email,
      }).first();
      if (emailConflict) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 },
        );
      }
    }

    const updatedUser = await db.orm.public.User.where({ id }).update({
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      role: parsedData.role,
      status: parsedData.status,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Error updating user:", error);
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
    const { id } = await params;

    // Verify admin access
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

    // Check if user exists
    const user = await db.orm.public.User.where({ id }).first();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deleting themselves
    if (user.id === dbUser.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    // Soft delete by updating status to DELETED
    await db.orm.public.User.where({ id }).update({
      status: "DELETED",
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
