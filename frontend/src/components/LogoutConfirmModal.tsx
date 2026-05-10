import React from 'react';

// Inline styles replacing any potential remote decorative lines for speed (none used yet, but ready)
const ActionButtonStyle: React.CSSProperties = {
  width: 120,
  height: 40,
  borderRadius: 100,
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500,
  fontFamily: 'Inter, system-ui, sans-serif'
};

interface LogoutConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void; // triggers actual logout -> parent sets loggedIn false
}

function LogoutConfirmModal({ onCancel, onConfirm }: LogoutConfirmModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div
        style={{
          position: 'relative',
          width: 420,
          minHeight: 220,
          background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
          borderRadius: 18,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.25)',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '32px 28px'
        }}
        data-node-id="logout-popup"
      >
        <h3 style={{ margin: 0, color: '#4960ac', fontSize: 24, fontWeight: 600, textAlign: 'center' }}>Confirm Logout</h3>
        <p style={{ margin: '16px 0 28px', color: '#6277ac', fontSize: 14, textAlign: 'center' }}>
          Are you sure you want to log out?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...ActionButtonStyle, background: '#fff', boxShadow: '0 0 0 1px #7587b8 inset', color: '#4960ac' }}
            aria-label="Cancel logout"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{ ...ActionButtonStyle, background: 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(117,135,184,0.8))', color: '#fff' }}
            aria-label="Confirm logout"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(LogoutConfirmModal);
