import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProduct = async (req, res) => {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

     const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

     const product = await productModel.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

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

        const stock = Math.max(0, Number(req.body.stock) || 0);

        product.variants.push({
            images,
            price: variantPrice,
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