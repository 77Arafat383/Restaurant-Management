# QuickBite — Online Food Ordering System

QuickBite is an enterprise-grade, high-performance food ordering platform built using **Next.js 14 (App Router)**, **PostgreSQL (Prisma ORM)**, and **Tailwind CSS**. It is fully optimized for ultra-fast response times, responsive layout aesthetics, and local/production environments.

---

## 🌟 Dedicated Stakeholder Experiences

QuickBite provides four distinct portals, each customized for a specific role in the food delivery ecosystem:

### 1. 🍴 Customer Portal
- **Cinematic Carousel**: Interactive horizontal hero slider with auto-rotating slides, custom coupon banners, bouncing hot item flame badges, and slide zoom transitions.
- **Unified Auto-complete Search**:
  - Searches both **Restaurants** (showing thumbnail, cuisines, rating stars, and delivery times) and **Dishes** (showing name, image, price, and kitchen owner name) simultaneously.
  - Automatically handles clicking outside and hitting `Escape` to close the suggestion panel.
- **Deep Linking & Visual Highlights**: Clicking a dish suggestion routes directly to the restaurant page, scrolls the specific item card into view, and applies a high-contrast visual glow (pulsing orange border and scale zoom) for 4 seconds.
- **Category Filter Pills**: Toggles cuisine types (e.g., Biryani, Pizza, Burger) to filter featured partner kitchens.
- **Pure Veg Filter**: Hides non-vegetarian items across searching, recommendations, and menus.
- **Order Search & Cancellation**: Customers can filter their order histories by restaurant/dish name and delete/cancel pending orders directly (via the `DELETE` API route) as long as they are in the `PENDING` state.
- **Simulated Payment Gateway**: Options for bKash, Nagad, Card, and Cash on Delivery.

### 2. 🏪 Restaurant Manager Portal (`/restaurant`)
- **Menu Creation with Image Uploader**: Replaced image URL text boxes with a file uploader that generates Base64 preview thumbnails. The base64 payloads are saved directly to the database.
- **Comma-Separated Multi-Categories**: Managers can set multiple categories on menu items (e.g., `Biryani Specials, Rice, Side Dishes`) by separating tags with commas.
- **Incoming Orders Board**: Live queue showing order cards with Accept/Reject controls.
- **Rider Request Approvals**: Displays pending rider delivery assignment requests under active order cards. Managers can click **Accept Rider** or **Deny Rider**.
- **Handover Button (Dynamically Styled)**: A manual **Ready & Handover to Rider** button is displayed inside order cards. It dynamically turns **green** (`bg-emerald-600`) once a rider assignment request is approved.

### 3. 🛵 Delivery Rider Portal (`/delivery`)
- **Board Splitting**: Divided into two tabs:
  - **My Runs**: Displays active deliveries currently in transit.
  - **Available Jobs**: Shows unassigned orders ready for delivery.
- **Request Assignment**: Riders browse the unassigned posting list and click **Request Assignment** to queue their request on the kitchen manager's board.
- **Transit Stepper**: Pick Up $\to$ In Transit $\to$ Confirm Handover buttons to complete deliveries.

### 4. 🛡️ Admin Console (`/admin`)
- **System Overview KPIs**: Live counters for Gross Merchandise Value (GMV), Total System Orders, Active Kitchens, and Registered Accounts.
- **Platform Search Bars**: Search inputs integrated across three sections:
  - **Recent Transactions**: Filter order rows by customer, restaurant, or order number.
  - **User Directory**: Search user accounts by name, email, or role.
  - **Restaurant Approvals**: Search partner kitchens by name, cuisine, or address.
- **System Entity Deletion**: Admins can permanently delete **User Accounts**, **Restaurants** (automatically cleaning up associated menu dishes to prevent orphan data), and **Customer Reviews**.
- **Merchant Verification**: Approve pending partner registrations or suspend accounts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: Next.js 14 (App Router) & React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide React Icons
- **Database ORM**: Prisma ORM (configured for PostgreSQL / Neon / local database JSON file-store)
- **Local Persistence Store**: File-based local JSON data-store wrapper (`prisma/quickbite_db.json`) for seamless zero-config local runs.

---

## ⚡ Quick Start: Step-by-Step Local Setup

Follow these steps to clone the project, install dependencies, and start the application on your local machine:

### 1. Clone the GitHub Repository
Open your terminal/command prompt and run:
```bash
git clone https://github.com/77Arafat383/Restaurant-Management.git
cd Restaurant-Management
```

### 2. Install Project Dependencies
Use `npm` to install all package modules:
```bash
npm install
```

### 3. Generate Prisma Client
Generate the local Prisma Client bindings:
```bash
npx prisma generate
```

### 4. Configure Environment Variables (Optional)
The project comes pre-configured with a local JSON store fallback (`prisma/quickbite_db.json`), meaning you **do not need** to install or run a live PostgreSQL database server for local development.

If you wish to connect to a live PostgreSQL server, create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/quickbite_db"
```

### 5. Launch the Local Development Server
Start the development server:
```bash
npm run dev
```

### 6. Access the Application
Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Pre-configured Testing Credentials

Use the following credentials to sign in and test the different portal experiences:

| Role | Email Address | Password | Portal Route |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@quickbite.com` | `password123` | `/` |
| **Kitchen Manager** | `manager@quickbite.com` | `password123` | `/restaurant` |
| **Delivery Rider** | `delivery@quickbite.com` | `password123` | `/delivery` |
| **System Administrator** | `admin@quickbite.com` | `password123` | `/admin` |

*Note: You can trigger register modals inside the top Navbar block to create new users of any role type.*

---

## 🌐 Build & Deployment

To compile the production build locally:
```bash
npm run build
```

### Vercel Deployment
1. Push your cloned repository branch to your own GitHub/GitLab account.
2. Log in to [Vercel](https://vercel.com) and import the project.
3. If connecting to a live database (e.g., Neon or Supabase), add your `DATABASE_URL` as an environment variable.
4. Deploy. Vercel will automatically compile the serverless routes.
