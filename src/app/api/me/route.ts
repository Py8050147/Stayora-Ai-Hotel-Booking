import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../prisma/db";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await db.orm.public.User.where({
      clerkId: user.id,
    }).first();

    if (!existingUser) {
      // Create user if doesn't exist
      const email =
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses[0]?.emailAddress;

      if (!email) {
        return NextResponse.json({ error: "No email found" }, { status: 400 });
      }

      const newUser = await db.orm.public.User.create({
        clerkId: user.id,
        name: user.fullName ?? user.firstName ?? email.split("@")[0],
        email,
        phone: user.primaryPhoneNumber?.phoneNumber ?? null,
      });

      return NextResponse.json(newUser);
    }

    return NextResponse.json(existingUser);
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}