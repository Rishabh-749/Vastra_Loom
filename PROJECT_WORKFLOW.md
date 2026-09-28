# VASTRA LOOM — Comprehensive Project & Workflow Guide

This document provides an in-depth walkthrough of all user journeys, technical flows, architecture, and operational workflows for the **VASTRA LOOM** Haute Couture Monolithic Platform.

---

## 1. High-Level Architecture Workflow

The system operates as a single unified service where the client application and backend micro-services (APIs, media processing, payment gateways) communicate over local and cloud pipelines:

```
[Customer Browser / Mobile]
         │
         ▼
[Vercel Serverless / Render Web Service]
   ├──> Static Assets Handler (/assets/*, favicon.svg, Auth.png)
   │        └──> Serves pre-built Vite assets from Backend/public/
   │
   ├──> Express REST Router (/api/*)
   │        ├── /api/auth    ──> Password hashing (bcrypt) & JWT Cookies
   │        ├── /api/products──> Product catalogue, search & variants
   │        ├── /api/cart    ──> User cart subdocuments & recalculations
   │        └── /api/payment ──> Razorpay order generation & HMAC SHA-256
   │
   └──> SPA Fallback Middleware (*)
            └──> Serves Backend/public/index.html for any React Route
```

---

## 2. Complete User Journeys & Workflows

### 2.1. Customer (Buyer) Journey

```
[Land on Homepage]
       │
       ▼
[Explore Catalog] ─── Filter by category (Bandhgala, Sherwani, Velvet) or search
       │
       ▼
[View Product Details] ─── Inspect multi-angle gallery, switch variants (Color, Size)
       │
       ▼
[Add to Cart] ─── Floating Atelier Toast appears with thumbnail and specs
       │
       ▼
[Review Shopping Bag] ─── Adjust quantity, view price breakdowns and complimentary shipping
       │
       ▼
[Checkout with Razorpay] ─── Pay via UPI, Cards, NetBanking
       │
       ▼
[Order Reserved & Confirmed]
```

#### Detailed Steps:
1. **Catalog Exploration**:
   - The user opens `/`. The page displays an interactive royal banner, curated pieces, search bar, and category filters.
   - Products show real-time stock pills: `In Stock`, `Low Stock`, or `Bespoke Creation`.
2. **Product Inspection (`/product/:id`)**:
   - The user clicks on any card.
   - The left rail displays up to 4 high-resolution thumbnails.
   - Hovering over a thumbnail provides a smooth zoom (`scale-110 duration-500`) without layout shifting or scrollbar popups.
   - The user can select from available variants (e.g. *Royal Navy*, *Emerald Green*, *Wine Crimson*). Switching a variant updates:
     - The hero image to the variant's custom photo.
     - The price (with +/- difference indicator).
     - The discount percentage and original MRP.
     - The stock availability counter.
     - The specifications grid (*Color, Size, Silhouette, Material*).
3. **Adding to Shopping Bag**:
   - When the user selects a quantity and clicks **Add to Cart**:
     - If unauthenticated, a modal opens prompting them to log in or create an account.
     - If authenticated, an item is added to their cart subdocument in MongoDB.
     - A floating atelier toast notification slides in from the bottom right with the garment preview, title, selected variant specs, and a *"View Bag"* button.
4. **Checkout & Payment**:
   - In `/cart`, the user reviews reserved items and clicks **Proceed to Insured Checkout**.
   - The backend creates a Razorpay order in INR paise via `/api/payment/create-order`.
   - The native Razorpay checkout modal opens.
   - Upon successful payment, the client sends `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to `/api/payment/verify`.
   - The server verifies the cryptographic signature using HMAC SHA-256 and clears the user's cart.

---

### 2.2. Seller / Artisan Journey

```
[Register as Seller] ─── Check "Register as Seller" checkbox
       │
       ▼
[Access Atelier Dashboard (/seller/dashboard)]
       │
       ├──> [Craft New Product] ── Upload 3-4 images to ImageKit + set price/stock
       ├──> [Manage Pricing & Discount] ── Adjust discount slider and MRP
       ├──> [Craft Variant Editions] ── Attach Colors, Sizes, Fabrics & upload variant media
       ├──> [Stock Units Drawer] ── Monitor and adjust quantities per variant
       └──> [Retire / Delete Piece] ── Remove piece with confirmation safeguard
```

#### Detailed Steps:
1. **Atelier Access**:
   - Registering with role `seller` or logging in redirects directly to `/seller/dashboard`.
   - Navbar displays the golden **Atelier Studio** badge.
2. **Crafting a Product**:
   - The seller enters the piece title, description, selling price, and stock.
   - Uploads up to 7 photos via the file picker.
   - The photos are streamed directly to ImageKit IO under folder `VASTRA_LOOM/`.
3. **Managing Discounts (`ManageDiscountModal`)**:
   - The seller clicks **Discount** on any product.
   - Can set a discount percentage (e.g., 20%) or specify an original MRP.
   - Automatically computes new selling prices.
4. **Crafting Variant Editions (`CraftVariantModal`)**:
   - The seller clicks **Craft Edition**.
   - Adds custom attribute pairs (e.g., `Color`: `Royal Ivory`, `Size`: `42`, `Fabric`: `Katan Silk`).
   - Sets independent variant pricing and uploads dedicated variant imagery.
5. **Inventory Controls**:
   - Clicking **Stock Units** opens a slide-out drawer showing inventory per variant and the base product.
   - The seller can increment or decrement stock in real time.

---

## 3. Media Ingestion & ImageKit Workflow

```
[Local File (User Browser)]
         │
         ▼ (multipart/form-data)
[Express Server (Multer Memory Storage)]
         │
         ▼ (Buffer Stream)
[@imagekit/nodejs SDK uploadFile()]
         │
         ▼
[ImageKit Cloud (Folder: VASTRA_LOOM)]
         │
         ▼
[Returns CDN URL: https://ik.imagekit.io/Rishi749/VASTRA_LOOM/filename.jpg]
         │
         ▼
[Saved to MongoDB Product Document: images: [{ url }]]
```

When rendering on the frontend, `getImageUrl(img, width)` appends transformation parameters (e.g., `?tr=w-1200,q-85,f-auto`), ensuring optimal resolution, compression, and WebP delivery.

---

## 4. Vercel Monolithic Deployment Workflow

### Prerequisites:
- Vercel account linked to GitHub.
- Environment variables configured in Vercel project settings.

### Execution:
1. **GitHub Push**:
   ```bash
   git add .
   git commit -m "feat: update monolithic platform"
   git push origin main
   ```
2. **Vercel Project Setup**:
   - Import repository `Snitch-Project`.
   - **Root Directory**: Select **`Backend`**.
   - **Framework Preset**: **`Express`** or **`Other`**.
   - **Build Command**: Toggle **OFF**.
   - **Output Directory**: Toggle **OFF** (`N/A`).
   - Add all environment variables from `Backend/.env`.
3. **How Vercel Executes the Monolith**:
   - **Static files**: Vercel automatically maps `Backend/public/` to the domain root (`/assets/*`, `/favicon.svg`, `/index.html`).
   - **APIs**: Any `/api/*` request matches `Backend/vercel.json` and invokes `Backend/api/index.js` (which connects to MongoDB and routes via Express).
   - **Client Routes**: Any route like `/login` or `/product/:id` rewrites to `/index.html`, where React Router renders the appropriate page.

---

## 5. Development Maintenance Workflow

### Whenever Frontend Code is Modified:
Run the sync script in the project root:
```bash
node sync_frontend.js
```
This single command:
1. Executes `npm run build` inside `Frontend/`.
2. Recursively syncs the output from `Frontend/dist/` into `Backend/public/`.
3. Ensures your production monolithic bundle in `Backend` is 100% up to date.

---

## 6. Seeded Royal Products & Testing Accounts

### Active Seller Accounts in Database:
1. **Seller 1: Rishabh Jagtap**
   - **Email**: `rishabhjagtap581@gmail.com`
   - **Role**: `seller`
   - **Products**: Imperial Royal Velvet Blazer, Maharaja Zardozi Sherwani, Onyx Bandhgala, Ivory Sherwani.

2. **Seller 2: Seller Test**
   - **Email**: `seller@test.com`
   - **Password**: `password123`
   - **Role**: `seller`
   - **Products**: Regal Obsidian Tuxedo Bandhgala, Jodhpur Royal Silk Achkan, Nawabi Kurta & Bundi Set.
