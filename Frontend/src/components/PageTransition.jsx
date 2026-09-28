import React from 'react';
import { motion } from 'motion/react';

/**
 * Enterprise Page Transition Wrapper
 * Delivers delicate, high-end opacity and subtle vertical displacement transitions
 */
export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
