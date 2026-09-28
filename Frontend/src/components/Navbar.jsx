import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useCart } from '../features/cart/hook/useCart';
import ThemeSwitcher from './ThemeSwitcher';

/**
 * Enterprise Haute Couture Navigation Bar
 * Seamlessly adapts across Royal Noir, Ivory Atelier, and Imperial Emerald themes
 */
const Navbar = ({
  variant = 'default',
  subtitle,
  onClear,
  showNavLinks = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, handleLogout } = useAuth();
  const { totalItems, handleGetCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    if (user) {
      handleGetCart().catch(() => {});
    }
  }, [user]);

  const isSellerMode = variant === 'seller' || location.pathname.startsWith('/seller');

  const navLinks = [
    { label: 'Collections', href: '/#catalog' },
    { label: 'New Drops', href: '/#catalog' },
    { label: 'Heritage', href: '/#heritage' },
  ];

  const onSignOut = async () => {
    try {
      await handleLogout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 backdrop-blur-xl border-b bg-[var(--bg-header)] border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo & Context ── */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            to={isSellerMode ? "/seller/dashboard" : "/"}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
          >
            <div className="w-9 h-9 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--accent-gold)] flex items-center justify-center transition-colors shrink-0 shadow-xs group-hover:border-[var(--accent-gold)]">
              <i className="ri-vip-crown-2-line text-lg" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-[0.22em] uppercase font-sans flex items-center text-[var(--text-primary)]">
              VASTRA <span className="text-[var(--accent-gold)] ml-1.5 font-extrabold">LOOM</span>
            </span>
          </Link>

          {/* Subtitle / Breadcrumb */}
          {subtitle && (
            <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-[var(--border-subtle)] h-5">
              <span className="text-xs font-medium tracking-wide text-[var(--text-muted)]">
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {/* ── Center: Customer Navigation Links ── */}
        {!isSellerMode && showNavLinks && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-semibold tracking-[0.14em] uppercase transition-colors relative py-1 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[var(--accent-gold)] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
        )}

        {/* ── Right Section: Theme Switcher & Actions ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Universal Luxury Theme Switcher */}
          <ThemeSwitcher compact className="shrink-0" />

          {/* Seller Mode Specific Actions */}
          {isSellerMode ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 mr-2">
                <Link
                  to="/seller/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    location.pathname === '/seller/dashboard' || location.pathname === '/seller'
                      ? 'bg-[var(--bg-card-subtle)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/40'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seller/create-product"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    location.pathname === '/seller/create-product'
                      ? 'bg-[var(--bg-card-subtle)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/40'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Create Piece
                </Link>
              </div>

              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                >
                  Clear
                </button>
              )}

              {user && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out of Atelier"
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-card)] hover:border-red-900/60 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  <i className="ri-logout-box-r-line" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            /* Buyer / Customer Mode Actions */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist */}
              <button
                type="button"
                title="Wishlist"
                className="hidden sm:flex w-8 h-8 rounded-lg border border-[var(--border-card)] hover:border-[var(--accent-gold)]/60 bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <i className="ri-heart-line text-sm" />
              </button>

              {/* Shopping Bag */}
              {user ? (
                <Link
                  to="/cart"
                  title="Shopping Bag"
                  className="relative w-8 h-8 rounded-lg border border-[var(--border-card)] hover:border-[var(--accent-gold)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <i className="ri-shopping-bag-3-line text-sm" />
                  {totalItems > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-gold-light)] text-[var(--text-on-accent)] font-bold text-[10px] flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  ) : (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-dim)] font-bold text-[9px] flex items-center justify-center">
                      0
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGuestModal(true)}
                  title="Sign In to Access Shopping Bag"
                  className="relative w-8 h-8 rounded-lg border border-[var(--border-card)] hover:border-[var(--accent-gold)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  <i className="ri-shopping-bag-3-line text-sm" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-dim)] font-bold text-[9px] flex items-center justify-center">
                    0
                  </span>
                </button>
              )}

              {/* User Account / Auth */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                  <div
                    title={user.fullname || user.email}
                    className="w-8 h-8 rounded-full border border-[var(--accent-gold)]/40 bg-[var(--bg-card-subtle)] text-[var(--accent-gold)] flex items-center justify-center text-xs font-bold uppercase shadow-xs"
                  >
                    {user.fullname ? user.fullname[0] : 'U'}
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign Out"
                    className="w-8 h-8 rounded-lg border border-[var(--border-card)] hover:border-red-900/60 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    <i className="ri-logout-box-r-line text-xs" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-card)] hover:border-[var(--accent-gold)]/50 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-card)] shadow-xs transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-gold px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs hover:opacity-95 transition-opacity"
                    style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle (Storefront only) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8 h-8 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer shadow-xs"
              >
                <i className={mobileMenuOpen ? 'ri-close-line text-base' : 'ri-menu-line text-base'} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Mobile Drawer (Storefront) ── */}
      {!isSellerMode && mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-6 py-4 space-y-3 animate-in fade-in duration-200 shadow-xl">
          <div className="pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              Aura Palette
            </span>
            <ThemeSwitcher />
          </div>

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-gold)] py-1"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* ── Guest Shopping Bag Auth Prompt Modal ── */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--bg-modal-backdrop)] backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-card)] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--accent-gold)]/40 flex items-center justify-center text-[var(--accent-gold)] mx-auto shadow-md">
              <i className="ri-shopping-bag-3-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Sign In to Access Bag</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Please sign in to your patron account to view your shopping bag, manage bespoke atelier selections, and checkout.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGuestModal(false);
                  navigate('/login', { state: { from: location } });
                }}
                className="btn-gold w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider block cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
                style={{ background: 'var(--accent-gradient)', color: 'var(--text-on-accent)' }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGuestModal(false);
                  navigate('/register');
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider block cursor-pointer transition-colors"
              >
                Create Account
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowGuestModal(false)}
              className="text-xs text-[var(--text-dim)] hover:text-[var(--text-primary)] cursor-pointer block mx-auto pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
