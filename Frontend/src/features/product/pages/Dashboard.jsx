import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import Navbar from '../../../components/Navbar';
import ShinyText from '../../../components/ShinyText';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hooks/useAuth';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', CAD: 'CA$' };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol} ${Number(amount).toLocaleString('en-IN')}`;
};

const formatDate = (isoString) => {
  if (!isoString) return 'Recent Drop';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

import { getImageUrl } from '../../../utils/image';
import { CraftVariantModal } from '../components/CraftVariantModal';
import { DeleteProductModal } from '../components/DeleteProductModal';
import { ManageDiscountModal } from '../components/ManageDiscountModal';

const ProductGridCard = ({ product, onInspect, onAddVariant, onManageDiscount, onDeleteProduct }) => {
  const [imgError, setImgError] = useState(false);
  const coverUrl = getImageUrl(product?.images?.[0]);
  const imageCount = product?.images?.length || 0;
  const variantCount = product?.variants?.length || 0;
  const hasDiscount = Boolean(product?.discount > 0);
  const hasOriginalPrice = Boolean(product?.originalPrice > product?.price?.amount);

  return (
    <div className="group relative rounded-2xl bg-[#100f0d] border border-[#2a2520] hover:border-[#C6A87C]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_40px_rgba(198,168,124,0.1)]">
      {/* Image Showcase Container */}
      <div className="relative aspect-[3/4] w-full bg-[#080806] overflow-hidden">
        {coverUrl && !imgError ? (
          <img
            src={coverUrl}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#12100d] select-none">
            <div className="w-12 h-12 rounded-xl bg-[#1c1914] border border-[#2a2520] flex items-center justify-center text-[#C6A87C] mb-2 shadow-inner">
              <i className="ri-vip-crown-2-line text-xl" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C6A87C]">
              VASTRA LOOM
            </span>
            <span className="text-xs text-[#8a8278] truncate max-w-full mt-1 font-medium">
              {product.title}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#100f0d] via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Badges Over Image */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-extrabold uppercase tracking-widest text-[#C6A87C]">
              Vastra Loom
            </span>
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-md bg-[#C6A87C] text-[#080806] font-extrabold font-mono text-[9px] uppercase tracking-wider shadow-sm">
                {product.discount}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {variantCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[#C6A87C] text-[10px] font-mono border border-[#C6A87C]/40 shadow-sm">
                <i className="ri-stack-line text-xs" />
                {variantCount} Variant{variantCount > 1 ? 's' : ''}
              </span>
            )}
            {imageCount > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-gray-200 text-[10px] font-mono border border-[#3a342c] shadow-sm">
                <i className="ri-image-2-line text-xs text-[#C6A87C]" />
                {imageCount}
              </span>
            )}
          </div>
        </div>

        {/* Hover Quick Action Overlay: High-fashion single Inspect Piece CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/55 backdrop-blur-xs px-3">
          <Link
            to={`/seller/product/${product._id}`}
            className="px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-[#C6A87C]/60 hover:border-[#C6A87C] text-white hover:text-[#C6A87C] text-xs font-semibold uppercase tracking-widest transition-all duration-200 shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            title="Inspect Piece Details & Variants"
          >
            <i className="ri-eye-line text-sm text-[#C6A87C]" />
            <span>Inspect Piece</span>
          </Link>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-5 space-y-3 relative z-10 bg-[#100f0d]">
        <div className="flex items-center justify-between text-[11px] text-[#6e675f]">
          <span className="font-mono">{formatDate(product.createdAt)}</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        <div>
          <Link to={`/seller/product/${product._id}`}>
            <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1 hover:text-[#C6A87C] transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="text-xs text-[#8a8278] line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price and Footer Row */}
        <div className="pt-2 border-t border-[#231f1a] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6e675f] block font-mono text-[10px] uppercase">
              Valuation
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight font-mono">
                {formatCurrency(product?.price?.amount, product?.price?.currency)}
              </span>
              {hasOriginalPrice && (
                <span className="text-xs text-[#8a8278] line-through font-mono">
                  {formatCurrency(product?.originalPrice, product?.price?.currency)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddVariant(product);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#181511] border border-[#C6A87C]/40 hover:bg-[#C6A87C] hover:text-[#080806] text-[#C6A87C] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              title="Add Variant to this piece"
            >
              <i className="ri-add-line text-xs font-bold" />
              <span>+ Variant</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onManageDiscount(product);
              }}
              className="px-2 py-1.5 rounded-lg bg-[#181511] border border-amber-600/40 hover:bg-amber-600 hover:text-black text-amber-300 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-1"
              title="Manage Discount & Pricing"
            >
              <i className="ri-percent-line text-xs" />
              <span>Disc</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProduct(product);
              }}
              className="p-1.5 px-2 rounded-lg border border-rose-900/40 hover:bg-rose-950/80 hover:border-rose-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="Permanently Delete Piece"
            >
              <i className="ri-delete-bin-line text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    handleGetSellerProduct,
    handleDeleteProduct,
    handleUpdateProductDiscount,
    loading,
    error,
    sellerProducts = []
  } = useProduct();

  // Local UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-desc' | 'price-asc' | 'title'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [copiedId, setCopiedId] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState(null);
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [discountModalProduct, setDiscountModalProduct] = useState(null);
  const [variantSuccessToast, setVariantSuccessToast] = useState(null);

  const handleConfirmDelete = async (productId) => {
    await handleDeleteProduct(productId);
    setVariantSuccessToast('Piece permanently retired and deleted from Atelier.');
    setTimeout(() => setVariantSuccessToast(null), 4000);
  };

  const handleSaveDiscount = async (productId, data) => {
    await handleUpdateProductDiscount(productId, data);
    setVariantSuccessToast('Pricing and discount updated successfully.');
    setTimeout(() => setVariantSuccessToast(null), 4000);
    handleGetSellerProduct();
  };

  // Fetch products on mount
  useEffect(() => {
    handleGetSellerProduct();
  }, []);

  // Compute Metrics
  const metrics = useMemo(() => {
    const totalCount = sellerProducts.length;
    const totalValuation = sellerProducts.reduce((sum, item) => {
      return sum + (Number(item?.price?.amount) || 0);
    }, 0);
    const avgPrice = totalCount > 0 ? Math.round(totalValuation / totalCount) : 0;
    const totalImages = sellerProducts.reduce((sum, item) => {
      return sum + (item?.images?.length || 0);
    }, 0);

    return { totalCount, totalValuation, avgPrice, totalImages };
  }, [sellerProducts]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...sellerProducts];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'price-desc') {
        return (Number(b?.price?.amount) || 0) - (Number(a?.price?.amount) || 0);
      }
      if (sortBy === 'price-asc') {
        return (Number(a?.price?.amount) || 0) - (Number(b?.price?.amount) || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [sellerProducts, searchTerm, sortBy]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#080806] font-sans text-gray-100 flex flex-col selection:bg-[#C6A87C]/30 selection:text-[#fff8e7]">
      {/* ── Top Navigation Bar ── */}
      <Navbar variant="seller" subtitle="Atelier Dashboard" />

      {/* ── Main Dashboard Workspace ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* ── Hero Welcome Strip ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#2a2520]">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12100d] border border-[#2a2520] text-[10px] font-mono tracking-widest uppercase text-[#C6A87C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6A87C] animate-pulse" />
              <span>Atelier Creator Suite</span>
              <span className="text-[#5a5651]">•</span>
              <span>{user?.fullname || 'Verified Seller'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight">
              Curated Collections{' '}
              <ShinyText
                text="VASTRA LOOM"
                color="#C6A87C"
                shineColor="#fff8e7"
                speed={3}
                className="font-semibold"
              />
            </h1>
            <p className="text-xs sm:text-sm text-[#8a8278] max-w-2xl leading-relaxed">
              Manage your published high-fashion pieces, inspect media assets, monitor portfolio valuation, and launch new catalog drops.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleGetSellerProduct()}
              disabled={loading}
              title="Refresh collections"
              className="p-3 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className={`ri-refresh-line text-base ${loading ? 'animate-spin text-[#C6A87C]' : ''}`} />
            </button>

            <Link
              to="/seller/create-product"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#080806] text-xs sm:text-sm font-bold tracking-wider uppercase shadow-[0_0_24px_rgba(198,168,124,0.25)] hover:shadow-[0_0_36px_rgba(198,168,124,0.4)] active:scale-[0.99] transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <i className="ri-add-line text-base font-bold" />
              <span>New Creation</span>
            </Link>
          </div>
        </div>

        {/* ── KPI Analytics Overview Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Pieces */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#100f0d] border border-[#2a2520] relative overflow-hidden group hover:border-[#C6A87C]/40 transition-colors">
            <div className="flex items-center justify-between text-[#8a8278] text-xs">
              <span className="uppercase font-semibold tracking-wider text-[10px]">Catalogued Pieces</span>
              <div className="w-8 h-8 rounded-lg bg-[#181511] border border-[#2a2520] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-shirt-line text-sm" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                {metrics.totalCount}
              </span>
              <span className="text-xs text-[#6e675f] ml-1.5 font-medium">Creations</span>
            </div>
          </div>

          {/* Card 2: Portfolio Valuation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#100f0d] border border-[#2a2520] relative overflow-hidden group hover:border-[#C6A87C]/40 transition-colors">
            <div className="flex items-center justify-between text-[#8a8278] text-xs">
              <span className="uppercase font-semibold tracking-wider text-[10px]">Portfolio Valuation</span>
              <div className="w-8 h-8 rounded-lg bg-[#181511] border border-[#2a2520] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-money-dollar-circle-line text-sm" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                ₹ {metrics.totalValuation.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Card 3: Average Price Point */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#100f0d] border border-[#2a2520] relative overflow-hidden group hover:border-[#C6A87C]/40 transition-colors">
            <div className="flex items-center justify-between text-[#8a8278] text-xs">
              <span className="uppercase font-semibold tracking-wider text-[10px]">Average Price Point</span>
              <div className="w-8 h-8 rounded-lg bg-[#181511] border border-[#2a2520] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-price-tag-3-line text-sm" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                ₹ {metrics.avgPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[#6e675f] ml-1.5 font-medium">/ item</span>
            </div>
          </div>

          {/* Card 4: Curated Imagery */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#100f0d] border border-[#2a2520] relative overflow-hidden group hover:border-[#C6A87C]/40 transition-colors">
            <div className="flex items-center justify-between text-[#8a8278] text-xs">
              <span className="uppercase font-semibold tracking-wider text-[10px]">Curated Visuals</span>
              <div className="w-8 h-8 rounded-lg bg-[#181511] border border-[#2a2520] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-image-2-line text-sm" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
                {metrics.totalImages}
              </span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                100% Live
              </span>
            </div>
          </div>
        </div>

        {/* ── Search, Sort, and View Controls ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-3 rounded-2xl bg-[#0d0c0b] border border-[#2a2520]">
          {/* Search Box */}
          <div className="relative flex-1 group max-w-md">
            <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5651] group-focus-within:text-[#C6A87C] transition-colors text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pieces by title, fabric, or craft narrative..."
              className="w-full pl-10 pr-9 py-2 bg-[#12100d] border border-[#2a2520] rounded-xl text-xs sm:text-sm text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/70 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
              >
                <i className="ri-close-line text-sm" />
              </button>
            )}
          </div>

          {/* Right Controls: Sort Dropdown & Layout Mode Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 bg-[#12100d] border border-[#2a2520] rounded-xl text-xs font-medium text-gray-200 focus:outline-none focus:border-[#C6A87C]/70 transition-colors appearance-none cursor-pointer"
              >
                <option value="newest" className="bg-[#12100d]">Newest Drops</option>
                <option value="price-desc" className="bg-[#12100d]">Price: High to Low</option>
                <option value="price-asc" className="bg-[#12100d]">Price: Low to High</option>
                <option value="title" className="bg-[#12100d]">Title: A to Z</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xs" />
            </div>

            {/* Layout Toggle (Grid vs Table) */}
            <div className="flex items-center p-1 rounded-xl bg-[#12100d] border border-[#2a2520]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Cinematic Grid View"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#C6A87C] text-[#080806] shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="ri-grid-fill text-xs" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Studio Table View"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#C6A87C] text-[#080806] shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="ri-list-check-2 text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Error Notification Banner if any ── */}
        {error && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0">
                <i className="ri-shield-user-line text-sm" />
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {error.toLowerCase().includes('unauthorized') ? 'Seller Authentication Required' : 'Catalogue Sync Notice'}
                </h4>
                <p className="text-[11px] text-[#a89d90] mt-0.5">
                  {error.toLowerCase().includes('unauthorized')
                    ? 'Please log in with your verified seller credentials to access and manage live atelier pieces.'
                    : error}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {error.toLowerCase().includes('unauthorized') && (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Sign In as Seller
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleGetSellerProduct()}
                className="px-3 py-2 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 text-gray-300 hover:text-white bg-[#100f0d] text-xs transition-colors cursor-pointer"
              >
                Retry Sync
              </button>
            </div>
          </div>
        )}

        {/* ── Content View Area ── */}
        {loading && sellerProducts.length === 0 ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-[#100f0d] border border-[#2a2520] overflow-hidden animate-pulse aspect-[3/4] flex flex-col justify-between p-4"
              >
                <div className="w-full h-[60%] bg-[#1c1914] rounded-xl" />
                <div className="space-y-3 pt-4">
                  <div className="w-3/4 h-4 bg-[#1c1914] rounded" />
                  <div className="w-1/2 h-3 bg-[#1c1914] rounded" />
                  <div className="w-1/3 h-5 bg-[#1c1914] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-20 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#100f0d]/60 border border-[#2a2520] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#181511] border border-[#2a2520] flex items-center justify-center text-[#C6A87C] shadow-inner">
              <i className="ri-archive-stack-line text-3xl" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-lg font-semibold text-white">
                {searchTerm ? 'No Matching Creations Found' : 'No Creations Catalogued Yet'}
              </h3>
              <p className="text-xs text-[#8a8278] leading-relaxed">
                {searchTerm
                  ? `No pieces found matching "${searchTerm}". Try another keyword or clear the search filter.`
                  : 'Your atelier portfolio is currently empty. Create and publish your first exclusive piece to VASTRA LOOM.'}
              </p>
            </div>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <Link
                to="/seller/create-product"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
              >
                <i className="ri-add-line text-sm" />
                Create First Product
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── CINEMATIC EDITORIAL GRID ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredProducts.map((product) => (
              <ProductGridCard
                key={product._id}
                product={product}
                onAddVariant={(p) => setVariantModalProduct(p)}
                onManageDiscount={(p) => setDiscountModalProduct(p)}
                onDeleteProduct={(p) => setDeleteModalProduct(p)}
              />
            ))}
          </div>
        ) : (
          /* ── STUDIO TABLE / LIST VIEW ── */
          <div className="rounded-2xl bg-[#100f0d] border border-[#2a2520] overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2a2520] bg-[#0a0907] text-[#8a8278] uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Piece / Title</th>
                    <th className="py-3.5 px-4">Valuation</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Visuals</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Editions</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Catalogued</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#201d18]">
                  {filteredProducts.map((product) => {
                    const coverUrl = getImageUrl(product?.images?.[0]);
                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-[#14120e] transition-colors group cursor-pointer"
                        onClick={() => navigate(`/seller/product/${product._id}`)}
                      >
                        {/* Piece & Title */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-14 rounded-lg bg-[#080806] overflow-hidden shrink-0 border border-[#2a2520] flex items-center justify-center">
                              {coverUrl ? (
                                <img
                                  src={coverUrl}
                                  alt={product.title}
                                  loading="lazy"
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                      e.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                style={{ display: coverUrl ? 'none' : 'flex' }}
                                className="w-full h-full items-center justify-center bg-[#14120e] text-[#C6A87C]"
                              >
                                <i className="ri-vip-crown-2-line text-xs" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white truncate max-w-xs sm:max-w-sm group-hover:text-[#C6A87C] transition-colors">
                                {product.title}
                              </h4>
                              <span className="text-[10px] font-mono text-[#6e675f] truncate block">
                                ID: {product._id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-white text-sm">
                              {formatCurrency(product?.price?.amount, product?.price?.currency)}
                            </span>
                            {product?.originalPrice > product?.price?.amount && (
                              <span className="text-xs text-[#6e675f] line-through">
                                {formatCurrency(product?.originalPrice, product?.price?.currency)}
                              </span>
                            )}
                          </div>
                          {product?.discount > 0 && (
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-[#C6A87C]/20 border border-[#C6A87C]/40 text-[#C6A87C] text-[9px] font-bold uppercase tracking-wider">
                              {product.discount}% OFF
                            </span>
                          )}
                        </td>

                        {/* Images count */}
                        <td className="py-3.5 px-4 hidden md:table-cell text-[#8a8278] font-mono">
                          {product?.images?.length || 0} Photo{(product?.images?.length || 0) > 1 ? 's' : ''}
                        </td>

                        {/* Editions count */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#14120e] border border-[#2a2520] text-[#C6A87C]">
                            <i className="ri-stack-line text-xs" />
                            {product?.variants?.length || 0} Edition{product?.variants?.length === 1 ? '' : 's'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 hidden sm:table-cell text-[#6e675f] font-mono">
                          {formatDate(product.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            <span className="w-1 h-1 rounded-full bg-emerald-400" />
                            Live
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVariantModalProduct(product);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#14120e] border border-[#C6A87C]/40 hover:bg-[#C6A87C] hover:text-[#080806] text-[#C6A87C] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                              title="Add variant edition to this product"
                            >
                              + Var
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDiscountModalProduct(product);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#14120e] border border-amber-600/40 hover:bg-amber-600 hover:text-black text-amber-300 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                              title="Manage Discount & Pricing"
                            >
                              <i className="ri-percent-line" />
                              <span>Disc</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalProduct(product);
                              }}
                              className="p-1.5 rounded-lg border border-rose-900/40 hover:bg-rose-950/80 hover:border-rose-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              title="Retire & Delete Piece"
                            >
                              <i className="ri-delete-bin-line text-xs" />
                            </button>
                            <Link
                              to={`/seller/product/${product._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-3 py-1.5 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/60 text-gray-300 hover:text-[#C6A87C] bg-[#0d0c0b] text-[11px] font-medium transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Manage</span>
                              <i className="ri-arrow-right-up-line text-xs" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ── Craft Variant Modal ── */}
      <CraftVariantModal
        isOpen={Boolean(variantModalProduct)}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct}
        onSuccess={(updated) => {
          setVariantSuccessToast(`New edition crafted for "${variantModalProduct?.title}"!`);
          setTimeout(() => setVariantSuccessToast(null), 4000);
          handleGetSellerProduct();
        }}
      />

      {/* ── Manage Discount Modal ── */}
      <ManageDiscountModal
        isOpen={Boolean(discountModalProduct)}
        onClose={() => setDiscountModalProduct(null)}
        product={discountModalProduct}
        onSaveDiscount={handleSaveDiscount}
      />

      {/* ── Delete Product Confirmation Modal ── */}
      <DeleteProductModal
        isOpen={Boolean(deleteModalProduct)}
        onClose={() => setDeleteModalProduct(null)}
        product={deleteModalProduct}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* ── Feedback Notification Toast ── */}
      {variantSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#100f0d] border border-emerald-500/60 text-emerald-400 text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in duration-300">
          <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
          <span>{variantSuccessToast}</span>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="w-full border-t border-[#1a1713] bg-[#050504] py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5a5651]">
          <div className="flex items-center gap-2">
            <i className="ri-vip-crown-2-line text-[#C6A87C]" />
            <span className="font-semibold tracking-widest uppercase text-gray-400">
              VASTRA LOOM Atelier
            </span>
          </div>
          <p>© 2026 VASTRA LOOM Inc. High-fashion creator studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;