import z from "zod";
import { dateStr } from "../data";
export const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().max(5000).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  checkInTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  checkOutTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  address: z.object({
    addressLine: z.string().min(3),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(3),
    latitude: z.union([
      z.number().min(-90).max(90),
      z.string().transform((val) => {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }),
    ]).optional(),
    longitude: z.union([
      z.number().min(-180).max(180),
      z.string().transform((val) => {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }),
    ]).optional(),
  }),
  images: z.array(z.string().min(1)).max(30).default([]),
  amenityIds: z.array(z.string().uuid()).default([]),
});

const searchSchema = z
  .object({
    city: z.string().trim().min(1).optional(),
    checkIn: dateStr.optional(),
    checkOut: dateStr.optional(),
    guests: z.coerce.number().int().min(1).max(20).default(2),
    rooms: z.coerce.number().int().min(1).max(9).default(1),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    stars: z.coerce.number().int().min(1).max(5).optional(),
    amenities: z.string().optional(), // comma separated amenity ids
    sort: z
      .enum(["recommended", "price_asc", "price_desc", "stars"])
      .default("recommended"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine((q) => !!q.checkIn === !!q.checkOut, {
    message: "Send both checkIn and checkOut",
    path: ["checkOut"],
  })
  .refine((q) => !q.checkIn || q.checkOut! > q.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });
