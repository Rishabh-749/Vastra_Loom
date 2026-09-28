import React, { useState } from 'react';
import { getImageUrl } from '../../../utils/image';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || `${currency} `;
  return `${sym} ${Number(amount).toLocaleString('en-IN')}`;
};

export const DeleteProductModal = ({ product, isOpen, onClose, onConfirmDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !product) return null;

  const coverUrl = getImageUrl(product?.images?.[0]);
  const variantCount = product?.variants?.length || 0;

  const handleDelete = async () => {
    setErrorMsg('');
    setIsDeleting(true);
    try {
      await onConfirmDelete(product._id);
      onClose();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to delete piece');
    } finally {
      setIsDeleting(false);
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
        className="relative w-full max-w-lg rounded-2xl bg-[#0e0d0b] border border-rose-900/40 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Luxury Danger Ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-700 via-rose-500 to-amber-600" />

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                <i className="ri-delete-bin-2-line text-xl" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rose-400 block">
                  Atelier Retirement
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Retire & Delete Piece
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-8 h-8 rounded-lg border border-[#2a2520] hover:border-gray-500 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>

          {/* Product Identification Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#14120e] border border-[#26211a]">
            <div className="w-14 h-16 rounded-lg bg-[#080806] border border-[#2a2520] overflow-hidden shrink-0 flex items-center justify-center">
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
              <h3 className="text-sm font-semibold text-white truncate">
                {product.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono font-bold text-[#C6A87C]">
                  {formatCurrency(product?.price?.amount, product?.price?.currency)}
                </span>
                {variantCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#1e1a14] border border-[#3a3328] text-gray-300">
                    {variantCount} Variant{variantCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#6e675f] block mt-0.5 truncate">
                ID: {product._id}
              </span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-200/90 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-300 uppercase tracking-wider text-[10px]">
              <i className="ri-error-warning-line text-sm text-rose-400" />
              Irreversible Action
            </div>
            <p>
              This creation will be permanently expunged from the VASTRA LOOM public catalogue,
              all staged variant editions, and active client carts.
            </p>
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
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-[#2a2520] hover:border-gray-500 text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Keep Piece
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  <span>Retiring Piece...</span>
                </>
              ) : (
                <>
                  <i className="ri-delete-bin-line text-sm" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
