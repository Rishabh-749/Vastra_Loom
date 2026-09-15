import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import ShinyText from '../../../components/ShinyText';
import Navbar from '../../../components/Navbar';
import { useProduct } from '../hooks/useProduct';

const MAX_IMAGES = 7;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const CURRENCIES = [
  { code: 'INR', symbol: '₹' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'AED', symbol: 'AED' },
  { code: 'CAD', symbol: 'CA$' },
];

const CreateProduct = () => {
  const navigate = useNavigate();
  const { handleCreateProduct, loading, error: apiError } = useProduct();
  const fileInputRef = useRef(null);

  // ── Form State ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'INR',
  });

  const [images, setImages] = useState([]); // [{ id, file, previewUrl, name, size }]
  const [activeCoverIdx, setActiveCoverIdx] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Store images in a ref for unmount-only cleanup
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Clean up blob URLs ONLY when the component unmounts
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.previewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, []);

  // Keep activeCoverIdx within bounds
  useEffect(() => {
    if (images.length === 0) {
      setActiveCoverIdx(0);
    } else if (activeCoverIdx >= images.length) {
      setActiveCoverIdx(Math.max(0, images.length - 1));
    }
  }, [images.length, activeCoverIdx]);

  // ── Input & File Handlers ───────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleStepPrice = (delta) => {
    setFormData((prev) => {
      const current = parseFloat(prev.priceAmount) || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, priceAmount: next === 0 ? '' : next.toString() };
    });
    if (errorMsg) setErrorMsg('');
  };

  const processFiles = useCallback(
    (files) => {
      setErrorMsg('');
      const fileList = Array.from(files);

      if (images.length + fileList.length > MAX_IMAGES) {
        setErrorMsg(`Maximum ${MAX_IMAGES} images allowed. (${MAX_IMAGES - images.length} slots remaining)`);
        return;
      }

      const validFiles = [];
      for (const file of fileList) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setErrorMsg(`"${file.name}" is not supported. Please use JPG, PNG, or WEBP.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setErrorMsg(`"${file.name}" exceeds 5MB limit.`);
          return;
        }
        validFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      }

      if (validFiles.length > 0) {
        setImages((prev) => [...prev, ...validFiles]);
      }
    },
    [images]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove, e) => {
    e?.stopPropagation();
    const removed = images[indexToRemove];
    if (removed?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setActiveCoverIdx((curr) => {
      if (curr === indexToRemove) {
        return Math.max(0, indexToRemove - 1);
      } else if (curr > indexToRemove) {
        return curr - 1;
      }
      return curr;
    });
  };

  const handleMakeCover = (idx, e) => {
    e?.stopPropagation();
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      return [item, ...copy];
    });
    setActiveCoverIdx(0);
  };

  // ── Validation & Submission ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Please enter a product title.');
      return;
    }
    if (!formData.priceAmount || Number(formData.priceAmount) <= 0) {
      setErrorMsg('Please enter a valid price amount.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Please provide a product description.');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Please upload at least 1 image (up to 7).');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title.trim());
    payload.append('description', formData.description.trim());
    payload.append('priceAmount', Number(formData.priceAmount));
    payload.append('priceCurrency', formData.priceCurrency);

    // Primary cover first, then remaining
    images.forEach((img) => {
      payload.append('images', img.file);
    });

    try {
      await handleCreateProduct(payload);
      setSuccessMsg('Product created successfully!');
      setTimeout(() => navigate('/seller/dashboard'), 1400);
    } catch (err) {
      // apiError is also synced in hook
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      priceAmount: '',
      priceCurrency: 'INR',
    });
    setImages([]);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const currentSymbol =
    CURRENCIES.find((c) => c.code === formData.priceCurrency)?.symbol || '₹';

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col bg-[#080806] font-sans text-gray-100 lg:overflow-hidden select-none">
      {/* ══════════════════════════════════════════════════════════
          STANDARD ATTRACTIVE NAVBAR (VASTRA LOOM)
      ══════════════════════════════════════════════════════════ */}
      <Navbar
        variant="seller"
        subtitle="New Product"
        onClear={handleReset}
        onClose={() => navigate('/')}
      />

      {/* ══════════════════════════════════════════════════════════
          MAIN VIEWPORT - SINGLE SCREEN SPLIT (Left: Media, Right: Details)
      ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 lg:p-7 gap-5 sm:gap-6 max-w-7xl mx-auto w-full lg:overflow-hidden min-h-0">
        
        {/* ── LEFT PANEL: Image Upload & Strip (Fits strictly in viewport) ── */}
        <div className="w-full lg:w-[48%] flex flex-col rounded-2xl bg-[#0d0c0b] border border-[#2a2520] p-4 sm:p-5 h-full min-h-0 shadow-lg">
          <div className="flex items-center justify-between pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <i className="ri-image-add-line text-[#C6A87C] text-sm" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-200">
                Product Images
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#161411] border border-[#2a2520] text-[#C6A87C]">
              {images.length} / {MAX_IMAGES}
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            disabled={images.length >= MAX_IMAGES}
            onChange={(e) => {
              if (e.target.files?.length) {
                processFiles(e.target.files);
                e.target.value = '';
              }
            }}
            className="hidden"
          />

          {/* Large Hero Preview / Main Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            onClick={() => images.length === 0 && fileInputRef.current?.click()}
            className={`relative flex-1 min-h-[220px] sm:min-h-[260px] rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center select-none group ${
              isDragOver
                ? 'border-[#C6A87C] bg-[#C6A87C]/10'
                : images.length > 0
                ? 'border-[#2a2520] bg-black'
                : 'border-[#2a2520] hover:border-[#C6A87C]/60 bg-[#12100d]/60 hover:bg-[#14120e] cursor-pointer'
            }`}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeCoverIdx]?.previewUrl || images[0]?.previewUrl}
                  alt="Selected product preview"
                  className="w-full h-full object-contain"
                />
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                
                {/* Top Left: Cover badge or Set Cover action */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  {activeCoverIdx === 0 ? (
                    <span className="px-2.5 py-1 rounded-md bg-[#C6A87C] text-[#080806] text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
                      <i className="ri-star-fill text-[11px]" />
                      Cover Image
                    </span>
                  ) : (
                    <>
                      <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-gray-200 text-[10px] font-mono border border-white/10">
                        #{activeCoverIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleMakeCover(activeCoverIdx, e)}
                        className="px-2.5 py-1 rounded-md bg-[#C6A87C] hover:bg-white text-[#080806] text-[10px] font-bold uppercase tracking-wider transition-colors shadow flex items-center gap-1"
                      >
                        <i className="ri-star-line text-[11px]" />
                        Set as Cover
                      </button>
                    </>
                  )}
                </div>

                {/* Top Right: Add more & Delete current */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                  {images.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="h-7 px-2.5 rounded-lg bg-black/70 hover:bg-[#1c1914] border border-[#2a2520] hover:border-[#C6A87C]/50 text-gray-300 hover:text-[#C6A87C] text-xs flex items-center gap-1 transition-colors shadow"
                      title="Upload more images"
                    >
                      <i className="ri-add-line text-sm" />
                      <span className="text-[10px] font-semibold uppercase">Add</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(activeCoverIdx, e)}
                    className="w-7 h-7 rounded-lg bg-black/70 hover:bg-red-500 text-gray-300 hover:text-white flex items-center justify-center transition-colors shadow"
                    title="Delete image"
                  >
                    <i className="ri-delete-bin-line text-xs" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#161411] border border-[#2a2520] group-hover:border-[#C6A87C]/50 flex items-center justify-center mx-auto text-[#C6A87C] transition-transform group-hover:scale-105">
                  <i className="ri-upload-cloud-2-line text-2xl" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-200">
                    Click or drag images here
                  </p>
                  <p className="text-[11px] text-[#6e675f] mt-0.5">
                    JPG, PNG, WEBP (Max 5MB each, up to 7)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 6 Thumbnail Slots Strip */}
          <div className="grid grid-cols-7 gap-1.5 pt-3 shrink-0">
            {Array.from({ length: MAX_IMAGES }).map((_, idx) => {
              const item = images[idx];
              const isCover = idx === 0;
              const isViewing = idx === activeCoverIdx;

              if (item) {
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveCoverIdx(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                      isViewing
                        ? 'border-[#C6A87C] ring-1 ring-[#C6A87C]'
                        : 'border-[#2a2520] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                    {isCover && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#C6A87C] text-[#080806] text-[8px] font-bold text-center leading-tight py-0.5">
                        COVER
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(idx, e)}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-black/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="ri-close-line text-[10px]" />
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border border-dashed border-[#231f1a] hover:border-[#C6A87C]/50 bg-[#12100d]/40 flex items-center justify-center text-gray-600 hover:text-[#C6A87C] transition-colors"
                >
                  <i className="ri-add-line text-xs" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: Compact Form (Fits strictly in viewport) ── */}
        <form
          onSubmit={handleSubmit}
          className="w-full lg:w-[52%] flex flex-col justify-between rounded-2xl bg-[#100f0d] border border-[#2a2520] p-5 sm:p-6 h-full min-h-0 shadow-lg"
        >
          {/* Header */}
          <div className="pb-2 shrink-0">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Create Product
              <ShinyText text="VASTRA LOOM" color="#C6A87C" shineColor="#fff8e7" speed={3} className="text-xs font-semibold uppercase tracking-wider" />
            </h1>
            <p className="text-xs text-[#6e675f] mt-0.5">
              Enter the core details to publish directly to the catalog.
            </p>
          </div>

          {/* Feedback messages */}
          {(errorMsg || apiError) && (
            <div className="my-2 px-3 py-2 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 shrink-0">
              <i className="ri-error-warning-line text-sm text-red-400 shrink-0" />
              <span className="truncate">{errorMsg || apiError}</span>
            </div>
          )}

          {successMsg && (
            <div className="my-2 px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
              <i className="ri-checkbox-circle-line text-sm text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields container - fills nicely */}
          <div className="flex-1 flex flex-col justify-around py-1 gap-3.5 min-h-0">
            
            {/* Field: Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a0988e]">
                Product Title <span className="text-[#C6A87C]">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5a5651] group-focus-within:text-[#C6A87C] transition-colors">
                  <i className="ri-price-tag-3-line text-sm" />
                </div>
                <input
                  type="text"
                  name="title"
                  maxLength={120}
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Vintage Textured Cuban Shirt"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0d0c0b] border border-[#2a2520] rounded-xl text-sm text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/70 transition-colors"
                />
              </div>
            </div>

            {/* Field: Price Amount & Currency (Side-by-side) */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a0988e]">
                  Currency <span className="text-[#C6A87C]">*</span>
                </label>
                <div className="relative">
                  <select
                    name="priceCurrency"
                    value={formData.priceCurrency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-[#0d0c0b] border border-[#2a2520] rounded-xl text-sm text-gray-100 focus:outline-none focus:border-[#C6A87C]/70 transition-colors appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-[#12100d]">
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm" />
                </div>
              </div>

              <div className="col-span-8 space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#a0988e]">
                  Price Amount <span className="text-[#C6A87C]">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#C6A87C] font-mono text-sm">
                    {currentSymbol}
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="priceAmount"
                    value={formData.priceAmount}
                    onChange={handleInputChange}
                    placeholder="2499"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#0d0c0b] border border-[#2a2520] rounded-xl text-sm text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/70 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {/* Custom Luxury Stepper */}
                  <div className="absolute inset-y-1.5 right-1.5 flex flex-col justify-between w-6 py-0.5 rounded-lg bg-[#14120e] border border-[#2a2520] overflow-hidden select-none">
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => handleStepPrice(100)}
                      className="flex-1 flex items-center justify-center text-[#8a8278] hover:text-[#C6A87C] hover:bg-[#1f1b15] transition-colors active:scale-90"
                      title="Increase price (+100)"
                    >
                      <i className="ri-arrow-up-s-fill text-[11px] leading-none" />
                    </button>
                    <div className="h-px bg-[#2a2520] w-full" />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => handleStepPrice(-100)}
                      className="flex-1 flex items-center justify-center text-[#8a8278] hover:text-[#C6A87C] hover:bg-[#1f1b15] transition-colors active:scale-90"
                      title="Decrease price (-100)"
                    >
                      <i className="ri-arrow-down-s-fill text-[11px] leading-none" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Field: Description (flex-1 to balance height) */}
            <div className="space-y-1 flex-1 flex flex-col min-h-0">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#a0988e]">
                Description <span className="text-[#C6A87C]">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Fabric composition, fit silhouette, wash care and styling tips..."
                className="w-full flex-1 p-3 bg-[#0d0c0b] border border-[#2a2520] rounded-xl text-sm text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/70 transition-colors resize-none leading-relaxed min-h-[90px]"
              />
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-[#2a2520] flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 rounded-xl border border-[#2a2520] hover:border-[#3a342c] text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white bg-[#0d0c0b] transition-colors"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#080806] text-xs font-bold tracking-wider uppercase shadow-[0_0_24px_rgba(198,168,124,0.25)] hover:shadow-[0_0_30px_rgba(198,168,124,0.4)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line text-sm animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <i className="ri-check-line text-base font-bold" />
                  <span>Publish Product</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CreateProduct;