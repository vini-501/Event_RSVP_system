# EventEase - Full-Stack Event RSVP Platform

EventEase is a production-style event management platform where organizers create events, attendees discover and RSVP, and admins manage platform operations.

Built and shipped in **under 20 hours** with end-to-end flows across frontend, backend APIs, role-based access, and database persistence.

## Why This Project Stands Out

- Full-stack implementation using Next.js App Router + Supabase
- Multi-role product design: `attendee`, `organizer`, and `admin`
- Secure API layer with auth, RBAC, validation, and structured error handling
- Real-time-ish operational UX: event creation, RSVP lifecycle, check-in, analytics, notifications
- Strong debugging/refactor workflow: migrated key screens from mock data to database-backed APIs

## Core Features

### Attendee Experience
- Browse and filter published events
- View event details (description, date/time, location, capacity, pricing)
- RSVP with status options: `going`, `maybe`, `not going`
- Update RSVP status from event detail page
- View personal RSVPs and tickets
- Manage RSVP directly from `My RSVPs`

### Organizer Experience
- Create events with category, schedule, capacity, tags, and pricing
- View organizer-only event list from DB
- Access event analytics dashboard
- View attendees and check-in data

### Admin Experience
- View all events across the platform
- Delete events with real DB deletion (not UI-only)
- Role-aware API authorization for privileged operations

### Platform UX
- Sticky role-aware navigation
- Working top-bar controls:
  - Search icon -> event search workflow
  - Bell icon -> notifications dropdown + mark-as-read
  - Settings icon -> profile page

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling/UI:** Tailwind CSS v4, Radix UI primitives, Lucide icons
- **Backend:** Next.js Route Handlers (`app/api`)
- **Database/Auth:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Validation:** Zod
- **Forms:** React Hook Form + Zod Resolver
- **Charts:** Recharts

## Architecture Highlights

- App Router with route groups:
  - `app/(public)` for public browsing
  - `app/(attendee)` for attendee flows
  - `app/organizer` for organizer tools
  - `app/admin` for admin operations
- Service-oriented API layer:
  - `lib/api/services/*` for event, RSVP, organizer, ticket, notification logic
- Middleware utilities:
  - auth extraction
  - RBAC checks
  - request validation
  - consistent API response formatting

## Security and Access Control

- Authenticated server-side API access through Supabase session context
- Role checks via RBAC middleware
- Admin-specific operations use elevated server-side client where appropriate
- Validation and typed payloads prevent malformed writes

## Project Structure

```txt
app/
  (public)/events/
  (attendee)/my-rsvps/
  organizer/
  admin/
  api/
components/
lib/
  api/
    middleware/
    services/
    utils/
  supabase/
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the app

```bash
pnpm dev
```

Open: `http://localhost:3000`

## Scripts

```bash
pnpm dev      # run locally
pnpm build    # production build
pnpm start    # run production build
pnpm lint     # linting
```

## What I Demonstrated

- Designing and shipping a complete multi-role SaaS-style application quickly
- Building API-first features with proper authorization boundaries
- Moving from mocked UI to persistent DB-backed functionality
- Diagnosing real-world integration issues (RLS, route shape mismatches, UI/API coupling)
- Delivering polished UX while maintaining backend correctness

## Status

Actively iterating. Current implementation is functional and portfolio-ready, with room for further enhancements (testing, CI/CD, richer analytics, and deployment hardening).

