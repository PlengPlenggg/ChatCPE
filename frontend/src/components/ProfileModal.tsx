import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const imgImage4 = "https://www.figma.com/api/mcp/asset/9382f54f-de53-40bd-97e6-51bfea13fedc"; // logo/avatar placeholder
const imgIconEye = "https://www.figma.com/api/mcp/asset/5da12c46-449e-4218-b1f9-64b0cab5c36e"; // eye icon (kept remote for now)
const imgIconEyeOff = "https://www.figma.com/api/mcp/asset/e18b9b3b-c11a-41c8-b386-4b74758e428d"; // eye off icon (kept remote for now)
// Replaced arrow + underline lines with inline SVG & CSS to eliminate remote fetch latency.

const ArrowIcon = () => (
  <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 19 5 12 12 5" />
    <line x1="19" y1="12" x2="5" y2="12" />
  </svg>
);

const underlineStyle: React.CSSProperties = { width: '100%', height: 1, background: '#6277ac', opacity: 0.9 };

interface ProfileModalProps {
  onClose: () => void;
  onEditProfile: () => void; // swap overlay to edit profile
}

function ProfileModal({ onClose, onEditProfile }: ProfileModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={(e) => e.stopPropagation()}>
      <div style={{ position: 'relative', width: 750, height: 550, background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)', borderRadius: 20, boxShadow: '5px 5px 10px rgba(0,0,0,0.25)', fontFamily: 'Inter, system-ui, sans-serif' }} data-node-id="34:610">
        {/* Back arrow (only way to close) */}
        <button
          aria-label="Close"
          type="button"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          style={{
            position: 'absolute',
            left: 30,
            top: 44,
            width: 50,80, width: 550, color: '#000', fontSize: 16 }}>
          {loading ? 'Loading...' : profile?.name || 'N/A'}
        </div>
        <div style={{ position: 'absolute', left: 100, top: 197, width: 550 }}>
          <div style={underlineStyle} />
        </div>
        {/* Email field */}
        <div style={{ position: 'absolute', left: 100, top: 236, color: '#6277ac', fontSize: 16 }}>Email</div>
        <div style={{ position: 'absolute', left: 100, top: 270, width: 550, color: '#000', fontSize: 16 }}>
          {loading ? 'Loading...' : profile?.email || 'N/A'}
        </div>
        <div style={{ position: 'absolute', left: 100, top: 286, width: 550 }}><div style={underlineStyle} /></div>
        {/* Password field */}
        <div style={{ position: 'absolute', left: 100, top: 325, color: '#6277ac', fontSize: 16 }}>Password</div>
        <div style={{ position: 'absolute', left: 100, top: 355, width: 550, color: '#000' }}>
          {showPassword ? '••••••••' : '••••••••'}
        
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowIcon />
        </button>
        {/* Title */}
        <div style={{ position: 'absolute', left: '50%', top: 69, transform: 'translate(-50%, -50%)', width: 830, textAlign: 'center', color: '#6277ac', fontSize: 40, fontWeight: 600 }}>Profile</div>
        {/* Username field */}
        <div style={{ position: 'absolute', left: 100, top: 147, color: '#6277ac', fontSize: 16 }}>Username</div>
        <div style={{ position: 'absolute', left: 100, top: 197, width: 550 }}>
          <div style={underlineStyle} />
        </div>
        {/* Email field */}
        <div style={{ position: 'absolute', left: 100, top: 236, color: '#6277ac', fontSize: 16 }}>Email</div>
        <div style={{ position: 'absolute', left: 100, top: 286, width: 550 }}><div style={underlineStyle} /></div>
        {/* Password field */}
        <div style={{ position: 'absolute', left: 100, top: 325, color: '#6277ac', fontSize: 16 }}>Password</div>
        <div style={{ position: 'absolute', left: 100, top: 375, width: 550 }}><div style={underlineStyle} /></div>
        {/* Eye icon toggle */}
        {!showPassword ? (
          <button
            type="button"
            aria-label="Show password"
            onClick={() => setShowPassword(true)}
            style={{ position: 'absolute', left: 636, top: 355, width: 15, height: 15, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <img alt="Show password" src={imgIconEyeOff} style={{ width: '100%', height: '100%' }} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Hide password"
            onClick={() => setShowPassword(false)}
            style={{ position: 'absolute', left: 636, top: 355, width: 15, height: 13, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <img alt="Hide password" src={imgIconEye} style={{ width: '100%', height: '100%' }} />
          </button>
        )}
        {/* Avatar placeholder (opens edit profile) */}
        <button
          onClick={onEditProfile}
          aria-label="Edit profile"
          style={{ position: 'absolute', left: 635, top: 177, width: 15, height: 15, background: 'transparent', padding: 0, border: 'none', cursor: 'pointer' }}
        >
          <img alt="Avatar" src={imgImage4} style={{ width: '100%', height: '100%' }} />
        </button>
      </div>
    </div>
  );
}

export default React.memo(ProfileModal);