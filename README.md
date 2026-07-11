# Government Graduate College Shahdara — Ravi Road, Lahore

Official fullstack website for **Government Graduate College Shahdara** (GGC Shahdara), built as a single **Next.js 14** application with API routes, MongoDB, and admin panel.

## Architecture

This project is a **unified monorepo** — one codebase, one deploy:

| Layer | Location | Technology |
|-------|----------|------------|
| Frontend | `src/app/` + `src/views/` | Next.js 14 App Router, React, Tailwind, shadcn/ui |
| API | `src/app/api/` | Next.js Route Handlers |
| Database | `src/models/` + `src/lib/mongodb.ts` | MongoDB Atlas, Mongoose |
| Auth | `src/lib/auth.ts` | JWT in HttpOnly cookies |
| Admin | `/admin/*` | Protected dashboard for content management |

There is **no separate Express backend**. All former `backend/` routes live under `/api/*` in the same Next.js app.

## Features

- Public pages: Home, About, Departments, Faculty, Admissions, News, Events, Gallery, Schedule, Contact
- Admin CMS: News, Events, Announcements, Departments, Faculty, Media, Schedule, Live Chat
- Admin authentication with cookie-based JWT
- **Forgot password** flow for admin (`/admin/forgot-password`)
- Live chat via **WebSockets on Vercel Functions** (with HTTP polling fallback)
- SEO: metadata, sitemap, robots.txt, JSON-LD structured data
- Security: CSP headers, input sanitization, NoSQL injection guards, rate-limited login

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection string
- Cloudinary account (for image uploads)

### Install

```bash
npm install --legacy-peer-deps
```

### Environment

Copy `.env.local.example` to `.env.local` and fill in values:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_min_32_chars
ADMIN_EMAIL=admin@ggc.edu.pk
ADMIN_PASSWORD=your_password
# Or use bcrypt hash (recommended):
# ADMIN_PASSWORD_HASH=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Production build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Import this repository in [Vercel](https://vercel.com)
2. Framework preset: **Next.js** (auto-detected)
3. Add all environment variables from `.env.local.example`
4. **Enable real-time chat (recommended):** add [Upstash Redis](https://vercel.com/marketplace/upstash) from the Vercel Marketplace so WebSocket events sync across all serverless instances:
   ```bash
   vercel link
   vercel integration add upstash
   vercel env pull
   ```
   This sets `REDIS_URL` automatically. Without Redis, chat still works on a single function instance; polling fills gaps.
5. Deploy — frontend, REST API, and WebSocket endpoint (`/api/ws`) deploy together on one domain

**Fluid compute** is enabled in `vercel.json` (required for WebSockets on Vercel).

### Local development with WebSockets

WebSocket upgrades need the Vercel runtime locally:

```bash
npm run dev:vercel
```

Plain `npm run dev` works for UI/API, but `/api/ws` only upgrades correctly with `vercel dev` or in production on Vercel.

No separate backend server or Render deployment is required.

## Project Structure

```
├── src/
│   ├── app/              # Next.js pages + API routes
│   │   ├── api/          # REST + WebSocket (/api/ws)
│   │   ├── admin/        # Admin panel pages
│   │   └── …             # Public pages
│   ├── views/            # Page UI components
│   ├── components/       # Shared React components
│   ├── models/           # Mongoose schemas (17 models)
│   └── lib/              # DB, auth, SEO, chat-realtime hub, Redis
├── middleware.ts         # Admin route protection
├── next.config.mjs       # Security headers, image domains
└── public/               # Static assets
```

## API Overview

All endpoints are relative to `/api`:

| Public | Admin (cookie auth) |
|--------|---------------------|
| `GET /api/health` | `POST /api/auth/login` |
| `GET /api/news`, `/events`, `/departments` | CRUD on news, events, faculty, media, … |
| `POST /api/contact` | `GET /api/admin/dashboard-stats` |
| `GET/POST /api/chat-messages` | `GET /api/ws` (WebSocket live chat) |
| `GET /api/settings` | `POST /api/upload`, `POST /api/auth/forgot-password` |

## License

Government Graduate College Shahdara — internal institutional project.
