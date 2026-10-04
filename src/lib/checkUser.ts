import { db } from "../../prisma/db";
import { currentUser } from "@clerk/nextjs/server";

export async function checkUser() {
  const user = await currentUser();
  console.log("user", user);
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

    const newUser = await db.orm.public.User.create({
      clerkId: user.id,
      name: user.fullName ?? user.firstName ?? email.split("@")[0],
      email,
      phone: user.primaryPhoneNumber?.phoneNumber ?? null,
      role: "CUSTOMER",
      status: "ACTIVE",
      // role and status are omitted, so the DB defaults apply (CUSTOMER, ACTIVE)
    });

    console.log("Created new user:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error checking user:", error);
    return null;
  }
}

// import { db } from "../../prisma/db";
// import { currentUser } from "@clerk/nextjs/server";

// export async function checkUser() {
//   const user = await currentUser();
//   console.log("user", user);

//   if (!user) {
//     return null;
//   }

//   try {
//     const existingUser = await db.orm.public.User.where({
//       clerkId: user.id,
//     }).first();

//     if (existingUser) {
//       return existingUser;
//     }
//     console.log("existingUser", existingUser);

//     const data = {
//       clerkId: user.id,
//       name: user.fullName,
//       phone: user.phoneNumbers,
//       passwordHash: user.passwordEnabled,
//       role: user.createOrganizationsLimit,
//       status: user.lastSignInAt,
//     };

//     const newUser = await db.orm.public.User.create({ data });

//     console.log("newUser", newUser);

//     return newUser;
//     console.log("newUser", newUser);
//   } catch (error) {
//     console.error("Error checking user:", error);
//     return null;
//   }
// }
