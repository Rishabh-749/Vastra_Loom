import express from "express";
import {config} from "../config/config.js";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import multer from "multer";
import {createProduct} from "../controllers/product.controller.js";
import {createProductValidator} from "../validators/product.validator.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

const productRouter = express.Router();

productRouter.post("/", authenticateSeller, upload.array('images', 7), createProductValidator, createProduct);

export default productRouter;