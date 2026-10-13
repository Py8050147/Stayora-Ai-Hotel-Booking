# System Documentation

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.3.8 (Turbopack) |
| Language | TypeScript 5 |
| Runtime | Node.js |
| Authentication | Clerk (Core 3, proxy-based) |
| Database ORM | Prisma 8 (orm-postgres) |
| Database | PostgreSQL (Neon) |
| Validation | Zod 4.6.5 |
| Forms | React Hook Form 7.89.0 |
| UI Components | Shadcn UI (Radix UI based) |
| Styling | Tailwind CSS 4 |
| Animations | tw-animate-css |
| Maps | React Leaflet 5.0.0 |
| Notifications | Sonner 2.0.8 |
| Icons | Lucide React 1.52.0 |

## Project Structure

```
stayora/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── hotel/
│   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   └── [id]/route.ts     # PATCH (update), DELETE
│   │   │   ├── me/route.ts           # Current user info
│   │   │   └── whoami/route.ts       # Auth check
│   │   ├── auth/
│   │   │   ├── sign-in/[...sign-up]/page.tsx
│   │   │   └── sign-up/[...sign-up]/page.tsx
│   │   ├── dashboard/page.tsx        # Hotel management dashboard
│   │   ├── hotels/create/page.tsx    # Create hotel page
│   │   ├── globals.css               # Global styles + Leaflet CSS
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Homepage
│   ├── components/
│   │   ├── ui/                       # Shadcn UI components
│   │   │   ├── ImageUploader.tsx     # Drag & drop image upload
│   │   │   ├── button.tsx, card.tsx, dialog.tsx, etc.
│   │   ├── hotels/
│   │   │   ├── CreateHotelForm.tsx   # Hotel creation form
│   │   │   ├── EditHotelForm.tsx     # Hotel edit form
│   │   │   └── MapPicker.tsx         # Leaflet map picker
│   │   └── header.tsx                # Navigation header
│   ├── lib/
│   │   ├── schema/
│   │   │   └── hotelSchema.ts        # Zod validation schemas
│   │   ├── checkUser.ts              # Sync Clerk user to DB
│   │   ├── data.ts                   # Shared data/constants
│   │   └── utils.ts                  # Utility functions
│   ├── proxy.ts                      # Clerk proxy middleware
│   └── middleware.ts                 # (Not used - proxy handles auth)
├── prisma/
│   └── db/                           # Prisma schema and client
├── .env                              # Environment variables
├── package.json
└── tsconfig.json
```

## Authentication Flow

1. **Clerk handles auth** via `src/proxy.ts` (not traditional middleware)
2. **User signs in** through Clerk's hosted sign-in page
3. **Sync to database** via `src/lib/checkUser.ts` - creates/updates User record in Prisma
4. **API routes** verify auth using `currentUser()` from `@clerk/nextjs/server`

## Database Schema (Prisma 8)

Key models:
- **Hotel** - Main entity with name, description, starRating, slug
- **Address** - Linked to Hotel (one-to-one)
- **Image** - Hotel images with url, sortOrder, isPrimary
- **Amenity** - Amenity entities
- **HotelAmenity** - Join table for hotel-amenity relationship
- **User** - Local user record synced from Clerk

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/hotel | List all hotels for current user |
| POST | /api/hotel | Create new hotel |
| PATCH | /api/hotel/[id] | Update existing hotel |
| DELETE | /api/hotel/[id] | Delete hotel |

## Form Validation

All forms use Zod schemas from `src/lib/schema/hotelSchema.ts`:
- `createSchema` - Hotel creation/update validation
- `searchSchema` - Hotel search/filter validation

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
```