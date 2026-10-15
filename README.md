# Stayora — AI Hotel Booking

Stayora is a modern hotel booking application built with Next.js, TypeScript, and Prisma. It offers a polished hotel discovery experience with search, filters, favorite listings, and an admin dashboard for managing hotel data.

Live demo: https://stayora-ai-hotel-booking.vercel.app

## Overview

Stayora helps travelers discover curated stays across India with a clean, premium booking experience. The platform includes:

- Hotel browsing with city filters and sorting
- Search by hotel name, city, and state
- Saved listings for later comparison
- Hotel detail modals with amenities and pricing
- Admin dashboard for managing hotels
- Authentication using Clerk
- Database access with Prisma and PostgreSQL
- Media storage support using AWS S3

## Features

### Customer Experience
- Browse curated hotel listings
- Search and filter stays by city and price
- Sort by recommended, price, or rating
- Save favorite properties
- View hotel details and amenities
- Responsive design for desktop and mobile

### Hotel Management
- Add, edit, and delete hotel listings
- Manage property status and ratings
- Admin access via authenticated dashboard
- Secure route handling for management actions

### Tech Highlights
- Next.js App Router
- TypeScript for type safety
- Tailwind CSS for modern UI styling
- shadcn-inspired component system
- Prisma ORM for database modeling
- Clerk authentication
- AWS S3 integration for file/media handling

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui patterns, Radix primitives
- Backend: Next.js API routes
- Database: PostgreSQL + Prisma
- Auth: Clerk
- Storage: AWS S3
- Linting: ESLint

## Project Structure

```bash
.
├── .agents
├── .claude
├── .cursor
├── .devin
├── .vscode
├── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── hotels/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── hotels/
│   │   ├── ui/
│   │   ├── header.tsx
│   │   └── theme-provider.tsx
│   ├── lib/
│   ├── prisma/
│   ├── proxy.ts
│   └── ...
├── .gitignore
├── .gitattributes
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── prisma.config.ts
├── prisma-8.md
├── system.md
├── tsconfig.json
├── README.md
└── package-lock.json
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 20+
- npm or yarn or pnpm
- PostgreSQL database
- Clerk account and API keys
- AWS account and S3 bucket credentials

## Installation

```bash
git clone https://github.com/Py8050147/Stayora-Ai-Hotel-Booking.git
cd Stayora-Ai-Hotel-Booking
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/stayora"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/sign-up"

AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="your_aws_region"
AWS_S3_BUCKET_NAME="your_bucket_name"
```

## Database Setup

```bash
npx prisma generate
npx prisma db push
```

If you want to initialize migrations:

```bash
npx prisma migrate dev --name init
```

## Running the App

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

Open http://localhost:3000 in your browser.

## Available Scripts

```bash
npm run dev       # Start local development server
npm run build     # Create production build
npm run start     # Run production server
npm run lint      # Run ESLint checks
npm run contract:emit
```

## Main Routes

- `/` — Landing page with hotel discovery and filtering
- `/auth/sign-in` — Sign in page
- `/dashboard` — Admin hotel management dashboard
- `/hotels/create` — Create a new hotel listing
- `/hotels/[id]` — Hotel detail and booking flow

## Deployment

This project is ready to be deployed on Vercel:

1. Connect the GitHub repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy the project

## Notes

This repository is a feature-rich hotel booking app prototype with a strong frontend experience and a solid backend foundation for managing properties, users, and media assets.

## Contributing

Contributions are welcome. If you want to improve the platform, please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Contact

Project owner: Py8050147
Repository: https://github.com/Py8050147/Stayora-Ai-Hotel-Booking
