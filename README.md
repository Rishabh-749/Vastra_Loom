<p align="center">
  <img
    src="YOUR_BANNER_IMAGE"
    alt="VASTRA LOOM Banner"
    width="100%"
  />
</p>

<div align="center">

# VASTRA LOOM

### Haute Couture Monolithic Platform

**A luxury full-stack e-commerce platform for bespoke Indian menswear, artisanal fashion, and modern digital atelier experiences.**

<br>

<a href="#-about-vastra-loom">
  <img src="https://img.shields.io/badge/📖_About-161B22?style=for-the-badge"/>
</a>
<a href="#-features">
  <img src="https://img.shields.io/badge/✨_Features-161B22?style=for-the-badge"/>
</a>
<a href="#-technology-stack">
  <img src="https://img.shields.io/badge/🛠️_Tech_Stack-161B22?style=for-the-badge"/>
</a>
<a href="#-system-architecture">
  <img src="https://img.shields.io/badge/🏗️_Architecture-161B22?style=for-the-badge"/>
</a>

</div>

---

# 📖 About VASTRA LOOM

**VASTRA LOOM** is an enterprise-grade full-stack monolithic e-commerce platform designed for premium Indian ethnic menswear.

The platform brings together luxury storefront experiences, bespoke product variants, real-time inventory, seller-side product management, optimized media delivery, secure authentication, and Razorpay-powered checkout into one unified application.

The catalog is designed around premium collections including:

- 👑 Royal Velvet Blazers
- 🧵 Heritage Sherwanis
- 🕴️ Tuxedo Bandhgalas
- 🤵 Jodhpur Achkans
- ✨ Nawabi Kurta Sets

VASTRA LOOM combines the visual language of a luxury fashion house with the engineering required for a production-oriented e-commerce platform.

---

# ✨ Features

- 👑 Luxury-focused Indian menswear storefront
- 🛍️ Dynamic product catalog and discovery
- 🔎 Debounced product search
- 🎨 Real-time bespoke product variants
- 📦 Variant-level inventory management
- 💰 Dynamic pricing and discount management
- 👥 Buyer & Seller role-based access
- 🔐 JWT authentication with HttpOnly cookies
- 🌐 Google & GitHub OAuth
- 🖼️ ImageKit-powered media storage and optimization
- 💳 Razorpay checkout integration
- 🛒 Persistent shopping cart
- 📱 Responsive interface
- ⚡ Unified monolithic architecture
- 🚀 Vercel / Render deployment support

---

# 🛍️ Shopping Experience

VASTRA LOOM is designed as a premium digital atelier rather than a conventional storefront.

| Experience | Description |
|---|---|
| 🏠 **Curated Storefront** | Premium hero presentation, category discovery, featured products, and search. |
| 🔎 **Product Discovery** | Debounced search with category-based exploration. |
| 👗 **Product Details** | High-resolution galleries, pricing, specifications, discounts, and inventory. |
| 🎨 **Bespoke Variants** | Dynamically switch between product editions and attributes. |
| 🛒 **Shopping Cart** | Add products or specific variants and manage quantities. |
| 💳 **Checkout** | Razorpay-powered payment flow with server-side verification. |

---

# 🎨 Bespoke Variant Engine

The core shopping experience is built around a flexible **variant engine**.

A product can contain multiple bespoke editions, with each variant maintaining its own:

- Attributes
- Price
- Discount
- Original MRP
- Stock
- Image gallery

When a customer switches between variants, the interface dynamically updates the relevant product information without requiring a page reload.

```text
                    Master Product
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Variant A    Variant B    Variant C
             │            │            │
       ┌─────┼─────┐ ┌────┼────┐ ┌────┼────┐
       ▼     ▼     ▼ ▼    ▼    ▼ ▼    ▼    ▼
     Price Stock Images  Price Stock Images
```

> **One product can become multiple configurable editions while maintaining independent inventory, pricing, and media.**

---

# 👥 Buyer & Seller Platform

VASTRA LOOM provides separate capabilities for customers and sellers.

| Role | Capabilities |
|---|---|
| 🛍️ **Buyer** | Browse products, explore variants, manage cart, authenticate, and complete purchases. |
| 🧵 **Seller** | Create products, manage pricing, upload media, create variants, and control inventory. |

The seller experience is centered around a dedicated **Atelier Studio**, providing product and inventory management tools without requiring direct database access.

---

# 💳 Payment Workflow

Razorpay is integrated into the checkout lifecycle with server-side payment verification.

```text
Product / Variant
       │
       ▼
 Shopping Cart
       │
       ▼
Create Razorpay Order
       │
       ▼
Razorpay Checkout
       │
       ▼
Payment Completed
       │
       ▼
Server-side Verification
       │
       ▼
HMAC SHA-256 Validation
       │
       ▼
Cart Cleared
       │
       ▼
Paid Order
```

The backend verifies the Razorpay payment signature using **HMAC SHA-256** before completing the payment workflow.

---

# 🔐 Authentication

VASTRA LOOM supports local authentication as well as social login.

```text
                    Authentication
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       Local Authentication       OAuth Authentication
             │                  ┌────────┴────────┐
             │                  ▼                 ▼
             │               Google            GitHub
             │                  │                 │
             └──────────────────┴─────────────────┘
                                │
                                ▼
                           User Account
                                │
                                ▼
                         Signed JWT Cookie
                                │
                                ▼
                       Protected Application
```

Authentication includes:

- Buyer / Seller roles
- Password hashing using bcrypt
- JWT-based authentication
- HttpOnly cookie storage
- Protected user and seller routes
- Google OAuth
- GitHub OAuth
- `/api/auth/me` session hydration

---

# 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| 🎨 **Frontend** | React 19, Vite |
| 🎨 **Styling** | Tailwind CSS v4, Vanilla CSS |
| 🧭 **Routing** | React Router v7 |
| 🧠 **State Management** | Redux Toolkit |
| ✨ **Animations** | Motion |
| 🔣 **Icons** | Remix Icon |
| ⚙️ **Backend** | Node.js 22+, Express 5.2.1 |
| 🗄️ **Database** | MongoDB Atlas, Mongoose 9 |
| 🔐 **Authentication** | JWT, HttpOnly Cookies, bcryptjs |
| 🌐 **OAuth** | Passport, Google, GitHub |
| 🖼️ **Media** | ImageKit |
| 💳 **Payments** | Razorpay |
| 📤 **File Uploads** | Multer |
| 🚀 **Deployment** | Vercel, Render |

---

# 🎨 Design Identity

VASTRA LOOM follows a luxury fashion-oriented visual system designed around premium typography, restrained colors, and immersive product presentation.

### Visual Modes

- **Noir Sévère** — primary dark luxury experience
- **Ivory Atelier** — light editorial experience
- **Imperial Emerald** — refined accent system

### Design System

- Geist Variable typography
- Remix Icon
- Responsive layouts
- High-resolution product imagery
- 4K-oriented visual presentation
- Motion-driven interactions
- Luxury editorial styling

---

# 🏗️ System Architecture

VASTRA LOOM follows a unified **monolithic architecture** where the React application, Express backend, REST APIs, and production static assets operate together.

<p align="center">
  <img
    src="YOUR_ARCHITECTURE_IMAGE"
    alt="VASTRA LOOM System Architecture"
    width="100%"
  />
</p>

### Architecture Flow

```text
                    Client Browser
                          │
                          ▼
                       React SPA
                          │
                          ▼
                Vercel / Render Layer
                          │
                          ▼
                   Express 5 Server
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
      REST APIs       Static Assets    Business Logic
          │               │                │
          └───────────────┼────────────────┘
                          │
          ┌───────────────┼────────────────────┐
          ▼               ▼                    ▼
      MongoDB          ImageKit             Razorpay
       Atlas             CDN                 Payments
```

### Why Monolithic?

VASTRA LOOM intentionally keeps the frontend and backend within a unified application boundary.

This provides:

- Single-domain deployment
- Minimal CORS complexity
- Centralized authentication
- Shared application lifecycle
- Simple deployment architecture
- Express-powered SPA fallback
- Direct serving of the built React application

The project includes `sync_frontend.js`, which builds the Vite frontend and synchronizes the generated distribution into `Backend/public/`.

---

# 🖼️ Media Architecture

VASTRA LOOM uses **ImageKit** for cloud-based product media storage, optimization, transformations, and CDN delivery.

```text
Product Image
      │
      ▼
Multer Memory Storage
      │
      ▼
Express Backend
      │
      ▼
ImageKit
      │
      ▼
Optimized CDN Asset
      │
      ▼
React Product Interface
```

Product media is uploaded through the backend using memory-based file handling and synchronized with the `VASTRA_LOOM` ImageKit folder.

ImageKit transformations dynamically optimize product assets for frontend delivery using responsive width, quality, and automatic format selection.
# 🧵 Seller Atelier Studio

The **Atelier Studio** provides sellers with a dedicated workspace for managing their complete product portfolio.

### Seller Capabilities

- 📊 Portfolio overview
- ➕ Create new products
- 🖼️ Upload multiple product images
- 💰 Manage pricing and discounts
- 🎨 Create bespoke product variants
- 📦 Manage variant-level inventory
- 🗑️ Delete or retire products
- ☁️ Synchronize product media with ImageKit

Each product can be configured with its own pricing, MRP, discount, stock, description, and media. Variants can additionally maintain independent attributes, images, pricing, and inventory.

---

# 📂 Project Structure

```text
VASTRA-LOOM/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── ...
│   │
│   └── public/
│
├── sync_frontend.js
├── README.md
└── LICENSE
```

---

# 🚀 Getting Started

Follow the steps below to run VASTRA LOOM locally.

## 📋 Prerequisites

Make sure the following are installed:

- Node.js 22+
- npm
- Git
- MongoDB Atlas account
- ImageKit account
- Razorpay account
- Google OAuth credentials
- GitHub OAuth credentials

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/VASTRA-LOOM.git

cd VASTRA-LOOM
```

Install the backend dependencies:

```bash
cd Backend
npm install
```

---

# 🔐 Backend Environment Variables

Create a `.env` file inside the `Backend` directory.

```env
PORT=8080
NODE_ENV=production

MONGO_URL=mongodb+srv://<username>:<password>@cluster0.dwfqrqu.mongodb.net/Snitch

JWT_SECRET=your_jwt_secret_key

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

CLIENT_URL=https://your-app.vercel.app
```

> Never commit your `.env` file or expose private API credentials in the repository.

---

# 💻 Run the Backend

From the `Backend` directory:

```bash
npm run dev
```

The monolithic application runs on:

```text
http://localhost:8080
```

---

# 🎨 Frontend Development

For independent frontend development, open another terminal:

```bash
cd Frontend

npm install

npm run dev
```

Vite will start the frontend development server, typically on:

```text
http://localhost:5173
```

or the next available port.

---

# 🔄 Frontend Synchronization

VASTRA LOOM supports a unified production-style workflow where the React frontend is built and synchronized into the Express backend.

From the project root:

```bash
node sync_frontend.js
```

The synchronization process:

```text
Frontend
   │
   ▼
Vite Build
   │
   ▼
Frontend/dist
   │
   ▼
sync_frontend.js
   │
   ▼
Backend/public
   │
   ▼
Express Server
```

This allows Express to serve the compiled React application together with the backend APIs.

---

# 🌐 API Overview

VASTRA LOOM exposes REST APIs for authentication, products, cart management, and payments.

| Module | Endpoint | Purpose |
|---|---|---|
| 🔐 Auth | `/api/auth` | Registration, login, logout, session, OAuth |
| 🛍️ Products | `/api/products` | Product and variant management |
| 🛒 Cart | `/api/cart` | Cart operations |
| 💳 Payment | `/api/payment` | Razorpay order creation and verification |

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/auth/google
GET    /api/auth/github
```

### Products

```text
GET    /api/products
GET    /api/products/:id
GET    /api/products/seller
POST   /api/products
PATCH  /api/products/:id/discount
PATCH  /api/products/:id/stock
DELETE /api/products/:id
POST   /api/products/:id/variants
PATCH  /api/products/:id/variants/:variantId/stock
```

### Cart

```text
GET    /api/cart
POST   /api/cart
PATCH  /api/cart/:itemId
DELETE /api/cart/:itemId
```

### Payments

```text
POST   /api/payment/create-order
POST   /api/payment/verify
```

---

# 🗄️ Data Model

VASTRA LOOM uses MongoDB with Mongoose for its core application data.

```text
                    MongoDB Atlas
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
        User          Product          Cart
          │              │              │
          │              ├── Variants    ├── Items
          │              ├── Images      │
          │              ├── Pricing     └── Product
          │              ├── Stock
          │              └── Seller
          │
          ├── Buyer / Seller
          ├── Email
          ├── Password
          ├── Google ID
          └── GitHub ID
```

### Core Models

| Model | Responsibility |
|---|---|
| 👤 **User** | Authentication, identity, role, and OAuth information |
| 👗 **Product** | Product information, pricing, stock, images, seller, and variants |
| 🛒 **Cart** | User shopping cart and selected product variants |

---

# 🖼️ ImageKit Integration

Product media is handled through ImageKit.

The backend uses:

- `@imagekit/nodejs`
- Multer `memoryStorage`
- Buffer-based uploads
- Dedicated `VASTRA_LOOM` ImageKit folder
- Dynamic image transformations
- Automatic format optimization

Example optimized asset:

```text
https://ik.imagekit.io/Rishi749/VASTRA_LOOM/file.jpg?tr=w-1200,q-85,f-auto
```

This allows the application to request optimized product imagery without maintaining multiple manually generated image versions.

---

# ☁️ Deployment

VASTRA LOOM supports both **Vercel** and **Render** deployment workflows.

## Vercel

The backend includes a serverless entry point:

```text
Backend/api/index.js
```

with the required Vercel configuration.

Recommended configuration:

```text
Root Directory:
Backend
```

Vercel can then serve the Express application together with the synchronized frontend.

---

## Render

VASTRA LOOM can also run as a Node.js web service on Render.

```text
Root Directory:
Backend

Build Command:
npm install

Start Command:
node server.js
```

The required production environment variables should be configured through the deployment platform rather than committed to the repository.

---

# 🔒 Production Considerations

Before deploying VASTRA LOOM publicly:

- Configure production MongoDB credentials
- Use a strong JWT secret
- Configure production OAuth callback URLs
- Configure Razorpay production credentials
- Configure ImageKit credentials securely
- Set the correct `CLIENT_URL`
- Keep `.env` outside version control
- Enable HTTPS in production
- Verify Razorpay signatures server-side
- Restrict OAuth redirect URLs to trusted domains

---

# 📸 Platform Preview

A glimpse into the VASTRA LOOM digital atelier experience.

<table align="center">
<tr>

<td align="center" width="50%">

### 🏠 Luxury Storefront

<img
  src="YOUR_STOREFRONT_IMAGE"
  width="100%"
  alt="VASTRA LOOM Storefront"
/>

<p>
Explore curated Indian menswear through a premium digital storefront.
</p>

</td>

<td align="center" width="50%">

### 👗 Product Experience

<img
  src="YOUR_PRODUCT_IMAGE"
  width="100%"
  alt="VASTRA LOOM Product Experience"
/>

<p>
Explore high-resolution imagery, pricing, inventory, and product variants.
</p>

</td>

</tr>

<tr>

<td align="center" width="50%">

### 🎨 Variant Engine

<img
  src="YOUR_VARIANT_IMAGE"
  width="100%"
  alt="VASTRA LOOM Variant Engine"
/>

<p>
Switch between bespoke product editions with real-time updates.
</p>

</td>

<td align="center" width="50%">

### 🧵 Atelier Studio

<img
  src="YOUR_SELLER_IMAGE"
  width="100%"
  alt="VASTRA LOOM Seller Atelier"
/>

<p>
Manage products, pricing, media, variants, and inventory.
</p>

</td>

</tr>
</table>

---

# 🤝 Contributing

Contributions are welcome.

If you would like to improve VASTRA LOOM:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the implementation
5. Commit your changes
6. Open a Pull Request

```bash
git checkout -b feature/your-feature

git add .

git commit -m "feat: add your feature"

git push origin feature/your-feature
```

---

# 📜 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.

---

<p align="center">
  <img
    src="YOUR_FOOTER_IMAGE"
    alt="VASTRA LOOM Footer"
    width="100%"
  />
</p>

<div align="center">

### Crafted for the modern Indian atelier.

**Built with ❤️ by Rishabh Jagtap**

</div>
