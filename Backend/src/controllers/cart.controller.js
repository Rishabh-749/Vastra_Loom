import mongoose from "mongoose";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

/**
 * Helper to safely extract variant attributes map or plain object
 */
const getVariantAttributes = (variant) => {
  if (!variant || !variant.attributes) return {};
  if (variant.attributes instanceof Map) {
    return Object.fromEntries(variant.attributes);
  }
  if (typeof variant.attributes === "object") {
    return variant.attributes;
  }
  try {
    return JSON.parse(variant.attributes);
  } catch {
    return {};
  }
};

/**
 * Production-grade MongoDB Aggregation Pipeline for VASTRA LOOM Cart.
 * 
 * Features:
 * 1. Seamlessly handles base products (variant: null) AND custom variants.
 * 2. Dynamically compares live seller price vs original cart price.
 * 3. Emits `priceStatus`: 'increased' | 'decreased' | 'unchanged' and `priceDiff`.
 * 4. Calculates `lineTotal` using the seller's current updated price.
 * 5. Computes overall `totalPrice` and `totalItems` directly in the database.
 * 6. Attaches liveStock, outOfStock flags, resolved images, and formatted attributes.
 */
export const getAggregatedCart = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Ensure user cart document exists in database
  let existingCart = await cartModel.findOne({ user: userObjectId });
  if (!existingCart) {
    existingCart = await cartModel.create({ user: userObjectId, items: [] });
  }

  if (!existingCart.items || existingCart.items.length === 0) {
    return {
      _id: existingCart._id,
      user: existingCart.user,
      items: [],
      totalPrice: 0,
      totalItems: 0,
      currency: "INR",
    };
  }

  const pipeline = [
    { $match: { user: userObjectId } },
    { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
    // Filter out items whose product no longer exists in catalog
    { $match: { productDoc: { $exists: true, $ne: null } } },
    {
      $addFields: {
        matchedVariant: {
          $cond: {
            if: {
              $and: [
                { $ne: ["$items.variant", null] },
                { $isArray: "$productDoc.variants" },
              ],
            },
            then: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$productDoc.variants",
                    as: "v",
                    cond: { $eq: ["$$v._id", "$items.variant"] },
                  },
                },
                0,
              ],
            },
            else: null,
          },
        },
      },
    },
    {
      $addFields: {
        originalPrice: { $ifNull: ["$items.price.amount", 0] },
        liveSellerPrice: {
          $ifNull: [
            "$matchedVariant.price.amount",
            { $ifNull: ["$productDoc.price.amount", "$items.price.amount"] },
          ],
        },
        currency: {
          $ifNull: [
            "$matchedVariant.price.currency",
            {
              $ifNull: [
                "$productDoc.price.currency",
                { $ifNull: ["$items.price.currency", "INR"] },
              ],
            },
          ],
        },
        liveStock: {
          $cond: {
            if: { $ne: ["$matchedVariant", null] },
            then: { $ifNull: ["$matchedVariant.stock", 0] },
            else: { $ifNull: ["$productDoc.stock", 0] },
          },
        },
      },
    },
    {
      $addFields: {
        priceDiff: { $subtract: ["$liveSellerPrice", "$originalPrice"] },
        priceStatus: {
          $switch: {
            branches: [
              {
                case: { $gt: ["$liveSellerPrice", "$originalPrice"] },
                then: "increased",
              },
              {
                case: { $lt: ["$liveSellerPrice", "$originalPrice"] },
                then: "decreased",
              },
            ],
            default: "unchanged",
          },
        },
        lineTotal: {
          $multiply: [
            { $ifNull: ["$items.quantity", 1] },
            "$liveSellerPrice",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        totalPrice: { $sum: "$lineTotal" },
        totalItems: {
          $sum: {
            $cond: {
              if: { $ne: ["$items", null] },
              then: { $ifNull: ["$items.quantity", 1] },
              else: 0,
            },
          },
        },
        currency: { $first: "$currency" },
        items: {
          $push: {
            _id: "$items._id",
            product: {
              _id: "$productDoc._id",
              title: "$productDoc.title",
              description: "$productDoc.description",
              images: "$productDoc.images",
              stock: "$productDoc.stock",
            },
            variant: "$items.variant",
            variantData: "$matchedVariant",
            quantity: "$items.quantity",
            originalPrice: "$originalPrice",
            unitPrice: "$liveSellerPrice",
            price: {
              amount: "$liveSellerPrice",
              currency: "$currency",
            },
            priceDiff: "$priceDiff",
            priceStatus: "$priceStatus",
            currency: "$currency",
            lineTotal: "$lineTotal",
            liveStock: "$liveStock",
            isOutOfStock: { $lte: ["$liveStock", 0] },
            exceedsStock: { $gt: ["$items.quantity", "$liveStock"] },
            resolvedImage: {
              $ifNull: [
                { $arrayElemAt: ["$matchedVariant.images.url", 0] },
                { $arrayElemAt: ["$productDoc.images.url", 0] },
              ],
            },
            attributes: {
              $ifNull: [
                "$matchedVariant.attributes",
                { Edition: "Atelier Master Piece", Craft: "Pure Handloom" },
              ],
            },
          },
        },
      },
    },
  ];

  const results = await cartModel.aggregate(pipeline);
  if (!results || results.length === 0) {
    return {
      _id: existingCart._id,
      user: existingCart.user,
      items: [],
      totalPrice: 0,
      totalItems: 0,
      currency: "INR",
    };
  }

  return results[0];
};

/**
 * Formats cart using the aggregation pipeline
 */
export const formatCartResponse = async (cartDoc) => {
  if (!cartDoc) return null;
  const userId = cartDoc.user?._id || cartDoc.user || cartDoc;
  return await getAggregatedCart(userId);
};

/**
 * @route GET /api/cart
 * @desc Get the authenticated user's cart calculated via MongoDB aggregation pipeline
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await getAggregatedCart(userId);

    return res.status(200).json({
      message: "Cart fetched successfully",
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch cart",
      success: false,
    });
  }
};

/**
 * @route POST /api/cart/add/:productId/:variantId?
 * @desc Add an item (base product or specific variant) to the cart
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity = 1 } = req.body;
    const addQuantity = Math.max(1, Number(quantity) || 1);

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    // Determine variant and live stock
    let targetVariant = null;
    let availableStock = product.stock || 0;
    let itemPrice = product.price || { amount: 0, currency: "INR" };

    const cleanVariantId =
      variantId && variantId !== "base" && variantId !== "null" && variantId !== "undefined"
        ? variantId
        : null;

    if (cleanVariantId) {
      targetVariant = product.variants?.find(
        (v) => v._id && v._id.toString() === cleanVariantId
      );

      if (!targetVariant) {
        return res.status(404).json({
          message: "Product variant not found",
          success: false,
        });
      }

      availableStock = targetVariant.stock ?? 0;
      if (targetVariant.price?.amount !== undefined) {
        itemPrice = targetVariant.price;
      }
    }

    if (availableStock <= 0) {
      return res.status(400).json({
        message: "This piece is currently out of stock",
        success: false,
      });
    }

    let cart = await cartModel.findOne({ user: req.user._id });
    if (!cart) {
      cart = await cartModel.create({ user: req.user._id, items: [] });
    }

    // Check if matching item is already in cart
    const existingIndex = cart.items.findIndex((item) => {
      const isSameProduct = item.product.toString() === productId;
      const isSameVariant = cleanVariantId
        ? item.variant?.toString() === cleanVariantId
        : !item.variant;
      return isSameProduct && isSameVariant;
    });

    if (existingIndex > -1) {
      const currentQty = cart.items[existingIndex].quantity || 0;
      const newQty = currentQty + addQuantity;

      if (newQty > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} items in stock. You already have ${currentQty} in your bag.`,
          success: false,
        });
      }

      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice;
    } else {
      if (addQuantity > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} items left in stock`,
          success: false,
        });
      }

      cart.items.push({
        product: productId,
        variant: cleanVariantId,
        quantity: addQuantity,
        price: itemPrice,
      });
    }

    await cart.save();
    const aggregatedCart = await getAggregatedCart(req.user._id);

    return res.status(200).json({
      message: "Product added to cart successfully",
      success: true,
      cart: aggregatedCart,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    return res.status(500).json({
      message: error.message || "Failed to add item to cart",
      success: false,
    });
  }
};

/**
 * @route PATCH /api/cart/quantity/:productId/:variantId?
 * @desc Update quantity of an item in the cart (increment, decrement, or set)
 */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { quantity, action } = req.body;

    const cleanVariantId =
      variantId && variantId !== "base" && variantId !== "null" && variantId !== "undefined"
        ? variantId
        : null;

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        success: false,
      });
    }

    const itemIndex = cart.items.findIndex((item) => {
      const isSameProduct = item.product.toString() === productId;
      const isSameVariant = cleanVariantId
        ? item.variant?.toString() === cleanVariantId
        : !item.variant;
      return isSameProduct && isSameVariant;
    });

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found in cart",
        success: false,
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      const aggregated = await getAggregatedCart(req.user._id);
      return res.status(200).json({
        message: "Product no longer available, removed from cart",
        success: true,
        cart: aggregated,
      });
    }

    let availableStock = product.stock || 0;
    if (cleanVariantId) {
      const v = product.variants?.find((x) => x._id && x._id.toString() === cleanVariantId);
      availableStock = v ? v.stock ?? 0 : 0;
    }

    let currentQty = cart.items[itemIndex].quantity;
    let targetQty = currentQty;

    if (action === "increment") {
      targetQty = currentQty + 1;
    } else if (action === "decrement") {
      targetQty = currentQty - 1;
    } else if (quantity !== undefined) {
      targetQty = Number(quantity);
    }

    if (targetQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (targetQty > availableStock) {
        return res.status(400).json({
          message: `Only ${availableStock} items in stock`,
          success: false,
        });
      }
      cart.items[itemIndex].quantity = targetQty;
    }

    await cart.save();
    const aggregated = await getAggregatedCart(req.user._id);

    return res.status(200).json({
      message: "Cart quantity updated successfully",
      success: true,
      cart: aggregated,
    });
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    return res.status(500).json({
      message: error.message || "Failed to update quantity",
      success: false,
    });
  }
};

/**
 * @route DELETE /api/cart/item/:productId/:variantId?
 * @desc Remove an item from the cart
 */
export const removeCartItem = async (req, res) => {
  try {
    const { productId, variantId } = req.params;

    const cleanVariantId =
      variantId && variantId !== "base" && variantId !== "null" && variantId !== "undefined"
        ? variantId
        : null;

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
        success: false,
      });
    }

    cart.items = cart.items.filter((item) => {
      const isSameProduct = item.product.toString() === productId;
      const isSameVariant = cleanVariantId
        ? item.variant?.toString() === cleanVariantId
        : !item.variant;
      return !(isSameProduct && isSameVariant);
    });

    await cart.save();
    const aggregated = await getAggregatedCart(req.user._id);

    return res.status(200).json({
      message: "Item removed from cart",
      success: true,
      cart: aggregated,
    });
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return res.status(500).json({
      message: error.message || "Failed to remove item from cart",
      success: false,
    });
  }
};

/**
 * @route DELETE /api/cart/clear
 * @desc Clear all items from the cart
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await cartModel.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    const aggregated = await getAggregatedCart(req.user._id);

    return res.status(200).json({
      message: "Cart cleared successfully",
      success: true,
      cart: aggregated,
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    return res.status(500).json({
      message: error.message || "Failed to clear cart",
      success: false,
    });
  }
};
