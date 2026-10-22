import z from "zod";
import { dateStr } from "../data";

export const createBookingSchema = z.object({
  hotelId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
  checkIn: dateStr,
  checkOut: dateStr,
  adults: z.number().int().min(1).max(10).default(1),
  children: z.number().int().min(0).max(10).default(0),
  rooms: z.number().int().min(1).max(9).default(1),
  couponCode: z.string().optional(),
});

export const updateBookingSchema = z.object({
  checkIn: dateStr.optional(),
  checkOut: dateStr.optional(),
  adults: z.number().int().min(1).max(10).optional(),
  children: z.number().int().min(0).max(10).optional(),
  rooms: z.number().int().min(1).max(9).optional(),
  status: z.enum(["PENDING", "PAYMENT_PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "REFUNDED", "EXPIRED"]).optional(),
  cancelReason: z.string().optional(),
}).refine((data) => !data.checkIn || !data.checkOut || data.checkOut > data.checkIn, {
  message: "checkOut must be after checkIn",
  path: ["checkOut"],
});

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(["PENDING", "PAYMENT_PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "REFUNDED", "EXPIRED"]).optional(),
  hotelId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  checkInFrom: dateStr.optional(),
  checkInTo: dateStr.optional(),
});