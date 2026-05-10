import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
    {!open && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
);

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
        width: 550,
        height: 44,
        marginTop: 40,
        borderRadius: 40,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#fff',
        opacity: disabled ? 0.6 : 1,
        background: pressed && !disabled
          ? 'linear-gradient(90deg, rgba(255,206,142,0.8), rgba(255,148,11,0.8))'
          : 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(98,119,172,0.8))'
      }}
    >
      <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16 }}>{text}</span>
    </button>
  );
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Token not found.');
    }
  }, [token]);

  const handleResetPassword = async () => {
    if (!token) {
      setError('Invalid reset link');
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setError('Please enter both passwords');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: 750,
          borderRadius: 20,
          background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)',
          boxShadow: '5px 5px 10px rgba(0,0,0,0.25)',
          padding: '60px 100px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            color: '#6277ac',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            fontSize: 32,
            marginBottom: 20
          }}
        >
          Reset Your Password
        </div>

        <div
          style={{
            color: '#6277ac',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            marginBottom: 30
          }}
        >
          Enter your new password below. Make sure it's at least 8 characters long.
        </div>

        {error && !success && (
          <div
            style={{
              color: '#d32f2f',
              fontSize: 14,
              fontFamily: 'Inter, system-ui, sans-serif',
              marginBottom: 20,
              padding: '10px',
              background: 'rgba(211, 47, 47, 0.1)',
              borderRadius: 5
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              color: '#2e7d32',
              fontSize: 14,
              fontFamily: 'Inter, system-ui, sans-serif',
              marginBottom: 20,
              padding: '10px',
              background: 'rgba(46, 125, 50, 0.1)',
              borderRadius: 5
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            position: 'relative',
            marginBottom: 20,
            textAlign: 'left'
          }}
        >
          <label style={{ color: '#6277ac', fontSize: 16, fontFamily: 'Inter, system-ui, sans-serif', display: 'block', marginBottom: 8 }}>
            New Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
            placeholder="Enter new password"
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: 'none',
              borderBottom: '1px solid #6277ac',
              fontSize: 14,
              fontFamily: 'Inter, system-ui, sans-serif',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 10,
              width: 30,
              height: 30,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            marginBottom: 20,
            textAlign: 'left'
          }}
        >
          <label style={{ color: '#6277ac', fontSize: 16, fontFamily: 'Inter, system-ui, sans-serif', display: 'block', marginBottom: 8 }}>
            Confirm Password
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
            placeholder="Confirm new password"
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              border: 'none',
              borderBottom: '1px solid #6277ac',
              fontSize: 14,
              fontFamily: 'Inter, system-ui, sans-serif',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 10,
              width: 30,
              height: 30,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <EyeIcon open={showConfirmPassword} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PrimaryButton onClick={handleResetPassword} disabled={loading} text={loading ? 'Resetting...' : 'Reset Password'} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(ResetPasswordPage);
