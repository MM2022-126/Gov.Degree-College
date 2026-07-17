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
- Admin authentication with cookie-based JWT + **email OTP verification**
- **Forgot password** with OTP sent to the admin email (`/admin/forgot-password`)
- Live chat via **WebSockets on Vercel Functions** (with HTTP polling fallback)
- SEO: metadata, sitemap, robots.txt, JSON-LD structured data
- Security: CSP headers, input sanitization, NoSQL injection guards, rate-limited login/OTP

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
ADMIN_EMAIL=abc@gmail.com
ADMIN_PASSWORD=abc
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# Optional alternative: CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Gmail SMTP (App Password) — required to email OTPs in production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=xyz@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="College Admin <xyz@gmail.com>"
```

Without SMTP in **development**, OTP codes are returned in the API response as `devOtp` so you can still log in locally.

### Admin login (OTP)

1. Enter `ADMIN_EMAIL` + password
2. A 6-digit code is emailed to that address
3. Enter the code to complete sign-in

**Password source of truth**

| Situation | Password that works |
|-----------|---------------------|
| First deploy (no reset yet) | `ADMIN_PASSWORD` (or `ADMIN_PASSWORD_HASH`) from env |
| After forgot-password reset | **New password only** (stored hashed in MongoDB). Env password is ignored until you delete that DB hash. |

### Forgot / change password (OTP)

1. Open `/admin/forgot-password` and enter `ADMIN_EMAIL`
2. Enter the emailed OTP + choose a new password (min 8 characters)
3. Sign in with the **new** password + OTP — not the old env password

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
3. Add these environment variables (from `.env.local.example`):

| Variable | Required | Notes |
|----------|----------|--------|
| `MONGODB_URI` | Yes | Atlas connection string; allow Vercel IPs (or `0.0.0.0/0`) in Atlas Network Access |
| `JWT_SECRET` | Yes | Random ≥32 characters |
| `ADMIN_EMAIL` | Yes | Admin Gmail / inbox that receives OTPs |
| `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` | Yes (bootstrap) | Initial password until someone uses forgot-password; after a reset, MongoDB hash wins |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL, e.g. `https://your-app.vercel.app` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Yes (for OTPs) | Gmail: host `smtp.gmail.com`, port `587`, App Password |
| `CLOUDINARY_*` | For media uploads | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — or single `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>` |
| `REDIS_URL` | Recommended | Upstash for multi-instance live chat |
| `JWT_EXPIRY` | Optional | Default `8h` |

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
| `GET /api/health` | `POST /api/auth/login` (sends OTP) |
| `GET /api/news`, `/events`, `/departments` | `POST /api/auth/verify-otp` (sets session) |
| `POST /api/contact` | CRUD on news, events, faculty, media, … |
| `GET/POST /api/chat-messages` | `GET /api/admin/dashboard-stats` |
| `GET /api/settings` | `GET /api/ws` (WebSocket live chat) |
| | `POST /api/upload`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |

## License

Government Graduate College Shahdara — internal institutional project.
