import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import Navbar from '../../../components/Navbar';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hooks/useAuth';
import { getImageUrl } from '../../../utils/image';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const symbols = { INR: '₹ ', USD: '$ ', EUR: '€ ', GBP: '£ ' };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol}${Number(amount).toLocaleString('en-IN')}`;
};

// Safe helper to extract attribute map from a variant
const getVariantAttributes = (variant) => {
  if (!variant || !variant.attributes) return {};
  if (variant.attributes instanceof Map) {
    return Object.fromEntries(variant.attributes);
  }
  if (typeof variant.attributes === 'object') {
    return variant.attributes;
  }
  try {
    return JSON.parse(variant.attributes);
  } catch {
    return {};
  }
};

const COMMON_ATTRIBUTE_TAGS = ['Color', 'Size', 'Storage', 'Material', 'Fit', 'Edition'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    handleGetProductDetails,
    handleAddProductVariant,
    handleUpdateVariantStock,
    handleUpdateProductStock,
    currentProduct,
    loading: apiLoading,
    error: apiError,
  } = useProduct();

  // Selected Variant (null = base authentic product by default, never auto-selects!)
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Drawers & Modals
  const [isSellerDrawerOpen, setIsSellerDrawerOpen] = useState(false);
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [authPromptProduct, setAuthPromptProduct] = useState(null);
  const [purchaseSuccessProduct, setPurchaseSuccessProduct] = useState(null);
  const [bagToast, setBagToast] = useState(null);
  const [stockFeedback, setStockFeedback] = useState(null);

  // Seller stock management
  const [baseStockInput, setBaseStockInput] = useState(0);
  const [variantStockInputs, setVariantStockInputs] = useState({});
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Add Variant Form state
  const [variantAttrKey, setVariantAttrKey] = useState('');
  const [variantAttrVal, setVariantAttrVal] = useState('');
  const [variantAttributes, setVariantAttributes] = useState({});
  const [variantPrice, setVariantPrice] = useState('');
  const [variantCurrency, setVariantCurrency] = useState('INR');
  const [variantStock, setVariantStock] = useState(0);
  const [variantFiles, setVariantFiles] = useState([]);
  const [variantPreviews, setVariantPreviews] = useState([]);
  const [variantModalError, setVariantModalError] = useState('');
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);

  // Fetch product on mount or id change, strictly resetting selectedVariant to null
  useEffect(() => {
    setSelectedVariant(null);
    setActiveImageIndex(0);
    setImgLoadError(false);
    if (id) {
      handleGetProductDetails(id).catch(() => {});
    }
  }, [id]);

  // Sync stock inputs when currentProduct updates
  useEffect(() => {
    if (currentProduct) {
      setBaseStockInput(currentProduct.stock || 0);
      if (currentProduct.variants && currentProduct.variants.length > 0) {
        const vStocks = {};
        currentProduct.variants.forEach((v) => {
          vStocks[v._id] = v.stock || 0;
        });
        setVariantStockInputs(vStocks);
      }
    }
  }, [currentProduct]);

  // Reset active image index and image load error when variant changes
  useEffect(() => {
    setActiveImageIndex(0);
    setImgLoadError(false);
  }, [selectedVariant]);

  // Role checks
  const isSeller = user?.role === 'seller';
  const isProductOwner =
    user &&
    currentProduct?.seller &&
    (user._id === (currentProduct.seller._id || currentProduct.seller));
  const canManageVariants = isSeller || isProductOwner;

  // Active Images:
  // If user selected a variant and that variant has provided images, SHOW ONLY THAT VARIANT'S IMAGES!
  // If variant has no custom images or no variant is selected, show base product images.
  const activeImages = useMemo(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      const validImages = selectedVariant.images.filter((img) => Boolean(getImageUrl(img)));
      if (validImages.length > 0) {
        return validImages;
      }
    }
    return currentProduct?.images || [];
  }, [selectedVariant, currentProduct]);

  // Active Price: Use variant price if selected, otherwise base product price
  const activePrice = useMemo(() => {
    if (selectedVariant && selectedVariant.price?.amount !== undefined) {
      return selectedVariant.price.amount;
    }
    return currentProduct?.price?.amount || 0;
  }, [selectedVariant, currentProduct]);

  const activeCurrency = useMemo(() => {
    if (selectedVariant && selectedVariant.price?.currency) {
      return selectedVariant.price.currency;
    }
    return currentProduct?.price?.currency || 'INR';
  }, [selectedVariant, currentProduct]);

  // Active Stock: Use variant stock if selected, otherwise base product stock
  const activeStock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stock ?? 0;
    }
    return currentProduct?.stock ?? 0;
  }, [selectedVariant, currentProduct]);

  // Primary image URL with graceful fallback
  const primaryImageUrl = useMemo(() => {
    if (imgLoadError) {
      return getImageUrl(currentProduct?.images?.[0], 1200) || '';
    }
    const currentImg = activeImages[activeImageIndex] || activeImages[0];
    const url = getImageUrl(currentImg, 1200);
    if (!url) {
      return getImageUrl(currentProduct?.images?.[0], 1200) || '';
    }
    return url;
  }, [activeImages, activeImageIndex, imgLoadError, currentProduct]);

  // Available variants list
  const availableVariants = useMemo(() => {
    return currentProduct?.variants || [];
  }, [currentProduct]);

  // Toggle variant selection: click selects, click again deselects to base product
  const handleToggleVariant = (variant) => {
    if (selectedVariant?._id === variant._id) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variant);
    }
  };

  // Customer Actions
  const handleAddToBag = () => {
    if (!user) {
      setAuthPromptProduct(currentProduct);
      return;
    }
    const variantLabel = selectedVariant
      ? ` (${Object.values(getVariantAttributes(selectedVariant)).join(' / ')})`
      : '';
    setBagToast(`${currentProduct.title}${variantLabel}`);
    setTimeout(() => setBagToast(null), 3000);
  };

  const handleBuyNow = () => {
    if (!user) {
      setAuthPromptProduct(currentProduct);
      return;
    }
    setPurchaseSuccessProduct(currentProduct);
  };

  // Seller Stock Updates
  const handleSaveBaseStock = async () => {
    setIsUpdatingStock(true);
    setStockFeedback(null);
    try {
      await handleUpdateProductStock(currentProduct._id, Number(baseStockInput));
      setStockFeedback('Base stock updated');
      setTimeout(() => setStockFeedback(null), 3000);
    } catch (err) {
      setStockFeedback(err.message || 'Failed to update stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleSaveVariantStock = async (variantId) => {
    setIsUpdatingStock(true);
    setStockFeedback(null);
    try {
      const newStock = Number(variantStockInputs[variantId] || 0);
      await handleUpdateVariantStock(currentProduct._id, variantId, newStock);
      setStockFeedback('Variant stock updated');
      setTimeout(() => setStockFeedback(null), 3000);
    } catch (err) {
      setStockFeedback(err.message || 'Failed to update variant stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Add Variant Form actions
  const handleAddAttribute = () => {
    if (!variantAttrKey.trim() || !variantAttrVal.trim()) return;
    setVariantAttributes((prev) => ({
      ...prev,
      [variantAttrKey.trim()]: variantAttrVal.trim(),
    }));
    setVariantAttrKey('');
    setVariantAttrVal('');
    setVariantModalError('');
  };

  const handleRemoveAttribute = (k) => {
    setVariantAttributes((prev) => {
      const copy = { ...prev };
      delete copy[k];
      return copy;
    });
  };

  const handleVariantFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (variantFiles.length + selected.length > 7) {
      setVariantModalError('Maximum 7 images allowed per variant');
      return;
    }
    const combined = [...variantFiles, ...selected].slice(0, 7);
    setVariantFiles(combined);
    const previews = combined.map((file) => URL.createObjectURL(file));
    setVariantPreviews(previews);
    setVariantModalError('');
  };

  const handleRemoveVariantFile = (idx) => {
    const newFiles = variantFiles.filter((_, i) => i !== idx);
    setVariantFiles(newFiles);
    const newPreviews = variantPreviews.filter((_, i) => i !== idx);
    setVariantPreviews(newPreviews);
  };

  const handleCreateVariantSubmit = async (e) => {
    e.preventDefault();
    setVariantModalError('');

    if (Object.keys(variantAttributes).length === 0) {
      setVariantModalError('Please define at least one attribute (e.g. Color, Size, Edition)');
      return;
    }

    setIsSubmittingVariant(true);
    try {
      const formData = new FormData();
      formData.append('attributes', JSON.stringify(variantAttributes));

      if (variantPrice !== '' && !isNaN(Number(variantPrice))) {
        formData.append('priceAmount', variantPrice);
      }
      formData.append('priceCurrency', variantCurrency || 'INR');
      formData.append('stock', variantStock || 0);

      variantFiles.forEach((file) => {
        formData.append('images', file);
      });

      const updated = await handleAddProductVariant(currentProduct._id, formData);

      setIsAddVariantModalOpen(false);
      setVariantAttributes({});
      setVariantPrice('');
      setVariantStock(0);
      setVariantFiles([]);
      setVariantPreviews([]);
      setStockFeedback('New variant crafted successfully');
      setTimeout(() => setStockFeedback(null), 3000);

      // If a new variant was crafted, automatically activate that new variant to preview it
      if (updated?.variants?.length > 0) {
        const newest = updated.variants[updated.variants.length - 1];
        setSelectedVariant(newest);
      }
    } catch (err) {
      setVariantModalError(err.message || 'Failed to craft variant');
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  // Loading & Error States
  if (apiLoading && !currentProduct) {
    return (
      <div className="min-h-screen w-full bg-[#08080a] flex flex-col items-center justify-center font-sans text-gray-100">
        <Navbar variant={isSeller ? 'seller' : 'default'} subtitle="Piece Details" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#131317] border border-[#23232c] flex items-center justify-center text-[#C6A87C] animate-pulse">
            <i className="ri-vip-crown-2-line text-xl" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#C6A87C] font-medium">
            Loading Atelier Piece...
          </span>
        </div>
      </div>
    );
  }

  if (apiError && !currentProduct) {
    return (
      <div className="min-h-screen w-full bg-[#08080a] flex flex-col font-sans text-gray-100">
        <Navbar variant={isSeller ? 'seller' : 'default'} subtitle="Piece Details" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Piece Not Found</h2>
          <p className="text-xs text-[#8a8278] max-w-sm mb-4">{apiError}</p>
          <Link
            to={isSeller ? '/seller/dashboard' : '/'}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#08080a] font-bold text-xs uppercase tracking-wider"
          >
            Return to {isSeller ? 'Dashboard' : 'Catalog'}
          </Link>
        </div>
      </div>
    );
  }

  if (!currentProduct) return null;

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#08080a] font-sans text-gray-100 flex flex-col lg:overflow-hidden selection:bg-[#C6A87C]/30 selection:text-[#fff8e7]">
      {/* ── Fixed Minimalist Navigation Bar ── */}
      <Navbar variant={isSeller ? 'seller' : 'default'} subtitle={isSeller ? 'Atelier Studio' : 'Haute Couture'} />

      {/* ── Toast Notifications ── */}
      {bagToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121216] border border-[#C6A87C]/60 text-white text-xs px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-5 h-5 rounded-full bg-[#C6A87C] text-[#08080a] flex items-center justify-center font-bold text-xs">
            <i className="ri-check-line" />
          </div>
          <div>
            <span className="font-semibold text-white block">{bagToast}</span>
            <span className="text-[10px] text-[#C6A87C]">Added to Shopping Bag</span>
          </div>
        </div>
      )}

      {stockFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-[#101912] border border-emerald-500/40 text-emerald-200 text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-300">
          <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
          <span>{stockFeedback}</span>
        </div>
      )}

      {/* ── Main Viewport Container (Single Screen on Desktop) ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-5 flex flex-col lg:overflow-hidden">
        
        {/* Top Breadcrumb & Seller Studio Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1b22] shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[#8a8894]">
            <Link
              to={isSeller ? '/seller/dashboard' : '/'}
              className="hover:text-[#C6A87C] transition-colors flex items-center gap-1"
            >
              <i className="ri-arrow-left-s-line" />
              <span>{isSeller ? 'Atelier Dashboard' : 'Atelier Catalog'}</span>
            </Link>
            <span className="text-[#353540]">/</span>
            <span className="text-gray-300 font-medium truncate max-w-xs sm:max-w-md">
              {currentProduct.title}
            </span>
            {selectedVariant && (
              <>
                <span className="text-[#353540]">/</span>
                <span className="text-[#C6A87C] font-semibold flex items-center gap-1">
                  <i className="ri-palette-line text-xs" />
                  {Object.values(getVariantAttributes(selectedVariant)).join(' • ')}
                </span>
              </>
            )}
          </div>

          {canManageVariants && (
            <button
              type="button"
              onClick={() => setIsSellerDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#141418] border border-[#C6A87C]/50 hover:bg-[#C6A87C] hover:text-[#08080a] text-[#C6A87C] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <i className="ri-equalizer-line" />
              <span>Seller Inventory Studio</span>
              {availableVariants.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#C6A87C]/20 border border-[#C6A87C]/40 text-[10px] font-mono">
                  {availableVariants.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── Two-Column Layout (Gallery 55% | Product Details 45%) ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-4 lg:overflow-hidden items-stretch">
          
          {/* ══════════════════════════════════════════════════════════
              LEFT COLUMN: LUXURY ATELIER GALLERY
              Shows variant's images if variant is active, else base images!
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between h-full lg:max-h-[calc(100vh-9.5rem)] lg:overflow-hidden">
            {/* Primary Image Frame */}
            <div className="relative flex-1 w-full rounded-2xl bg-[#0e0e11] border border-[#1e1e24] overflow-hidden shadow-2xl flex items-center justify-center group min-h-[360px] lg:min-h-0">
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt={currentProduct.title}
                  onError={() => setImgLoadError(true)}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[#555360]">
                  <i className="ri-vip-crown-2-line text-3xl mb-2 text-[#C6A87C]" />
                  <span className="text-xs uppercase tracking-widest text-[#C6A87C] font-semibold">
                    VASTRA LOOM
                  </span>
                  <span className="text-[11px] text-[#7a7888] mt-1">{currentProduct.title}</span>
                </div>
              )}

              {/* Top Vignette Badge */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-[#C6A87C]/30 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C6A87C]">
                  VASTRA LOOM
                </span>
              </div>

              {/* Active Variant Indicator Overlay */}
              {selectedVariant && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-[#C6A87C] text-[#08080a] text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
                    <i className="ri-check-line" />
                    Variant: {Object.values(getVariantAttributes(selectedVariant)).join(' / ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="w-6 h-6 rounded-full bg-black/80 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center cursor-pointer text-xs border border-white/20 transition-colors"
                    title="View Base Original Piece"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              )}

              {/* Bottom Stock Indicator */}
              <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                {activeStock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    In Stock ({activeStock} unit{activeStock > 1 ? 's' : ''} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-rose-500/30 text-rose-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Made to Order / Bespoke Creation
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel (Shows only the active edition's photos!) */}
            {activeImages && activeImages.length > 1 && (
              <div className="flex items-center gap-2.5 pt-3 overflow-x-auto pb-1 shrink-0 scrollbar-none">
                {activeImages.map((img, idx) => {
                  const thumb = getImageUrl(img, 300);
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setImgLoadError(false);
                      }}
                      className={`relative w-14 h-16 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#C6A87C] ring-2 ring-[#C6A87C]/50 opacity-100 scale-105 shadow-md'
                          : 'border-[#202028] opacity-50 hover:opacity-100 hover:border-[#C6A87C]/40'
                      }`}
                    >
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT COLUMN: SEAMLESS PRODUCT INFORMATION & CONTROLS
          ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between h-full lg:max-h-[calc(100vh-9.5rem)] lg:overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-[#1f1f26]">
            
            {/* 1. Header: Brand, Title, Artisan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C6A87C] flex items-center gap-1">
                  <i className="ri-vip-crown-fill text-xs" />
                  HAUTE COUTURE BESPOKE
                </span>

                <span className="text-[11px] text-[#6d6a78] font-mono">
                  Ref: {currentProduct._id?.slice(-8)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {currentProduct.title}
              </h1>

              {currentProduct.seller && (
                <p className="text-xs text-[#9591a0]">
                  Artisanal craftsmanship by{' '}
                  <span className="text-gray-200 font-semibold">
                    {currentProduct.seller.fullname || 'Master Artisan'}
                  </span>
                </p>
              )}
            </div>

            {/* 2. Valuation Card (Clean, elegant, transparent) */}
            <div className="p-4 rounded-2xl bg-[#111115] border border-[#202028] flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#7a7788] block mb-0.5">
                  {selectedVariant ? 'Variant Valuation' : 'Atelier Valuation'}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                    {formatCurrency(activePrice, activeCurrency)}
                  </span>

                  {selectedVariant && (
                    <button
                      type="button"
                      onClick={() => setSelectedVariant(null)}
                      className="text-[10px] text-[#C6A87C] hover:underline cursor-pointer font-medium ml-1"
                    >
                      (Reset to base {formatCurrency(currentProduct.price.amount, currentProduct.price.currency)})
                    </button>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
                  Complimentary Express Delivery
                </span>
                <span className="text-[10px] text-[#6e6b7c]">Taxes & Duties Included</span>
              </div>
            </div>

            {/* 3. TAILORED VARIANTS SELECTOR (Clean, intuitive, Original Piece is default!) */}
            {availableVariants.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-[#1b1b22]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                    <i className="ri-palette-line text-[#C6A87C]" />
                    Select Edition / Variant
                  </span>

                  {selectedVariant ? (
                    <button
                      type="button"
                      onClick={() => setSelectedVariant(null)}
                      className="text-[11px] text-[#C6A87C] hover:underline cursor-pointer flex items-center gap-1 font-medium"
                    >
                      <i className="ri-refresh-line" /> View Original Base Piece
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ✓ Original Piece Active
                    </span>
                  )}
                </div>

                {/* Variant Chips Grid (Includes explicit Original Piece + All Variants) */}
                <div className="flex flex-wrap gap-2">
                  {/* Option 1: Original Base Piece */}
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                      selectedVariant === null
                        ? 'bg-[#1b1914] border-[#C6A87C] text-white shadow-[0_0_15px_rgba(198,168,124,0.2)] ring-1 ring-[#C6A87C]'
                        : 'bg-[#111115] border-[#22222a] text-gray-400 hover:border-[#C6A87C]/50 hover:text-white'
                    }`}
                  >
                    <span className={selectedVariant === null ? 'text-[#C6A87C] font-semibold' : ''}>
                      Original Piece
                    </span>
                    <span className="text-[10px] font-mono text-[#8a8894] pl-1 border-l border-[#262630]">
                      {formatCurrency(currentProduct.price.amount, currentProduct.price.currency)}
                    </span>
                  </button>

                  {/* Option 2...N: Custom Crafted Variants */}
                  {availableVariants.map((v, idx) => {
                    const attrs = getVariantAttributes(v);
                    const isSelected = selectedVariant?._id === v._id;
                    const attrSummary = Object.entries(attrs)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(' • ');

                    return (
                      <button
                        key={v._id || idx}
                        type="button"
                        onClick={() => handleToggleVariant(v)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#1b1914] border-[#C6A87C] text-white shadow-[0_0_15px_rgba(198,168,124,0.2)] ring-1 ring-[#C6A87C]'
                            : 'bg-[#111115] border-[#22222a] text-gray-300 hover:border-[#C6A87C]/50 hover:text-white'
                        }`}
                      >
                        <span className={isSelected ? 'text-[#C6A87C] font-semibold' : ''}>
                          {attrSummary || `Variant #${idx + 1}`}
                        </span>

                        <span className="text-[10px] font-mono text-[#8a8894] pl-1 border-l border-[#262630]">
                          {formatCurrency(
                            v.price?.amount || currentProduct.price.amount,
                            v.price?.currency || currentProduct.price.currency
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Quantity & Action Buttons */}
            <div className="space-y-3 pt-2 border-t border-[#1b1b22]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8894]">
                  Quantity
                </span>
                <div className="flex items-center border border-[#22222a] rounded-xl bg-[#111115] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-[#C6A87C] hover:bg-[#1a191f] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-xs" />
                  </button>
                  <span className="w-9 text-center text-xs font-mono font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(activeStock || 10, q + 1))}
                    disabled={activeStock > 0 ? quantity >= activeStock : quantity >= 10}
                    className="w-8 h-8 flex items-center justify-center text-[#C6A87C] hover:bg-[#1a191f] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line text-xs" />
                  </button>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#08080a] font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(198,168,124,0.25)] hover:shadow-[0_6px_25px_rgba(198,168,124,0.4)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="ri-shopping-bag-3-line text-sm" />
                  Add to Bag
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 rounded-xl border border-[#C6A87C]/60 hover:bg-[#C6A87C]/15 text-[#C6A87C] font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <i className="ri-flashlight-line text-sm text-[#C6A87C]" />
                  Buy Now
                </button>
              </div>
            </div>

            {/* 5. Garment Narrative & Details */}
            <div className="pt-2 border-t border-[#1b1b22] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A87C] block">
                Garment Narrative & Craftsmanship
              </span>
              <p className="text-xs text-[#a5a1b0] leading-relaxed line-clamp-3 bg-[#0e0e12] p-3 rounded-xl border border-[#1b1b22]">
                {currentProduct.description}
              </p>
            </div>

            {/* 6. Heritage Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1b1b22] text-[10px] text-[#7a7888]">
              <div className="flex items-center gap-1.5">
                <i className="ri-shield-check-line text-[#C6A87C]" />
                <span>100% Authentic Handloom</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ri-plane-line text-[#C6A87C]" />
                <span>Global Insured Courier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ri-medal-line text-[#C6A87C]" />
                <span>Atelier Verified Piece</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SLIDE-OUT SELLER ATELIER DRAWER (STOCK & VARIANT CONTROLS)
      ══════════════════════════════════════════════════════════════ */}
      {isSellerDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e0e12] border-l border-[#202028] h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1b1b22]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A87C]">
                    Seller Atelier Studio
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">Inventory & Stock Controls</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSellerDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#16161c] border border-[#252530] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <i className="ri-close-line text-sm" />
                </button>
              </div>

              {/* Action Button: Add Variant */}
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#08080a] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="ri-add-circle-line text-base" />
                Craft New Product Variant
              </button>

              {/* Base Product Stock Card */}
              <div className="p-4 rounded-xl bg-[#131318] border border-[#202028] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Base Piece Stock
                  </h4>
                  <span className="text-xs font-mono text-[#C6A87C]">
                    Current: {currentProduct.stock || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={baseStockInput}
                    onChange={(e) => setBaseStockInput(e.target.value)}
                    className="flex-1 bg-[#08080a] border border-[#252530] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C6A87C]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveBaseStock}
                    disabled={isUpdatingStock}
                    className="px-4 py-2 rounded-xl bg-[#1a191f] border border-[#C6A87C]/50 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#08080a] transition-all text-xs font-bold uppercase cursor-pointer"
                  >
                    Save Stock
                  </button>
                </div>
              </div>

              {/* Variants Stock & Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C6A87C]">
                    Crafted Variants ({availableVariants.length})
                  </h4>
                  <span className="text-[10px] text-[#7a7888]">
                    Shows variant specific visuals & valuation
                  </span>
                </div>

                {availableVariants.length > 0 ? (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {availableVariants.map((v, idx) => {
                      const attrs = getVariantAttributes(v);
                      const vStockVal =
                        variantStockInputs[v._id] !== undefined
                          ? variantStockInputs[v._id]
                          : v.stock || 0;
                      const vThumb = getImageUrl(v.images?.[0] || currentProduct.images?.[0], 160);

                      return (
                        <div
                          key={v._id || idx}
                          className="p-3 rounded-xl bg-[#131318] border border-[#202028] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-12 rounded-lg bg-[#08080a] border border-[#252530] overflow-hidden shrink-0">
                              <img
                                src={vThumb}
                                alt=""
                                onError={(e) => {
                                  e.currentTarget.src = getImageUrl(currentProduct.images?.[0], 160);
                                }}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(attrs).map(([k, val]) => (
                                  <span
                                    key={k}
                                    className="text-[10px] bg-[#1a1920] border border-[#30303c] px-1.5 py-0.5 rounded text-gray-200"
                                  >
                                    <strong className="text-[#C6A87C]">{k}:</strong> {val}
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                                {formatCurrency(
                                  v.price?.amount || currentProduct.price.amount,
                                  v.price?.currency || currentProduct.price.currency
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              min="0"
                              value={vStockVal}
                              onChange={(e) =>
                                setVariantStockInputs((prev) => ({
                                  ...prev,
                                  [v._id]: e.target.value,
                                }))
                              }
                              className="w-16 bg-[#08080a] border border-[#252530] rounded-lg px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#C6A87C]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveVariantStock(v._id)}
                              className="px-2.5 py-1 rounded-lg bg-[#1a191f] border border-[#C6A87C]/40 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#08080a] transition-all text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#8a8894] italic p-3 bg-[#131318] rounded-xl border border-[#202028]">
                    No custom variants added yet.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1b1b22]">
              <button
                type="button"
                onClick={() => setIsSellerDrawerOpen(false)}
                className="w-full py-2 rounded-xl border border-[#252530] text-gray-300 hover:text-white text-xs font-semibold uppercase cursor-pointer"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SELLER "ADD NEW VARIANT" MODAL (Dynamic attributes, up to 7 images)
      ══════════════════════════════════════════════════════════════ */}
      {isAddVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#101014] border border-[#252530] w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#252530]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1b22]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A87C]">
                  Atelier Crafting
                </span>
                <h3 className="text-base font-bold text-white">Add Product Variant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#181820] border border-[#282834] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line text-sm" />
              </button>
            </div>

            {variantModalError && (
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                <i className="ri-error-warning-line text-sm shrink-0" />
                <span>{variantModalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateVariantSubmit} className="space-y-4">
              {/* Dynamic Attributes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#C6A87C] block">
                  Dynamic Attributes <span className="text-red-400">* (At least 1 required)</span>
                </label>

                {/* Quick Add Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-[#7a7888]">Quick Tags:</span>
                  {COMMON_ATTRIBUTE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setVariantAttrKey(tag)}
                      className="px-2 py-0.5 rounded-full bg-[#181820] border border-[#282834] hover:border-[#C6A87C] text-[10px] text-gray-300 transition-colors cursor-pointer"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>

                {/* Key & Value Inputs */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Name (e.g. Color)"
                      value={variantAttrKey}
                      onChange={(e) => setVariantAttrKey(e.target.value)}
                      className="w-full bg-[#08080a] border border-[#252530] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Value (e.g. Royal Emerald)"
                      value={variantAttrVal}
                      onChange={(e) => setVariantAttrVal(e.target.value)}
                      className="w-full bg-[#08080a] border border-[#252530] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddAttribute}
                      disabled={!variantAttrKey.trim() || !variantAttrVal.trim()}
                      className="w-full h-full py-2 rounded-xl bg-[#1a191f] border border-[#C6A87C]/40 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#08080a] text-xs font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Display added attributes */}
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[28px]">
                  {Object.entries(variantAttributes).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181820] border border-[#C6A87C]/60 text-xs text-white"
                    >
                      <span className="text-[#C6A87C] font-semibold">{k}:</span> {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(k)}
                        className="text-gray-400 hover:text-red-400 ml-1 cursor-pointer"
                      >
                        <i className="ri-close-line text-xs" />
                      </button>
                    </span>
                  ))}
                  {Object.keys(variantAttributes).length === 0 && (
                    <span className="text-[11px] text-[#6d6a78] italic">
                      Define at least one attribute (e.g. Color: Royal Emerald, Size: XL)
                    </span>
                  )}
                </div>
              </div>

              {/* Optional Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#C6A87C] block">
                    Price <span className="text-[#7a7888] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder={`Inherit: ${currentProduct.price.amount}`}
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    className="w-full bg-[#08080a] border border-[#252530] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                  />
                  <span className="text-[9px] text-[#6d6a78] block">
                    Inherits parent valuation if left blank
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#C6A87C] block">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variantStock}
                    onChange={(e) => setVariantStock(e.target.value)}
                    className="w-full bg-[#08080a] border border-[#252530] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                  />
                  <span className="text-[9px] text-[#6d6a78] block">Initial units</span>
                </div>
              </div>

              {/* Upload Visuals (up to 7 images) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#C6A87C]">
                    Visuals <span className="text-[#7a7888] font-normal lowercase">(optional, up to 7)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#7a7888]">
                    {variantFiles.length}/7 photos
                  </span>
                </div>

                {variantFiles.length < 7 && (
                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed border-[#252530] hover:border-[#C6A87C]/60 bg-[#08080a] cursor-pointer transition-colors text-center">
                    <i className="ri-upload-cloud-line text-lg text-[#C6A87C]" />
                    <span className="text-xs text-gray-300 mt-0.5">
                      Upload variant-specific photos
                    </span>
                    <span className="text-[9px] text-[#7a7888]">
                      Inherits parent image if none selected
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleVariantFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Previews */}
                {variantPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {variantPreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative w-12 h-14 rounded-lg overflow-hidden border border-[#252530] bg-[#08080a] group"
                      >
                        <img
                          src={previewUrl}
                          alt=""
                          className="w-full h-full object-cover object-top"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantFile(idx)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit / Cancel buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b1b22]">
                <button
                  type="button"
                  onClick={() => setIsAddVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#252530] text-gray-300 text-xs font-semibold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVariant || Object.keys(variantAttributes).length === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#08080a] font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingVariant ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-sm" />
                      Crafting...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-line text-sm" />
                      Add Variant
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Guest Authentication Prompt Modal ── */}
      {authPromptProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#101014] border border-[#252530] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#181820] border border-[#C6A87C]/40 flex items-center justify-center text-[#C6A87C] mx-auto">
              <i className="ri-vip-crown-2-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sign In to Acquire</h3>
              <p className="text-xs text-[#8a8894] mt-1">
                Please sign in to your patron account to reserve this couture piece.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#08080a] font-bold text-xs uppercase tracking-wider block"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-[#141418] border border-[#252530] text-gray-300 text-xs font-semibold uppercase tracking-wider block"
              >
                Create Account
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAuthPromptProduct(null)}
              className="text-xs text-[#6d6a78] hover:text-gray-400 cursor-pointer block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Order Reserved Modal ── */}
      {purchaseSuccessProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#101014] border border-[#252530] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <i className="ri-checkbox-circle-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Acquisition Reserved</h3>
              <p className="text-xs text-[#8a8894] mt-1">
                "{purchaseSuccessProduct.title}" (Qty: {quantity}) has been reserved for{' '}
                {formatCurrency(activePrice * quantity, activeCurrency)}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPurchaseSuccessProduct(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#08080a] font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
