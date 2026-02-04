import React, { useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const underlineStyle: React.CSSProperties = { width: '100%', height: 1, background: '#6277ac', opacity: 0.9 };

type ProfileModalProps = {
  onClose: () => void;
  onEditProfile: () => void;
};

function ProfileModal({ onClose, onEditProfile }: ProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError(null);
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err?.response?.data?.detail || 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
      <div
        role="dialog"
        aria-modal="true"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
        onMouseDown={onClose}
      >
        <div
          style={{ position: 'relative', width: 750, height: 550, background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)', borderRadius: 20, boxShadow: '5px 5px 10px rgba(0,0,0,0.25)', fontFamily: 'Inter, system-ui, sans-serif' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Close"
            type="button"
            onMouseDown={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{ position: 'absolute', left: 30, top: 44, width: 50, height: 50, background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10, fontSize: 24 }}
          >
            ✕
          </button>

        <div style={{ position: 'absolute', left: '50%', top: 70, transform: 'translate(-50%, -50%)', width: 830, textAlign: 'center', color: '#6277ac', fontSize: 32, fontWeight: 600 }}>
          Profile
        </div>

        <div style={{ position: 'absolute', left: 100, top: 147, color: '#6277ac', fontSize: 16 }}>Username</div>
        <div style={{ position: 'absolute', left: 100, top: 177, width: 550, paddingLeft: 12, color: '#000', fontSize: 16 }}>
          {loading ? 'Loading...' : error ? <span style={{color: '#d32f2f'}}>Error: {error}</span> : profile?.name || 'N/A'}
        </div>
        <div style={{ position: 'absolute', left: 100, top: 197, width: 550 }}><div style={underlineStyle} /></div>

        <div style={{ position: 'absolute', left: 100, top: 236, color: '#6277ac', fontSize: 16 }}>Email</div>
        <div style={{ position: 'absolute', left: 100, top: 266, width: 550, paddingLeft: 12, color: '#000', fontSize: 16 }}>
          {loading ? 'Loading...' : error ? <span style={{color: '#d32f2f'}}>Error: {error}</span> : profile?.email || 'N/A'}
        </div>
        <div style={{ position: 'absolute', left: 100, top: 286, width: 550 }}><div style={underlineStyle} /></div>

        <button
          onClick={onEditProfile}
          aria-label="Edit profile"
          style={{ position: 'absolute', left: 100, top: 330, width: 150, height: 40, borderRadius: 10, border: '1px solid #6277ac', background: '#fff', color: '#6277ac', cursor: 'pointer' }}
        >
          Edit profile
        </button>
      </div>
    </div>
  );
}

export default React.memo(ProfileModal);