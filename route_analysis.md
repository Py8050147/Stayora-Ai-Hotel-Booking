# Route.ts and Contract.prisma Analysis

## Overview
This analysis shows how the route.ts files in `/src/app/api/` interact with the Prisma 8 contract schema in `/src/prisma/contract.prisma` to perform CRUD (Create, Read, Update, Delete) operations.

## Files Examined

### Prisma Contract Schema
**Location**: `/src/prisma/contract.prisma`
**Purpose**: Defines the database schema using Prisma 8 (formerly Prisma Next) with PostgreSQL adapter

Key Models Defined:
- User (with Clerk integration)
- Hotel (with owner relationship)
- Address, HotelImage, Amenity, HotelAmenity
- RoomType, RoomInventory
- Booking, BookingRoom
- Payment, Refund
- Review, Favorite
- Coupon
- Notification
- Contact

### Route.ts Files

#### 1. `/src/app/api/whoami/route.ts`
**Purpose**: Authentication endpoint
**Operations**:
- GET: Returns current user ID and session ID from Clerk
**Database Interaction**: None (auth-only endpoint)

#### 2. `/src/app/api/me/route.ts`
**Purpose**: User profile management
**Operations**:
- GET: Fetches or creates user record from Clerk data
**Database Interaction**:
```typescript
// READ: Find existing user
const existingUser = await db.orm.public.User.where({
  clerkId: user.id,
}).first();

// CREATE: If user doesn't exist
const newUser = await db.orm.public.User.create({
  clerkId: user.id,
  name: user.fullName ?? user.firstName ?? email.split("@")[0],
  email,
  phone: user.primaryPhoneNumber?.phoneNumber ?? null,
});
```

#### 3. `/src/app/api/contact/route.ts`
**Purpose**: Contact form submissions
**Operations**:
- POST: Creates a new contact entry
**Database Interaction**:
```typescript
// CREATE: Insert new contact record
const contact = await db.contact.create({
  data: {
    name,
    email,
    phone: phone || null,
    subject,
    message,
    status: "NEW",
  },
});
```

#### 4. `/src/app/api/hotel/route.ts`
**Purpose**: Hotel collection operations
**Operations**:
- GET: Fetch hotels (public or user-specific)
- POST: Create new hotel with images, address, amenities
**Database Interaction**:
```typescript
// GET - READ: Fetch hotels with relations
// For user's hotels
hotels = await db.orm.public.Hotel.where({
  ownerId: dbUser.id,
})
  .include("images")
  .include("address")
  .all();

// For public hotels
hotels = await db.orm.public.Hotel.include("images")
  .include("address")
  .all();

// POST - CREATE: Create hotel with nested relations
const newHotel = await db.orm.public.Hotel.create({
  ownerId: dbUser.id,
  name: parsedData.name,
  slug: generateSlug(parsedData.name),
  description: parsedData.description,
  starRating: parsedData.starRating,
  images: (rel) =>
    rel.create(
      parsedData.images.map((keyOrUrl, index) => ({
        imageUrl: keyOrUrl,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    ),
  address: (rel) =>
    rel.create({
      // ... address fields
    }),
  // ... amenities relation
});
```

#### 5. `/src/app/api/hotel/[id]/route.ts`
**Purpose**: Individual hotel operations
**Operations**:
- PATCH: Update hotel (with ownership verification)
- DELETE: Delete hotel (with ownership verification)
**Database Interaction**:
```typescript
// PATCH - UPDATE: Update hotel with nested relations
const updatedHotel = await db.orm.public.Hotel.where({ id }).update({
  name: parsedData.name,
  description: parsedData.description,
  starRating: parsedData.starRating,
  images: (rel) => {
    rel.disconnect();
    return rel.create(
      parsedData.images.map((url, index) => ({
        imageUrl: url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    );
  },
  // ... address and amenities updates
});

// DELETE - DELETE: Remove hotel
await db.orm.public.Hotel.where({ id }).delete();
```

## Schema-Route Relationship Summary

### CREATE Operations (POST/PUT/PATCH)
- **Hotel Creation** (`hotel/route.ts.POST`): Uses `db.orm.public.Hotel.create()` with nested creation for images, address, and amenities
- **User Creation** (`me/route.ts.GET`): Uses `db.orm.public.User.create()` when Clerk user doesn't exist
- **Contact Creation** (`contact/route.ts.POST`): Uses `db.contact.create()` 
- **Relation Handling**: Uses Prisma 8's relational create syntax: `(rel) => rel.create(...)`

### READ Operations (GET)
- **Hotel Listing** (`hotel/route.ts.GET`): Uses `db.orm.public.Hotel.where(...).all()` with `.include()` for eager loading
- **Hotel Detail** (`hotel/[id]/route.ts` implied): Would use `.where({ id }).first()` 
- **User Lookup** (`me/route.ts.GET`): Uses `db.orm.public.User.where({ clerkId }).first()`
- **Filtering**: Uses `.where()` clauses for conditions (e.g., ownerId filters)

### UPDATE Operations (PATCH)
- **Hotel Update** (`hotel/[id]/route.ts.PATCH`): Uses `db.orm.public.Hotel.where({ id }).update()`
- **Relation Updates**: Uses disconnect/reconnect pattern:
  ```typescript
  images: (rel) => {
    rel.disconnect();
    return rel.create(...);
  }
  ```
- **Conditional Updates**: Address updates check if relation exists before updating/creating

### DELETE Operations (DELETE)
- **Hotel Deletion** (`hotel/[id]/route.ts.DELETE`): Uses `db.orm.public.Hotel.where({ id }).delete()`
- **Cascade Deletion**: Handled by Prisma relations with `onDelete: Cascade` in schema

## Key Observations

1. **Prisma 8 Syntax**: All database interactions use the Prisma 8 `db.orm.public.Model` API with method chaining
2. **Relation Handling**: 
   - Creation: Nested create via `(rel) => rel.create(...)`
   - Updates: Disconnect/reconnect pattern for to-many relations
   - Loading: `.include()` for eager loading relations
3. **Error Handling**: All routes use try/catch with proper HTTP status codes
4. **Authentication**: Clerk integration via `auth()` and `currentUser()` helpers
5. **Ownership Verification**: Mutating operations (PATCH, DELETE) verify user owns the resource
6. **File Uploads**: Hotel creation handles multipart/form-data for image uploads to S3

## Contract.prisma Support for Routes

The contract.prisma schema provides all necessary models and relations:
- **User ↔ Hotel**: One-to-many (ownerId foreign key)
- **Hotel ↔ Address**: One-to-one (hotelId unique foreign key)
- **Hotel ↔ HotelImage**: One-to-many (hotelId foreign key)
- **Hotel ↔ HotelAmenity ↔ Amenity**: Many-to-many junction table
- **Hotel ↔ RoomType**: One-to-many
- **RoomType ↔ RoomInventory**: One-to-many (daily availability/pricing)
- **Hotel ↔ Booking**: One-to-many
- **Booking ↔ BookingRoom**: One-to-many (snapshot of room prices/quantities)
- **Booking ↔ Payment**: One-to-many
- **Payment ↔ Refund**: One-to-many
- **Hotel ↔ Review**: One-to-many (with bookingId unique constraint)
- **Hotel ↔ Favorite**: One-to-many (userId, hotelId unique constraint)
- **User ↔ Notification**: One-to-many

This schema fully supports all CRUD operations demonstrated in the route.ts files.