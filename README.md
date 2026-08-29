# QuickBite — Online Food Ordering System

## 🚀 Overview & Key Features

QuickBite is an enterprise-grade, high-performance food ordering platform built using **Next.js 14 (App Router)**, **PostgreSQL (Prisma ORM)**, and **Tailwind CSS**, fully optimized for ultra-fast response times and one-click **Vercel** deployment.

### 🌟 4 Dedicated Stakeholder Experiences:
1. **Customer Side**:
   - Multi-cuisine browsing, real-time search, veg/spicy filters.
   - Persistent basket management with real-time tax & total calculation.
   - Secure simulated payment gateway (bKash, Nagad, Credit/Debit Cards, Cash on Delivery).
   - Real-time step-by-step order tracking timeline with live progression simulator.
   - Customer ratings and feedback submission.
2. **Restaurant Manager Portal (`/restaurant`)**:
   - Live incoming order queue with Accept / Reject controls.
   - Kitchen dispatch workflow (Start Cooking $\to$ Ready for Pickup).
   - Menu Management (Add dishes, edit pricing, toggle stock availability).
   - Revenue and daily ticket analytics.
3. **Delivery Rider Portal (`/delivery`)**:
   - Available & assigned orders queue.
   - Step-by-step transit management (Pick Up $\to$ In Transit $\to$ Confirm Handover).
   - One-touch customer calling and destination details.
4. **Administrator Console (`/admin`)**:
   - System overview metrics (Total GMV, completed orders, active kitchens).
   - User directory with role management.
   - Partner kitchen verification and approval toggles.
   - Transaction audit logs and customer review moderation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Serverless Engine**: Next.js 14 App Router, React 18, TypeScript
- **Styling & UI**: Tailwind CSS, Lucide React, Modern Glassmorphism
- **Database & ORM**: PostgreSQL via Prisma ORM (prepared for Vercel Postgres / Neon / Supabase)
- **Deployment**: Vercel Serverless Ready with Edge optimization

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub / GitLab.
2. Import project on [Vercel](https://vercel.com).
3. (Optional) Connect a **Vercel Postgres** or **Neon Database** and add `DATABASE_URL` in Environment Variables.
4. Deploy! Next.js will automatically build and deploy the edge-optimized application.
