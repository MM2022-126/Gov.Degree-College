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
- Live chat via HTTP API (Vercel-compatible)
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
4. Deploy — frontend and API deploy together on one domain

No separate backend server or Render deployment is required.

## Project Structure

```
├── src/
│   ├── app/              # Next.js pages + API routes
│   │   ├── api/          # All REST endpoints (/api/news, /api/events, …)
│   │   ├── admin/        # Admin panel pages
│   │   └── …             # Public pages
│   ├── views/            # Page UI components
│   ├── components/       # Shared React components
│   ├── models/           # Mongoose schemas (17 models)
│   └── lib/              # DB, auth, SEO, sanitization, Cloudinary
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
| `GET/POST /api/chat-messages` | `POST /api/upload` |
| `GET /api/settings` | `POST /api/auth/forgot-password` |

## License

Government Graduate College Shahdara — internal institutional project.
