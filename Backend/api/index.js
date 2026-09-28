import app from "../src/app.js";
import connectTODB from "../src/config/db.js";

export default async function handler(req, res) {
    // If Vercel rewrote the URL internally, restore the matched API path
    const matchedPath = req.headers["x-matched-path"] || req.headers["x-forwarded-url"];
    if (matchedPath && matchedPath.startsWith("/api") && req.url !== matchedPath) {
        req.url = matchedPath;
    }

    try {
        await connectTODB();
    } catch (dbErr) {
        console.error("MongoDB Atlas connection error on Vercel:", dbErr.message);
        return res.status(500).json({
            success: false,
            message: "Failed to connect to MongoDB Atlas. Please ensure 0.0.0.0/0 is added in MongoDB Atlas Network Access.",
            error: dbErr.message
        });
    }

    return app(req, res);
}
