import express from "express";
import authController from "../controllers/auth.controller.js";
import validateRegisterUser from "../validators/auth.validator.js";
import validateLoginUser from "../validators/auth.validator.js";

const authRouter = express.Router();

authRouter.get("/register", validateRegisterUser, authController.registerController);
authRouter.get("/login", validateLoginUser, authController.loginController);

export default authRouter;