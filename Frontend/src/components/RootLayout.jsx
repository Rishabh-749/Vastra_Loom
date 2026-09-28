import React from 'react';
import { Outlet, useLocation } from 'react-router';
import SmoothScroll from './SmoothScroll';
import PageTransition from './PageTransition';

/**
 * Root Layout Wrapper
 * Enforces smooth scrolling via Lenis and page transitions via Motion
 */
export const RootLayout = () => {
  const location = useLocation();

  return (
    <SmoothScroll>
      <PageTransition key={location.pathname}>
        <Outlet />
      </PageTransition>
    </SmoothScroll>
  );
};

export default RootLayout;
