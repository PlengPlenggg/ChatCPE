import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ArrowIcon = () => (
  <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 19 5 12 12 5" />
    <line x1="19" y1="12" x2="5" y2="12" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {!open && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

type Props = {
  open: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToForgotPassword?: () => void;
  onSubmitSignIn?: () => void;
};

const authInputTextStyle: React.CSSProperties = {
  color: '#24324f',
  WebkitTextFillColor: '#24324f',
  caretColor: '#24324f'
};

function PrimaryButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
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

function SignInModal({ open, onClose, onSwitchToSignUp, onSwitchToForgotPassword, onSubmitSignIn }: Props) {
  const layout = useResponsiveLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const modalScale = Math.max(0.55, Math.min((viewportWidth - 24) / 750, (viewportHeight - 24) / 580, 1));

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
      localStorage.setItem('user_id', String(response.data.user_id));
      onSubmitSignIn?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
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

          <div style={{ color: '#6277ac', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: 34, lineHeight: 1.1, textAlign: 'center', marginBottom: 14 }}>
            Welcome to
            <br />
            Chat CPE
          </div>

          <div style={{ color: '#6277ac', fontSize: 14, marginBottom: 6 }}>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            placeholder="Enter your email"
            style={{ width: '100%', padding: '10px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 16, fontFamily: 'Inter, system-ui, sans-serif', marginBottom: 12, boxSizing: 'border-box', background: 'transparent', ...authInputTextStyle }}
          />

          <div style={{ color: '#6277ac', fontSize: 14, marginBottom: 6 }}>Password</div>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '10px 44px 10px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 16, fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box', background: 'transparent', ...authInputTextStyle }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 8, top: 6, width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {error && (
            <div style={{ color: '#d32f2f', fontSize: 12, marginBottom: 10, fontFamily: 'Inter, system-ui, sans-serif' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={{ width: '100%', height: 44, borderRadius: 40, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', opacity: loading ? 0.6 : 1, background: 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(98,119,172,0.8))', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, marginBottom: 10 }}
          >
            Sign in
          </button>

          <div style={{ textAlign: 'center' }}>
            <button onClick={onSwitchToForgotPassword} style={{ border: 'none', background: 'transparent', color: '#6277ac', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11, textDecoration: 'underline', marginBottom: 4 }}>
              Forgot Password?
            </button>
            <br />
            <button onClick={onSwitchToSignUp} style={{ border: 'none', background: 'transparent', color: '#6277ac', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 11 }}>
              <span style={{ color: 'rgba(117,117,117,0.76)' }}>Don't have an account ?</span>
              <span> Sign up</span>
            </button>
          </div>
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
        data-name="Sign in"
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
          Welcome to Chat CPE
        </div>

        <div style={{ position: 'absolute', left: 100, top: 154, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          placeholder="Enter your email"
          style={{ position: 'absolute', left: 100, top: 180, width: 550, padding: '8px 0 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 16, fontFamily: 'Inter, system-ui, sans-serif', ...authInputTextStyle }}
        />

        <div style={{ position: 'absolute', left: 100, top: 235, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Password</div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          placeholder="Enter your password"
          style={{ position: 'absolute', left: 100, top: 260, width: 550, padding: '8px 60px 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 16, fontFamily: 'Inter, system-ui, sans-serif', ...authInputTextStyle }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{ position: 'absolute', left: 600, top: 265, width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <EyeIcon open={showPassword} />
        </button>

        {error && (
          <div style={{ position: 'absolute', left: 100, top: 305, color: '#d32f2f', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error}
          </div>
        )}

        <PrimaryButton onClick={handleSignIn} disabled={loading} />

        <button
          onClick={onSwitchToForgotPassword}
          style={{
            position: 'absolute',
            left: 374.5,
            top: 380,
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
          <span style={{ color: '#6277ac', textDecoration: 'underline' }}>Forgot Password?</span>
        </button>

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
          <span style={{ color: 'rgba(117,117,117,0.76)' }}>Don't have an account ?</span>
          <span> Sign up</span>
        </button>
      </div>
    </div>
  );
}

export default React.memo(SignInModal);
