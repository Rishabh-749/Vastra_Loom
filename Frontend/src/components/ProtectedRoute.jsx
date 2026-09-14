import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';
import Navbar from './Navbar';
import ShinyText from './ShinyText';

/**
 * ProtectedRoute component for guarding privileged routes (e.g. Seller Studio).
 * If the user is not authenticated or lacks the required role, it renders an
 * informative, luxury access-denied page explaining exactly what is happening.
 * 
 * Props:
 * - children: ReactNode
 * - requiredRole: 'seller' | 'admin' | null (default: 'seller')
 */
const ProtectedRoute = ({ children, requiredRole = 'seller' }) => {
  const { user, handleCheckAuth } = useAuth();
  const [isVerifying, setIsVerifying] = useState(!user);

  useEffect(() => {
    // If no user in state, try checking active cookie session with backend
    if (!user) {
      handleCheckAuth().finally(() => setIsVerifying(false));
    } else {
      setIsVerifying(false);
    }
  }, [user]);

  // Loading state while verifying token with backend
  if (isVerifying) {
    return (
      <div className="min-h-screen w-full bg-[#080806] flex flex-col items-center justify-center font-sans text-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#14120e] border border-[#2a2520] flex items-center justify-center text-[#C6A87C] animate-pulse">
            <i className="ri-vip-crown-2-line text-xl" />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8a8278] font-mono tracking-wider uppercase">
            <i className="ri-loader-4-line animate-spin text-[#C6A87C]" />
            <span>Verifying Atelier Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Case 1: User Not Logged In ──
  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#080806] flex flex-col font-sans text-gray-100">
        <Navbar variant="seller" subtitle="Access Restricted" />
        
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#100f0d] border border-[#2a2520] p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Lock Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#181511] border border-[#C6A87C]/40 flex items-center justify-center mx-auto text-[#C6A87C] shadow-[0_0_30px_rgba(198,168,124,0.15)]">
              <i className="ri-lock-2-line text-3xl" />
            </div>

            {/* Explanation Heading */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Authentication <ShinyText text="Required" color="#C6A87C" shineColor="#fff8e7" speed={3} />
              </h2>
              <p className="text-xs sm:text-sm text-[#8a8278] leading-relaxed">
                You are not currently logged in. To publish creations to the <span className="text-gray-200 font-medium">VASTRA LOOM</span> catalog, you must sign in with a verified Seller account.
              </p>
            </div>

            {/* Status Info Box */}
            <div className="p-3.5 rounded-xl bg-[#0a0907] border border-[#231f1a] text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#C6A87C] font-semibold text-[11px] uppercase tracking-wider">
                <i className="ri-information-line" />
                Why am I seeing this?
              </div>
              <p className="text-[11px] text-[#6e675f] leading-relaxed">
                The Atelier Product Studio is a protected seller environment requiring an active authentication token.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(198,168,124,0.25)] hover:shadow-[0_0_30px_rgba(198,168,124,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <i className="ri-login-box-line text-sm" />
                Sign In to Seller Account
              </Link>

              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-store-2-line text-sm text-[#C6A87C]" />
                Register as New Seller
              </Link>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="text-xs text-[#6e675f] hover:text-[#C6A87C] transition-colors inline-flex items-center gap-1"
              >
                <i className="ri-arrow-left-line text-xs" />
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Case 2: Logged in, but lacks required role (e.g. buyer instead of seller) ──
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen w-full bg-[#080806] flex flex-col font-sans text-gray-100">
        <Navbar variant="seller" subtitle="Access Restricted" />
        
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#100f0d] border border-[#2a2520] p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Shield Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#181511] border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <i className="ri-shield-keyhole-line text-3xl" />
            </div>

            {/* Explanation Heading */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Seller Privileges <span className="text-amber-400">Required</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#8a8278] leading-relaxed">
                You are currently signed in as <span className="text-white font-medium">{user.fullname || user.email}</span> with a <span className="text-amber-400 uppercase font-bold text-xs">{user.role || 'Buyer'}</span> account.
              </p>
            </div>

            {/* Status Info Box */}
            <div className="p-3.5 rounded-xl bg-[#0a0907] border border-[#231f1a] text-left text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
                <i className="ri-alert-line" />
                Permission Details
              </div>
              <p className="text-[11px] text-[#6e675f] leading-relaxed">
                Product creation is restricted to verified VASTRA LOOM Sellers. Customer accounts cannot list or sell products in the catalog.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                to="/register"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#080806] text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(198,168,124,0.25)] hover:shadow-[0_0_30px_rgba(198,168,124,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <i className="ri-store-2-line text-sm" />
                Register a Seller Account
              </Link>

              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl border border-[#2a2520] hover:border-[#C6A87C]/50 bg-[#0d0c0b] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-user-shared-line text-sm text-[#C6A87C]" />
                Switch to Another Account
              </Link>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="text-xs text-[#6e675f] hover:text-[#C6A87C] transition-colors inline-flex items-center gap-1"
              >
                <i className="ri-arrow-left-line text-xs" />
                Return to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Authorized: Render Child Component ──
  return children;
};

export default ProtectedRoute;
