# Monolithic Deployment Guide (Render & Vercel)

This application is now configured as a **single unified monolith**:
The Node.js/Express server in `Backend` serves both:
1. **Frontend Static Assets & React SPA** from `Backend/public/`
2. **Backend REST APIs** from `/api/...`

---

## Option 1: Deploy on Render (Recommended)

Render is ideal because it maintains persistent Node.js processes, MongoDB connection pooling, and supports full ImageKit multipart file uploads.

### Steps:
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: configure monolithic architecture for Render and Vercel"
   git push origin main
   ```
2. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
3. Select your repository `Rishabh-749/Snitch-Project`.
4. Fill in the settings:
   - **Name**: `vastra-loom` (or any name)
   - **Region**: Choose the closest region (e.g., Singapore / Frankfurt / Oregon)
   - **Root Directory**: `Backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. In **Environment Variables**, add the keys from your `Backend/.env`:
   - `MONGO_URL`: `mongodb+srv://...`
   - `JWT_SECRET`: `...`
   - `IMAGEKIT_PRIVATE_KEY`: `...`
   - `GOOGLE_CLIENT_ID`: `...`
   - `GOOGLE_CLIENT_SECRET`: `...`
   - `GITHUB_CLIENT_ID`: `...`
   - `GITHUB_CLIENT_SECRET`: `...`
   - `RAZORPAY_KEY`: `...`
   - `RAZORPAY_SECRET`: `...`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
7. Once deployed, your site and all APIs will be live at `https://your-service.onrender.com`.

---

## Option 2: Deploy on Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com/) and click **Add New...** → **Project**.
3. Import `Snitch-Project`.
4. In **Root Directory**, click edit and select **`Backend`**.
5. Framework Preset: Leave as **Other**.
6. In **Environment Variables**, add all keys from `Backend/.env`.
7. Click **Deploy**.
8. `Backend/vercel.json` and `Backend/api/index.js` handle routing all `/api/*` requests to Express and all other requests to `public/index.html`.

---

## Local Monolithic Testing
To test the complete monolithic app locally (serving the frontend from Express):
```bash
cd Backend
npm start
```
Open [http://localhost:8080](http://localhost:8080) in your browser!
