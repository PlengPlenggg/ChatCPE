import React, { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { authAPI, faqAPI } from '../services/api';
const ProfileModal = React.lazy(() => import('./ProfileModal'));
const EditProfileModal = React.lazy(() => import('./EditProfileModal'));
const LogoutConfirmModal = React.lazy(() => import('./LogoutConfirmModal'));

// Assets based on Figma node 34:476 extraction (no Tailwind, inline styles)
const imgLogoCpe = "https://www.figma.com/api/mcp/asset/eef2b23b-4e43-4e55-9482-547a9b45e83c";
const imgNewChat = "https://www.figma.com/api/mcp/asset/d22173fb-a8dc-434c-8c7e-2ced04c7efdd";
const imgIconLogout = "https://www.figma.com/api/mcp/asset/c92c9123-0100-45dd-94dd-d60902d08ba5";
const imgLine1 = "https://www.figma.com/api/mcp/asset/47181470-9c71-4be8-81e8-beb1d0e5fd80";
const imgArrowUp = "https://www.figma.com/api/mcp/asset/dbe62b01-0422-48d0-afc0-ccb62eeb30d2";
const imgPaperclip = "https://www.figma.com/api/mcp/asset/b6035596-514d-42f6-b1e0-4d5130aee8d5";
const imgStar = "https://www.figma.com/api/mcp/asset/e54a6e9c-0384-4af8-b21a-9d6616bb71c6";
const imgMessageCircle = "https://www.figma.com/api/mcp/asset/1de302d4-20da-4fb9-8a33-27e6e7f00e5a";
const imgEllipseProfile = "https://www.figma.com/api/mcp/asset/83062a3a-88f4-4343-8ada-b1c6de0ecab9";

interface LoggedInPageProps {
  onLogout?: () => void; // signal parent to go back to HomeAi
}

export default function LoggedInPage({ onLogout }: LoggedInPageProps) {
  const [selected, setSelected] = useState<'ai' | 'qa' | 'doc'>('ai');
  const [profile, setProfile] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const iconPositions: Record<'ai' | 'qa' | 'doc', number> = { ai: 266, qa: 319, doc: 372 };
  const highlightTop = useMemo(() => iconPositions[selected] - 13, [selected]);

  const [profileView, setProfileView] = useState<'none' | 'profile' | 'edit'>('none');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    loadProfileAndFAQ();
  }, []);
async () => {
    setShowLogoutConfirm(false);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      onLogout && onLogout();
    }
      const profileRes = await authAPI.getProfile();
      setProfile(profileRes.data);
      const faqRes = await faqAPI.getAllFAQs();
      setFaqs(faqRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const [profileView, setProfileView] = useState<'none' | 'profile' | 'edit'>('none');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const openProfile = useCallback(() => setProfileView('profile'), []);
  const openEditProfile = useCallback(() => setProfileView('edit'), []);
  const closeProfile = useCallback(() => setProfileView('none'), []);
  const openLogoutConfirm = useCallback(() => setShowLogoutConfirm(true), []);
  const cancelLogout = useCallback(() => setShowLogoutConfirm(false), []);
  const confirmLogout = useCallback(() => {
    setShowLogoutConfirm(false);
    onLogout && onLogout();
  }, [onLogout]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 730, background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)' }} data-node-id="34:476">
      {/* Sidebar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 285, height: 730, background: '#e4eef8' }} />
      <div style={{ position: 'absolute', left: 42, top: 19, width: 143, height: 122, overflow: 'hidden', pointerEvents: 'none' }}>
        <img alt="CPE Logo" src={imgLogoCpe} style={{ position: 'absolute', width: '212.39%', height: '140.6%', left: '-112.38%', top: '-18.6%' }} />
      </div>
      <div style={{ position: 'absolute', left: 25, top: 233, width: 236, height: 1 }}>
        <img alt="" src={imgLine1} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', left: 25, top: highlightTop, width: 236, height: 44, borderRadius: 10, background: '#7587b8', transition: 'top 0.25s' }} />
      <div style={{ position: 'absolute', left: 31, top: highlightTop, width: 230, height: 44, borderRadius: 10, background: '#fff', transition: 'top 0.25s' }} />

      {/* AI Chat */}
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: 70, top: 266, width: 18, height: 18, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '12.5%' }}>
          <div style={{ position: 'absolute', inset: '-5.93%' }}>
            <img alt="AI Chat" src={imgMessageCircle} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'none' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: 109.47, top: 275.48, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>
      
       {/* New chat */}
      <div style={{ position: 'absolute', left: 70, top: 186.83, width: 34, height: 27, overflow: 'hidden' }}>
        <img alt="New chat" src={imgNewChat} style={{ position: 'absolute', width: 25, height: 25, left: 0, bottom: 3, opacity: 0.9 }} />
      </div>
      <div style={{ position: 'absolute', left: 109.47, top: 196.31, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>New Chat</div>

      {/* Q & A */}
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: 70, top: 319, width: 18, height: 18, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
          <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
            <img alt="Q & A" src={imgStar} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: 109.47, top: 328.48, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Q & A</button>

      {/* Document */}
      <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: 70, top: 372, width: 18, height: 18, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5.78% 10.67% 8.34% 8.34%' }}>
          <div style={{ position: 'absolute', inset: '-5.18% -5.49%' }}>
            <img alt="Document" src={imgPaperclip} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'doc' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: 109.47, top: 381.48, transform: 'translateY(-50%)', color: selected === 'doc' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Document</button>

      {selected === 'ai' && (
        <>
          {/* Gradient welcome header (AI only) */}
          <div style={{ position: 'absolute', left: 912.76, top: 236.5, transform: 'translate(-50%, -50%)', width: 995, height: 197, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <p style={{ margin: 0, color: '#757575', fontSize: 70, fontWeight: 600 }}>Hello</p>
            <p style={{ margin: 0, fontSize: 70, fontWeight: 600, background: 'linear-gradient(90deg, #faa538 20.192%, #708ac4 51.923%, #4960ac 80.769%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Chat CPE</p>
          </div>
          {/* Search / input area (AI only) */}
          <div style={{ position: 'absolute', left: 371, top: 567.78, width: 1084.255, height: 110.852 }}>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #4960ac', borderRadius: 15 }} />
            <div style={{ position: 'absolute', left: 1395.68 - 371, top: 625.91 - 567.78, width: 40, height: 40, borderRadius: 100, background: '#7587b8' }} />
            <div style={{ position: 'absolute', left: 1401.89 - 371, top: 632.11 - 567.78, width: 27.586, height: 27.586, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: '20.83%' }}>
                <div style={{ position: 'absolute', inset: '-7.77%' }}>
                  <img alt="Send" src={imgArrowUp} style={{ display: 'block', width: '100%', height: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content area (conditional placeholders) */}
      {selected === 'ai' && (
        <div style={{ position: 'absolute', left: 371, top: 350, width: 900, minHeight: 180, padding: 32, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 16 }}>
          <h2 style={{ margin: 0, color: '#4960ac' }}>AI Chat (Logged In)</h2>
          <p style={{ color: '#6277ac', marginTop: 8 }}>Start interacting with the AI.</p>
        </div>
      )}
      {selected === 'qa' && (
        <div style={{ position: 'absolute', left: 371, top: 220, width: 900, minHeight: 380, padding: 32, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 16 }}>
          <h2 style={{ margin: 0, color: '#4960ac', fontFamily: 'Inter, system-ui, sans-serif' }}>Q & A (Logged In)</h2>
          <p style={{ color: '#6277ac' }}>Placeholder content after sign in.</p>
        </div>
      )}
      {selected === 'doc' && (
        <div style={{ position: 'absolute', left: 371, top: 220, width: 900, minHeight: 380, padding: 32, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 16 }}>
          <h2 style={{ margin: 0, color: '#4960ac', fontFamily: 'Inter, system-ui, sans-serif' }}>Documents (Logged In)</h2>
          <p style={{ color: '#6277ac' }}>Your documents appear here post login.</p>
        </div>{profile?.email || 'user@example.com'}
      )}

      {/* Profile section bottom left with modal trigger */}
      <button onClick={openProfile} style={{ position: 'absolute', left: 25, top: 635, width: 44, height: 44, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <img alt="Profile avatar" src={imgEllipseProfile} style={{ display: 'block', width: '100%', height: '100%' }} />
      </button>
      <button onClick={openProfile} style={{ position: 'absolute', left: 81, top: 645.48, transform: 'translateY(-50%)', color: '#000', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Profile</button>
      <div style={{ position: 'absolute', left: 81, top: 668.48, transform: 'translateY(-50%)', color: '#757575', fontSize: 12 }}>Username@gmail.com</div>
      <button aria-label="Logout" onClick={openLogoutConfirm} style={{ position: 'absolute', left: 243, top: 648, width: 18, height: 18, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <img alt="Logout" src={imgIconLogout} style={{ width: '100%', height: '100%' }} />
      </button>

      <Suspense fallback={null}>
        {profileView === 'profile' && (
          <ProfileModal
            onClose={closeProfile}
            onEditProfile={openEditProfile}
          />
        )}
        {profileView === 'edit' && (
          <EditProfileModal
            onBack={openProfile}
            onSave={(newName) => {
              console.log('Saved username:', newName);
            }}
          />
        )}
        {showLogoutConfirm && (
          <LogoutConfirmModal
            onCancel={cancelLogout}
            onConfirm={confirmLogout}
          />
        )}
      </Suspense>
    </div>
  );
}
