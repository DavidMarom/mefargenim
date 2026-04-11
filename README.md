# Mefargenim — Israel's Local Business Directory

> A full-stack, production web application for discovering and managing local businesses across Israel.

**Live:** [mefargenim.biz](https://mefargenim.biz)

---

## Overview

Mefargenim is a full-stack business directory platform built with Next.js 16 (App Router). It allows business owners to list and manage their presence online, while users can browse, search, and interact with local businesses through a fast, SEO-optimized interface.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, SSR/SSG) |
| UI | React 19, TypeScript |
| Database | MongoDB |
| Auth & Storage | Firebase |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| SEO | next-sitemap |

## Features

- **Business Listings** — Browse and search local businesses with dedicated listing pages
- **Owner Dashboard** — Business owners can create and manage their listing
- **Authentication** — Google OAuth via Firebase
- **Like System** — Optimistic UI updates with persistent like tracking
- **Admin Panel** — Internal tools for managing listings, including CSV import/export
- **Blog** — Content section with landing-page and tips articles
- **REST API** — Next.js Route Handlers for businesses, users, likes, and email
- **SEO** — Auto-generated sitemap on every build via `next-sitemap`

## Project Structure

```
src/
├── app/
│   ├── api/           # Route Handlers (biz, users, likes, email, sitemap)
│   ├── business/      # Business listing pages
│   ├── dashboard/     # Owner dashboard
│   ├── my-business/   # Business management
│   ├── blog/          # Blog articles
│   └── admin123/      # Admin panel
├── components/        # Shared UI components (BizCard, Navbar, Footer, ...)
├── hooks/             # TanStack Query hooks (useBusiness, useBusinesses, ...)
├── services/          # Data access layer (MongoDB, Firebase, likes, users)
├── store/             # Zustand stores (userStore, likesStore)
└── providers/         # React context providers
```

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file with:

```
MONGODB_URI=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

---

Developed by [David Marom](https://github.com/DavidMarom) · 2026 · [stealthCode.co](https://stealthCode.co)
