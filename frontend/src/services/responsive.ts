/**
 * Responsive utility functions for styling
 * Helps create adaptive layouts based on screen size
 */

import React from 'react';

/**
 * Get responsive value based on viewport width
 * @param mobile - Value for mobile (< 768px)
 * @param tablet - Value for tablet (768px - 1023px)
 * @param laptop - Value for laptop (1024px - 1199px)
 * @param desktop - Value for desktop (1200px+)
 */
export const getResponsiveValue = (mobile: any, tablet?: any, laptop?: any, desktop?: any): any => {
  if (typeof window === 'undefined') return mobile;
  
  const width = window.innerWidth;
  
  if (width < 768) return mobile;
  if (width < 1024) return tablet || mobile;
  if (width < 1200) return laptop || tablet || mobile;
  return desktop || laptop || tablet || mobile;
};

/**
 * Get responsive modal width
 */
export const getModalWidth = (): string | number => {
  if (typeof window === 'undefined') return 750;
  
  const width = window.innerWidth;
  if (width < 768) return '95vw';
  if (width < 1024) return '90vw';
  if (width < 1440) return 750;
  return 850;
};

/**
 * Get responsive modal height
 */
export const getModalHeight = (): string | number => {
  if (typeof window === 'undefined') return 580;
  
  const width = window.innerWidth;
  if (width < 768) return '90vh';
  if (width < 1024) return 550;
  if (width < 1440) return 580;
  return 650;
};

/**
 * Get responsive input width
 */
export const getInputWidth = (): string | number => {
  if (typeof window === 'undefined') return 550;
  
  const width = window.innerWidth;
  if (width < 768) return 'calc(95vw - 40px)';
  if (width < 1024) return 'calc(90vw - 80px)';
  if (width < 1440) return 550;
  return 600;
};

/**
 * Check if device is mobile
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= 768 && width < 1024;
};

/**
 * Check if device is desktop
 */
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 1024;
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (mobileSize: number, desktopSize: number): number => {
  if (typeof window === 'undefined') return desktopSize;
  
  const width = window.innerWidth;
  if (width < 768) return mobileSize;
  if (width < 1024) return mobileSize + 1;
  if (width < 1440) return desktopSize - 1;
  return desktopSize;
};

/**
 * Get responsive padding
 */
export const getResponsivePadding = (): number => {
  if (typeof window === 'undefined') return 100;
  
  const width = window.innerWidth;
  if (width < 768) return 15;
  if (width < 1024) return 20;
  if (width < 1440) return 80;
  return 100;
};

/**
 * Hook to use responsive values with state updates on resize
 */
export const useResponsiveValue = (mobile: any, tablet?: any, laptop?: any, desktop?: any) => {
  const [value, setValue] = React.useState(getResponsiveValue(mobile, tablet, laptop, desktop));

  React.useEffect(() => {
    const handleResize = () => {
      setValue(getResponsiveValue(mobile, tablet, laptop, desktop));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobile, tablet, laptop, desktop]);

  return value;
};
