import express from "express";
import authController from "../controllers/auth.controller.js";
import {validateRegisterUser, validateLoginUser} from "../validators/auth.validator.js";
import passport from "passport";
import { config } from "../config/config.js";

const authRouter = express.Router();

authRouter.post("/register", validateRegisterUser, authController.registerController);
authRouter.post("/login", validateLoginUser, authController.loginController);

authRouter.get("/google",passport.authenticate("google", {scope: ["profile", "email"]}));
authRouter.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: config.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login"
    }),
    authController.googleCallback,
)

authRouter.get("/github", passport.authenticate("github", { scope: [ "user:email" ] }));
authRouter.get("/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: config.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login"
    }),
    authController.githubCallback,
)

export default authRouter;