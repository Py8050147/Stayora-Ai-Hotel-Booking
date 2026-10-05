import { db } from "../../prisma/db";
import { currentUser } from "@clerk/nextjs/server";

// Syncs the signed-in Clerk user into your own User table.
// Returns null when nobody is signed in (sign-in / sign-up / public pages).
export async function checkUser() {
  const user = await currentUser();
  if (!user) return null;

  try {
    const existingUser = await db.orm.public.User.where({
      clerkId: user.id,
    }).first();

    if (existingUser) return existingUser;

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress;

    if (!email) {
      console.error("Clerk user has no email address:", user.id);
      return null;
    }

    try {
      // role and status are omitted, so the DB defaults apply (CUSTOMER, ACTIVE)
      return await db.orm.public.User.create({
        clerkId: user.id,
        name: user.fullName ?? user.firstName ?? email.split("@")[0],
        email,
        phone: user.primaryPhoneNumber?.phoneNumber ?? null,
      });
    } catch (error) {
      // Two requests can race to create the same user (23505 = unique violation).
      // If that happens, the other request already created it, so fetch it.
      throw error;
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return null;
  }
}
