import React from 'react';

export const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000 // Default z-index, can be overridden
};

export const modalContentStyle: React.CSSProperties = {
  position: 'relative',
  background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
  borderRadius: 20,
  boxShadow: '5px 5px 10px rgba(0,0,0,0.25)',
  fontFamily: 'Inter, system-ui, sans-serif'
};
