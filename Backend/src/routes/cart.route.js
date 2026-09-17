import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import {
  validateAddToCart,
  validateUpdateCartItemQuantity,
  validateRemoveCartItem,
} from '../validators/cart.validator.js';
import {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller.js';

const router = express.Router();

/**
 * @route POST /api/cart/add/:productId/:variantId?
 * @desc Add item (base product or specific variant) to cart
 * @access Private
 */
router.post(
  ['/add/:productId', '/add/:productId/:variantId'],
  authenticateUser,
  validateAddToCart,
  addToCart
);

/**
 * @route GET /api/cart
 * @desc Get user's cart
 * @access Private
 */
router.get('/', authenticateUser, getCart);

/**
 * @route PATCH /api/cart/quantity/:productId/:variantId?
 * @desc Update item quantity in cart (increment, decrement, or specific number)
 * @access Private
 */
router.patch(
  ['/quantity/:productId', '/quantity/:productId/:variantId'],
  authenticateUser,
  validateUpdateCartItemQuantity,
  updateCartItemQuantity
);

/**
 * @route DELETE /api/cart/item/:productId/:variantId?
 * @desc Remove item from cart
 * @access Private
 */
router.delete(
  ['/item/:productId', '/item/:productId/:variantId'],
  authenticateUser,
  validateRemoveCartItem,
  removeCartItem
);

/**
 * @route DELETE /api/cart/clear
 * @desc Clear user's entire cart
 * @access Private
 */
router.delete('/clear', authenticateUser, clearCart);

export default router;