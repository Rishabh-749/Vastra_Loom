import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import { motion } from 'motion/react';
import Navbar from '../../../components/Navbar';
import ShinyText from '../../../components/ShinyText';
import SEO from '../../../components/SEO';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCart } from '../../cart/hook/useCart';
import { getImageUrl } from '../../../utils/image';

const formatCurrency = (amount = 0, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', CAD: 'CA$' };
  const symbol = symbols[currency] || `${currency} `;
  return `${symbol} ${Number(amount).toLocaleString('en-IN')}`;
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { handleGetAllProducts, allProducts = [], loading } = useProduct();
  const { handleAddItem } = useCart();

  // Local Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bagToast, setBagToast] = useState(null);
  const [authPromptProduct, setAuthPromptProduct] = useState(null);

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

  const handleBuyNow = async (product, e) => {
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
      navigate('/cart');
    } catch {
      navigate(`/product/${product._id}`);
    }
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
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] font-sans text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-glow)] transition-colors duration-300">
      
      {/* ── SEO Metadata ── */}
      <SEO
        title="Royal Bespoke Handloom Collections"
        description="Experience hand-embroidered raw silks, velvet achkans, and regal Banarasi sherwanis crafted by India’s master artisans at VASTRA LOOM."
      />

      {/* ── Storefront Navigation Bar ── */}
      <Navbar variant="default" />

      {/* ── Rich Toast Notification ── */}
      {bagToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--accent-gold)]/60 rounded-2xl p-3.5 sm:p-4 shadow-[0_15px_45px_rgba(0,0,0,0.5)] flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-13 h-16 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] overflow-hidden shrink-0">
            {bagToast.image ? (
              <img
                src={bagToast.image}
                alt={bagToast.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--accent-gold)]">
                <i className="ri-vip-crown-2-line text-lg" />
              </div>
            )}
          </div>

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

      {/* ── Hero Haute Couture Banner ── */}
      <section className="relative w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,_var(--accent-glow),_transparent_70%)] pointer-events-none opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 sm:pb-12 flex flex-col items-center text-center space-y-5 relative z-10">
          
          {/* Season Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[10px] font-mono tracking-[0.22em] uppercase text-[var(--accent-gold)] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
            <span>Autumn / Winter Haute Couture</span>
            <span className="text-[var(--text-dim)]">•</span>
            <span>Atelier Edition</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.12] max-w-3xl font-serif">
            The Royal Weaver’s{' '}
            <ShinyText
              text="VASTRA LOOM"
              color="var(--accent-gold)"
              shineColor="#fff8e7"
              speed={3}
              className="font-serif font-semibold"
            />
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Experience hand-embroidered raw silks, velvet achkans, and regal Banarasi sherwanis crafted by India’s master artisans. Every piece is an heirloom created with bespoke perfection.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-4 pt-2">
            <a
              href="#catalog"
              className="btn-gold px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_4px_25px_var(--accent-glow)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center gap-2 select-none"
              style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
            >
              <i className="ri-compass-3-line text-sm" />
              <span>Explore Catalog</span>
            </a>
            <a
              href="#heritage"
              className="px-6 py-3.5 rounded-xl border border-[var(--border-card)] hover:border-[var(--accent-gold)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2"
            >
              <i className="ri-gemini-line text-sm text-[var(--accent-gold)]" />
              <span>Atelier Craft</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-8 border-t border-[var(--border-subtle)] max-w-xl w-full text-center">
            <div>
              <span className="text-base sm:text-xl font-bold text-[var(--text-primary)] font-mono block">100%</span>
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider">Pure Silks</span>
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold text-[var(--text-primary)] font-mono block">Heritage</span>
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider">Zardozi Art</span>
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold text-[var(--text-primary)] font-mono block">Bespoke</span>
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider">Tailoring</span>
            </div>
          </div>
        </div>
      </section>

      <main id="catalog" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 scroll-mt-16">
        
        {/* Catalog Header & Filters Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[var(--border-subtle)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent-gold)]">
                Curated Collection
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Atelier Ready-to-Wear
            </h2>
          </div>

          {/* Search and Category Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Box */}
            <div className="relative group min-w-[240px]">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent-gold)] text-xs transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by silk, achkan, embroidery..."
                className="w-full pl-9 pr-7 py-2 bg-[var(--bg-input)] border border-[var(--border-card)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                >
                  <i className="ri-close-line text-xs" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl shadow-xs">
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
                  style={selectedCategory === cat.id ? { background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' } : undefined}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'btn-gold font-bold shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)]'
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
                className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden animate-pulse aspect-[3/4] p-4 flex flex-col justify-between"
              >
                <div className="w-full h-[70%] bg-[var(--bg-card-subtle)] rounded-xl" />
                <div className="space-y-2 pt-4">
                  <div className="w-2/3 h-4 bg-[var(--bg-card-subtle)] rounded" />
                  <div className="w-1/3 h-3 bg-[var(--bg-card-subtle)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty Filter State */
          <div className="py-20 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 p-6 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] flex items-center justify-center text-[var(--accent-gold)] mx-auto shadow-inner">
              <i className="ri-archive-line text-2xl" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">No Pieces Match Your Filter</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Try modifying your search term or reset to all pieces to explore our seasonal catalog.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl border border-[var(--border-card)] hover:border-[var(--accent-gold)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Real Products Grid with Motion */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9">
            {filteredProducts.map((product, idx) => {
              const coverUrl = getImageUrl(product?.images?.[0]);
              const imageCount = product?.images?.length || 0;

              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                  className="group rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--accent-gold)]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_45px_var(--accent-glow)] cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Image Container with Badges */}
                  <div className="relative aspect-[3/4] w-full bg-[var(--bg-canvas)] overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={product.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-card-subtle)]">
                        <i className="ri-vip-crown-2-line text-2xl text-[var(--accent-gold)] mb-2" />
                        <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">VASTRA LOOM</span>
                      </div>
                    )}

                    {/* Gradient Overlay - subtle top vignette for badge readability, no bottom fog */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent opacity-60 pointer-events-none" />

                    {/* Badges Over Image */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[9px] font-bold uppercase tracking-widest text-[#E0CA9E] shadow-sm">
                          Couture
                        </span>
                        {product?.discount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-[var(--accent-gold)] text-[var(--text-on-accent)] font-extrabold font-mono text-[9px] uppercase tracking-wider shadow-sm">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                      {imageCount > 1 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-gray-200 text-[10px] font-mono border border-white/15 shadow-sm">
                          <i className="ri-image-2-line text-xs text-[#E0CA9E]" />
                          {imageCount} Angles
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Action */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 bg-black/35 backdrop-blur-xs">
                      <Link
                        to={`/product/${product._id}`}
                        className="btn-gold px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                        style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
                      >
                        <i className="ri-eye-line text-sm" />
                        Inspect Piece
                      </Link>
                    </div>
                  </div>

                  {/* Piece Details Section */}
                  <div className="p-5 space-y-3 bg-[var(--bg-card)]">
                    <div>
                      <Link to={`/product/${product._id}`}>
                        <h3 className="text-base font-semibold text-[var(--text-primary)] tracking-tight hover:text-[var(--accent-gold)] transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price, Bag, and Buy Now Row */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono block">
                          Catalog Price
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-mono tracking-tight">
                            {formatCurrency(product?.price?.amount, product?.price?.currency)}
                          </span>
                          {product?.originalPrice > product?.price?.amount && (
                            <span className="text-xs text-[var(--text-muted)] line-through font-mono">
                              {formatCurrency(product?.originalPrice, product?.price?.currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleAddToBag(product, e)}
                          className="px-3 py-2 rounded-xl border border-[var(--border-card)] hover:border-[var(--accent-gold)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                          title="Add to Bag"
                        >
                          <i className="ri-shopping-bag-3-line text-sm text-[var(--accent-gold)]" />
                          <span>Bag</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleBuyNow(product, e)}
                          className="btn-gold px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
                        >
                          <i className="ri-flashlight-line text-xs font-bold" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <section id="heritage" className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] py-8 sm:py-10 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--accent-gold)]">
              The Craftsmanship
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Heritage Woven For Generations
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Every VASTRA LOOM piece combines time-honored artisanal looms with contemporary tailored silhouettes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] flex items-center justify-center text-[var(--accent-gold)] shadow-xs">
                <i className="ri-sparkling-line text-lg" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Pure Banarasi Silk</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Woven from hand-selected raw mulberry silk, creating high-tensile fabric with natural lustrous texture.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] flex items-center justify-center text-[var(--accent-gold)] shadow-xs">
                <i className="ri-compasses-2-line text-lg" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Zardozi Wire Embroidery</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Hand-stitched metallic bullion wire and micro dabka work along collars, cuffs, and plackets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] flex items-center justify-center text-[var(--accent-gold)] shadow-xs">
                <i className="ri-shield-star-line text-lg" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Structured Bespoke Fit</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Precision-cut tailored shoulders, padded chest canvases, and handcrafted bronze button accents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sign In Prompt Modal for Unauthenticated Users ── */}
      {authPromptProduct && (
        <div
          className="fixed inset-0 z-50 bg-[var(--bg-modal-backdrop)] backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setAuthPromptProduct(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[var(--bg-modal)] border border-[var(--border-card)] p-6 sm:p-8 text-center shadow-[0_25px_70px_rgba(0,0,0,0.5)] space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setAuthPromptProduct(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-base" />
            </button>

            {/* Lock / Crown Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--accent-gold)]/40 flex items-center justify-center mx-auto text-[var(--accent-gold)] shadow-md">
              <i className="ri-lock-password-line text-2xl" />
            </div>

            {/* Header */}
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                Authentication Required
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Please sign in to your <span className="text-[var(--text-primary)] font-semibold">VASTRA LOOM</span> account or register as a patron to reserve this bespoke piece.
              </p>
            </div>

            {/* Target Piece Snapshot */}
            <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center gap-3 text-left">
              <div className="w-12 h-14 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-card)] overflow-hidden shrink-0">
                <img
                  src={getImageUrl(authPromptProduct?.images?.[0])}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {authPromptProduct.title}
                </h4>
                <span className="text-xs font-bold text-[var(--accent-gold)] font-mono block mt-0.5">
                  {formatCurrency(authPromptProduct?.price?.amount, authPromptProduct?.price?.currency)}
                </span>
              </div>
            </div>

            {/* Sign In & Register Buttons */}
            <div className="space-y-2.5 pt-1">
              <Link
                to="/login"
                className="btn-gold w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
              >
                <i className="ri-login-box-line text-sm" />
                Sign In to Proceed
              </Link>

              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl border border-[var(--border-card)] hover:border-[var(--accent-gold)]/50 bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-user-add-line text-sm text-[var(--accent-gold)]" />
                Register New Account
              </Link>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setAuthPromptProduct(null)}
                className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Continue Browsing Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-card)] py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <i className="ri-vip-crown-2-line text-[var(--accent-gold)]" />
            <span className="font-semibold tracking-widest uppercase text-[var(--text-muted)]">
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
