import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

// Helper to safely extract variant attributes map or plain object
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
 * Format cart document with populated products, resolved variant metadata,
 * resolved images, verified live stock, and calculated totals.
 */
export const formatCartResponse = async (cartDoc) => {
  if (!cartDoc) return null;

  // Ensure items.product is populated
  if (!cartDoc.populated("items.product")) {
    await cartDoc.populate("items.product");
  }

  let totalPrice = 0;
  let totalItems = 0;
  let currency = "INR";

  const formattedItems = cartDoc.items
    .filter((item) => Boolean(item.product)) // filter out deleted products
    .map((item) => {
      const product = item.product;
      const variantId = item.variant ? item.variant.toString() : null;
      let matchedVariant = null;

      if (variantId && product.variants && product.variants.length > 0) {
        matchedVariant = product.variants.find(
          (v) => v._id && v._id.toString() === variantId
        );
      }

      // Determine attributes, live stock, image, and price
      let resolvedAttributes = {};
      let liveStock = product.stock || 0;
      let resolvedImage = product.images?.[0]?.url || "";
      let itemPrice = item.price?.amount
        ? item.price
        : product.price || { amount: 0, currency: "INR" };

      if (matchedVariant) {
        resolvedAttributes = getVariantAttributes(matchedVariant);
        liveStock = matchedVariant.stock ?? 0;
        if (matchedVariant.images && matchedVariant.images.length > 0) {
          resolvedImage = matchedVariant.images[0]?.url || resolvedImage;
        }
        if (matchedVariant.price && matchedVariant.price.amount !== undefined) {
          itemPrice = matchedVariant.price;
        }
      } else if (variantId) {
        // Variant was removed or not found
        resolvedAttributes = { Edition: "Custom Variant" };
        liveStock = 0;
      } else {
        // Base Master Piece
        resolvedAttributes = {
          Edition: "Atelier Master Piece",
          Craft: "Pure Handloom",
        };
      }

      const unitPriceAmount = Number(itemPrice.amount) || 0;
      const quantity = Number(item.quantity) || 1;
      const lineTotal = unitPriceAmount * quantity;

      if (itemPrice.currency) {
        currency = itemPrice.currency;
      }

      totalPrice += lineTotal;
      totalItems += quantity;

      return {
        _id: item._id,
        product: {
          _id: product._id,
          title: product.title,
          description: product.description,
          stock: product.stock,
          images: product.images,
        },
        variant: variantId,
        variantData: matchedVariant
          ? {
              _id: matchedVariant._id,
              stock: matchedVariant.stock,
              price: matchedVariant.price,
              attributes: resolvedAttributes,
            }
          : null,
        attributes: resolvedAttributes,
        resolvedImage,
        quantity,
        price: {
          amount: unitPriceAmount,
          currency: itemPrice.currency || "INR",
        },
        lineTotal,
        liveStock,
        isOutOfStock: liveStock <= 0,
        exceedsStock: quantity > liveStock,
      };
    });

  return {
    _id: cartDoc._id,
    user: cartDoc.user,
    items: formattedItems,
    totalItems,
    totalPrice,
    currency,
  };
};

/**
 * @route GET /api/cart
 * @desc Get the authenticated user's cart
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await cartModel.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      cart = await cartModel.create({ user: userId, items: [] });
    }

    const formattedCart = await formatCartResponse(cart);

    return res.status(200).json({
      message: "Cart fetched successfully",
      success: true,
      cart: formattedCart,
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
    await cart.populate("items.product");

    const formattedCart = await formatCartResponse(cart);

    return res.status(200).json({
      message: "Product added to cart successfully",
      success: true,
      cart: formattedCart,
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
      await cart.populate("items.product");
      const formatted = await formatCartResponse(cart);
      return res.status(200).json({
        message: "Product no longer available, removed from cart",
        success: true,
        cart: formatted,
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
    await cart.populate("items.product");
    const formatted = await formatCartResponse(cart);

    return res.status(200).json({
      message: "Cart quantity updated successfully",
      success: true,
      cart: formatted,
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
    await cart.populate("items.product");
    const formatted = await formatCartResponse(cart);

    return res.status(200).json({
      message: "Item removed from cart",
      success: true,
      cart: formatted,
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

    return res.status(200).json({
      message: "Cart cleared successfully",
      success: true,
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        currency: "INR",
      },
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    return res.status(500).json({
      message: error.message || "Failed to clear cart",
      success: false,
    });
  }
};