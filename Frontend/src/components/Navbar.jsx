import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import 'remixicon/fonts/remixicon.css';
import ShinyText from './ShinyText';

/**
 * Standard, highly attractive Navbar for VASTRA LOOM.
 * Supports both standard customer storefront mode and seller studio mode.
 * 
 * Props:
 * - variant: 'default' | 'seller' (default: 'default')
 * - subtitle: string (optional breadcrumb / label, e.g. "New Product")
 * - onClear: function (optional callback for clear/reset button in seller mode)
 * - onClose: function (optional close/exit handler)
 */
const Navbar = ({
  variant = 'default',
  subtitle,
  onClear,
  onClose,
  showNavLinks = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || { user: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSellerMode = variant === 'seller' || location.pathname.startsWith('/seller');

  const navLinks = [
    { label: 'Collections', href: '/#collections' },
    { label: 'New Drops', href: '/#new-drops' },
    { label: 'Men', href: '/#men' },
    { label: 'Atelier', href: '/#atelier' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[#080806]/90 backdrop-blur-xl border-b border-[#2a2520] transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo & Context ── */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 text-[#C6A87C] hover:opacity-95 transition-opacity group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#12100d] border border-[#2a2520] group-hover:border-[#C6A87C]/50 flex items-center justify-center transition-colors shadow-inner shrink-0">
              <i className="ri-vip-crown-2-line text-lg text-[#C6A87C]" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-[0.22em] uppercase text-white font-sans flex items-center">
              VASTRA <span className="text-[#C6A87C] ml-1.5">LOOM</span>
            </span>
          </Link>

          {/* Subtitle / Breadcrumb (e.g. / New Product) */}
          {subtitle && (
            <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-[#2a2520] h-5">
              <span className="text-xs text-[#a0988e] font-medium tracking-wide">
                {subtitle}
              </span>
            </div>
          )}
        </div>

        {/* ── Center: Customer Navigation Links (Storefront Mode) ── */}
        {!isSellerMode && showNavLinks && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-semibold tracking-[0.14em] uppercase text-gray-300 hover:text-[#C6A87C] transition-colors relative py-1 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#C6A87C] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
        )}

        {/* ── Right Section: Action Controls ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seller Mode Specific Actions */}
          {isSellerMode ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Seller Navigation Tabs */}
              <div className="hidden md:flex items-center gap-1.5 mr-2">
                <Link
                  to="/seller/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    location.pathname === '/seller/dashboard' || location.pathname === '/seller'
                      ? 'bg-[#181511] text-[#C6A87C] border border-[#C6A87C]/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seller/create-product"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    location.pathname === '/seller/create-product'
                      ? 'bg-[#181511] text-[#C6A87C] border border-[#C6A87C]/40'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Create Piece
                </Link>
              </div>

              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#161411] transition-colors"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={onClose || (() => navigate('/'))}
                title="Close and return"
                className="w-8 h-8 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/60 bg-[#0d0c0b] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>
          ) : (
            /* Standard User / Customer Mode Actions */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                type="button"
                title="Search Collections"
                className="w-8 h-8 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C] flex items-center justify-center transition-colors"
              >
                <i className="ri-search-line text-sm" />
              </button>

              {/* Wishlist */}
              <button
                type="button"
                title="Wishlist"
                className="hidden sm:flex w-8 h-8 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C] items-center justify-center transition-colors"
              >
                <i className="ri-heart-line text-sm" />
              </button>

              {/* Cart / Bag */}
              <button
                type="button"
                title="Shopping Bag"
                className="relative w-8 h-8 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C] flex items-center justify-center transition-colors"
              >
                <i className="ri-shopping-bag-3-line text-sm" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C6A87C] text-[#080806] font-bold text-[9px] flex items-center justify-center shadow">
                  0
                </span>
              </button>

              {/* User Account / Auth */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#2a2520]">
                  <div className="w-8 h-8 rounded-full bg-[#1c1914] border border-[#C6A87C]/40 text-[#C6A87C] flex items-center justify-center text-xs font-bold uppercase">
                    {user.fullname ? user.fullname[0] : 'U'}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    to="/login"
                    className="hidden sm:inline-block px-3 py-1.5 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/40 text-xs font-semibold text-gray-300 hover:text-white bg-[#0d0c0b] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806] text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    Join
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle (Storefront only) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8 h-8 rounded-lg border border-[#2a2520] bg-[#0d0c0b] text-gray-300 flex items-center justify-center"
              >
                <i className={mobileMenuOpen ? 'ri-close-line text-base' : 'ri-menu-line text-base'} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Mobile Drawer (Storefront) ── */}
      {!isSellerMode && mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0c0b] border-b border-[#2a2520] px-6 py-4 space-y-3 animate-in fade-in duration-200">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold uppercase tracking-wider text-gray-300 hover:text-[#C6A87C]"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-[#2a2520] flex gap-2">
            <Link
              to="/seller/create-product"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg bg-[#161411] border border-[#2a2520] text-xs text-[#C6A87C] font-semibold uppercase tracking-wider"
            >
              Seller Atelier
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
