// prisma/seed.ts  (Prisma ORM 8 API: db.orm.public.<Model>)
// Run:  npx tsx prisma/seed.ts
// Creates: 1 owner, 12 amenities, 10 hotels (5 images each), 3 room types per hotel,
//          and 60 days of daily room inventory (weekend prices +20%).
// Safe to run again: hotels that already exist (same slug) are skipped.

import "dotenv/config";
import { db } from "../../prisma/db"; // adjust to where your db.ts lives

const DAYS = 60;

const AMENITIES = [
  ["Free WiFi", "Internet"],
  ["Swimming Pool", "Recreation"],
  ["Free Breakfast", "Food"],
  ["Free Parking", "Transport"],
  ["Air Conditioning", "Room"],
  ["Gym", "Recreation"],
  ["Spa", "Recreation"],
  ["Restaurant", "Food"],
  ["Airport Shuttle", "Transport"],
  ["24h Front Desk", "Service"],
  ["Pet Friendly", "Policy"],
  ["Room Service", "Service"],
] as const;

type Seed = {
  name: string;
  city: string;
  state: string;
  stars: number;
  base: number; // base price per night (INR) for the Standard room
  lat: number;
  lng: number;
  amenities: string[];
  about: string;
};

const HOTELS: Seed[] = [
  {
    name: "Stayora Grand Patna",
    city: "Patna",
    state: "Bihar",
    stars: 4,
    base: 3800,
    lat: 25.5941,
    lng: 85.1376,
    amenities: [
      "Free WiFi",
      "Free Breakfast",
      "Free Parking",
      "Air Conditioning",
      "Restaurant",
      "24h Front Desk",
    ],
    about:
      "A comfortable business and family hotel close to Gandhi Maidan and the railway station.",
  },
  {
    name: "Ganga View Residency",
    city: "Patna",
    state: "Bihar",
    stars: 3,
    base: 2400,
    lat: 25.6093,
    lng: 85.1235,
    amenities: [
      "Free WiFi",
      "Free Breakfast",
      "Air Conditioning",
      "24h Front Desk",
      "Room Service",
    ],
    about:
      "Budget friendly rooms with a calm view of the Ganga and easy access to the city centre.",
  },
  {
    name: "Sea Breeze Resort",
    city: "Goa",
    state: "Goa",
    stars: 5,
    base: 9500,
    lat: 15.4989,
    lng: 73.8278,
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Free Breakfast",
      "Spa",
      "Restaurant",
      "Gym",
      "Airport Shuttle",
    ],
    about:
      "Beachfront resort with a pool, spa and sunset dining, a short walk from Calangute beach.",
  },
  {
    name: "Marine Drive Suites",
    city: "Mumbai",
    state: "Maharashtra",
    stars: 5,
    base: 12500,
    lat: 18.9442,
    lng: 72.8231,
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Gym",
      "Spa",
      "Restaurant",
      "Room Service",
      "24h Front Desk",
    ],
    about:
      "Elegant sea facing suites on Marine Drive, minutes from South Mumbai's landmarks.",
  },
  {
    name: "Connaught Central Inn",
    city: "New Delhi",
    state: "Delhi",
    stars: 4,
    base: 6200,
    lat: 28.6315,
    lng: 77.2167,
    amenities: [
      "Free WiFi",
      "Free Breakfast",
      "Air Conditioning",
      "Restaurant",
      "Airport Shuttle",
      "24h Front Desk",
    ],
    about:
      "Modern hotel in the heart of Connaught Place with metro access at the doorstep.",
  },
  {
    name: "Pink City Haveli",
    city: "Jaipur",
    state: "Rajasthan",
    stars: 4,
    base: 5200,
    lat: 26.9239,
    lng: 75.8267,
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Free Breakfast",
      "Restaurant",
      "Free Parking",
      "Pet Friendly",
    ],
    about:
      "A restored haveli with courtyard dining, rooftop views and Rajasthani hospitality.",
  },
  {
    name: "Garden City Business Hotel",
    city: "Bengaluru",
    state: "Karnataka",
    stars: 4,
    base: 5800,
    lat: 12.9716,
    lng: 77.5946,
    amenities: [
      "Free WiFi",
      "Gym",
      "Free Breakfast",
      "Restaurant",
      "Free Parking",
      "Air Conditioning",
    ],
    about:
      "Business hotel near MG Road with meeting rooms, fast WiFi and a rooftop restaurant.",
  },
  {
    name: "Howrah Heritage Stay",
    city: "Kolkata",
    state: "West Bengal",
    stars: 3,
    base: 3200,
    lat: 22.5726,
    lng: 88.3639,
    amenities: [
      "Free WiFi",
      "Free Breakfast",
      "Air Conditioning",
      "Restaurant",
      "24h Front Desk",
    ],
    about:
      "Classic Kolkata charm with modern comforts, close to Howrah Bridge and the riverfront.",
  },
  {
    name: "Lake Palace View",
    city: "Udaipur",
    state: "Rajasthan",
    stars: 5,
    base: 11000,
    lat: 24.5854,
    lng: 73.7125,
    amenities: [
      "Free WiFi",
      "Swimming Pool",
      "Spa",
      "Restaurant",
      "Free Breakfast",
      "Room Service",
      "Airport Shuttle",
    ],
    about:
      "Lakefront luxury hotel with rooms overlooking Lake Pichola and the City Palace.",
  },
  {
    name: "Himalayan Pine Lodge",
    city: "Manali",
    state: "Himachal Pradesh",
    stars: 3,
    base: 4200,
    lat: 32.2432,
    lng: 77.1892,
    amenities: [
      "Free WiFi",
      "Free Breakfast",
      "Free Parking",
      "Restaurant",
      "Pet Friendly",
    ],
    about:
      "Cosy wooden lodge among pine trees with mountain views and a warm fireplace lounge.",
  },
];

const ROOM_TYPES = [
  {
    name: "Standard Room",
    bed: "DOUBLE",
    adults: 2,
    children: 1,
    rooms: 10,
    mult: 1,
    desc: "Comfortable room with a double bed, work desk and private bathroom.",
  },
  {
    name: "Deluxe Room",
    bed: "QUEEN",
    adults: 2,
    children: 2,
    rooms: 6,
    mult: 1.5,
    desc: "Larger room with a queen bed, seating area and city or garden view.",
  },
  {
    name: "Premium Suite",
    bed: "KING",
    adults: 3,
    children: 2,
    rooms: 3,
    mult: 2.4,
    desc: "Spacious suite with a king bed, separate living area and premium amenities.",
  },
] as const;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const isoDay = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);
const isWeekend = (iso: string) =>
  [0, 6].includes(new Date(iso + "T00:00:00Z").getUTCDay());
const round50 = (n: number) => Math.round(n / 50) * 50;

async function main() {
  console.log("Seeding Stayora...");

  // 1) Owner
  const owner = await db.orm.public.User.upsert({
    create: {
      name: "Stayora Demo Owner",
      email: "owner@stayora.dev",
      role: "HOTEL_OWNER",
      status: "ACTIVE",
    },
    update: { name: "Stayora Demo Owner" },
    conflictOn: { email: "owner@stayora.dev" },
  });

  // 2) Amenities
  const amenityIds = new Map<string, string>();
  for (const [name, category] of AMENITIES) {
    const a = await db.orm.public.Amenity.upsert({
      create: { name, category },
      update: { category },
      conflictOn: { name },
    });
    amenityIds.set(name, a.id);
  }

  // 3) Hotels (each hotel is written in ONE transaction: all or nothing)
  let created = 0;
  for (const h of HOTELS) {
    const slug = slugify(h.name);

    const exists = await db.orm.public.Hotel.first({ slug });
    if (exists) {
      console.log(`  skip  ${h.name} (already exists)`);
      continue;
    }

    await db.transaction(async (tx) => {
      const hotel = await tx.orm.public.Hotel.create({
        ownerId: owner.id,
        name: h.name,
        slug,
        description: h.about,
        starRating: h.stars,
        status: "ACTIVE",
      });

      await tx.orm.public.Address.create({
        hotelId: hotel.id,
        addressLine: `${10 + created * 7} Main Road`,
        city: h.city,
        state: h.state,
        country: "India",
        postalCode: String(100000 + created * 1111),
        latitude: h.lat,
        longitude: h.lng,
      });

      await tx.orm.public.HotelImage.createAll(
        Array.from({ length: 5 }, (_, i) => ({
          hotelId: hotel.id,
          imageUrl: `https://picsum.photos/seed/${slug}-${i + 1}/1200/800`,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      );

      await tx.orm.public.HotelAmenity.createAll(
        h.amenities.map((n) => ({
          hotelId: hotel.id,
          amenityId: amenityIds.get(n)!,
        })),
      );

      for (const rt of ROOM_TYPES) {
        const basePrice = round50(h.base * rt.mult);
        const roomType = await tx.orm.public.RoomType.create({
          hotelId: hotel.id,
          name: rt.name,
          description: rt.desc,
          maxAdults: rt.adults,
          maxChildren: rt.children,
          bedType: rt.bed,
          totalRooms: rt.rooms,
          basePrice,
        });

        await tx.orm.public.RoomInventory.createAll(
          Array.from({ length: DAYS }, (_, i) => {
            const date = isoDay(i);
            const price = isWeekend(date)
              ? round50(basePrice * 1.2)
              : basePrice;
            return {
              roomTypeId: roomType.id,
              date,
              availableRooms: rt.rooms,
              price,
              isClosed: false,
            };
          }),
          { onConflict: "skip" },
        );
      }
    });

    created++;
    console.log(`  added ${h.name} (${h.city})`);
  }

  console.log(
    `\nDone. ${created} hotels created, inventory covers the next ${DAYS} days.`,
  );
  console.log(
    "Owner record: owner@stayora.dev (link a Clerk user by setting your own user's role in the database).",
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
