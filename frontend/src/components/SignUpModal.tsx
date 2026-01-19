import React, { useState } from 'react';
import { authAPI } from '../services/api';

// Inline replacements for performance (remove remote image fetch)
const ArrowIcon = () => (
  <svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 19 5 12 12 5" />
    <line x1="19" y1="12" x2="5" y2="12" />
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
const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    try {
      const response = await authAPI.register(name, email, password, confirmPassword);
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }
function SignUpModal({ open, onBackToSignIn }: Props) {
  if (!open) return null;
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
        {/* Back arrow (return to sign in) */}
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
            cursor: 'pointe+ input */}
        <div style={{ position: 'absolute', left: 100, top: 154, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Username</div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          style={{ position: 'absolute', left: 100, top: 180, width: 550, padding: '8px 0', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <div style={{ position: 'absolute', left: 100, top: 204, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Email label + input */}
        <div style={{ position: 'absolute', left: 100, top: 235, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email (@mail.kmutt.ac.th)"
          style={{ position: 'absolute', left: 100, top: 261, width: 550, padding: '8px 0', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <div style={{ position: 'absolute', left: 100, top: 285, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Password label + input */}
        <div style={{ position: 'absolute', left: 100, top: 316, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Password</div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password"
          style={{ position: 'absolute', left: 100, top: 342, width: 550, padding: '8px 0', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <div style={{ position: 'absolute', left: 100, top: 366, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Confirm Password label + input */}
        <div style={{ position: 'absolute', left: 100, top: 397, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Confirm Password</div>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          style={{ position: 'absolute', left: 100, top: 423, width: 550, padding: '8px 0', border: 'none', borderBottom: '1px solid #6277ac', fontSize: 14, fontFamily: 'Inter, system-ui, sans-serif' }}
        />
        <div style={{ position: 'absolute', left: 100, top: 447, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Error message */}
        {error && (
          <div style={{ position: 'absolute', left: 100, top: 467, color: '#d32f2f', fontSize: 12, fontFamily: 'Inter, system-ui, sans-serif' }}>
            {error}handleSignUp} disabled={loading
          </div>
        )}ntSize: 40,
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          Create your account
        </div>

        {/* Username label */}
        <div style={{ position: 'absolute', left: 100, top: 154, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Username</div>
        <div style={{ position: 'absolute', left: 100, top: 204, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Email label */}
        <div style={{ position: 'absolute', left: 100, top: 235, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Email</div>
        <div style={{ position: 'absolute', left: 100, top: 285, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Password label */}
        <div style={{ position: 'absolute', left: 100, top: 316, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Password</div>
        <div style={{ position: 'absolute', left: 100, top: 366, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* Confirm Password label */}
        <div style={{ position: 'absolute', left: 100, top: 397, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>Confirm Password</div>
        <div style={{ position: 'absolute', left: 100, top: 447, width: 550 }}>
          <div style={underlineStyle} />
        </div>

        {/* CTA: sign up then swap back to sign in overlay */}
        <PrimaryButton onClick={onBackToSignIn} />
      </div>
    </div>
  );
}

export default React.memo(SignUpModal);
