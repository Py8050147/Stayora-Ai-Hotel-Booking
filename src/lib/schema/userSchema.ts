import z from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "HOTEL_OWNER", "HOTEL_MANAGER", "ADMIN"]).default("CUSTOMER"),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).default("ACTIVE"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "HOTEL_OWNER", "HOTEL_MANAGER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).optional(),
});