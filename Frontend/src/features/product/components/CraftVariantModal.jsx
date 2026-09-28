import React, { useState, useRef, useEffect } from 'react';
import 'remixicon/fonts/remixicon.css';
import { getImageUrl } from '../../../utils/image';
import { useProduct } from '../hooks/useProduct';

const PRESET_ATTRIBUTE_KEYS = ['Color', 'Size', 'Fabric', 'Weave', 'Edition', 'Pattern'];

const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'AED' },
  { code: 'CAD', symbol: 'CA$' },
];

export const CraftVariantModal = ({ isOpen, onClose, product, onSuccess }) => {
  const { handleAddProductVariant } = useProduct();
  const fileInputRef = useRef(null);

  const [attributes, setAttributes] = useState({});
  const [attrKey, setAttrKey] = useState('Color');
  const [attrVal, setAttrVal] = useState('');

  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');
  const [discount, setDiscount] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');

  const [images, setImages] = useState([]); // [{ file, previewUrl, id }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill currency & price placeholder when product changes
  useEffect(() => {
    if (product) {
      setPriceCurrency(product.price?.currency || 'INR');
      setPriceAmount('');
      setDiscount('');
      setOriginalPrice('');
      setStock('10');
      setAttributes({});
      setImages([]);
      setErrorMsg('');
      setAttrKey('Color');
      setAttrVal('');
    }
  }, [product, isOpen]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, [images]);

  if (!isOpen || !product) return null;

  const handleAddAttribute = () => {
    const k = attrKey.trim();
    const v = attrVal.trim();
    if (!k || !v) return;

    setAttributes((prev) => ({ ...prev, [k]: v }));
    setAttrVal('');
    setErrorMsg('');
  };

  const handleRemoveAttribute = (keyToRemove) => {
    setAttributes((prev) => {
      const copy = { ...prev };
      delete copy[keyToRemove];
      return copy;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > 7) {
      setErrorMsg(`Maximum 7 images allowed. (${7 - images.length} slots remaining)`);
      return;
    }

    const newImgs = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImgs]);
    e.target.value = '';
    setErrorMsg('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const item = images[indexToRemove];
    if (item?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInheritBasePrice = () => {
    if (product?.price?.amount !== undefined) {
      setPriceAmount(product.price.amount.toString());
      setPriceCurrency(product.price?.currency || 'INR');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (Object.keys(attributes).length === 0) {
      setErrorMsg('Please define at least one variant attribute (e.g. Color, Size).');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('attributes', JSON.stringify(attributes));

      if (priceAmount !== '' && !isNaN(Number(priceAmount))) {
        formData.append('priceAmount', Number(priceAmount));
      }
      formData.append('priceCurrency', priceCurrency);
      formData.append('stock', Math.max(0, Number(stock) || 0));

      if (discount !== '' && !isNaN(Number(discount))) {
        formData.append('discount', Number(discount));
      }
      if (originalPrice !== '' && !isNaN(Number(originalPrice))) {
        formData.append('originalPrice', Number(originalPrice));
      }

      images.forEach((img) => {
        formData.append('images', img.file);
      });

      const updated = await handleAddProductVariant(product._id, formData);
      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to craft variant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCover = getImageUrl(product?.images?.[0], 120);
  const basePriceNum = Number(product?.price?.amount) || 0;
  const currentPriceNum = priceAmount !== '' && !isNaN(Number(priceAmount)) ? Number(priceAmount) : basePriceNum;
  const priceDiff = currentPriceNum - basePriceNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#100f0d] border border-[#2a2520] w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#2a2520]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#231f1a]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-13 rounded-xl bg-[#080806] border border-[#2a2520] overflow-hidden shrink-0">
              {currentCover ? (
                <img src={currentCover} alt="" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C6A87C]">
                  <i className="ri-vip-crown-2-line text-sm" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A87C] block">
                Atelier Variant Studio
              </span>
              <h3 className="text-base font-bold text-white truncate max-w-sm">
                Craft Variant for {product.title}
              </h3>
              <span className="text-[11px] text-[#8a8278] font-mono block">
                Base Valuation: {product.price?.currency || 'INR'} {basePriceNum.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181511] border border-[#2a2520] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
            <i className="ri-error-warning-line text-sm shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Dynamic Attributes Section */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#0a0907] border border-[#231f1a]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#C6A87C] flex items-center gap-1.5">
                <i className="ri-equalizer-line text-xs" />
                <span>Attributes & Specifications</span>
                <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-[#6e675f]">At least 1 required</span>
            </div>

            {/* Preset quick buttons */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-[#6e675f] uppercase tracking-wider font-mono mr-1">
                Presets:
              </span>
              {PRESET_ATTRIBUTE_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setAttrKey(k)}
                  className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold transition-colors cursor-pointer ${
                    attrKey === k
                      ? 'bg-[#C6A87C] text-[#080806] font-bold'
                      : 'bg-[#14120e] border border-[#2a2520] text-[#8a8278] hover:text-white hover:border-[#C6A87C]/50'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="grid grid-cols-12 gap-2 pt-1">
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Key (e.g. Color)"
                  value={attrKey}
                  onChange={(e) => setAttrKey(e.target.value)}
                  className="w-full bg-[#100f0d] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                />
              </div>
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Value (e.g. Royal Ruby Red)"
                  value={attrVal}
                  onChange={(e) => setAttrVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAttribute();
                    }
                  }}
                  className="w-full bg-[#100f0d] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                />
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  disabled={!attrKey.trim() || !attrVal.trim()}
                  className="w-full h-full rounded-xl bg-[#1c1914] border border-[#C6A87C]/40 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#080806] text-xs font-bold uppercase transition-all disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1"
                >
                  <i className="ri-add-line text-sm" />
                  Add
                </button>
              </div>
            </div>

            {/* Added Attributes Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
              {Object.entries(attributes).length > 0 ? (
                Object.entries(attributes).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14120e] border border-[#C6A87C]/50 text-xs text-white shadow-xs"
                  >
                    <strong className="text-[#C6A87C]">{k}:</strong> {v}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(k)}
                      className="text-gray-500 hover:text-red-400 ml-1 cursor-pointer transition-colors"
                      title="Remove attribute"
                    >
                      <i className="ri-close-line text-xs" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#5a5651] italic">
                  No attributes added yet. Add at least one (e.g., Color: Red or Size: 42).
                </span>
              )}
            </div>
          </div>

          {/* 2. Valuation & Inventory Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Price setting */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#0a0907] border border-[#231f1a]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C6A87C]">
                  Variant Price
                </label>
                <button
                  type="button"
                  onClick={handleInheritBasePrice}
                  className="text-[10px] text-[#C6A87C] hover:underline cursor-pointer uppercase font-semibold"
                >
                  Match ({basePriceNum})
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <select
                  value={priceCurrency}
                  onChange={(e) => setPriceCurrency(e.target.value)}
                  className="w-16 bg-[#100f0d] border border-[#2a2520] rounded-xl px-1.5 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#100f0d]">
                      {c.code}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  placeholder={`Base: ${basePriceNum}`}
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  className="flex-1 bg-[#100f0d] border border-[#2a2520] rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                />
              </div>

              {priceDiff !== 0 && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold inline-block ${
                    priceDiff > 0 ? 'bg-amber-950/60 text-amber-300' : 'bg-emerald-950/60 text-emerald-300'
                  }`}
                >
                  {priceDiff > 0 ? `+${priceDiff.toLocaleString('en-IN')}` : `-${Math.abs(priceDiff).toLocaleString('en-IN')}`} vs Base
                </span>
              )}
            </div>

            {/* Stock setting */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#0a0907] border border-[#231f1a]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#C6A87C] block">
                Stock Quantity
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-[#100f0d] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6e675f] uppercase">
                  Units
                </span>
              </div>
              <span className="text-[10px] text-[#6e675f] block">
                Real-time availability.
              </span>
            </div>

            {/* Discount setting */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#0a0907] border border-[#231f1a]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#C6A87C] block">
                Discount (%) <span className="text-[#6e675f] font-normal lowercase">(Optional)</span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="e.g. 15"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-[#100f0d] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#C6A87C] font-bold">
                  %
                </span>
              </div>
              <span className="text-[10px] text-[#6e675f] block">
                Optional edition discount.
              </span>
            </div>
          </div>

          {/* 3. Visuals / Photos Upload */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-[#0a0907] border border-[#231f1a]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#C6A87C]">
                Variant Photos <span className="text-[#6e675f] font-normal lowercase">(Optional, up to 7)</span>
              </label>
              <span className="text-[10px] font-mono text-[#8a8278]">
                {images.length} / 7
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              disabled={images.length >= 7}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Preview strip */}
            <div className="flex flex-wrap gap-2 items-center">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative w-14 h-16 rounded-xl overflow-hidden border border-[#2a2520] group bg-[#100f0d]"
                >
                  <img src={img.previewUrl} alt="" className="w-full h-full object-cover object-top" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              ))}

              {images.length < 7 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-16 rounded-xl border border-dashed border-[#2a2520] hover:border-[#C6A87C]/60 bg-[#100f0d] flex flex-col items-center justify-center text-[#6e675f] hover:text-[#C6A87C] transition-colors cursor-pointer"
                >
                  <i className="ri-camera-line text-sm" />
                  <span className="text-[9px] uppercase font-bold mt-0.5">Upload</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-[#6e675f] leading-relaxed">
              If no images are uploaded, this variant will automatically display the base piece’s photography.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#231f1a] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2520] text-gray-400 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || Object.keys(attributes).length === 0}
              className="btn-gold px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
              style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line text-sm animate-spin" />
                  <span>Crafting Edition...</span>
                </>
              ) : (
                <>
                  <i className="ri-vip-crown-line text-sm font-bold" />
                  <span>Publish Variant</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
