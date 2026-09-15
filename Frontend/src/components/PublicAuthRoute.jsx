import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../features/auth/hooks/useAuth';

/**
 * PublicAuthRoute: Wraps /login and /register pages.
 * If user is already authenticated:
 * - Seller -> redirected to /seller/dashboard
 * - Buyer -> redirected to /
 * If not authenticated, renders login/register children.
 */
const PublicAuthRoute = ({ children }) => {
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
      <div className="min-h-screen w-full bg-[#080806] flex items-center justify-center text-[#C6A87C]">
        <i className="ri-loader-4-line text-2xl animate-spin" />
      </div>
    );
  }

  if (user) {
    if (user.role === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicAuthRoute;
