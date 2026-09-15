import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * Standard, highly attractive Navbar for VASTRA LOOM.
 * Supports customer storefront mode (buyer) and seller studio mode (seller).
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSellerMode = variant === 'seller' || location.pathname.startsWith('/seller');

  const navLinks = [
    { label: 'Collections', href: '/#catalog' },
    { label: 'New Drops', href: '/#catalog' },
    { label: 'Heritage', href: '/#heritage' },
  ];

  const onSignOut = () => {
    handleLogout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[#080806]/90 backdrop-blur-xl border-b border-[#2a2520] transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo & Context ── */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            to={isSellerMode ? "/seller/dashboard" : "/"}
            className="flex items-center gap-3 text-[#C6A87C] hover:opacity-95 transition-opacity group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#12100d] border border-[#2a2520] group-hover:border-[#C6A87C]/50 flex items-center justify-center transition-colors shadow-inner shrink-0">
              <i className="ri-vip-crown-2-line text-lg text-[#C6A87C]" />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-[0.22em] uppercase text-white font-sans flex items-center">
              VASTRA <span className="text-[#C6A87C] ml-1.5">LOOM</span>
            </span>
          </Link>

          {/* Subtitle / Breadcrumb (e.g. / Atelier Dashboard) */}
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
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#161411] transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}

              {/* Seller Sign Out */}
              {user && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out of Atelier"
                  className="px-3 py-1.5 rounded-lg border border-[#2a2520] hover:border-red-900/60 bg-[#0d0c0b] text-gray-400 hover:text-red-400 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
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
                className="hidden sm:flex w-8 h-8 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C] items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-heart-line text-sm" />
              </button>

              {/* Shopping Bag */}
              <button
                type="button"
                title="Shopping Bag"
                className="relative w-8 h-8 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-shopping-bag-3-line text-sm" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C6A87C] text-[#080806] font-bold text-[9px] flex items-center justify-center shadow">
                  0
                </span>
              </button>

              {/* User Account / Auth */}
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-[#2a2520]">
                  <div
                    title={user.fullname || user.email}
                    className="w-8 h-8 rounded-full bg-[#1c1914] border border-[#C6A87C]/40 text-[#C6A87C] flex items-center justify-center text-xs font-bold uppercase"
                  >
                    {user.fullname ? user.fullname[0] : 'U'}
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign Out"
                    className="w-8 h-8 rounded-lg border border-[#2a2520] hover:border-red-900/60 bg-[#0d0c0b] text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ri-logout-box-r-line text-xs" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg border border-[#2a2520] hover:border-[#C6A87C]/40 text-xs font-semibold text-gray-300 hover:text-white bg-[#0d0c0b] transition-colors"
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
                className="md:hidden w-8 h-8 rounded-lg border border-[#2a2520] bg-[#0d0c0b] text-gray-300 flex items-center justify-center cursor-pointer"
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
        </div>
      )}
    </header>
  );
};

export default Navbar;
