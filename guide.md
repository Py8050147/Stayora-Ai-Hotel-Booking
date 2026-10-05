# Stayora - Step-by-Step Guide

Welcome to the Stayora project! This guide will walk you through setting up the project, configuring the database, and using the newly added hotel management features.

## Prerequisites
- Node.js (v18 or higher recommended)
- A PostgreSQL database (or compatible SQL database supported by Prisma)
- A [Clerk](https://clerk.dev/) account for authentication

---

## Step 1: Installation
First, install the project dependencies:
```bash
npm install
```

## Step 2: Environment Variables
Create a `.env` file in the root of your project and configure the necessary environment variables. You will need your database URL and Clerk API keys:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stayora?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 3: Database Setup
Sync your Prisma schema with your database:
```bash
npx prisma generate
npx prisma db push
```

## Step 4: Seeding the Database
To populate the database with initial data (Amenities, Hotels, Rooms, and a Demo Owner), run the seed script:
```bash
npx tsx src/lib/seed.ts
```
*Note: This creates sample hotels, amenities, and room inventory data. Run this only once to prevent redundant execution, though it attempts to skip existing hotels.*

## Step 5: Running the Application
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 6: Using Hotel Management Features

We have recently added features for hotel owners to manage their properties.

### 1. Authentication & Ownership
- You must be signed in via Clerk to manage properties.
- Ensure your authenticated user has their database role set to `HOTEL_OWNER`. The seed script automatically creates an owner with the email `owner@stayora.dev`.

### 2. API Endpoints
The following internal API routes are available for hotel management (all require authentication):
- `GET /api/hotel` - Fetch all hotels owned by the current user.
- `POST /api/hotel` - Create a new hotel.
- `PATCH /api/hotel/[id]` - Update an existing hotel's details (e.g., name, check-in/out times, address, amenities, images).
- `DELETE /api/hotel/[id]` - Delete a hotel.

### 3. Creating & Editing a Hotel (UI)
The application includes forms (such as `EditHotelForm`) to modify hotel properties:
- Hotel Name & Description
- Star Rating (1-5)
- Check-in & Check-out times
- Address details (Address Line, City, State, Country, Postal Code)
- Hotel Images (add/remove URLs)
- Amenities (by linking Amenity IDs)

When updates are made, the application validates the payload using Zod before issuing requests to create or update the database records.
