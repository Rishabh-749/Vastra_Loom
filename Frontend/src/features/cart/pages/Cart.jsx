import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import Navbar from '../../../components/Navbar';
import { useCart } from '../hook/useCart';
import { useAuth } from '../../auth/hooks/useAuth';
import { getImageUrl } from '../../../utils/image';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const code = currency?.toUpperCase() === 'INR' ? 'INR' : currency;
  return `${code} ${Number(amount).toLocaleString('en-IN')}`;
};

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    totalPrice,
    currency,
    totalItems,
    loading: cartLoading,
    handleGetCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
  } = useCart();

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Load cart on mount or user change
  useEffect(() => {
    if (user) {
      handleGetCart().catch(() => {});
    }
  }, [user]);

  const showToast = (message) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Stepper handlers
  const onIncrement = async (item) => {
    const key = `${item.product._id}_${item.variant || 'base'}`;
    if (actionLoadingId === key) return;

    if (item.liveStock && item.quantity >= item.liveStock) {
      showToast(`Maximum stock limit (${item.liveStock}) reached for this piece`);
      return;
    }

    setActionLoadingId(key);
    try {
      await handleUpdateQuantity({
        productId: item.product._id,
        variantId: item.variant,
        action: 'increment',
      });
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Unable to update piece quantity');
    } finally {
      setActionLoadingId(null);
    }
  };

  const onDecrement = async (item) => {
    const key = `${item.product._id}_${item.variant || 'base'}`;
    if (actionLoadingId === key) return;

    setActionLoadingId(key);
    try {
      if (item.quantity <= 1) {
        await handleRemoveItem({
          productId: item.product._id,
          variantId: item.variant,
        });
        showToast('Piece removed from your shopping bag');
      } else {
        await handleUpdateQuantity({
          productId: item.product._id,
          variantId: item.variant,
          action: 'decrement',
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Unable to update piece quantity');
    } finally {
      setActionLoadingId(null);
    }
  };

  const onRemove = async (item) => {
    const key = `${item.product._id}_${item.variant || 'base'}`;
    setActionLoadingId(key);
    try {
      await handleRemoveItem({
        productId: item.product._id,
        variantId: item.variant,
      });
      showToast('Piece removed from your shopping bag');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to remove piece');
    } finally {
      setActionLoadingId(null);
    }
  };

  const onClear = async () => {
    if (!window.confirm('Are you sure you wish to clear all pieces from your bag?')) return;
    setIsClearing(true);
    try {
      await handleClearCart();
      showToast('Shopping bag cleared');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to clear bag');
    } finally {
      setIsClearing(false);
    }
  };

  const onProceedToCheckout = () => {
    setCheckoutModalOpen(true);
  };

  // ── Guest State ──
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080806] font-sans text-gray-100 flex flex-col">
        <Navbar subtitle="Shopping Bag" />
        <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#13110d] border border-[#2a241b] flex items-center justify-center text-[#C6A87C] mb-6 shadow-2xl">
            <i className="ri-vip-crown-2-line text-3xl" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#C6A87C]">
            Patron Authentication Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-3 tracking-tight">
            Sign In to Access Your Couture Bag
          </h2>
          <p className="text-xs sm:text-sm text-[#8a8278] max-w-md mb-8 leading-relaxed">
            Your reserved handloom creations and bespoke atelier selections are securely linked to your patron profile.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider text-center shadow-lg hover:opacity-95 transition-opacity"
            >
              Sign In to Atelier
            </Link>
            <Link
              to="/register"
              className="w-full py-3 rounded-xl bg-[#12100d] border border-[#26211a] text-gray-200 hover:text-white hover:border-[#C6A87C]/50 font-semibold text-xs uppercase tracking-wider text-center transition-all"
            >
              Create Account
            </Link>
          </div>
          <Link
            to="/"
            className="mt-8 text-xs text-[#787167] hover:text-[#C6A87C] transition-colors flex items-center gap-1 uppercase tracking-wider font-medium"
          >
            <i className="ri-arrow-left-line text-sm" />
            <span>Continue Browsing Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080806] font-sans text-gray-100 flex flex-col selection:bg-[#C6A87C]/30 selection:text-[#fff8e7]">
      {/* ── Fixed Luxury Header ── */}
      <Navbar subtitle="Shopping Bag" />

      {/* ── Toast Notifications ── */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14120e] border border-[#C6A87C]/60 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-5 h-5 rounded-full bg-[#C6A87C] text-[#080806] flex items-center justify-center font-bold text-xs">
            <i className="ri-check-line" />
          </div>
          <div>
            <span className="font-semibold text-white block">{feedbackToast}</span>
            <span className="text-[10px] text-[#C6A87C]">Shopping Bag Synchronized</span>
          </div>
        </div>
      )}

      {/* ── Main Container (Centered, Breathing Space, Generous Margins) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Subtle Top Row: Back to Catalog & Bag Status */}
        <div className="flex items-center justify-between pb-6 border-b border-[#1c1914]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#8a8278] hover:text-[#C6A87C] transition-colors"
          >
            <i className="ri-arrow-left-line text-sm" />
            <span>Continue Curating</span>
          </Link>

          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#C6A87C] font-semibold">
            <i className="ri-vip-crown-fill text-xs" />
            <span>Bespoke Atelier Reservoir</span>
          </div>
        </div>

        {/* ── Page Header ── */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C6A87C]">
              HAUTE COUTURE RESERVATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Your Shopping Bag
            </h1>
          </div>
          {items && items.length > 0 && (
            <span className="text-xs text-[#8a8278] tracking-wider uppercase font-mono">
              {totalItems} {totalItems === 1 ? 'Piece Reserved' : 'Pieces Reserved'}
            </span>
          )}
        </div>

        {/* ── Empty Cart State ── */}
        {(!items || items.length === 0) ? (
          <div className="py-16 sm:py-24 rounded-3xl bg-[#0d0c0a] border border-[#201c17] text-center p-8 flex flex-col items-center justify-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#14120e] border border-[#C6A87C]/30 flex items-center justify-center text-[#C6A87C] mb-5 shadow-lg">
              <i className="ri-shopping-bag-3-line text-3xl" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#C6A87C]">
              Atelier Reservoir Empty
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-2">
              Your Shopping Bag is Currently Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8278] max-w-md mx-auto leading-relaxed mb-8">
              Explore our master artisans' bespoke handloom sherwanis, achkans, and royal silhouettes tailored with timeless precision.
            </p>
            <Link
              to="/"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(198,168,124,0.25)] hover:shadow-[0_6px_30px_rgba(198,168,124,0.4)] hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2"
            >
              <i className="ri-compass-3-line text-sm" />
              <span>Discover Haute Couture Catalog</span>
            </Link>
          </div>
        ) : (
          /* ── Active Cart: Two-Column Responsive Layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ══════════════════════════════════════════════════════════════
                LEFT COLUMN: SHOPPING BAG ITEMS LIST
            ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              
              {/* Atelier Live Price Synchronization Alert Banner */}
              {items.some((it) => it.priceStatus === 'increased' || it.priceStatus === 'decreased') && (
                <div className="p-3.5 rounded-xl bg-[#16120d] border border-[#C6A87C]/50 text-xs text-gray-200 flex items-start gap-2.5 shadow-lg animate-in fade-in duration-300">
                  <i className="ri-information-fill text-[#C6A87C] text-base shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#C6A87C] uppercase tracking-wider text-[11px] block">
                      Live Atelier Price Synchronization
                    </span>
                    <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                      One or more pieces in your shopping bag had a price revision by their master artisans. Your subtotals and total reservation have been synchronized with the latest catalog rates.
                    </p>
                  </div>
                </div>
              )}

              {items.map((item) => {
                const itemKey = `${item.product._id}_${item.variant || 'base'}`;
                const isMutating = actionLoadingId === itemKey;
                const imgUrl = getImageUrl(item.resolvedImage, 400);

                return (
                  <div
                    key={itemKey}
                    className={`relative rounded-2xl bg-[#100f0d] border border-[#221e18] p-4 sm:p-5 transition-all hover:border-[#C6A87C]/40 shadow-xl ${
                      isMutating ? 'opacity-60 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      
                      {/* 1. Garment Portrait Thumbnail */}
                      <Link
                        to={`/product/${item.product._id}`}
                        className="relative aspect-[3/4] w-24 sm:w-28 rounded-xl bg-[#161410] border border-[#26211a] overflow-hidden shrink-0 group block"
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.product.title}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#554e44] p-2 text-center">
                            <i className="ri-vip-crown-2-line text-lg text-[#C6A87C]" />
                            <span className="text-[9px] uppercase tracking-widest text-[#C6A87C] font-semibold mt-1">
                              VASTRA
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur text-[8px] font-extrabold uppercase tracking-widest text-[#C6A87C] border border-[#C6A87C]/20">
                          BESPOKE
                        </span>
                      </Link>

                      {/* 2. Garment Details & Attributes */}
                      <div className="flex-1 flex flex-col justify-between self-stretch space-y-2.5">
                        <div>
                          {/* Brand & Reference */}
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C6A87C] flex items-center gap-1">
                              <i className="ri-vip-crown-fill text-[9px]" />
                              HAUTE COUTURE BESPOKE
                            </span>
                            <span className="text-[10px] text-[#6b645b] font-mono">
                              Ref: {item.product._id?.slice(-8)}
                            </span>
                          </div>

                          {/* Garment Title */}
                          <Link
                            to={`/product/${item.product._id}`}
                            className="text-base sm:text-lg font-bold text-white hover:text-[#C6A87C] transition-colors leading-snug mt-0.5 block"
                          >
                            {item.product.title}
                          </Link>

                          {/* Active Variant Specifications Badge Strip */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                            {item.attributes && Object.keys(item.attributes).length > 0 ? (
                              Object.entries(item.attributes).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#161410] border border-[#2b251d] text-[10px] text-gray-200"
                                >
                                  <strong className="text-[#C6A87C] uppercase font-semibold">
                                    {key}:
                                  </strong>
                                  <span className="capitalize">{val}</span>
                                </span>
                              ))
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#161410] border border-[#2b251d] text-[10px] text-[#C6A87C]">
                                Atelier Master Piece
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 3. Unit Price & Live Stock Status & Price Revisions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-[#7a7267] uppercase tracking-wider font-medium">
                              Unit Price:
                            </span>
                            <span className="text-xs font-mono font-semibold text-white">
                              {formatCurrency(item.unitPrice || item.price?.amount, item.currency || currency)}
                            </span>

                            {/* Seller Price Increase Warning (Red) */}
                            {item.priceStatus === 'increased' && (
                              <span
                                title={`Price was ${formatCurrency(item.originalPrice, item.currency || currency)} when added`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-950/80 border border-red-700/80 text-red-300 text-[10px] font-semibold tracking-wide animate-pulse shadow-sm"
                              >
                                <i className="ri-error-warning-fill text-red-400 text-xs" />
                                <span>
                                  Price revised: was {formatCurrency(item.originalPrice, item.currency || currency)} (+{formatCurrency(item.priceDiff, item.currency || currency)})
                                </span>
                              </span>
                            )}

                            {/* Seller Price Reduction Highlight (Green) */}
                            {item.priceStatus === 'decreased' && (
                              <span
                                title={`Price was ${formatCurrency(item.originalPrice, item.currency || currency)} when added`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-600/80 text-emerald-300 text-[10px] font-semibold tracking-wide shadow-sm"
                              >
                                <i className="ri-price-tag-3-fill text-emerald-400 text-xs" />
                                <span>
                                  Price reduced: was {formatCurrency(item.originalPrice, item.currency || currency)} (-{formatCurrency(Math.abs(item.priceDiff), item.currency || currency)})
                                </span>
                              </span>
                            )}
                          </div>

                          {/* Stock Status Indicator */}
                          {item.liveStock > 0 ? (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {item.liveStock <= 5
                                ? `Only ${item.liveStock} left`
                                : `${item.liveStock} in stock`}
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* 4. Controls Row: Quantity Stepper, Line Total, Trash Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#1d1a15]">
                          
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-[#26211a] rounded-xl bg-[#0c0b09] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => onDecrement(item)}
                              disabled={isMutating}
                              title="Decrease quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#C6A87C] hover:bg-[#1a1712] disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              <i className={item.quantity === 1 ? "ri-delete-bin-line text-xs text-red-400" : "ri-subtract-line text-xs"} />
                            </button>
                            <span className="w-8 text-center text-xs font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onIncrement(item)}
                              disabled={isMutating || (item.liveStock && item.quantity >= item.liveStock)}
                              title="Increase quantity"
                              className="w-7 h-7 flex items-center justify-center text-[#C6A87C] hover:bg-[#1a1712] disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              <i className="ri-add-line text-xs" />
                            </button>
                          </div>

                          {/* Line Total & Remove */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-[#7a7267] block">
                                Subtotal
                              </span>
                              <span className="text-sm sm:text-base font-bold font-mono text-white tracking-tight">
                                {formatCurrency(item.lineTotal, item.price?.currency || currency)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemove(item)}
                              disabled={isMutating}
                              title="Remove Piece"
                              className="w-8 h-8 rounded-lg bg-[#14120e] border border-[#26211a] hover:border-red-900/60 text-[#7a7267] hover:text-red-400 hover:bg-red-950/20 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <i className="ri-close-line text-sm" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom Actions: Clear Bag */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isClearing}
                  className="text-xs text-[#7a7267] hover:text-red-400 transition-colors flex items-center gap-1.5 uppercase tracking-wider font-semibold cursor-pointer py-1"
                >
                  <i className="ri-delete-bin-line text-xs" />
                  <span>Clear Entire Shopping Bag</span>
                </button>
              </div>

            </div>

            {/* ══════════════════════════════════════════════════════════════
                RIGHT COLUMN: STICKY ORDER RESERVATION SUMMARY
            ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-4">
              
              {/* Summary Card */}
              <div className="rounded-2xl bg-[#100f0d] border border-[#242019] p-5 sm:p-6 shadow-2xl space-y-5">
                
                {/* Card Title */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1f1b15]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded-full bg-[#C6A87C]" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                      Reservation Summary
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#C6A87C] font-mono uppercase tracking-wider font-semibold">
                    {totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>

                {/* Pricing Line Items */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[#999084]">
                    <span>Couture Subtotal</span>
                    <span className="font-mono font-semibold text-white">
                      {formatCurrency(totalPrice, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#999084]">
                    <div className="flex items-center gap-1.5">
                      <span>White Glove Delivery</span>
                      <i className="ri-shield-check-line text-emerald-400 text-xs" />
                    </div>
                    <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[11px]">
                      COMPLIMENTARY
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#999084]">
                    <span>Artisanal Keepsake Box</span>
                    <span className="text-emerald-400 font-semibold tracking-wider uppercase text-[11px]">
                      COMPLIMENTARY
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#999084]">
                    <span>Handloom GST & Duties</span>
                    <span className="font-medium text-gray-300">INCLUDED</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t border-[#1f1b15] flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C6A87C] block">
                      Total Reservation
                    </span>
                    <span className="text-[10px] text-[#6b645b]">
                      All taxes & insured delivery included
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                    {formatCurrency(totalPrice, currency)}
                  </span>
                </div>

                {/* Checkout Action CTA */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onProceedToCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(198,168,124,0.3)] hover:shadow-[0_6px_30px_rgba(198,168,124,0.45)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="ri-shield-check-line text-base" />
                    <span>Proceed to Bespoke Checkout</span>
                  </button>
                </div>

                {/* Assurance Guarantee Strip */}
                <div className="pt-2 border-t border-[#1a1713] space-y-2 text-[10px] text-[#7a7267] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill text-[#C6A87C] text-xs" />
                    <span>100% Certified Authentic Handloom Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill text-[#C6A87C] text-xs" />
                    <span>Complimentary Insured Courier Over INR 15,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-checkbox-circle-fill text-[#C6A87C] text-xs" />
                    <span>14-Day Bespoke Vault Exchange Guarantee</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ── Checkout Confirmation Modal ── */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#100f0d] border border-[#28231c] max-w-md w-full rounded-2xl p-6 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
              <i className="ri-vip-crown-fill text-2xl text-[#C6A87C]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C6A87C]">
                HAUTE COUTURE RESERVATION CONFIRMED
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Atelier Order Reserved
              </h3>
              <p className="text-xs text-[#8a8278] mt-2 leading-relaxed">
                Thank you for patronizing VASTRA LOOM. Your reservation for {totalItems} couture piece(s) valued at{' '}
                <strong className="text-white font-mono">{formatCurrency(totalPrice, currency)}</strong> has been recorded in our master atelier registry.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#14120e] border border-[#241f19] text-left text-xs space-y-1.5">
              <div className="flex justify-between text-[#7a7267]">
                <span>Order Reference:</span>
                <span className="font-mono text-gray-200">VL-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-[#7a7267]">
                <span>Patron:</span>
                <span className="text-gray-200 font-medium">{user.fullname || user.email}</span>
              </div>
              <div className="flex justify-between text-[#7a7267]">
                <span>Delivery:</span>
                <span className="text-emerald-400 font-medium">Complimentary White Glove Courier</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCheckoutModalOpen(false);
                  navigate('/');
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
              >
                Return to Collections
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;