/**
 * Hook for responsive layout calculations
 * Returns responsive dimensions based on screen size
 */

import { useState, useEffect } from 'react';

export interface ResponsiveLayout {
  minHeight: number | string;
  mainPaddingLeft: number;
  sidebarWidth: number;
  sidebarHeight: number | string;
  contentWidth: number | string;
  modalWidth: number | string;
  modalHeight: number | string;
  inputWidth: number | string;
  fontSize: number;
}

export const useResponsiveLayout = (): ResponsiveLayout => {
  const [layout, setLayout] = useState<ResponsiveLayout>({
    minHeight: 730,
    mainPaddingLeft: 100,
    sidebarWidth: 285,
    sidebarHeight: 730,
    contentWidth: 'calc(100% - 285px)',
    modalWidth: 750,
    modalHeight: 580,
    inputWidth: 550,
    fontSize: 14,
  });

  useEffect(() => {
    const calculateLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Desktop Large (1440px+)
      if (width >= 1440) {
        setLayout({
          minHeight: height > 730 ? height : 730,
          mainPaddingLeft: 120,
          sidebarWidth: 300,
          sidebarHeight: height > 730 ? height : 730,
          contentWidth: width > 585 ? `calc(100% - 300px)` : '100%',
          modalWidth: 850,
          modalHeight: 650,
          inputWidth: 600,
          fontSize: 15,
        });
      }
      // Laptop/Desktop (1200px - 1439px) - DEFAULT
      else if (width >= 1200) {
        setLayout({
          minHeight: height > 730 ? height : 730,
          mainPaddingLeft: 100,
          sidebarWidth: 285,
          sidebarHeight: height > 730 ? height : 730,
          contentWidth: width > 385 ? `calc(100% - 285px)` : '100%',
          modalWidth: 750,
          modalHeight: 580,
          inputWidth: 550,
          fontSize: 14,
        });
      }
      // Laptop 13"-15" (1024px - 1199px)
      else if (width >= 1024) {
        setLayout({
          minHeight: height > 700 ? height : 700,
          mainPaddingLeft: 80,
          sidebarWidth: 240,
          sidebarHeight: height > 700 ? height : 700,
          contentWidth: width > 320 ? `calc(100% - 240px)` : '100%',
          modalWidth: 700,
          modalHeight: 550,
          inputWidth: 500,
          fontSize: 13,
        });
      }
      // Tablet (768px - 1023px)
      else if (width >= 768) {
        setLayout({
          minHeight: '100vh',
          mainPaddingLeft: 20,
          sidebarWidth: width > 600 ? 200 : width,
          sidebarHeight: '100vh',
          contentWidth: width > 600 ? `calc(100% - 200px)` : '100%',
          modalWidth: '90vw',
          modalHeight: 'auto',
          inputWidth: 'calc(90vw - 80px)',
          fontSize: 13,
        });
      }
      // Mobile (< 768px)
      else {
        setLayout({
          minHeight: '100vh',
          mainPaddingLeft: 15,
          sidebarWidth: width,
          sidebarHeight: '100vh',
          contentWidth: '100%',
          modalWidth: '95vw',
          modalHeight: 'auto',
          inputWidth: 'calc(95vw - 40px)',
          fontSize: 12,
        });
      }
    };

    calculateLayout();

    // Recalculate on resize
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

  return layout;
};

/**
 * Simpler hook for just modal dimensions
 */
export const useModalDimensions = () => {
  const layout = useResponsiveLayout();
  return {
    width: layout.modalWidth,
    height: layout.modalHeight,
    inputWidth: layout.inputWidth,
  };
};
