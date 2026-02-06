import React, { useState } from 'react';
import { authAPI } from '../services/api';

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

const underlineStyle: React.CSSProperties = { width: '100%', height: 1, background: '#6277ac', opacity: 0.9 };

type Props = {
  open: boolean;
  onBackToSignIn: () => void;
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
        top: 485,
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
      data-node-id="34:374"
    >
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16 }}>Sign up</span>
    </button>
  );
}

function SignUpModal({ open, onBackToSignIn }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!open) return null;

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await authAPI.register(name, email, password, confirmPassword);
      setSuccessMessage(response.data.message || 'Verification email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000 }}>
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
        data-name="Sign up"
        data-node-id="34:374"
      >
        <button
          onClick={onBackToSignIn}
          aria-label="Back to Sign in"
          style={{
            position: 'absolute',
            left: 30,
            top: 44,
            width: 50,
            height: 50,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
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
          Create your account
        </div>

        <div style={{ position: 'absolute', left: 100, top: 154, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Username</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          placeholder="Enter your full name"
          style={{ position: 'absolute', left: 100, top: 180, width: 550, padding: '8px 0 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        
        <div style={{ position: 'absolute', left: 100, top: 235, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          placeholder="Enter your email (@gmail.com)"
          style={{ position: 'absolute', left: 100, top: 261, width: 550, padding: '8px 0 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />

        <div style={{ position: 'absolute', left: 100, top: 316, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Password</div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          placeholder="Enter a password"
          style={{ position: 'absolute', left: 100, top: 342, width: 550, padding: '8px 60px 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          style={{ position: 'absolute', left: 600, top: 347, width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <EyeIcon open={showPassword} />
        </button>

        <div style={{ position: 'absolute', left: 100, top: 397, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Confirm Password</div>
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
          placeholder="Confirm your password"
          style={{ position: 'absolute', left: 100, top: 423, width: 550, padding: '8px 60px 8px 12px', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          style={{ position: 'absolute', left: 600, top: 428, width: 30, height: 30, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <EyeIcon open={showConfirmPassword} />
        </button>

        {error && (
          <div style={{ position: 'absolute', left: 100, top: 467, color: '#d32f2f', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error}
          </div>
        )}

        {successMessage && (
          <div style={{ position: 'absolute', left: 100, top: 467, color: '#2e7d32', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {successMessage}
          </div>
        )}

        <PrimaryButton onClick={handleSignUp} disabled={loading} />

        {successMessage && (
          <button
            onClick={onBackToSignIn}
            style={{
              position: 'absolute',
              left: 374.5,
              top: 525,
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
            Back to Sign in
          </button>
        )}
      </div>
    </div>
  );
}

export default React.memo(SignUpModal);
