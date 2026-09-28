import express from "express";
import authController from "../controllers/auth.controller.js";
import {validateRegisterUser, validateLoginUser} from "../validators/auth.validator.js";
import passport from "passport";
import { config } from "../config/config.js";

import { authenticateUser } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", validateRegisterUser, authController.registerController);
authRouter.post("/login", validateLoginUser, authController.loginController);
authRouter.post("/logout", authController.logoutController);
authRouter.get("/logout", authController.logoutController);
authRouter.get("/me", authenticateUser, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
});

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/login` : "/login"
    }),
    authController.googleCallback,
);

authRouter.get("/github", passport.authenticate("github", { scope: [ "user:email" ] }));
authRouter.get("/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/$/, "")}/login` : "/login"
    }),
    authController.githubCallback,
);

export default authRouter;