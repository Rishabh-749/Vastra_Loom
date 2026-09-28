import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../../utils/image';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || `${currency} `;
  return `${sym} ${Number(amount).toLocaleString('en-IN')}`;
};

const DISCOUNT_PRESETS = [0, 10, 15, 20, 25, 30, 40, 50];

export const ManageDiscountModal = ({ product, isOpen, onClose, onSaveDiscount }) => {
  const [sellingPrice, setSellingPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      const price = product?.price?.amount || '';
      const disc = product?.discount || '';
      const orig = product?.originalPrice || '';
      setSellingPrice(price.toString());
      setDiscountPercent(disc ? disc.toString() : '');
      setOriginalPrice(orig ? orig.toString() : '');
      setErrorMsg('');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const coverUrl = getImageUrl(product?.images?.[0]);
  const currency = product?.price?.currency || 'INR';

  // Live calculations
  const numSelling = Number(sellingPrice) || 0;
  const numDiscount = Number(discountPercent) || 0;
  const numOriginal = Number(originalPrice) || 0;

  // Derive preview numbers
  let effectiveOriginal = numOriginal;
  let effectiveDiscount = numDiscount;

  if (numDiscount > 0 && numSelling > 0) {
    if (!numOriginal || numOriginal <= numSelling) {
      effectiveOriginal = Math.round(numSelling / (1 - numDiscount / 100));
    }
  } else if (numOriginal > numSelling && numSelling > 0 && numDiscount === 0) {
    effectiveDiscount = Math.round(((numOriginal - numSelling) / numOriginal) * 100);
  }

  const savingsAmount = Math.max(0, effectiveOriginal - numSelling);

  const handleApplyPreset = (preset) => {
    setDiscountPercent(preset === 0 ? '' : preset.toString());
    if (preset === 0) {
      setOriginalPrice('');
    } else if (numSelling > 0) {
      const autoOrig = Math.round(numSelling / (1 - preset / 100));
      setOriginalPrice(autoOrig.toString());
    }
  };

  const handleOriginalPriceChange = (val) => {
    setOriginalPrice(val);
    const orig = Number(val);
    if (orig > numSelling && numSelling > 0) {
      const computedDisc = Math.round(((orig - numSelling) / orig) * 100);
      setDiscountPercent(computedDisc.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!numSelling || numSelling <= 0) {
      setErrorMsg('Selling price must be greater than 0');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      await onSaveDiscount(product._id, {
        priceAmount: numSelling,
        discount: effectiveDiscount,
        originalPrice: effectiveOriginal > numSelling ? effectiveOriginal : null,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update pricing');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#0e0d0b] border border-[#C6A87C]/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Gold Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-[#C6A87C] via-[#f7e7c4] to-[#C6A87C]" />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1c1813] border border-[#C6A87C]/50 flex items-center justify-center text-[#C6A87C] shrink-0 shadow-inner">
                <i className="ri-discount-percent-line text-xl" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C6A87C] block">
                  Atelier Commercials
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Manage Pricing & Discount
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="w-8 h-8 rounded-lg border border-[#2a2520] hover:border-gray-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>

          {/* Product Identification Snippet */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#14120e] border border-[#26211a]">
            <div className="w-12 h-14 rounded-lg bg-[#080806] border border-[#2a2520] overflow-hidden shrink-0 flex items-center justify-center">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={product.title}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <i className="ri-vip-crown-2-line text-lg text-[#C6A87C]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold text-white truncate">
                {product.title}
              </h3>
              <span className="text-[10px] text-[#8a8278] block">
                Current: <strong className="text-white font-mono">{formatCurrency(product?.price?.amount, currency)}</strong>
                {product?.discount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 font-mono text-[9px] border border-amber-800/40">
                    {product.discount}% OFF
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Quick Discount Presets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#a0988e]">
              Instant Discount Presets
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {DISCOUNT_PRESETS.map((p) => {
                const isActive = (p === 0 && (!discountPercent || Number(discountPercent) === 0)) ||
                  (p > 0 && Number(discountPercent) === p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border ${
                      isActive
                        ? 'border-[#C6A87C] bg-[#C6A87C]/20 text-[#C6A87C] shadow-xs'
                        : 'border-[#26211a] bg-[#12100d] text-gray-300 hover:border-[#C6A87C]/50 hover:text-white'
                    }`}
                  >
                    {p === 0 ? 'No Discount' : `${p}% OFF`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dual Inputs: Selling Price & Discount % */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a0988e]">
                Selling Price ({currency}) <span className="text-[#C6A87C]">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="26500"
                  className="w-full px-3 py-2 bg-[#12100d] border border-[#2a2520] rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#C6A87C]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a0988e]">
                Discount (%)
              </label>
              <div className="relative group">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                  className="w-full pl-3 pr-7 py-2 bg-[#12100d] border border-[#2a2520] rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#C6A87C]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C6A87C] font-bold text-xs">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Original MRP Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#a0988e]">
              Original MRP / Reference Price (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={originalPrice}
              onChange={(e) => handleOriginalPriceChange(e.target.value)}
              placeholder="e.g. 32000 (Crossed-out on client view)"
              className="w-full px-3 py-2 bg-[#12100d] border border-[#2a2520] rounded-xl text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#C6A87C]"
            />
            <p className="text-[10px] text-[#6e675f]">
              Auto-calculated if discount is set, or enter manually to strike through.
            </p>
          </div>

          {/* Patron View Simulation Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#16130e] to-[#0e0d0b] border border-[#C6A87C]/30 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#a0988e]">
              <span className="flex items-center gap-1">
                <i className="ri-eye-line text-[#C6A87C]" />
                Patron View Simulation
              </span>
              <span className="text-[#C6A87C] font-semibold">Live Preview</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-white">
                  {formatCurrency(numSelling, currency)}
                </span>
                {effectiveOriginal > numSelling && (
                  <span className="text-xs font-mono text-gray-400 line-through">
                    {formatCurrency(effectiveOriginal, currency)}
                  </span>
                )}
              </div>

              {effectiveDiscount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-[#C6A87C] text-[#080806] font-bold font-mono text-[10px] shadow-sm uppercase tracking-wide">
                  {effectiveDiscount}% OFF
                </span>
              )}
            </div>

            {savingsAmount > 0 && (
              <p className="text-[11px] text-emerald-400 font-medium">
                Client saves {formatCurrency(savingsAmount, currency)} on this atelier piece.
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <i className="ri-error-warning-line text-sm shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#231f1a]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-[#2a2520] hover:border-gray-500 text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
            >
              {isSaving ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  <span>Applying Changes...</span>
                </>
              ) : (
                <>
                  <i className="ri-check-line text-sm font-bold" />
                  <span>Apply & Publish Discount</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
