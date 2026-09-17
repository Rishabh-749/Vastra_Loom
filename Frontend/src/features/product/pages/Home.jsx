import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import Navbar from '../../../components/Navbar';
import ShinyText from '../../../components/ShinyText';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/hook/useCart';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', CAD: 'CA$' };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol} ${Number(amount).toLocaleString('en-IN')}`;
};

import { getImageUrl } from '../../../utils/image';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleGetAllProducts, allProducts = [], loading, error } = useProduct();
  const { handleAddItem } = useCart();

  // Local State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bagToast, setBagToast] = useState(null);

  // Authentication & Purchase Modals
  const [authPromptProduct, setAuthPromptProduct] = useState(null);
  const [purchaseSuccessProduct, setPurchaseSuccessProduct] = useState(null);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  // Filtered pieces
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => {
        const text = `${p.title} ${p.description}`.toLowerCase();
        return text.includes(selectedCategory.toLowerCase());
      });
    }

    return list;
  }, [allProducts, searchQuery, selectedCategory]);

  const handleBuyNow = (product, e) => {
    e?.stopPropagation();
    if (!user) {
      setAuthPromptProduct(product);
      return;
    }
    // If logged in, proceed with order confirmation
    setPurchaseSuccessProduct(product);
  };

  const handleAddToBag = async (product, e) => {
    e?.stopPropagation();
    if (!user) {
      setAuthPromptProduct(product);
      return;
    }
    try {
      await handleAddItem({
        productId: product._id,
        quantity: 1,
      });
      setBagToast({
        title: product.title,
        image: getImageUrl(product.images?.[0], 200),
        specs: product.description ? product.description.slice(0, 48) + '...' : 'Atelier Master Piece',
        price: product.price?.amount || 0,
        currency: product.price?.currency || 'INR',
        quantity: 1,
      });
      setTimeout(() => {
        setBagToast(null);
      }, 4000);
    } catch (err) {
      console.error("Failed to add to bag:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080806] font-sans text-gray-100 flex flex-col selection:bg-[#C6A87C]/30 selection:text-[#fff8e7]">
      {/* ── Storefront Navigation Bar ── */}
      <Navbar variant="default" />

      {/* ── Rich Toast Notification (Small Image, Name, Short Info, View Bag CTA) ── */}
      {bagToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#12100d]/95 backdrop-blur-xl border border-[#C6A87C]/60 rounded-2xl p-3.5 sm:p-4 shadow-[0_10px_40px_rgba(0,0,0,0.85)] flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-13 h-16 rounded-xl bg-[#181510] border border-[#2b251d] overflow-hidden shrink-0">
            {bagToast.image ? (
              <img
                src={bagToast.image}
                alt={bagToast.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#C6A87C]">
                <i className="ri-vip-crown-2-line text-lg" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C6A87C] flex items-center gap-1">
                <i className="ri-checkbox-circle-fill text-emerald-400 text-xs" />
                Added to Shopping Bag
              </span>
              <button
                type="button"
                onClick={() => setBagToast(null)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer p-0.5"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-white tracking-tight truncate mt-0.5">
              {bagToast.title}
            </h4>

            <p className="text-[10px] text-[#8a8278] truncate mt-0.5">
              {bagToast.specs}
            </p>

            <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#1f1b15]">
              <span className="text-xs font-mono font-bold text-white">
                {formatCurrency(bagToast.price * bagToast.quantity, bagToast.currency)}
              </span>
              <Link
                to="/cart"
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                View Bag
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Haute Couture Banner ── */}
      <section className="relative w-full overflow-hidden border-b border-[#241f19] bg-gradient-to-b from-[#13110e] via-[#0a0907] to-[#080806]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C6A87C]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center space-y-6 relative z-10">
          {/* Season Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161410] border border-[#383126] text-[10px] font-mono tracking-[0.22em] uppercase text-[#C6A87C] shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A87C] animate-pulse" />
            <span>Autumn / Winter Haute Couture Drop</span>
            <span className="text-[#5a5247]">•</span>
            <span>Atelier Edition</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-tight leading-[1.12] max-w-3xl font-serif">
            The Royal Weaver’s{' '}
            <ShinyText
              text="VASTRA LOOM"
              color="#C6A87C"
              shineColor="#fff8e7"
              speed={3}
              className="font-serif font-semibold"
            />
          </h1>

          <p className="text-xs sm:text-sm text-[#9c9387] max-w-xl leading-relaxed">
            Experience hand-embroidered raw silks, velvet achkans, and regal Banarasi sherwanis crafted by India’s master artisans. Every piece is an heirloom created with bespoke perfection.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-4 pt-2">
            <a
              href="#catalog"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(198,168,124,0.3)] hover:shadow-[0_0_40px_rgba(198,168,124,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              Explore Catalog
            </a>
            <a
              href="#heritage"
              className="px-6 py-3 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Atelier Craft
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-8 border-t border-[#1e1b16] max-w-xl w-full text-center">
            <div>
              <span className="text-base sm:text-xl font-bold text-white font-mono block">100%</span>
              <span className="text-[10px] sm:text-xs text-[#70685e] uppercase tracking-wider">Pure Silks</span>
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold text-white font-mono block">Heritage</span>
              <span className="text-[10px] sm:text-xs text-[#70685e] uppercase tracking-wider">Zardozi Art</span>
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold text-white font-mono block">Bespoke</span>
              <span className="text-[10px] sm:text-xs text-[#70685e] uppercase tracking-wider">Tailoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated Catalog Workspace ── */}
      <main id="catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
        
        {/* Catalog Header & Filters Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#241f19] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6A87C]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C6A87C]">
                Curated Collection
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Atelier Ready-to-Wear
            </h2>
          </div>

          {/* Search and Category Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Box */}
            <div className="relative group min-w-[240px]">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5247] group-focus-within:text-[#C6A87C] text-xs transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by silk, achkan, embroidery..."
                className="w-full pl-9 pr-7 py-2 bg-[#12100d] border border-[#2a2520] rounded-xl text-xs text-gray-200 placeholder-[#4f483e] focus:outline-none focus:border-[#C6A87C]/60 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <i className="ri-close-line text-xs" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#100f0d] border border-[#241f19] rounded-xl">
              {[
                { id: 'all', label: 'All' },
                { id: 'bandhgala', label: 'Bandhgalas' },
                { id: 'sherwani', label: 'Sherwanis' },
                { id: 'velvet', label: 'Velvet' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#C6A87C] text-[#080806] shadow'
                      : 'text-gray-400 hover:text-white hover:bg-[#181511]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Pieces Presentation Grid ── */}
        {loading && allProducts.length === 0 ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-[#100f0d] border border-[#241f19] overflow-hidden animate-pulse aspect-[3/4] p-4 flex flex-col justify-between"
              >
                <div className="w-full h-[70%] bg-[#1a1713] rounded-xl" />
                <div className="space-y-2 pt-4">
                  <div className="w-2/3 h-4 bg-[#1a1713] rounded" />
                  <div className="w-1/3 h-3 bg-[#1a1713] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Filter State */
          <div className="py-20 text-center rounded-2xl bg-[#100f0d]/60 border border-[#241f19] space-y-3 p-6">
            <div className="w-14 h-14 rounded-2xl bg-[#181511] border border-[#241f19] flex items-center justify-center text-[#C6A87C] mx-auto shadow-inner">
              <i className="ri-archive-line text-2xl" />
            </div>
            <h3 className="text-base font-semibold text-white">No Pieces Match Your Filter</h3>
            <p className="text-xs text-[#70685e] max-w-sm mx-auto">
              Try modifying your search term or reset to all pieces to explore our seasonal catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Real Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9">
            {filteredProducts.map((product) => {
              const coverUrl = getImageUrl(product?.images?.[0]);
              const imageCount = product?.images?.length || 0;

              return (
                <div
                  key={product._id}
                  className="group rounded-2xl bg-[#100f0d] border border-[#241f19] hover:border-[#C6A87C]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_45px_rgba(198,168,124,0.14)] cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[3/4] w-full bg-[#080806] overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#12100d]">
                        <i className="ri-vip-crown-2-line text-2xl text-[#C6A87C] mb-2" />
                        <span className="text-xs uppercase tracking-widest text-gray-400">VASTRA LOOM</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#100f0d] via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

                    {/* Badges Over Image */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-extrabold uppercase tracking-widest text-[#C6A87C]">
                        Couture
                      </span>
                      {imageCount > 1 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md text-gray-200 text-[10px] font-mono border border-[#3a342c]">
                          <i className="ri-image-2-line text-xs text-[#C6A87C]" />
                          {imageCount} Angles
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Action */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/40 backdrop-blur-xs">
                      <Link
                        to={`/product/${product._id}`}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="ri-eye-line text-sm" />
                        Inspect Piece
                      </Link>
                    </div>
                  </div>

                  {/* Piece Details Section */}
                  <div className="p-5 space-y-3 bg-[#100f0d]">
                    <div>
                      <Link to={`/product/${product._id}`}>
                        <h3 className="text-base font-semibold text-white tracking-tight hover:text-[#C6A87C] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[#8a8278] line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price, Bag, and Buy Now Row */}
                    <div className="pt-3 border-t border-[#201c17] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#635c52] uppercase font-mono block">
                          Catalog Price
                        </span>
                        <span className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                          {formatCurrency(product?.price?.amount, product?.price?.currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleAddToBag(product, e)}
                          className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/60 bg-[#14120e] hover:bg-[#1a1712] text-[#C6A87C] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Add to Bag"
                        >
                          <i className="ri-shopping-bag-3-line text-sm" />
                          <span className="hidden sm:inline">Bag</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleBuyNow(product, e)}
                          className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-[0_0_20px_rgba(198,168,124,0.35)] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <i className="ri-flashlight-line text-xs font-bold" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Atelier Heritage Section ── */}
      <section id="heritage" className="w-full border-t border-[#241f19] bg-[#0b0a08] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C6A87C]">
              The Craftsmanship
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Heritage Woven For Generations
            </h2>
            <p className="text-xs sm:text-sm text-[#8c8276] leading-relaxed">
              Every VASTRA LOOM piece combines time-honored artisanal looms with contemporary tailored silhouettes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#100f0d] border border-[#241f19] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#161410] border border-[#383126] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-sparkling-line text-lg" />
              </div>
              <h4 className="text-sm font-semibold text-white">Pure Banarasi Silk</h4>
              <p className="text-xs text-[#7e756a] leading-relaxed">
                Woven from hand-selected raw mulberry silk, creating high-tensile fabric with natural lustrous texture.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#100f0d] border border-[#241f19] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#161410] border border-[#383126] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-compasses-2-line text-lg" />
              </div>
              <h4 className="text-sm font-semibold text-white">Zardozi Wire Embroidery</h4>
              <p className="text-xs text-[#7e756a] leading-relaxed">
                Hand-stitched metallic bullion wire and micro dabka work along collars, cuffs, and plackets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#100f0d] border border-[#241f19] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#161410] border border-[#383126] flex items-center justify-center text-[#C6A87C]">
                <i className="ri-shield-star-line text-lg" />
              </div>
              <h4 className="text-sm font-semibold text-white">Structured Bespoke Fit</h4>
              <p className="text-xs text-[#7e756a] leading-relaxed">
                Precision-cut tailored shoulders, padded chest canvases, and handcrafted bronze button accents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sign In / Register Prompt Modal for Unauthenticated Purchases ── */}
      {authPromptProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setAuthPromptProduct(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#100f0d] border border-[#2a2520] p-6 sm:p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthPromptProduct(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 hover:bg-[#1f1b15] border border-[#2a2520] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-base" />
            </button>

            {/* Lock / Crown Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#181511] border border-[#C6A87C]/40 flex items-center justify-center mx-auto text-[#C6A87C] shadow-[0_0_24px_rgba(198,168,124,0.2)]">
              <i className="ri-lock-password-line text-2xl" />
            </div>

            {/* Header */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Authentication Required
              </h3>
              <p className="text-xs text-[#8c8276] leading-relaxed">
                Please sign in to your <span className="text-gray-200 font-semibold">VASTRA LOOM</span> account or register as a patron to complete this reservation.
              </p>
            </div>

            {/* Target Piece Snapshot */}
            <div className="p-3 rounded-xl bg-[#080806] border border-[#221e18] flex items-center gap-3 text-left">
              <div className="w-12 h-14 rounded-lg bg-black border border-[#2a2520] overflow-hidden shrink-0">
                <img
                  src={getImageUrl(authPromptProduct?.images?.[0])}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">
                  {authPromptProduct.title}
                </h4>
                <span className="text-xs font-bold text-[#C6A87C] font-mono block mt-0.5">
                  {formatCurrency(authPromptProduct?.price?.amount, authPromptProduct?.price?.currency)}
                </span>
              </div>
            </div>

            {/* Sign In & Register Buttons */}
            <div className="space-y-2.5 pt-1">
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(198,168,124,0.25)] hover:shadow-[0_0_30px_rgba(198,168,124,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <i className="ri-login-box-line text-sm" />
                Sign In to Proceed
              </Link>

              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-user-add-line text-sm text-[#C6A87C]" />
                Register New Account
              </Link>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setAuthPromptProduct(null)}
                className="text-xs text-[#6e675f] hover:text-[#C6A87C] transition-colors cursor-pointer"
              >
                Continue Browsing Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Confirmation Modal (For Authenticated Buyers) ── */}
      {purchaseSuccessProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPurchaseSuccessProduct(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#100f0d] border border-[#2a2520] p-6 sm:p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
              <i className="ri-checkbox-circle-line text-3xl" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                Reservation Confirmed
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Order Placed Successfully
              </h3>
              <p className="text-xs text-[#8c8276] leading-relaxed">
                Thank you, <span className="text-white font-medium">{user?.fullname || 'Patron'}</span>. The atelier artisans have received your order for:
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080806] border border-[#221e18] flex items-center gap-3 text-left">
              <div className="w-12 h-14 rounded-lg bg-black border border-[#2a2520] overflow-hidden shrink-0">
                <img
                  src={getImageUrl(purchaseSuccessProduct?.images?.[0])}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-white truncate">
                  {purchaseSuccessProduct.title}
                </h4>
                <span className="text-xs font-bold text-[#C6A87C] font-mono block mt-0.5">
                  {formatCurrency(purchaseSuccessProduct?.price?.amount, purchaseSuccessProduct?.price?.currency)}
                </span>
                <span className="text-[10px] text-[#635c52] font-mono">
                  Order Ref: #VL-{purchaseSuccessProduct._id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPurchaseSuccessProduct(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="w-full border-t border-[#1a1713] bg-[#050504] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5a5651]">
          <div className="flex items-center gap-2">
            <i className="ri-vip-crown-2-line text-[#C6A87C]" />
            <span className="font-semibold tracking-widest uppercase text-gray-400">
              VASTRA LOOM Atelier
            </span>
          </div>
          <p>© 2026 VASTRA LOOM Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
