import express from "express";
import {config} from "../config/config.js";
import { authenticateSeller } from "../middlewares/auth.middleware.js";

const productRouter = express.Router();

productRouter.post("/", authenticateSeller);

export default productRouter;