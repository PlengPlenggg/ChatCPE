import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';

export interface ResponsiveLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
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
  const isNarrowWidth = useMediaQuery({ maxWidth: 767 });
  const isCoarsePointer = useMediaQuery({ query: '(pointer: coarse)' });
  const isNoHover = useMediaQuery({ query: '(hover: none)' });
  const isMobile = isNarrowWidth && (isCoarsePointer || isNoHover);
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isLaptop = useMediaQuery({ minWidth: 1024, maxWidth: 1199 });
  const isDesktop = useMediaQuery({ minWidth: 1200 });
  const isWideDesktop = useMediaQuery({ minWidth: 1440 });

  return useMemo(() => {
    if (isWideDesktop) {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        minHeight: 730,
        mainPaddingLeft: 120,
        sidebarWidth: 340,
        sidebarHeight: '100vh',
        contentWidth: 'calc(100% - 340px)',
        modalWidth: 850,
        modalHeight: 650,
        inputWidth: 600,
        fontSize: 15,
      };
    }

    if (isDesktop) {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        minHeight: 730,
        mainPaddingLeft: 100,
        sidebarWidth: 320,
        sidebarHeight: '100vh',
        contentWidth: 'calc(100% - 320px)',
        modalWidth: 750,
        modalHeight: 580,
        inputWidth: 550,
        fontSize: 14,
      };
    }

    if (isLaptop) {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        minHeight: 700,
        mainPaddingLeft: 80,
        sidebarWidth: 240,
        sidebarHeight: '100vh',
        contentWidth: 'calc(100% - 240px)',
        modalWidth: 700,
        modalHeight: 550,
        inputWidth: 500,
        fontSize: 13,
      };
    }

    if (isTablet) {
      return {
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        minHeight: '100vh',
        mainPaddingLeft: 20,
        sidebarWidth: 200,
        sidebarHeight: '100vh',
        contentWidth: 'calc(100% - 200px)',
        modalWidth: '90vw',
        modalHeight: 'auto',
        inputWidth: 'calc(90vw - 80px)',
        fontSize: 13,
      };
    }

    if (isNarrowWidth && !isMobile) {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        minHeight: 680,
        mainPaddingLeft: 20,
        sidebarWidth: 220,
        sidebarHeight: '100vh',
        contentWidth: 'calc(100% - 220px)',
        modalWidth: 680,
        modalHeight: 520,
        inputWidth: 460,
        fontSize: 13,
      };
    }

    return {
      isMobile,
      isTablet: false,
      isDesktop: false,
      minHeight: '100vh',
      mainPaddingLeft: 12,
      sidebarWidth: 0,
      sidebarHeight: '100vh',
      contentWidth: '100%',
      modalWidth: '95vw',
      modalHeight: 'auto',
      inputWidth: 'calc(95vw - 40px)',
      fontSize: 12,
    };
  }, [isDesktop, isLaptop, isMobile, isNarrowWidth, isTablet, isWideDesktop]);
};

export const useModalDimensions = () => {
  const layout = useResponsiveLayout();
  return {
    width: layout.modalWidth,
    height: layout.modalHeight,
    inputWidth: layout.inputWidth,
  };
};
