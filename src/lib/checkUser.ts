import { db } from "../prisma/db";
import { currentUser } from "@clerk/nextjs/server";

// Syncs the signed-in Clerk user into your own User table.
// Returns null when nobody is signed in (sign-in / sign-up / public pages).
export async function checkUser() {
  const user = await currentUser();
  if (!user) return null;

  try {
    // 1. Check if the user already exists by clerkId
    const existingByClerkId = await db.orm.public.User.where({
      clerkId: user.id,
    }).first();

    if (existingByClerkId) return existingByClerkId;

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("Clerk user has no email address:", user.id);
      return null;
    }

    const name = user.fullName ?? user.firstName ?? email.split("@")[0];
    const phone = user.primaryPhoneNumber?.phoneNumber ?? null;

    // 2. Check if a user with this email already exists (e.g. recreated in Clerk)
    const existingByEmail = await db.orm.public.User.where({
      email,
    }).first();

    if (existingByEmail) {
      await db.orm.public.User.where({
        id: existingByEmail.id,
      }).update({
        clerkId: user.id,
        name,
        phone,
      });

      return {
        ...existingByEmail,
        clerkId: user.id,
        name,
        phone,
      };
    }

    // 3. Create the new user
    try {
      // role and status are omitted, so the DB defaults apply (CUSTOMER, ACTIVE)
      return await db.orm.public.User.create({
        clerkId: user.id,
        name,
        email,
        phone,
      });
    } catch (createError) {
      // Two requests raced to create the same user (23505 = unique violation).
      // Fetch the user that the winning request just created.
      const racedUser =
        (await db.orm.public.User.where({ clerkId: user.id }).first()) ??
        (await db.orm.public.User.where({ email }).first());

      if (racedUser) return racedUser;
      throw createError;
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return null;
  }
}
