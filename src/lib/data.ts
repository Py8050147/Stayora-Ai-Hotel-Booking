import { z } from "zod";

export const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

export const todayStr = () => new Date().toISOString().slice(0, 10);

/** Each night of a stay: checkIn inclusive, checkOut exclusive. */
export function nightsBetween(checkIn: string, checkOut: string) {
  const out: string[] = [];
  const end = Date.parse(checkOut);
  for (let t = Date.parse(checkIn); t < end; t += 86_400_000)
    out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

export const stayDates = z
  .object({ checkIn: dateStr, checkOut: dateStr })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  })
  .refine((d) => nightsBetween(d.checkIn, d.checkOut).length <= 30, {
    message: "Maximum stay is 30 nights",
    path: ["checkOut"],
  });
