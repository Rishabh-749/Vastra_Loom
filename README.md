<p align="center">
  <img
    src="https://ik.imagekit.io/Rishi749/VASTRA_LOOM/Github/bannner%20vastra.png"
    alt="VASTRA LOOM Banner"
    width="100%"
  />
</p>

<div align="center">

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

<table>
<tr>
<td width="50%" valign="top">

### 🛍️ Shopping & Products

- 👑 Luxury-focused Indian menswear storefront
- 🛍️ Dynamic product catalog and discovery
- 🔎 Debounced product search
- 🎨 Real-time bespoke product variants
- 📦 Variant-level inventory management
- 💰 Dynamic pricing and discount management

</td>
<td width="50%" valign="top">

### 🔐 Authentication & Security

- 👥 Buyer & Seller role-based access
- 🔐 JWT authentication with HttpOnly cookies
- 🌐 Google & GitHub OAuth
- 🛡️ Secure server-side payment verification

</td>
</tr>

<tr>
<td width="50%" valign="top">

### 💳 Commerce & Media

- 💳 Razorpay checkout integration
- 🛒 Persistent shopping cart
- 🖼️ ImageKit-powered media storage
- ⚡ Image optimization & CDN delivery

</td>
<td width="50%" valign="top">

### ⚡ Performance & Deployment

- 📱 Fully responsive interface
- ⚡ Unified monolithic architecture
- 🚀 Vercel / Render deployment support
- 🔄 Optimized product discovery

</td>
</tr>
</table>

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

VASTRA LOOM supports configurable product variants, allowing each product edition to maintain independent **attributes, pricing, discounts, inventory, and image galleries**.

Customers can switch between variants dynamically without reloading the product page, while sellers can create and manage variants through the **Atelier Studio**.

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

Razorpay is integrated into the checkout lifecycle with secure server-side payment verification.

<p align="center">
  <img 
    src="https://ik.imagekit.io/Rishi749/VASTRA_LOOM/Github/Payment%20Flow.png" 
    alt="Razorpay Payment Workflow"
    width="100%"
  />
</p>

> **Payment Flow:**  
> The customer selects a product or variant and proceeds through the shopping cart to Razorpay Checkout. After payment completion, the server verifies the Razorpay payment signature using HMAC SHA-256 before clearing the cart and confirming the paid order.

The backend verifies the Razorpay payment signature using **HMAC SHA-256** before completing the payment workflow.

---

# 🔐 Authentication

VASTRA LOOM supports secure local authentication and social OAuth login.

| Feature | Implementation |
|---|---|
| 👥 Roles | Buyer / Seller |
| 🔐 Authentication | JWT-based authentication |
| 🍪 Session Storage | HttpOnly cookies |
| 🔑 Password Security | bcrypt |
| 🌐 OAuth | Google & GitHub |
| 🛡️ Route Protection | Protected user & seller routes |
| 🔄 Session Hydration | `/api/auth/me` |

Authentication supports both traditional credentials and OAuth providers, with the authenticated session maintained through a signed JWT stored in an HttpOnly cookie.

# 🛠️ Technology Stack

| Layer                 | Technologies                                         |
| --------------------- | ---------------------------------------------------- |
| 🎨 **Frontend**       | React 19, Vite, Tailwind CSS, Redux Toolkit          |
| ⚙️ **Backend**        | Node.js, Express 5                                   |
| 🗄️ **Database**      | MongoDB Atlas, Mongoose                              |
| 🔐 **Authentication** | JWT, HttpOnly Cookies, bcrypt, Google & GitHub OAuth |
| 💳 **Payments**       | Razorpay                                             |
| 🖼️ **Media**         | ImageKit, Multer                                     |
| 🚀 **Deployment**     | Vercel, Render                                       |


# 🏗️ System Architecture
  
### Architecture Flow

<p align="center">
  <img 
    src="https://ik.imagekit.io/Rishi749/VASTRA_LOOM/Github/Architecture.png" 
    alt="Project Architecture Flow"
    width="100%"
  />
</p>

> **Architecture Overview:**  
> The application follows a modern full-stack architecture where the React SPA communicates with the Express 5 backend through REST APIs. The backend handles business logic, static assets, database operations, image delivery through ImageKit CDN, and payment processing through Razorpay. MongoDB Atlas serves as the primary database.

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

---

# 🌐 API Overview

VASTRA LOOM exposes REST APIs for authentication, products, cart management, and payments.

| Module | Endpoint | Purpose |
|---|---|---|
| 🔐 Auth | `/api/auth` | Registration, login, logout, session, OAuth |
| 🛍️ Products | `/api/products` | Product and variant management |
| 🛒 Cart | `/api/cart` | Cart operations |
| 💳 Payment | `/api/payment` | Razorpay order creation and verification |

# 🌐 API Overview

VASTRA LOOM exposes RESTful APIs for authentication, product management, cart operations, and Razorpay payments.

| Module           |  Method  | Endpoint                                      | Purpose                |
| ---------------- | :------: | --------------------------------------------- | ---------------------- |
| 🔐 **Auth**      |  `POST`  | `/api/auth/register`                          | Register a new user    |
|                  |  `POST`  | `/api/auth/login`                             | Authenticate user      |
|                  |  `POST`  | `/api/auth/logout`                            | End user session       |
|                  |   `GET`  | `/api/auth/me`                                | Get authenticated user |
|                  |   `GET`  | `/api/auth/google`                            | Google OAuth           |
|                  |   `GET`  | `/api/auth/github`                            | GitHub OAuth           |
| 🛍️ **Products** |   `GET`  | `/api/products`                               | Get products           |
|                  |   `GET`  | `/api/products/:id`                           | Get product details    |
|                  |   `GET`  | `/api/products/seller`                        | Get seller products    |
|                  |  `POST`  | `/api/products`                               | Create product         |
|                  |  `PATCH` | `/api/products/:id/discount`                  | Update discount        |
|                  |  `PATCH` | `/api/products/:id/stock`                     | Update stock           |
|                  | `DELETE` | `/api/products/:id`                           | Delete product         |
|                  |  `POST`  | `/api/products/:id/variants`                  | Create variant         |
|                  |  `PATCH` | `/api/products/:id/variants/:variantId/stock` | Update variant stock   |
| 🛒 **Cart**      |   `GET`  | `/api/cart`                                   | Get cart               |
|                  |  `POST`  | `/api/cart`                                   | Add to cart            |
|                  |  `PATCH` | `/api/cart/:itemId`                           | Update cart item       |
|                  | `DELETE` | `/api/cart/:itemId`                           | Remove cart item       |
| 💳 **Payment**   |  `POST`  | `/api/payment/create-order`                   | Create Razorpay order  |
|                  |  `POST`  | `/api/payment/verify`                         | Verify payment         |

---

### Core Models

| Model | Responsibility |
|---|---|
| 👤 **User** | Authentication, identity, role, and OAuth information |
| 👗 **Product** | Product information, pricing, stock, images, seller, and variants |
| 🛒 **Cart** | User shopping cart and selected product variants |

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

Contributions are always welcome. Whether you're improving the codebase, enhancing the user experience, or enriching cultural content, every contribution helps make Sanskruti AI a more meaningful platform.

If you'd like to contribute, feel free to open an issue, suggest an improvement, or submit a pull request.

> **Together, we're preserving India's civilizational heritage through technology.**

---


<p align="center">
  <img
    src="https://ik.imagekit.io/Rishi749/VASTRA_LOOM/Github/Footer.png"
    alt="VASTRA LOOM Footer"
    width="100%"
  />
</p>

<div align="center">

### Crafted for the modern Indian atelier.

**Built with ❤️ by Rishabh Jagtap**

</div>
