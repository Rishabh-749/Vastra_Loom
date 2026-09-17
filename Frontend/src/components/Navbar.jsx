import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import 'remixicon/fonts/remixicon.css';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useCart } from '../features/cart/hook/useCart';

/**
 * Standard, highly attractive Navbar for VASTRA LOOM.
 * Supports customer storefront mode (buyer) and seller studio mode (seller).
 */
const Navbar = ({
  variant = 'default',
  subtitle,
  onClear,
  showNavLinks = true,
  theme = 'dark',
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
  const isLight = theme === 'light';

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
    <header
      className={`sticky top-0 z-50 w-full h-16 backdrop-blur-xl border-b transition-colors ${
        isLight
          ? 'bg-[#fafaf9]/90 border-[#e7e5e4] text-zinc-900'
          : 'bg-[#080806]/90 border-[#2a2520] text-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* ── Brand Logo & Context ── */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link
            to={isSellerMode ? "/seller/dashboard" : "/"}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
          >
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                isLight
                  ? 'bg-[#f5f5f4] border-[#e7e5e4] text-[#926c38]'
                  : 'bg-[#12100d] border-[#2a2520] text-[#C6A87C]'
              }`}
            >
              <i className="ri-vip-crown-2-line text-lg" />
            </div>
            <span
              className={`text-sm sm:text-base font-bold tracking-[0.22em] uppercase font-sans flex items-center ${
                isLight ? 'text-zinc-900' : 'text-white'
              }`}
            >
              VASTRA <span className="text-[#C6A87C] ml-1.5">LOOM</span>
            </span>
          </Link>

          {/* Subtitle / Breadcrumb */}
          {subtitle && (
            <div
              className={`flex items-center gap-2 pl-3 sm:pl-4 border-l h-5 ${
                isLight ? 'border-[#e7e5e4]' : 'border-[#2a2520]'
              }`}
            >
              <span
                className={`text-xs font-medium tracking-wide ${
                  isLight ? 'text-zinc-500' : 'text-[#a0988e]'
                }`}
              >
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
                className={`text-xs font-semibold tracking-[0.14em] uppercase transition-colors relative py-1 group ${
                  isLight
                    ? 'text-zinc-600 hover:text-zinc-950'
                    : 'text-gray-300 hover:text-[#C6A87C]'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-[1.5px] transition-all duration-300 group-hover:w-full ${
                    isLight ? 'bg-zinc-900' : 'bg-[#C6A87C]'
                  }`}
                />
              </a>
            ))}
          </nav>
        )}

        {/* ── Right Section: Action Controls ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Seller Mode Specific Actions */}
          {isSellerMode ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 mr-2">
                <Link
                  to="/seller/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    location.pathname === '/seller/dashboard' || location.pathname === '/seller'
                      ? isLight
                        ? 'bg-zinc-900 text-white'
                        : 'bg-[#181511] text-[#C6A87C] border border-[#C6A87C]/40'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/seller/create-product"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    location.pathname === '/seller/create-product'
                      ? isLight
                        ? 'bg-zinc-900 text-white'
                        : 'bg-[#181511] text-[#C6A87C] border border-[#C6A87C]/40'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                      : 'text-gray-400 hover:text-white hover:bg-[#161411]'
                  }`}
                >
                  Clear
                </button>
              )}

              {user && (
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out of Atelier"
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    isLight
                      ? 'border-zinc-300 hover:border-red-500 bg-white text-zinc-700 hover:text-red-600'
                      : 'border-[#2a2520] hover:border-red-900/60 bg-[#0d0c0b] text-gray-400 hover:text-red-400'
                  }`}
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
                className={`hidden sm:flex w-8 h-8 rounded-lg border items-center justify-center transition-colors cursor-pointer ${
                  isLight
                    ? 'border-zinc-300 bg-white text-zinc-600 hover:text-zinc-950'
                    : 'border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C]'
                }`}
              >
                <i className="ri-heart-line text-sm" />
              </button>

              {/* Shopping Bag */}
              {user ? (
                <Link
                  to="/cart"
                  title="Shopping Bag"
                  className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isLight
                      ? 'border-zinc-300 bg-white text-zinc-700 hover:text-zinc-950'
                      : 'border-[#2a2520] hover:border-[#C6A87C]/70 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C]'
                  }`}
                >
                  <i className="ri-shopping-bag-3-line text-sm" />
                  {totalItems > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-[10px] flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  ) : (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-gray-400 font-bold text-[9px] flex items-center justify-center">
                      0
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGuestModal(true)}
                  title="Sign In to Access Shopping Bag"
                  className={`relative w-8 h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                    isLight
                      ? 'border-zinc-300 bg-white text-zinc-700 hover:text-zinc-950'
                      : 'border-[#2a2520] hover:border-[#C6A87C]/70 bg-[#0d0c0b] text-gray-300 hover:text-[#C6A87C]'
                  }`}
                >
                  <i className="ri-shopping-bag-3-line text-sm" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-gray-400 font-bold text-[9px] flex items-center justify-center">
                    0
                  </span>
                </button>
              )}

              {/* User Account / Auth */}
              {user ? (
                <div
                  className={`flex items-center gap-2 pl-2 border-l ${
                    isLight ? 'border-zinc-200' : 'border-[#2a2520]'
                  }`}
                >
                  <div
                    title={user.fullname || user.email}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold uppercase ${
                      isLight
                        ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                        : 'bg-[#1c1914] border-[#C6A87C]/40 text-[#C6A87C]'
                    }`}
                  >
                    {user.fullname ? user.fullname[0] : 'U'}
                  </div>
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign Out"
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      isLight
                        ? 'border-zinc-300 hover:border-red-500 bg-white text-zinc-600 hover:text-red-600'
                        : 'border-[#2a2520] hover:border-red-900/60 bg-[#0d0c0b] text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <i className="ri-logout-box-r-line text-xs" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-1">
                  <Link
                    to="/login"
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      isLight
                        ? 'border-zinc-300 hover:border-zinc-400 text-zinc-800 bg-white'
                        : 'border-[#2a2520] hover:border-[#C6A87C]/40 text-gray-300 hover:text-white bg-[#0d0c0b]'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity ${
                      isLight
                        ? 'bg-zinc-900 text-white'
                        : 'bg-gradient-to-r from-[#C6A87C] to-[#e8d5aa] text-[#080806]'
                    }`}
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

      {/* ── Guest Shopping Bag Auth Prompt Modal ── */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#100f0d] border border-[#25211b] max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#181511] border border-[#C6A87C]/40 flex items-center justify-center text-[#C6A87C] mx-auto shadow-[0_0_20px_rgba(198,168,124,0.15)]">
              <i className="ri-shopping-bag-3-line text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sign In to Access Bag</h3>
              <p className="text-xs text-[#8a8278] mt-1">
                Please sign in to your patron account to view your shopping bag, manage atelier selections, and checkout.
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGuestModal(false);
                  navigate('/login', { state: { from: location } });
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C6A87C] to-[#dfca9f] text-[#080806] font-bold text-xs uppercase tracking-wider block cursor-pointer hover:opacity-90 transition-opacity"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGuestModal(false);
                  navigate('/register');
                }}
                className="w-full py-2.5 rounded-xl bg-[#14120e] border border-[#2a2520] hover:border-[#C6A87C]/50 text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider block cursor-pointer transition-colors"
              >
                Create Account
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowGuestModal(false)}
              className="text-xs text-[#665f55] hover:text-gray-400 cursor-pointer block mx-auto pt-1"
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
