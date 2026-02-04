import React, { useState } from 'react';
import { authAPI } from '../services/api';

// Replacing remote arrow + line with inline assets for faster rendering
const ArrowIcon = () => (
  <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 19 5 12 12 5" />
    <line x1="19" y1="12" x2="5" y2="12" />
  </svg>
);
const underlineStyle: React.CSSProperties = { width: '100%', height: 1, background: '#6277ac', opacity: 0.9 };

interface EditProfileModalProps {
  onBack: () => void; // swap back to ProfileModal
  onSave?: (newUsername: string) => void;
}

function EditProfileModal({ onBack, onSave }: EditProfileModalProps) {
  const [username, setUsername] = useState("");
  const [pressed, setPressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.updateProfile(username.trim());
      onSave && onSave(username.trim());
      onBack();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
      <div
        style={{
          position: 'relative',
          width: 750,
          height: 550,
          background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
          borderRadius: 20,
          boxShadow: '5px 5px 10px rgba(0,0,0,0.25)',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
        data-node-id="34:655"
      >
        {/* Back arrow (swap back to profile) */}
        <button
          aria-label="Back to Profile"
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute',
            left: 30,
            top: 44,
            width: 50,
            height: 50,
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5 // ensure arrow is above title layer for clickability
          }}
        >
          <ArrowIcon />
        </button>

        {/* Title */}
        <div style={{ position: 'absolute', left: '50%', top: 69, transform: 'translate(-50%, -50%)', width: 830, textAlign: 'center', color: '#6277ac', fontSize: 40, fontWeight: 600 }}>Edit Profile</div>

        {/* New Username label + input */}
        <label htmlFor="edit-username" style={{ position: 'absolute', left: 100, top: 205, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>New Username</label>
        <input
          id="edit-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter new username"
          style={{ position: 'absolute', left: 100, top: 260, width: 550, padding: '8px 60px 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />

        {/* Error message */}
        {error && (
          <div style={{ position: 'absolute', left: 100, top: 290, color: '#d32f2f', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error}
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          style={{
            position: 'absolute',
            left: 284,
            top: 318,
            width: 182,
            height: 44,
            borderRadius: 100,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: pressed && !loading
              ? 'linear-gradient(90deg, rgba(255,206,142,0.8), rgba(255,148,11,0.8))'
              : 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(117,135,184,0.8))',
            color: '#fff',
            fontSize: 16,
            fontWeight: 500,
            fontFamily: 'Inter, system-ui, sans-serif',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default React.memo(EditProfileModal);