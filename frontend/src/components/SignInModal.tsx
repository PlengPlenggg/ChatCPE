import React, { useState } from 'react';
import { authAPI } from '../services/api';

// Inline replacements for arrow + underline to avoid remote fetch delay
const ArrowIcon = () => (
  <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 19 5 12 12 5" />
    <line x1="19" y1="12" x2="5" y2="12" />
  </svg>
);
const underlineStyle: React.CSSProperties = { width: '100%', height: 1, background: '#6277ac', opacity: 0.9 };

type Props = {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
  onSubmitSignIn?: () => void; // trigger navigation to logged in page
};

function PrimaryButton({ onClick, disabled }: { onClick?: () => void; disabled?: boolean }) {
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
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16 }}>Sign in</span>
    </button>
  );
}

function SignInModal({ open, onClose, onSwitchToSignUp, onSubmitSignIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      onSubmitSignIn?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000 }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 750,
          height: 580,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
          boxShadow: '5px 5px 10px rgba(0,0,0,0.25)'
        }}
        data-name="Sign in"
        data-node-id="1:174"
      >
        {/* Back arrow (acts as close) */}
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
input */}
        <div style={{ position: 'absolute', left: 100, top: 154, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{ position: 'absolute', left: 100, top: 180, width: 550, padding: '8px 0', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <div style={{ position: 'absolute', left: 100, top: 204, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Password label + input */}
        <div style={{ position: 'absolute', left: 100, top: 235, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{ position: 'absolute', left: 100, top: 260, width: 550, padding: '8px 0', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <div style={{ position: 'absolute', left: 100, top: 285, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Error message */}
        {error && (
          <div style={{ position: 'absolute', left: 100, top: 305, color: '#d32f2f', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error}
          </div>
        )}splay: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6277ac',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 40,handleSignIn} disabled={loading
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          Welcome to Chat CPE
        </div>

        {/* Email label + underline */}
        <div style={{ position: 'absolute', left: 100, top: 154, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <div style={{ position: 'absolute', left: 100, top: 204, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Password label + underline */}
        <div style={{ position: 'absolute', left: 100, top: 235, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Password</div>
        <div style={{ position: 'absolute', left: 100, top: 285, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* CTA triggers parent navigation (does not auto-close unless parent changes state) */}
        <PrimaryButton onClick={onSubmitSignIn} />

        {/* Sign up link */}
        <button
          onClick={onSwitchToSignUp}
          style={{
            position: 'absolute',
            left: 374.5,
            top: 400,
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
          <span style={{ color: 'rgba(117,117,117,0.76)' }}>Don’t have an account ?</span>
          <span> Sign up</span>
        </button>
      </div>
    </div>
  );
}

export default React.memo(SignInModal);
