import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * BuyerRoute: Guard for customer storefront routes (e.g. '/').
 * 
 * Rules:
 * - If user is logged in as a Seller:
 *   Sellers are NOT buyers and cannot access the buyer storefront;
 *   They are automatically redirected to '/seller/dashboard'.
 * - If user is a Buyer (or guest visitor browsing the atelier catalog):
 *   Allowed to browse and access '/'.
 */
const BuyerRoute = ({ children }) => {
  const { user, isAuthChecked, handleCheckAuth } = useAuth();
  const [isVerifying, setIsVerifying] = useState(!isAuthChecked);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthChecked) {
      handleCheckAuth()
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsVerifying(false);
        });
    } else {
      setIsVerifying(false);
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthChecked]);

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full bg-[#080806] flex flex-col items-center justify-center font-sans text-gray-100">
        <div className="w-10 h-10 rounded-xl bg-[#14120e] border border-[#2a2520] flex items-center justify-center text-[#C6A87C] animate-pulse">
          <i className="ri-vip-crown-2-line text-xl" />
        </div>
      </div>
    );
  }

  // Seller cannot access the buyer storefront (/) -> redirect to seller dashboard
  if (user?.role === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default BuyerRoute;
