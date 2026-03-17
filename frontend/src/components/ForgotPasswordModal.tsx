import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ArrowIcon = () => (
  <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 19 5 12 12 5" />
    <line x1="19" y1="12" x2="5" y2="12" />
  </svg>
);

type Props = {
  open: boolean;
  onClose: () => void;
  onBackToSignIn?: () => void;
};

function PrimaryButton({ onClick, disabled, text }: { onClick: () => void; disabled?: boolean; text: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        position: 'absolute',
        left: 100,
        top: 325,
        width: 550,
        height: 44,
        borderRadius: 40,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#fff',
        opacity: disabled ? 0.6 : 1,
        background: pressed && !disabled
          ? 'linear-gradient(90deg, rgba(255,206,142,0.8), rgba(255,148,11,0.8))'
          : 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(98,119,172,0.8))'
      }}
      data-node-id="34:360"
    >
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16 }}>{text}</span>
    </button>
  );
}

function ForgotPasswordModal({ open, onClose, onBackToSignIn }: Props) {
  const layout = useResponsiveLayout();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!open) return null;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const modalScale = Math.max(0.55, Math.min((viewportWidth - 24) / 750, (viewportHeight - 24) / 580, 1));

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess('Check your email for password reset link');
      setTimeout(() => {
        onBackToSignIn?.();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (layout.isMobile) {
    return (
      <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
        <div className="auth-modal-content" style={{ width: '100%', maxWidth: 380, borderRadius: 16, background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)', boxShadow: '5px 5px 10px rgba(0,0,0,0.25)', padding: '16px 14px 18px', boxSizing: 'border-box' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ width: 36, height: 36, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}
          >
            <ArrowIcon />
          </button>

          <div style={{ color: '#6277ac', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 30, lineHeight: 1.1, textAlign: 'center', marginBottom: 10 }}>
            Reset Your Password
          </div>

          <div style={{ color: '#6277ac', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
            Enter your email address and we will send you a link to reset your password.
          </div>

          <div style={{ color: '#6277ac', fontSize: 14, marginBottom: 6 }}>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
            placeholder="Enter your email"
            style={{ width: '100%', padding: '10px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 12, boxSizing: 'border-box', background: 'transparent' }}
          />

          {error && (
            <div style={{ color: '#d32f2f', fontSize: 12, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: '#2e7d32', fontSize: 12, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {success}
            </div>
          )}

          <button
            onClick={handleForgotPassword}
            disabled={loading}
            style={{ width: '100%', height: 44, borderRadius: 40, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', opacity: loading ? 0.6 : 1, background: 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(98,119,172,0.8))', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, marginBottom: 8 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <button
            onClick={onBackToSignIn}
            style={{ width: '100%', border: 'none', background: 'transparent', color: '#6277ac', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, textDecoration: 'underline' }}
          >
            Back to Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, boxSizing: 'border-box' }}>
      <div
        className="auth-modal-content"
        style={{
          position: 'relative',
          transform: `scale(${modalScale})`,
          transformOrigin: 'center center',
          width: 750,
          height: 580,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
          boxShadow: '5px 5px 10px rgba(0,0,0,0.25)'
        }}
        data-name="Forgot Password"
        data-node-id="1:174"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            left: 30,
            top: 44,
            width: 50,
            height: 50,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transform: 'none'
          }}
        >
          <ArrowIcon />
        </button>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 90,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6277ac',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 32,
            textAlign: 'center'
          }}
        >
          Reset Your Password
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 140,
            transform: 'translate(-50%, -50%)',
            width: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6277ac',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            textAlign: 'center'
          }}
        >
          Enter your email address and we'll send you a link to reset your password.
        </div>

        <div style={{ position: 'absolute', left: 100, top: 204, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
          placeholder="Enter your email"
          style={{ position: 'absolute', left: 100, top: 230, width: 550, padding: '8px 0 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />

        {error && (
          <div style={{ position: 'absolute', left: 100, top: 280, color: '#d32f2f', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ position: 'absolute', left: 100, top: 280, color: '#2e7d32', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {success}
          </div>
        )}

        <PrimaryButton onClick={handleForgotPassword} disabled={loading} text={loading ? 'Sending...' : 'Send Reset Link'} />

        <button
          onClick={onBackToSignIn}
          style={{
            position: 'absolute',
            left: 374.5,
            bottom: 30,
            transform: 'translate(-50%, -50%)',
            width: 185,
            height: 22,
            border: 'none',
            background: 'transparent',
            color: '#6277ac',
            cursor: 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 10
          }}
        >
          <span style={{ color: 'rgba(117,117,117,0.76)' }}>Back to </span>
          <span>Sign in</span>
        </button>
      </div>
    </div>
  );
}

export default React.memo(ForgotPasswordModal);
