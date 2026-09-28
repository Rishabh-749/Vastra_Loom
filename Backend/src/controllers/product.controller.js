import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import cartModel from "../models/cart.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency, discount, originalPrice, stock } = req.body;
        const seller = req.user;

        const images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            });
        }));

        const numPrice = Number(priceAmount);
        let numDiscount = Number(discount) || 0;
        let numOriginalPrice = originalPrice ? Number(originalPrice) : null;

        if (numDiscount > 0 && (!numOriginalPrice || numOriginalPrice <= numPrice)) {
            numOriginalPrice = Math.round(numPrice / (1 - numDiscount / 100));
        } else if (numOriginalPrice && numOriginalPrice > numPrice && numDiscount === 0) {
            numDiscount = Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100);
        }

        const product = await productModel.create({
            title,
            description,
            price: {
                amount: numPrice,
                currency: priceCurrency || "INR"
            },
            discount: Math.min(99, Math.max(0, numDiscount)),
            originalPrice: numOriginalPrice,
            stock: Math.max(0, Number(stock) || 0),
            images,
            seller: seller._id
        });

        res.status(201).json({
            message: "Product created successfully",
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to create product",
            success: false
        });
    }
};

export const getSellerProducts = async (req, res) => {
    const seller = req.user;
    const products = await productModel.find({seller: seller._id}).sort({ createdAt: -1 });

    res.status(200).json({
        message: "Products Fetched Successfully",
        success: true,
        products
    })
}

export const getAllProducts = async (req, res) => {
    const products = await productModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        message: "Catalog Pieces Fetched Successfully",
        success: true,
        products
    });
};

export async function getProductDetails(req, res) {
    try {
        const { id } = req.params;

        const product = await productModel.findById(id).populate("seller", "fullname email contact");

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Product details fetched successfully",
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to fetch product details",
            success: false
        });
    }
}

export async function addProductVariant(req, res) {
    try {
        const productId = req.params.productId;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        // Upload variant images if provided (up to 7 images, optional)
        const files = req.files;
        let images = [];
        if (files && files.length > 0) {
            const uploadedImages = await Promise.all(
                files.map(async (file) => {
                    const uploaded = await uploadFile({
                        buffer: file.buffer,
                        fileName: file.originalname
                    });
                    return {
                        url: uploaded.url || (typeof uploaded === 'string' ? uploaded : '')
                    };
                })
            );
            images = uploadedImages.filter((img) => Boolean(img.url));
        }

        // If no images provided for this variant, inherit from parent product
        if (images.length === 0 && product.images && product.images.length > 0) {
            images = product.images.map((img) => ({
                url: img.url || (typeof img === 'string' ? img : '')
            })).filter((img) => Boolean(img.url));
        }

        // Parse attributes (Map of key -> value)
        let attributes = {};
        if (req.body.attributes) {
            try {
                attributes = typeof req.body.attributes === "string" 
                    ? JSON.parse(req.body.attributes) 
                    : req.body.attributes;
            } catch {
                return res.status(400).json({
                    message: "Invalid attributes JSON format",
                    success: false
                });
            }
        }

        // At least one attribute is required
        if (!attributes || typeof attributes !== "object" || Object.keys(attributes).length === 0) {
            return res.status(400).json({
                message: "At least one variant attribute is required (e.g. Color, Size, Storage)",
                success: false
            });
        }

        // Price is optional, defaults to base product price
        const priceAmountInput = req.body.priceAmount;
        const variantPrice = {
            amount: (priceAmountInput !== undefined && priceAmountInput !== "" && !isNaN(Number(priceAmountInput)))
                ? Number(priceAmountInput)
                : product.price.amount,
            currency: req.body.priceCurrency || product.price.currency || "INR"
        };

        const variantDiscount = Number(req.body.discount) || 0;
        let variantOriginalPrice = req.body.originalPrice ? Number(req.body.originalPrice) : null;
        if (variantDiscount > 0 && (!variantOriginalPrice || variantOriginalPrice <= variantPrice.amount)) {
            variantOriginalPrice = Math.round(variantPrice.amount / (1 - variantDiscount / 100));
        }

        const stock = Math.max(0, Number(req.body.stock) || 0);

        product.variants.push({
            images,
            price: variantPrice,
            discount: variantDiscount,
            originalPrice: variantOriginalPrice,
            stock,
            attributes
        });

        await product.save();

        return res.status(201).json({
            message: "Product variant added successfully",
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to add product variant",
            success: false
        });
    }
}

export async function updateVariantStock(req, res) {
    try {
        const { productId, variantId } = req.params;
        const { stock } = req.body;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({
                message: "Variant not found",
                success: false
            });
        }

        variant.stock = Math.max(0, Number(stock) || 0);
        await product.save();

        return res.status(200).json({
            message: "Variant stock updated successfully",
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to update variant stock",
            success: false
        });
    }
}

export async function updateProductStock(req, res) {
    try {
        const { productId } = req.params;
        const { stock } = req.body;

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        product.stock = Math.max(0, Number(stock) || 0);
        await product.save();

        return res.status(200).json({
            message: "Product stock updated successfully",
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to update product stock",
            success: false
        });
    }
}

/**
 * @route DELETE /api/products/:productId
 * @description Permanently delete a product and clean up referencing cart items (Seller only)
 */
export async function deleteProduct(req, res) {
    try {
        const { productId } = req.params;
        const seller = req.user;

        const product = await productModel.findOneAndDelete({
            _id: productId,
            seller: seller._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized to delete",
                success: false
            });
        }

        // Clean up references in all user carts
        try {
            await cartModel.updateMany(
                { "items.product": productId },
                { $pull: { items: { product: productId } } }
            );
        } catch (cleanupErr) {
            console.warn("Cart cleanup warning upon product deletion:", cleanupErr);
        }

        return res.status(200).json({
            message: "Product retired and deleted successfully from Atelier catalog",
            success: true,
            productId
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to delete product",
            success: false
        });
    }
}

/**
 * @route PATCH /api/products/:productId/discount
 * @description Update product pricing and discount (Seller only)
 */
export async function updateProductDiscount(req, res) {
    try {
        const { productId } = req.params;
        const { discount, originalPrice, priceAmount } = req.body;
        const seller = req.user;

        const product = await productModel.findOne({
            _id: productId,
            seller: seller._id
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
                success: false
            });
        }

        if (priceAmount !== undefined && priceAmount !== "" && !isNaN(Number(priceAmount))) {
            product.price.amount = Math.max(1, Number(priceAmount));
        }

        const currentPrice = product.price.amount;
        let numDiscount = discount !== undefined && discount !== "" ? Number(discount) : 0;
        let numOriginalPrice = originalPrice ? Number(originalPrice) : null;

        if (numDiscount > 0 && numDiscount < 100) {
            product.discount = numDiscount;
            if (numOriginalPrice && numOriginalPrice > currentPrice) {
                product.originalPrice = numOriginalPrice;
            } else {
                product.originalPrice = Math.round(currentPrice / (1 - numDiscount / 100));
            }
        } else if (numOriginalPrice && numOriginalPrice > currentPrice) {
            product.originalPrice = numOriginalPrice;
            product.discount = Math.min(99, Math.round(((numOriginalPrice - currentPrice) / numOriginalPrice) * 100));
        } else {
            product.discount = 0;
            product.originalPrice = null;
        }

        await product.save();

        return res.status(200).json({
            message: "Product pricing and discount updated successfully",
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to update product discount",
            success: false
        });
    }
}  