import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import Navbar from '../../../components/Navbar';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hooks/useAuth';
import { getImageUrl } from '../../../utils/image';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const code = currency?.toUpperCase() === 'INR' ? 'INR' : currency;
  return `${code} ${Number(amount).toLocaleString('en-IN')}`;
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

  // Active Variant State (null strictly = Authentic Base Product by default)
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

  // Seller stock management state
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

  // Fetch product on mount or id change
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

  // Reset image index when variant changes
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

  // Available variants from backend
  const availableVariants = useMemo(() => {
    return currentProduct?.variants || [];
  }, [currentProduct]);

  // Base piece label (e.g. "Ivory (Original)")
  const baseOptionLabel = useMemo(() => {
    if (!currentProduct?.title) return 'Original Piece';
    const firstWord = currentProduct.title.split(' ')[0];
    return `${firstWord} (Original)`;
  }, [currentProduct]);

  // Build clean, intuitive list of all selectable options:
  // Option 0: Base Original Piece (active by default!)
  // Option 1..N: Each created variant with its primary label
  const variantOptions = useMemo(() => {
    const options = [
      {
        id: 'base',
        label: baseOptionLabel,
        isBase: true,
        variant: null,
        price: currentProduct?.price?.amount,
        currency: currentProduct?.price?.currency || 'INR',
        stock: currentProduct?.stock || 0,
        attributes: { Edition: 'Original Base Piece' },
      },
    ];

    availableVariants.forEach((v, idx) => {
      const attrs = getVariantAttributes(v);
      let label = '';
      if (attrs.Color) {
        label = attrs.Color;
      } else if (attrs.Size) {
        label = `Size ${attrs.Size}`;
      } else {
        label = Object.values(attrs).join(' • ') || `Variant #${idx + 1}`;
      }

      options.push({
        id: v._id || `variant-${idx}`,
        label,
        isBase: false,
        variant: v,
        price: v.price?.amount || currentProduct?.price?.amount,
        currency: v.price?.currency || currentProduct?.price?.currency || 'INR',
        stock: v.stock ?? 0,
        attributes: attrs,
      });
    });

    return options;
  }, [baseOptionLabel, currentProduct, availableVariants]);

  // Attributes belonging ONLY to the currently active variant (no mixing!)
  const currentActiveAttributes = useMemo(() => {
    if (selectedVariant) {
      return getVariantAttributes(selectedVariant);
    }
    return {
      Edition: 'Atelier Master Piece',
      Craft: 'Pure Handloom',
      Weave: 'Chanderi Silk',
    };
  }, [selectedVariant]);

  // Active Images: If variant has images, display ONLY that variant's images!
  const activeImages = useMemo(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      const validImages = selectedVariant.images.filter((img) => Boolean(getImageUrl(img)));
      if (validImages.length > 0) {
        return validImages;
      }
    }
    return currentProduct?.images || [];
  }, [selectedVariant, currentProduct]);

  // Active Price: Variant price if variant selected, else base product price
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

  // Active Stock: Variant stock if variant selected, else base product stock
  const activeStock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stock ?? 0;
    }
    return currentProduct?.stock ?? 0;
  }, [selectedVariant, currentProduct]);

  // Hero image URL
  const heroImageUrl = useMemo(() => {
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

  // Customer Actions
  const handleAddToCart = () => {
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

  // Seller stock updates
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
  const handleAddAttributeToDraft = () => {
    if (!variantAttrKey.trim() || !variantAttrVal.trim()) return;
    setVariantAttributes((prev) => ({
      ...prev,
      [variantAttrKey.trim()]: variantAttrVal.trim(),
    }));
    setVariantAttrKey('');
    setVariantAttrVal('');
    setVariantModalError('');
  };

  const handleRemoveAttributeFromDraft = (k) => {
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
      setVariantModalError('Please define at least one attribute (e.g. Color, Size)');
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
      <div className="min-h-screen w-full bg-[#080806] flex flex-col items-center justify-center font-sans text-gray-100">
        <Navbar variant={isSeller ? 'seller' : 'default'} subtitle="Piece Details" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#14120e] border border-[#2a2520] flex items-center justify-center text-[#C6A87C] animate-pulse">
            <i className="ri-vip-crown-2-line text-xl" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C6A87C] font-medium">
            Loading Haute Couture Piece...
          </span>
        </div>
      </div>
    );
  }

  if (apiError && !currentProduct) {
    return (
      <div className="min-h-screen w-full bg-[#080806] flex flex-col font-sans text-gray-100">
        <Navbar variant={isSeller ? 'seller' : 'default'} subtitle="Piece Details" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Piece Not Found</h2>
          <p className="text-xs text-[#8a8278] max-w-sm mb-6">{apiError}</p>
          <Link
            to={isSeller ? '/seller/dashboard' : '/'}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider"
          >
            Return to {isSeller ? 'Dashboard' : 'Catalog'}
          </Link>
        </div>
      </div>
    );
  }

  if (!currentProduct) return null;

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#080806] font-sans text-gray-100 flex flex-col lg:overflow-hidden selection:bg-[#C6A87C]/30 selection:text-[#fff8e7]">
      {/* ── Fixed Header ── */}
      <Navbar
        variant={isSeller ? 'seller' : 'default'}
        subtitle={isSeller ? 'Atelier Studio' : 'Haute Couture'}
      />

      {/* ── Toast Notifications ── */}
      {bagToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14120e] border border-[#C6A87C]/60 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-5 h-5 rounded-full bg-[#C6A87C] text-[#080806] flex items-center justify-center font-bold text-xs">
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

      {/* ── Main Viewport Container (Centered, balanced margins on all 4 sides, fits in 1 screen) ── */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex flex-col justify-center lg:overflow-hidden">
        
        {/* Subtle top bar: Left Back Button + Right Seller Inventory Button (No separate wide breadcrumb row!) */}
        <div className="flex items-center justify-between pb-2 shrink-0">
          <Link
            to={isSeller ? '/seller/dashboard' : '/'}
            className="inline-flex items-center gap-1.5 text-xs text-[#8a8278] hover:text-[#C6A87C] transition-colors uppercase tracking-wider font-medium"
          >
            <i className="ri-arrow-left-line text-sm" />
            <span>Back to {isSeller ? 'Dashboard' : 'Catalog'}</span>
          </Link>

          {canManageVariants && (
            <button
              type="button"
              onClick={() => setIsSellerDrawerOpen(true)}
              className="px-3 py-1 rounded-full bg-[#14120e] border border-[#C6A87C]/50 hover:bg-[#C6A87C] hover:text-[#080806] text-[#C6A87C] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <i className="ri-equalizer-line" />
              <span>Seller Inventory</span>
              {availableVariants.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#C6A87C]/20 border border-[#C6A87C]/40 text-[10px] font-mono">
                  {availableVariants.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── Perfectly Aligned Two-Column Stage (Same Height, Perfectly Balanced) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch lg:h-[calc(100vh-6.5rem)] lg:max-h-[540px]">
          
          {/* ════════════════════════════════════════════════════════════════
              LEFT COLUMN: VERTICAL THUMBNAILS + LARGE HERO IMAGE
              Matching height with right column!
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-row gap-3 items-stretch h-full overflow-hidden">
            
            {/* 1. Vertical Thumbnail Rail on the Far Left */}
            {activeImages && activeImages.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0 overflow-y-auto max-h-full scrollbar-none w-14 sm:w-16">
                {activeImages.map((img, idx) => {
                  const thumb = getImageUrl(img, 200);
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setImgLoadError(false);
                      }}
                      className={`relative aspect-[3/4] w-full rounded-lg bg-[#0e0c0a] overflow-hidden transition-all cursor-pointer ${
                        isActive
                          ? 'border-2 border-[#C6A87C] opacity-100 shadow-md scale-[1.02]'
                          : 'border border-[#24201a] opacity-50 hover:opacity-90 hover:border-[#C6A87C]/40'
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

            {/* 2. Primary Hero Image Frame */}
            <div className="relative flex-1 w-full h-full rounded-2xl bg-[#0d0c0a] border border-[#201c17] overflow-hidden shadow-2xl flex items-center justify-center group min-h-[280px] lg:min-h-0">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt={currentProduct.title}
                  onError={() => setImgLoadError(true)}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[#554e44]">
                  <i className="ri-vip-crown-2-line text-3xl mb-2 text-[#C6A87C]" />
                  <span className="text-xs uppercase tracking-widest text-[#C6A87C] font-semibold">
                    VASTRA LOOM
                  </span>
                  <span className="text-[11px] text-[#7a7267] mt-1">{currentProduct.title}</span>
                </div>
              )}

              {/* Discreet Brand Badge */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-[#C6A87C]/30 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#C6A87C]">
                  VASTRA LOOM
                </span>
              </div>

              {/* Active Variant Indicator Overlay */}
              {selectedVariant && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-[#C6A87C] text-[#080806] text-[10px] font-bold uppercase tracking-wider shadow">
                    Variant Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="w-6 h-6 rounded-full bg-black/80 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center cursor-pointer text-xs border border-white/20 transition-colors"
                    title="View Original Piece"
                  >
                    <i className="ri-close-line" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              RIGHT COLUMN: SEAMLESS PRODUCT INFORMATION & ATTRIBUTES
              Matching height with left column, perfectly balanced!
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between h-full py-1 space-y-2.5 overflow-y-auto pr-1 no-scrollbar">
            
            {/* 1. Header: Brand, Title, Price */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C6A87C] flex items-center gap-1">
                  <i className="ri-vip-crown-fill text-[10px]" />
                  HAUTE COUTURE BESPOKE
                </span>
                <span className="text-[10px] text-[#6e675f] font-mono">
                  Ref: {currentProduct._id?.slice(-8)}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {currentProduct.title}
              </h1>

              {/* Price Row */}
              <div className="pt-0.5 flex items-baseline gap-2.5">
                <span className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                  {formatCurrency(activePrice, activeCurrency)}
                </span>
                {selectedVariant && (
                  <button
                    type="button"
                    onClick={() => setSelectedVariant(null)}
                    className="text-[11px] text-[#C6A87C] hover:underline cursor-pointer font-medium"
                  >
                    (View Original {formatCurrency(currentProduct.price.amount, currentProduct.price.currency)})
                  </button>
                )}
              </div>
            </div>

            {/* 2. DYNAMIC VARIANT / EDITION SELECTOR */}
            {/* Single click selects that variant, auto-updating price, image, stock, and its own attributes! */}
            <div className="space-y-2 pt-1 border-t border-[#1f1c17]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8a8278]">
                  Select Edition / Variant
                </span>
                <span className="text-[10px] font-bold text-[#C6A87C] uppercase tracking-wider">
                  {selectedVariant ? 'Custom Edition' : 'Original Piece'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {variantOptions.map((opt) => {
                  const isActive = opt.isBase
                    ? selectedVariant === null
                    : selectedVariant?._id === opt.variant?._id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        if (opt.isBase) {
                          setSelectedVariant(null);
                        } else {
                          setSelectedVariant(opt.variant);
                        }
                      }}
                      className={`group relative px-3.5 py-1.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                        isActive
                          ? 'bg-gradient-to-b from-[#2c241a] to-[#15120e] border-[#C6A87C] text-[#fff8e7] shadow-[0_0_16px_rgba(198,168,124,0.3)] ring-1 ring-[#C6A87C]/80 scale-[1.02]'
                          : 'bg-[#12100d] border-[#262019] text-[#a59c90] hover:border-[#C6A87C]/60 hover:text-white hover:bg-[#1c1813] hover:scale-[1.02] active:scale-95 shadow-sm'
                      }`}
                    >
                      {/* Luminous Active Jewel Indicator */}
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-[#C6A87C] shadow-[0_0_8px_#C6A87C] scale-110'
                            : 'bg-[#3d362d] group-hover:bg-[#C6A87C]/60'
                        }`}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. LUXURY SPECIFICATIONS & ATTRIBUTES SHOWCASE (With Breathing Room & Only Active Piece's Attributes) */}
            <div className="bg-gradient-to-b from-[#13110d] to-[#0c0b09] border border-[#231f18] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-3 rounded-full bg-[#C6A87C]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#C6A87C]">
                    Piece Specifications
                  </span>
                </div>
                <span className="text-[9px] text-[#7d756b] uppercase tracking-wider font-mono">
                  {selectedVariant ? 'Bespoke Customization' : 'Master Atelier Piece'}
                </span>
              </div>

              {/* Attribute Grid with Breathing Room - Only active attributes are displayed! */}
              <div
                className={`grid gap-2 ${
                  Object.keys(currentActiveAttributes).length === 1
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : Object.keys(currentActiveAttributes).length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 sm:grid-cols-3'
                }`}
              >
                {Object.entries(currentActiveAttributes).map(([k, val]) => (
                  <div
                    key={k}
                    className="flex flex-col justify-center bg-[#181510]/90 border border-[#2c261e] rounded-lg px-3 py-2 transition-all hover:border-[#C6A87C]/40"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8a8278]">
                      {k}
                    </span>
                    <span className="text-xs font-semibold text-white tracking-wide mt-0.5 capitalize truncate">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Stock Status Indicator */}
            <div className="flex items-center justify-between">
              {activeStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {activeStock} IN STOCK
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  OUT OF STOCK / BESPOKE CREATION
                </span>
              )}
            </div>

            {/* 5. THE DETAILS Narrative (Scrollable with hidden scrollbar so all text can be viewed) */}
            <div className="space-y-1 pt-1 border-t border-[#1f1c17]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8a8278]">
                  THE DETAILS
                </span>
                <span className="text-[9px] text-[#6b645b] tracking-wider uppercase">
                  Artisan Provenance
                </span>
              </div>
              <div className="max-h-20 sm:max-h-22 overflow-y-auto no-scrollbar bg-[#0d0c0a] p-2.5 rounded-xl border border-[#1d1a15]">
                <p className="text-xs text-[#b5aca0] leading-relaxed select-text">
                  {currentProduct.description}
                </p>
              </div>
            </div>

            {/* 6. Quantity Stepper & Primary CTAs */}
            <div className="space-y-2 pt-1 border-t border-[#1f1c17]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8278]">
                  Quantity
                </span>
                <div className="flex items-center border border-[#25211b] rounded-xl bg-[#100f0d] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-[#C6A87C] hover:bg-[#1a1712] disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-xs" />
                  </button>
                  <span className="w-7 text-center text-xs font-mono font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(activeStock || 10, q + 1))}
                    disabled={activeStock > 0 ? quantity >= activeStock : quantity >= 10}
                    className="w-7 h-7 flex items-center justify-center text-[#C6A87C] hover:bg-[#1a1712] disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <i className="ri-add-line text-xs" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Solid Luxury Gold & Matte Outlined */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(198,168,124,0.25)] hover:shadow-[0_6px_25px_rgba(198,168,124,0.4)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="ri-shopping-bag-3-line text-sm" />
                  ADD TO CART
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl border border-[#C6A87C]/60 hover:bg-[#C6A87C]/15 text-[#C6A87C] font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <i className="ri-flashlight-line text-sm text-[#C6A87C]" />
                  BUY NOW
                </button>
              </div>
            </div>

            {/* 7. Specification & Heritage Rows */}
            <div className="pt-1.5 border-t border-[#1f1c17] space-y-1 text-[10px] uppercase tracking-wider">
              <div className="flex items-center justify-between text-[#7a7267]">
                <span>SHIPPING</span>
                <span className="text-gray-300 font-medium">COMPLIMENTARY OVER INR 15,000</span>
              </div>
              <div className="flex items-center justify-between text-[#7a7267]">
                <span>RETURNS</span>
                <span className="text-gray-300 font-medium">WITHIN 14 DAYS OF DELIVERY</span>
              </div>
              <div className="flex items-center justify-between text-[#7a7267]">
                <span>AUTHENTICITY</span>
                <span className="text-gray-300 font-medium">100% GUARANTEED HANDLOOM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SLIDE-OUT SELLER ATELIER DRAWER (STOCK & VARIANT CONTROLS)
      ══════════════════════════════════════════════════════════════════ */}
      {isSellerDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#100f0d] border-l border-[#221e19] h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1b1814]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A87C]">
                    Seller Atelier Studio
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">Inventory & Stock Controls</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSellerDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#181511] border border-[#2a2520] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <i className="ri-close-line text-sm" />
                </button>
              </div>

              {/* Action Button: Add Variant */}
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="ri-add-circle-line text-base" />
                Craft New Product Variant
              </button>

              {/* Base Product Stock Card */}
              <div className="p-4 rounded-xl bg-[#14120e] border border-[#221e19] space-y-2.5">
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
                    className="flex-1 bg-[#080806] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#C6A87C]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveBaseStock}
                    disabled={isUpdatingStock}
                    className="px-4 py-2 rounded-xl bg-[#1c1914] border border-[#C6A87C]/50 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#080806] transition-all text-xs font-bold uppercase cursor-pointer"
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
                  <span className="text-[10px] text-[#7a7267]">
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
                          className="p-3 rounded-xl bg-[#14120e] border border-[#221e19] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-12 rounded-lg bg-[#080806] border border-[#2a2520] overflow-hidden shrink-0">
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
                                    className="text-[10px] bg-[#1a1712] border border-[#3a342c] px-1.5 py-0.5 rounded text-gray-200"
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
                              className="w-16 bg-[#080806] border border-[#2a2520] rounded-lg px-2 py-1 text-xs text-white font-mono outline-none focus:border-[#C6A87C]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveVariantStock(v._id)}
                              className="px-2.5 py-1 rounded-lg bg-[#1c1914] border border-[#C6A87C]/40 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#080806] transition-all text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#8a8278] italic p-3 bg-[#14120e] rounded-xl border border-[#201c18]">
                    No custom variants crafted yet.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1b1814]">
              <button
                type="button"
                onClick={() => setIsSellerDrawerOpen(false)}
                className="w-full py-2 rounded-xl border border-[#2a2520] text-gray-300 hover:text-white text-xs font-semibold uppercase cursor-pointer"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SELLER "ADD NEW VARIANT" MODAL (Dynamic attributes & photos)
      ══════════════════════════════════════════════════════════════════ */}
      {isAddVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#100f0d] border border-[#25211b] w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#25211b]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1814]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A87C]">
                  Atelier Crafting
                </span>
                <h3 className="text-base font-bold text-white">Add Product Variant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#181511] border border-[#2a2520] text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
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

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Name (e.g. Color)"
                      value={variantAttrKey}
                      onChange={(e) => setVariantAttrKey(e.target.value)}
                      className="w-full bg-[#080806] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Value (e.g. Blue)"
                      value={variantAttrVal}
                      onChange={(e) => setVariantAttrVal(e.target.value)}
                      className="w-full bg-[#080806] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white focus:border-[#C6A87C] outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddAttributeToDraft}
                      disabled={!variantAttrKey.trim() || !variantAttrVal.trim()}
                      className="w-full h-full py-2 rounded-xl bg-[#1c1914] border border-[#C6A87C]/40 text-[#C6A87C] hover:bg-[#C6A87C] hover:text-[#080806] text-xs font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Added attributes */}
                <div className="flex flex-wrap gap-1.5 pt-1 min-h-[28px]">
                  {Object.entries(variantAttributes).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181511] border border-[#C6A87C]/60 text-xs text-white"
                    >
                      <span className="text-[#C6A87C] font-semibold">{k}:</span> {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttributeFromDraft(k)}
                        className="text-gray-400 hover:text-red-400 ml-1 cursor-pointer"
                      >
                        <i className="ri-close-line text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#C6A87C] block">
                    Price <span className="text-[#7a7267] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder={`Inherit: ${currentProduct.price.amount}`}
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    className="w-full bg-[#080806] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                  />
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
                    className="w-full bg-[#080806] border border-[#2a2520] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#C6A87C] outline-none"
                  />
                </div>
              </div>

              {/* Visuals Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#C6A87C]">
                    Visuals <span className="text-[#7a7267] font-normal lowercase">(optional, up to 7)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#7a7267]">
                    {variantFiles.length}/7 photos
                  </span>
                </div>

                {variantFiles.length < 7 && (
                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed border-[#2a2520] hover:border-[#C6A87C]/60 bg-[#080806] cursor-pointer transition-colors text-center">
                    <i className="ri-upload-cloud-line text-lg text-[#C6A87C]" />
                    <span className="text-xs text-gray-300 mt-0.5">
                      Upload variant-specific photos
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
                        className="relative w-12 h-14 rounded-lg overflow-hidden border border-[#2a2520] bg-[#080806] group"
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

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1b1814]">
                <button
                  type="button"
                  onClick={() => setIsAddVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#2a2520] text-gray-300 text-xs font-semibold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVariant || Object.keys(variantAttributes).length === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingVariant ? 'Crafting...' : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Guest Authentication Prompt Modal ── */}
      {authPromptProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#100f0d] border border-[#25211b] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#181511] border border-[#C6A87C]/40 flex items-center justify-center text-[#C6A87C] mx-auto">
              <i className="ri-vip-crown-2-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sign In to Continue</h3>
              <p className="text-xs text-[#8a8278] mt-1">
                Please sign in to your patron account to reserve this couture piece.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider block"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-[#14120e] border border-[#2a2520] text-gray-300 text-xs font-semibold uppercase tracking-wider block"
              >
                Create Account
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAuthPromptProduct(null)}
              className="text-xs text-[#665f55] hover:text-gray-400 cursor-pointer block mx-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Order Reserved Modal ── */}
      {purchaseSuccessProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#100f0d] border border-[#25211b] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <i className="ri-checkbox-circle-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Acquisition Reserved</h3>
              <p className="text-xs text-[#8a8278] mt-1">
                "{purchaseSuccessProduct.title}" (Qty: {quantity}) has been reserved for{' '}
                {formatCurrency(activePrice * quantity, activeCurrency)}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPurchaseSuccessProduct(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider cursor-pointer"
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
