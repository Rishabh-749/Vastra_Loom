import express from "express";
import cookie from "cookie-parser";
import morgan from "morgan";
const app = express();
import authRouter from "./routes/auth.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import cors from "cors";
import passport from "passport";
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from "./config/config.js";

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookie())

app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.use(new GitHubStrategy({
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.get("/health", (req, res)=>{
    res.status(200).json({
        message: "Server is Running"
    })
})

app.use("/api/auth", authRouter);
app.use("/api/products/", productRouter);
app.use("/api/cart", cartRouter);

export default app;