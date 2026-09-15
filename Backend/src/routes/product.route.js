import express from "express";
import { authenticateSeller } from "../middlewares/auth.middleware.js";
import multer from "multer";
import {
    createProduct,
    getSellerProducts,
    getAllProducts,
    getProductDetails,
    addProductVariant,
    updateVariantStock,
    updateProductStock
} from "../controllers/product.controller.js";
import { createProductValidator } from "../validators/product.validator.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB per file
    }
});

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.post("/", authenticateSeller, upload.array('images', 7), createProductValidator, createProduct);
productRouter.get("/seller", authenticateSeller, getSellerProducts);

/**
 * @route GET /api/products/detail/:id
 * @description Get product details by ID (Public)
 */
productRouter.get("/detail/:id", getProductDetails);

/**
 * @route POST /api/products/:productId/variants
 * @description Add a new variant to a product (Seller only, up to 7 images)
 */
productRouter.post("/:productId/variants", authenticateSeller, upload.array('images', 7), addProductVariant);

/**
 * @route PATCH /api/products/:productId/variants/:variantId/stock
 * @description Update variant stock (Seller only)
 */
productRouter.patch("/:productId/variants/:variantId/stock", authenticateSeller, updateVariantStock);

/**
 * @route PATCH /api/products/:productId/stock
 * @description Update base product stock (Seller only)
 */
productRouter.patch("/:productId/stock", authenticateSeller, updateProductStock);

export default productRouter;