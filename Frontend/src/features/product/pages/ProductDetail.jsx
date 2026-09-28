import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/hook/useCart';
import { getImageUrl } from '../../../utils/image';
import { CraftVariantModal } from '../components/CraftVariantModal';
import { DeleteProductModal } from '../components/DeleteProductModal';
import { ManageDiscountModal } from '../components/ManageDiscountModal';

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
    handleDeleteProduct,
    handleUpdateProductDiscount,
    handleGetAllProducts,
    allProducts,
    currentProduct,
    loading: apiLoading,
    error: apiError,
  } = useProduct();

  const { handleAddItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Active Variant State (null strictly = Authentic Base Product by default)
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Drawers & Modals
  const [isSellerDrawerOpen, setIsSellerDrawerOpen] = useState(false);
  const [isAddVariantModalOpen, setIsAddVariantModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [authPromptProduct, setAuthPromptProduct] = useState(null);
  const [purchaseSuccessProduct, setPurchaseSuccessProduct] = useState(null);
  const [bagToast, setBagToast] = useState(null);

  const handleDetailConfirmDelete = async (productId) => {
    await handleDeleteProduct(productId);
    navigate(user?.role === 'seller' ? '/seller/dashboard' : '/');
  };

  const handleDetailSaveDiscount = async (productId, data) => {
    await handleUpdateProductDiscount(productId, data);
    handleGetProductDetails(productId);
    setStockFeedback('Pricing and discount updated successfully.');
    setTimeout(() => setStockFeedback(null), 3500);
  };
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id) {
      handleGetProductDetails(id).catch(() => {});
    }
  }, [id]);

  // Load all products for similar recommendations if not already in store
  useEffect(() => {
    if (!allProducts || allProducts.length === 0) {
      handleGetAllProducts().catch(() => {});
    }
  }, [allProducts]);

  // Curate similar pieces (excluding the current active piece)
  const similarProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    return allProducts.filter((p) => p && p._id && p._id !== id).slice(0, 4);
  }, [allProducts, id]);

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
  // Luxury color hex mapping for dynamic swatch indicators
  const COLOR_HEX_MAP = {
    ivory: '#FFFFF0',
    white: '#FFFFFF',
    cream: '#FFFDD0',
    black: '#121110',
    noir: '#121110',
    red: '#B91C1C',
    crimson: '#991B1B',
    ruby: '#9B111E',
    maroon: '#800000',
    emerald: '#047857',
    green: '#15803D',
    blue: '#1D4ED8',
    royal: '#1E40AF',
    navy: '#0F172A',
    gold: '#D4AF37',
    yellow: '#EAB308',
    pink: '#EC4899',
    rose: '#E11D48',
    purple: '#7E22CE',
    silver: '#CBD5E1',
    grey: '#64748B',
    gray: '#64748B',
    beige: '#F5F5DC',
    brown: '#78350F',
    champagne: '#F7E7CE',
    bronze: '#CD7F32',
    copper: '#B87333',
    rust: '#B7410E',
    teal: '#0D9488',
    olive: '#808000',
  };

  const getColorHex = (colorStr) => {
    if (!colorStr || typeof colorStr !== 'string') return null;
    const lower = colorStr.toLowerCase().trim();
    for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
      if (lower.includes(key)) return hex;
    }
    return null;
  };

  // Base piece label (clean luxury provenance)
  const baseOptionLabel = useMemo(() => {
    return 'Original Masterpiece';
  }, []);

  // Build clean, intuitive list of all selectable options with rich metadata
  const variantOptions = useMemo(() => {
    const baseThumb = getImageUrl(currentProduct?.images?.[0], 160) || '';
    const basePrice = Number(currentProduct?.price?.amount) || 0;

    const options = [
      {
        id: 'base',
        label: baseOptionLabel,
        isBase: true,
        variant: null,
        price: basePrice,
        priceDiff: 0,
        currency: currentProduct?.price?.currency || 'INR',
        stock: currentProduct?.stock || 0,
        thumbnail: baseThumb,
        attributes: { Edition: 'Master Atelier Base Piece' },
        colorName: null,
        colorHex: null,
      },
    ];

    availableVariants.forEach((v, idx) => {
      const attrs = getVariantAttributes(v);
      const colorVal = attrs.Color || attrs.Colour || null;
      const sizeVal = attrs.Size || null;

      let label = '';
      if (colorVal && sizeVal) {
        label = `${colorVal} • Size ${sizeVal}`;
      } else if (colorVal) {
        label = colorVal;
      } else if (sizeVal) {
        label = `Size ${sizeVal}`;
      } else {
        label = Object.values(attrs).join(' • ') || `Custom Edition #${idx + 1}`;
      }

      const vPrice = v.price?.amount !== undefined && v.price?.amount !== null
        ? Number(v.price.amount)
        : basePrice;
      const priceDiff = vPrice - basePrice;
      const vThumb = getImageUrl(v.images?.[0] || currentProduct?.images?.[0], 160) || baseThumb;

      options.push({
        id: v._id || `variant-${idx}`,
        label,
        isBase: false,
        variant: v,
        price: vPrice,
        priceDiff,
        currency: v.price?.currency || currentProduct?.price?.currency || 'INR',
        stock: v.stock ?? 0,
        thumbnail: vThumb,
        attributes: attrs,
        colorName: colorVal,
        colorHex: getColorHex(colorVal),
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

  // Active Discount & Original MRP
  const activeDiscount = useMemo(() => {
    if (selectedVariant && selectedVariant.discount !== undefined && selectedVariant.discount !== null) {
      return Number(selectedVariant.discount) || 0;
    }
    return Number(currentProduct?.discount) || 0;
  }, [selectedVariant, currentProduct]);

  const activeOriginalPrice = useMemo(() => {
    if (selectedVariant && selectedVariant.originalPrice) {
      return Number(selectedVariant.originalPrice);
    }
    return currentProduct?.originalPrice ? Number(currentProduct.originalPrice) : null;
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
  const handleAddToCart = async () => {
    if (!user) {
      setAuthPromptProduct(currentProduct);
      return;
    }
    setIsAddingToCart(true);
    try {
      await handleAddItem({
        productId: currentProduct._id,
        variantId: selectedVariant?._id || null,
        quantity,
      });

      const specsSummary = selectedVariant
        ? Object.entries(getVariantAttributes(selectedVariant))
            .map(([k, v]) => `${k}: ${v}`)
            .join(' • ')
        : 'Atelier Master Piece';

      setBagToast({
        title: currentProduct.title,
        image: heroImageUrl || getImageUrl(currentProduct?.images?.[0], 200),
        specs: specsSummary,
        price: activePrice,
        currency: activeCurrency,
        quantity,
      });
      setTimeout(() => setBagToast(null), 4000);
    } catch (err) {
      setStockFeedback(err.response?.data?.message || err.message || 'Failed to add item to bag');
      setTimeout(() => setStockFeedback(null), 3500);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      setAuthPromptProduct(currentProduct);
      return;
    }
    try {
      await handleAddItem({
        productId: currentProduct._id,
        variantId: selectedVariant?._id || null,
        quantity,
      });
      navigate('/cart');
    } catch (err) {
      setStockFeedback(err.response?.data?.message || err.message || 'Failed to reserve piece');
      setTimeout(() => setStockFeedback(null), 3500);
    }
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
      <div className="min-h-screen w-full bg-[var(--bg-canvas)] flex flex-col items-center justify-center font-sans text-[var(--text-primary)] transition-colors duration-300">
        <Navbar variant={isSeller ? 'seller' : 'default'} subtitle="Piece Details" />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center text-[var(--accent-gold)] animate-pulse shadow-sm">
            <i className="ri-vip-crown-2-line text-xl" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[var(--accent-gold)] font-medium">
            Loading Haute Couture Piece...
          </span>
        </div>
      </div>
    );
  }

  if (apiError && !currentProduct) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg-canvas)] flex flex-col font-sans text-[var(--text-primary)] transition-colors duration-300">
        <Navbar variant={isSeller ? 'seller' : 'default'} subtitle="Piece Details" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Piece Not Found</h2>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mb-6">{apiError}</p>
          <Link
            to={isSeller ? '/seller/dashboard' : '/'}
            className="btn-gold px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm inline-block"
            style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
          >
            Return to {isSeller ? 'Dashboard' : 'Catalog'}
          </Link>
        </div>
      </div>
    );
  }

  if (!currentProduct) return null;

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] font-sans text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-glow)] transition-colors duration-300">
      
      {/* ── SEO Metadata ── */}
      <SEO
        title={currentProduct.title}
        description={currentProduct.description}
        image={heroImageUrl}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: currentProduct.title,
          description: currentProduct.description,
          image: heroImageUrl,
          offers: {
            '@type': 'Offer',
            price: activePrice,
            priceCurrency: activeCurrency,
            availability: activeStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }}
      />

      {/* ── Fixed Header ── */}
      <Navbar
        variant={isSeller ? 'seller' : 'default'}
        subtitle={isSeller ? 'Atelier Studio' : 'Haute Couture'}
      />

      {/* ── Rich Toast Notification (Small Image, Name, Short Info, View Bag CTA) ── */}
      {bagToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--accent-gold)]/60 rounded-2xl p-3.5 sm:p-4 shadow-[0_15px_45px_rgba(0,0,0,0.5)] flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Garment Image */}
          <div className="w-13 h-16 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] overflow-hidden shrink-0">
            <img
              src={bagToast.image}
              alt={bagToast.title}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent-gold)] flex items-center gap-1">
                <i className="ri-checkbox-circle-fill text-emerald-400 text-xs" />
                Added to Shopping Bag
              </span>
              <button
                type="button"
                onClick={() => setBagToast(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer p-0.5"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-[var(--text-primary)] tracking-tight truncate mt-0.5">
              {bagToast.title}
            </h4>

            <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
              {bagToast.specs}
            </p>

            <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--border-subtle)]">
              <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                {formatCurrency(bagToast.price * bagToast.quantity, bagToast.currency)}
              </span>
              <Link
                to="/cart"
                className="btn-gold px-3.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:opacity-95 transition-opacity shadow-xs"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
              >
                View Bag
              </Link>
            </div>
          </div>
        </div>
      )}

      {stockFeedback && (
        <div className="fixed top-20 right-6 z-50 bg-[var(--bg-card)] border border-emerald-500/50 text-emerald-400 text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-300">
          <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
          <span>{stockFeedback}</span>
        </div>
      )}

      {/* ── Main Hero Stage Container (Centered, balanced margins on all 4 sides) ── */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 flex flex-col">
        
        {/* Top bar: Left Back Navigation + Right Atelier Curator Suite */}
        <div className="flex items-center justify-between pb-3 shrink-0 flex-wrap gap-3 border-b border-[var(--border-subtle)] mb-5">
          <div className="flex items-center gap-3">
            <Link
              to={isSeller ? '/seller/dashboard' : '/'}
              className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors uppercase tracking-widest font-semibold group"
            >
              <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" />
              <span>Back to {isSeller ? 'Dashboard' : 'Catalog'}</span>
            </Link>
            {isSeller && (
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-dim)]">
                Atelier Studio Piece
              </span>
            )}
          </div>

          {canManageVariants && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-card)]/90 border border-[var(--border-card)] shadow-xs flex-wrap">
              {/* Craft Variant Edition */}
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 cursor-pointer hover:opacity-95 active:scale-95 transition-all text-black"
                style={{ background: 'var(--accent-gradient)' }}
                title="Craft and publish a new variant edition for this piece"
              >
                <i className="ri-add-line font-bold text-xs" />
                <span>Craft Edition</span>
              </button>

              {/* Pricing & Discount */}
              <button
                type="button"
                onClick={() => setIsDiscountDialogOpen(true)}
                className="px-3 py-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-amber-300 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Manage Pricing, MRP & Discount"
              >
                <i className="ri-percent-line text-xs" />
                <span>Discount {currentProduct.discount > 0 ? `(${currentProduct.discount}%)` : ''}</span>
              </button>

              {/* Seller Inventory Drawer */}
              <button
                type="button"
                onClick={() => setIsSellerDrawerOpen(true)}
                className="px-3 py-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Inspect and adjust inventory per edition"
              >
                <i className="ri-equalizer-line text-xs" />
                <span>Stock Units</span>
                {availableVariants.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-[var(--accent-glow)] border border-[var(--accent-gold)]/40 text-[10px] font-mono text-[var(--accent-gold)]">
                    {availableVariants.length + 1}
                  </span>
                )}
              </button>

              {/* Retire / Delete Piece */}
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-8 h-8 rounded-xl hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Retire & Delete Piece from Atelier"
              >
                <i className="ri-delete-bin-line text-sm" />
              </button>
            </div>
          )}
        </div>

        {/* ── Perfectly Aligned Two-Column Stage ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
          
          {/* ════════════════════════════════════════════════════════════════
              LEFT COLUMN: VERTICAL THUMBNAILS + LARGE HERO IMAGE
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-24 flex flex-row gap-3 items-start">
            
            {/* 1. Vertical Thumbnail Rail on the Far Left */}
            {activeImages && activeImages.length > 1 && (
              <div className="flex flex-col gap-2 shrink-0 overflow-y-auto overflow-x-hidden max-h-[620px] no-scrollbar w-14 sm:w-16 py-0.5 px-0.5 select-none">
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
                      onMouseEnter={() => {
                        setActiveImageIndex(idx);
                        setImgLoadError(false);
                      }}
                      className={`group relative aspect-[3/4] w-full rounded-xl bg-[var(--bg-card-subtle)] overflow-hidden transition-all duration-300 ease-out cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-[var(--accent-gold)] opacity-100 shadow-[0_0_12px_var(--accent-glow)]'
                          : 'ring-1 ring-[var(--border-card)] opacity-60 hover:opacity-100 hover:ring-[var(--accent-gold)]/60'
                      }`}
                    >
                      <img
                        src={thumb}
                        alt=""
                        className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Primary Hero Image Frame */}
            <div className="relative flex-1 w-full aspect-[3/4] max-h-[640px] rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden shadow-xl flex items-center justify-center group min-h-[300px]">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt={currentProduct.title}
                  onError={() => setImgLoadError(true)}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--text-dim)]">
                  <i className="ri-vip-crown-2-line text-3xl mb-2 text-[var(--accent-gold)]" />
                  <span className="text-xs uppercase tracking-widest text-[var(--accent-gold)] font-semibold">
                    VASTRA LOOM
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1">{currentProduct.title}</span>
                </div>
              )}

              {/* Discreet Brand Badge */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#C6A87C]">
                  VASTRA LOOM
                </span>
              </div>

              {/* Active Variant Indicator Overlay */}
              {selectedVariant && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-[var(--accent-gold)] text-[var(--text-on-accent)] text-[10px] font-bold uppercase tracking-wider shadow">
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
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col space-y-4">
            
            {/* 1. Header: Brand, Title, Price */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-gold)] flex items-center gap-1">
                  <i className="ri-vip-crown-fill text-[10px]" />
                  HAUTE COUTURE BESPOKE
                </span>
                <span className="text-[10px] text-[var(--text-dim)] font-mono">
                  Ref: {currentProduct._id?.slice(-8)}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug">
                {currentProduct.title}
              </h1>

              {/* Price & Stock Availability Row */}
              <div className="pt-0.5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-mono tracking-tight">
                    {formatCurrency(activePrice, activeCurrency)}
                  </span>
                  {activeOriginalPrice && activeOriginalPrice > activePrice && (
                    <span className="text-sm font-mono text-[var(--text-muted)] line-through">
                      {formatCurrency(activeOriginalPrice, activeCurrency)}
                    </span>
                  )}
                  {activeDiscount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-mono font-bold text-xs shadow-xs">
                      {activeDiscount}% OFF
                    </span>
                  )}
                  {selectedVariant && (
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      (Base: {formatCurrency(currentProduct.price.amount, currentProduct.price.currency)})
                    </span>
                  )}
                </div>

                {/* Stock Status Pill */}
                <div className="flex items-center">
                  {activeStock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {activeStock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-800/40 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Bespoke Creation
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. DYNAMIC VARIANT / BESPOKE EDITION SELECTOR (Only rendered when multiple editions exist) */}
            {availableVariants.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                {/* Header: Title + Counter + Reset Base Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--accent-gold)]">
                      Select Variation / Edition
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]">
                      {variantOptions.length} Available
                    </span>
                  </div>

                  {selectedVariant && (
                    <button
                      type="button"
                      onClick={() => setSelectedVariant(null)}
                      className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-gold)] hover:underline transition-colors flex items-center gap-1 cursor-pointer"
                      title="Switch back to original base piece"
                    >
                      <i className="ri-arrow-go-back-line text-xs" />
                      <span>Reset to Original</span>
                    </button>
                  )}
                </div>

                {/* Luxury Variant Cards Swatches Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
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
                        className={`group relative p-2 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2.5 select-none ${
                          isActive
                            ? 'border-[var(--accent-gold)] bg-[var(--bg-card-subtle)] shadow-[0_0_14px_var(--accent-glow)] ring-1 ring-[var(--accent-gold)]'
                            : 'border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--accent-gold)]/50 hover:bg-[var(--bg-card-hover)]'
                        }`}
                      >
                        {/* Thumbnail Swatch */}
                        <div className="relative w-10 h-10 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-card)] overflow-hidden shrink-0 flex items-center justify-center">
                          {opt.thumbnail ? (
                            <img
                              src={opt.thumbnail}
                              alt=""
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <i className="ri-t-shirt-2-line text-sm text-[var(--accent-gold)]" />
                          )}
                          {opt.colorHex && (
                            <span
                              className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border border-black/80 shadow-xs"
                              style={{ backgroundColor: opt.colorHex }}
                              title={`Color: ${opt.colorName}`}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-semibold truncate block ${isActive ? 'text-[var(--accent-gold)] font-bold' : 'text-[var(--text-primary)]'}`}>
                              {opt.label}
                            </span>
                            {isActive && (
                              <span className="w-3.5 h-3.5 rounded-full bg-[var(--accent-gold)] text-[var(--text-on-accent)] flex items-center justify-center shrink-0">
                                <i className="ri-check-line text-[9px] font-bold" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                                {formatCurrency(opt.price, opt.currency)}
                              </span>
                              {opt.priceDiff !== 0 && (
                                <span
                                  className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
                                    opt.priceDiff > 0
                                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                                      : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                  }`}
                                >
                                  {opt.priceDiff > 0 ? `+${formatCurrency(opt.priceDiff, opt.currency)}` : `-${formatCurrency(Math.abs(opt.priceDiff), opt.currency)}`}
                                </span>
                              )}
                            </div>

                            {/* Stock status dot */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  opt.stock > 3 ? 'bg-emerald-400' : opt.stock > 0 ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                              />
                              <span className="text-[9px] font-mono text-[var(--text-muted)]">
                                {opt.stock > 0 ? `${opt.stock} left` : 'Sold out'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Seller Add Edition card at the end of swatches */}
                  {canManageVariants && (
                    <button
                      type="button"
                      onClick={() => setIsAddVariantModalOpen(true)}
                      className="p-2 rounded-xl border border-dashed border-[var(--accent-gold)]/40 hover:border-[var(--accent-gold)] bg-[var(--bg-card)]/40 hover:bg-[var(--accent-glow)]/15 text-[var(--accent-gold)] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[48px]"
                      title="Craft and publish another variant edition"
                    >
                      <i className="ri-add-line text-sm font-bold" />
                      <span>New Edition</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. LUXURY SPECIFICATIONS & ATTRIBUTES SHOWCASE */}
            <div className="bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-3 rounded-full bg-[var(--accent-gold)]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--accent-gold)]">
                    Piece Specifications
                  </span>
                </div>
                <span className="text-[9px] text-[var(--text-dim)] uppercase tracking-wider font-mono">
                  {selectedVariant ? 'Bespoke Customization' : 'Master Atelier Piece'}
                </span>
              </div>

              {/* Attribute Grid */}
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
                    className="flex flex-col justify-center bg-[var(--bg-card)] border border-[var(--border-card)] rounded-lg px-3 py-2 transition-all hover:border-[var(--accent-gold)]/40 shadow-xs"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)]">
                      {k}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text-primary)] tracking-wide mt-0.5 capitalize truncate">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. THE DETAILS Narrative */}
            <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)]">
                  THE DETAILS
                </span>
                <span className="text-[9px] text-[var(--text-dim)] tracking-wider uppercase">
                  Artisan Provenance
                </span>
              </div>
              <div className="max-h-20 sm:max-h-22 overflow-y-auto no-scrollbar bg-[var(--bg-card-subtle)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed select-text">
                  {currentProduct.description}
                </p>
              </div>
            </div>

            {/* 6. Quantity Stepper & Primary CTAs */}
            <div className="space-y-2 pt-1 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Quantity
                </span>
                <div className="flex items-center border border-[var(--border-card)] rounded-xl bg-[var(--bg-card)] overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 flex items-center justify-center text-[var(--accent-gold)] hover:bg-[var(--bg-card-hover)] disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <i className="ri-subtract-line text-xs" />
                  </button>
                  <span className="w-7 text-center text-xs font-mono font-bold text-[var(--text-primary)]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(activeStock || 10, q + 1))}
                    disabled={activeStock > 0 ? quantity >= activeStock : quantity >= 10}
                    className="w-7 h-7 flex items-center justify-center text-[var(--accent-gold)] hover:bg-[var(--bg-card-hover)] disabled:opacity-30 transition-colors cursor-pointer"
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
                  disabled={isAddingToCart || activeStock <= 0}
                  className="btn-gold w-full py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
                >
                  <i className={isAddingToCart ? "ri-loader-4-line animate-spin text-sm" : "ri-shopping-bag-3-line text-sm"} />
                  {isAddingToCart ? 'ADDING...' : 'ADD TO CART'}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={activeStock <= 0}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl border border-[var(--accent-gold)]/60 hover:bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <i className="ri-flashlight-line text-sm text-[var(--accent-gold)]" />
                  BUY NOW
                </button>
              </div>
            </div>

            {/* 7. Specification & Heritage Rows */}
            <div className="pt-1.5 border-t border-[var(--border-subtle)] space-y-1 text-[10px] uppercase tracking-wider">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>SHIPPING</span>
                <span className="text-[var(--text-secondary)] font-medium">COMPLIMENTARY OVER INR 15,000</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>RETURNS</span>
                <span className="text-[var(--text-secondary)] font-medium">WITHIN 14 DAYS OF DELIVERY</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>AUTHENTICITY</span>
                <span className="text-[var(--text-secondary)] font-medium">100% GUARANTEED HANDLOOM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Creations / You May Also Like Section ── */}
      {similarProducts && similarProducts.length > 0 && (
        <section className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] py-12 sm:py-16">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[var(--border-subtle)] gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent-gold)] flex items-center gap-1.5">
                  <i className="ri-vip-crown-fill text-xs" />
                  CURATED ATELIER COMPANIONS
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
                  You May Also Like
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md">
                  Handcrafted pieces tailored with artisanal precision in matching silks and imperial silhouettes.
                </p>
              </div>
              <Link
                to="/#catalog"
                className="text-xs text-[var(--accent-gold)] hover:underline uppercase tracking-wider font-semibold flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Explore Entire Catalog</span>
                <i className="ri-arrow-right-line" />
              </Link>
            </div>

            {/* Grid of Similar Pieces */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((prod) => {
                const thumb = getImageUrl(prod.images?.[0], 400);
                return (
                  <Link
                    key={prod._id}
                    to={`/product/${prod._id}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="group flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--accent-gold)]/60 transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Image Frame */}
                    <div className="relative aspect-[3/4] w-full bg-[var(--bg-card-subtle)] overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={prod.title}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-dim)] p-4 text-center">
                          <i className="ri-vip-crown-2-line text-2xl text-[var(--accent-gold)]" />
                          <span className="text-[10px] uppercase tracking-widest text-[var(--accent-gold)] font-semibold mt-1">
                            VASTRA LOOM
                          </span>
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur text-[8px] font-extrabold uppercase tracking-widest text-[#C6A87C] border border-white/10">
                          BESPOKE
                        </span>
                      </div>
                    </div>

                    {/* Card Meta */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium block">
                          ATELIER CREATION
                        </span>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors line-clamp-1 mt-0.5">
                          {prod.title}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                          {formatCurrency(prod.price?.amount, prod.price?.currency)}
                        </span>
                        <span className="text-[10px] text-[var(--accent-gold)] flex items-center gap-1 font-semibold uppercase tracking-wider">
                          <span>View Piece</span>
                          <i className="ri-arrow-right-line" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
              </div>
            </div>
          </section>
        )}

      {/* ══════════════════════════════════════════════════════════════════
          SLIDE-OUT SELLER ATELIER DRAWER (STOCK & VARIANT CONTROLS)
      ══════════════════════════════════════════════════════════════════ */}
      {isSellerDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[var(--bg-modal-backdrop)] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[var(--bg-modal)] border-l border-[var(--border-card)] h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)]">
                    Seller Atelier Studio
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">Inventory & Stock Controls</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSellerDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
                >
                  <i className="ri-close-line text-sm" />
                </button>
              </div>

              {/* Action Button: Add Variant */}
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(true)}
                className="btn-gold w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
              >
                <i className="ri-add-circle-line text-base" />
                Craft New Product Variant
              </button>

              {/* Base Product Stock Card */}
              <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    Base Piece Stock
                  </h4>
                  <span className="text-xs font-mono text-[var(--accent-gold)] font-semibold">
                    Current: {currentProduct.stock || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={baseStockInput}
                    onChange={(e) => setBaseStockInput(e.target.value)}
                    className="flex-1 bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-gold)]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveBaseStock}
                    disabled={isUpdatingStock}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-gold)]/50 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--text-on-accent)] transition-all text-xs font-bold uppercase cursor-pointer"
                  >
                    Save Stock
                  </button>
                </div>
              </div>

              {/* Variants Stock & Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                    Crafted Variants ({availableVariants.length})
                  </h4>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Variant specific visuals & valuation
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
                          className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-12 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-card)] overflow-hidden shrink-0">
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
                                    className="text-[10px] bg-[var(--bg-card)] border border-[var(--border-card)] px-1.5 py-0.5 rounded text-[var(--text-secondary)]"
                                  >
                                    <strong className="text-[var(--accent-gold)]">{k}:</strong> {val}
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-0.5">
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
                              className="w-16 bg-[var(--bg-input)] border border-[var(--border-card)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] font-mono outline-none focus:border-[var(--accent-gold)]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveVariantStock(v._id)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--text-on-accent)] transition-all text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] italic p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-subtle)]">
                    No custom variants crafted yet.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setIsSellerDrawerOpen(false)}
                className="w-full py-2 rounded-xl border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold uppercase cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-modal-backdrop)] backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[var(--bg-modal)] border border-[var(--border-card)] w-full max-w-lg rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[var(--border-card)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)]">
                  Atelier Crafting
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Add Product Variant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVariantModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[var(--bg-card-subtle)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
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
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--accent-gold)] block">
                  Dynamic Attributes <span className="text-red-400">* (At least 1 required)</span>
                </label>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Name (e.g. Color)"
                      value={variantAttrKey}
                      onChange={(e) => setVariantAttrKey(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent-gold)] outline-none"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Value (e.g. Blue)"
                      value={variantAttrVal}
                      onChange={(e) => setVariantAttrVal(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--accent-gold)] outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddAttributeToDraft}
                      disabled={!variantAttrKey.trim() || !variantAttrVal.trim()}
                      className="w-full h-full py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--text-on-accent)] text-xs font-bold uppercase transition-all disabled:opacity-40 cursor-pointer"
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--accent-gold)]/60 text-xs text-[var(--text-primary)]"
                    >
                      <span className="text-[var(--accent-gold)] font-semibold">{k}:</span> {v}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttributeFromDraft(k)}
                        className="text-[var(--text-muted)] hover:text-red-400 ml-1 cursor-pointer"
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
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-gold)] block">
                    Price <span className="text-[var(--text-muted)] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder={`Inherit: ${currentProduct.price.amount}`}
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent-gold)] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-gold)] block">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variantStock}
                    onChange={(e) => setVariantStock(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] font-mono focus:border-[var(--accent-gold)] outline-none"
                  />
                </div>
              </div>

              {/* Visuals Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                    Visuals <span className="text-[var(--text-muted)] font-normal lowercase">(optional, up to 7)</span>
                  </label>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    {variantFiles.length}/7 photos
                  </span>
                </div>

                {variantFiles.length < 7 && (
                  <label className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed border-[var(--border-card)] hover:border-[var(--accent-gold)]/60 bg-[var(--bg-input)] cursor-pointer transition-colors text-center">
                    <i className="ri-upload-cloud-line text-lg text-[var(--accent-gold)]" />
                    <span className="text-xs text-[var(--text-secondary)] mt-0.5">
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
                        className="relative w-12 h-14 rounded-lg overflow-hidden border border-[var(--border-card)] bg-[var(--bg-card)] group"
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
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-card)] text-[var(--text-secondary)] text-xs font-semibold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVariant || Object.keys(variantAttributes).length === 0}
                  className="btn-gold px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-modal-backdrop)] backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[var(--bg-modal)] border border-[var(--border-card)] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--accent-gold)]/40 flex items-center justify-center text-[var(--accent-gold)] mx-auto shadow-md">
              <i className="ri-vip-crown-2-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Sign In to Continue</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Please sign in to your patron account to reserve this couture piece.
              </p>
            </div>
            <div className="space-y-2">
              <Link
                to="/login"
                className="btn-gold w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider block shadow-xs"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider block"
              >
                Create Account
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setAuthPromptProduct(null)}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] cursor-pointer block mx-auto"
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

      {/* ── Craft Variant Modal ── */}
      <CraftVariantModal
        isOpen={isAddVariantModalOpen}
        onClose={() => setIsAddVariantModalOpen(false)}
        product={currentProduct}
        onSuccess={() => {
          handleGetProductDetails(id);
          setStockFeedback('New edition crafted and published successfully!');
          setTimeout(() => setStockFeedback(null), 3500);
        }}
      />

      {/* ── Manage Discount Modal ── */}
      <ManageDiscountModal
        isOpen={isDiscountDialogOpen}
        onClose={() => setIsDiscountDialogOpen(false)}
        product={currentProduct}
        onSaveDiscount={handleDetailSaveDiscount}
      />

      {/* ── Delete Product Confirmation Modal ── */}
      <DeleteProductModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        product={currentProduct}
        onConfirmDelete={handleDetailConfirmDelete}
      />
    </div>
  );
};

export default ProductDetail;
