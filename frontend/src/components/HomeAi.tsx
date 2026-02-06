import React, { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { faqAPI, chatAPI } from '../services/api';
import FAQsAccordion from './FAQsAccordion';
import DocumentsPage from './DocumentsPage';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
const SignInModal = React.lazy(() => import('./SignInModal'));
const SignUpModal = React.lazy(() => import('./SignUpModal'));

// Image paths from public/images folder
const imgLogoCpe = "/images/LogoCPE.png";        
const imgNewChat = "/images/Newchat.png";  
const imgIcon = "/images/Login.png";           
const imgIcon1 = "/images/Logout.png";          
const imgLine1 = "/images/Line1.png";           
const img = "/images/Arrow.png";             
const img1 = "/images/Paperclip.png";            
const img2 = "/images/Star.png";                 
const img3 = "/images/Messagecircle.png";                


function LogIn({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }} data-name="Log in" data-node-id="34:97">
      <div style={{ position: 'absolute', inset: '12.5%' }} data-name="Icon" data-node-id="34:98">
        <div style={{ position: 'absolute', inset: '-6.67%' }}>
          <img alt="" style={{ display: 'block', width: '100%', height: '100%' }} src={imgIcon} />
        </div>
      </div>
    </div>
  );
}

function LogOut({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }} data-name="Log out" data-node-id="33:98">
      <div style={{ position: 'absolute', inset: '12.5%' }} data-name="Icon" data-node-id="33:99">
        <div style={{ position: 'absolute', inset: '-6.67%' }}>
          <img alt="" style={{ display: 'block', width: '100%', height: '100%' }} src={imgIcon1} />
        </div>
      </div>
    </div>
  );
}

function SignInButton({ style, onClick }: { style?: React.CSSProperties; onClick?: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onClick={onClick}
      style={{ position: 'relative', width: 236, height: 44, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', ...style }}
      data-node-id="34:448"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: pressed
            ? 'linear-gradient(90deg, rgba(163,194,230,0.8), rgba(98,119,172,0.8))'
            : '#fff',
          borderRadius: 10,
          transition: 'background 120ms ease'
        }}
      />
      <div style={{ position: 'absolute', left: '47.46%', right: '30.93%', top: '25%', bottom: '27.27%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 16 }}>
        Sign in
      </div>
      <LogIn style={{ position: 'absolute', left: '30.93%', right: '61.44%', top: '27.27%', bottom: '31.82%', overflow: 'hidden' }} />
    </button>
  );
}

export default function HomeAi({ onSignedIn }: { onSignedIn?: () => void }) {
  const layout = useResponsiveLayout();
  const [modal, setModal] = useState<'none' | 'signin' | 'signup'>('none');
  const [selected, setSelected] = useState<'ai' | 'qa' | 'doc'>('ai');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'bot'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const response = await faqAPI.getAllFAQs();
      setFaqs(response.data || []);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    }
  };

  const iconPositions: Record<'ai' | 'qa' | 'doc', number> = { ai: 266, qa: 319, doc: 372 };
  const highlightTop = useMemo(() => iconPositions[selected] - 13, [selected]);
  const openSignIn = useCallback(() => setModal('signin'), []);
  const openSignUp = useCallback(() => setModal('signup'), []);
  const closeModal = useCallback(() => setModal('none'), []);
  const handleSubmitSignIn = useCallback(() => {
    onSignedIn && onSignedIn();
  }, [onSignedIn]);
  const handleNewChat = useCallback(() => {
    setSelected('ai');
    setMessages([]);
    setInput('');
    setNextId(1);
  }, []);
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const startId = nextId;
    setNextId((prev) => prev + 2);
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: startId, role: 'user', text: trimmed }
    ]);
    setInput('');

    try {
      // Call backend API with guest mode (no user_id)
      // Generate a temporary thread_id for guest users
      const tempThreadId = `guest-${Date.now()}`;
      const response = await chatAPI.sendMessage(trimmed, tempThreadId);
      const llmResponse = response.data?.answer || 'ไม่สามารถได้รับคำตอบ';
      // Add bot response
      setMessages((prev) => [
        ...prev,
        { id: startId + 1, role: 'bot', text: llmResponse }
      ]);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Add error message
      setMessages((prev) => [
        ...prev,
        { id: startId + 1, role: 'bot', text: 'เกิดข้อผิดพลาดในการประมวลผลข้อความ' }
      ]);
    }
  }, [input, nextId]);
  return (
    <div
      data-name="Home - ai"
      data-node-id="10:122"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)'
      }}
    >
      {/* Left sidebar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 285, height: '100vh', background: '#e4eef8' }} />

      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          width: 285,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <img alt="CPE Logo" src={imgLogoCpe} style={{ maxWidth: '70%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {/* Divider line */}
      <div style={{ position: 'absolute', left: 25, top: 233, width: 236, height: 1 }}>
        <img alt="" src={imgLine1} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>

      {/* Dynamic highlight background */}
      <div style={{ position: 'absolute', left: 25, top: highlightTop, width: 236, height: 44, borderRadius: 10, background: '#7587b8', transition: 'top 0.25s' }} />
      <div style={{ position: 'absolute', left: 31, top: highlightTop, width: 230, height: 44, borderRadius: 10, background: '#fff', transition: 'top 0.25s' }} />

      {/* AI Chat */}
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: 70, top: 266, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '12.5%' }}>
          <div style={{ position: 'absolute', inset: '-5.93%' }}>
            <img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'brightness(0) saturate(100%)' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: 109.47, top: 275.48, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

      {/* FAQs */}
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: 70, top: 319, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
          <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
            <img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: 109.47, top: 328.48, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>FAQs</button>

      {/* Document */}
      <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: 70, top: 372, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5.78% 10.67% 8.34% 8.34%' }}>
          <div style={{ position: 'absolute', inset: '-5.18% -5.49%' }}>
            <img alt="" src={img1} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'doc' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: 109.47, top: 381.48, transform: 'translateY(-50%)', color: selected === 'doc' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Document</button>

      {/* New chat */}
      <button onClick={handleNewChat} style={{ position: 'absolute', left: 70, top: 186.83, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5% 10% 5% 10%' }}>
          <div style={{ position: 'absolute', inset: '-5%' }}>
            <img alt="New chat" src={imgNewChat} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} />
          </div>
        </div>
      </button>
      <button onClick={handleNewChat} style={{ position: 'absolute', left: 109.47, top: 196.31, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>New Chat</button>

      {/* Welcome text (only visible on AI when no messages) */}
      {selected === 'ai' && messages.length === 0 && (
        <div style={{ position: 'absolute', left: 320, right: 40, top: '35%', transform: 'translateY(-50%)', textAlign: 'center', padding: '0 20px' }}>
          <p style={{ margin: 0, color: '#757575', fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1 }}>Hello</p>
          <p style={{ margin: 0, fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1, background: 'linear-gradient(90deg, #faa538 20%, #708ac4 52%, #4960ac 81%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Chat CPE</p>
        </div>
      )}

      {/* Chat display (only visible when messages exist) */}
      {selected === 'ai' && messages.length > 0 && (
        <div style={{ position: 'absolute', left: 320, top: 120, right: 40, bottom: 150, overflow: 'auto', padding: 20, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 12 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '60%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: msg.role === 'user' ? '#e6efff' : '#f4f6fb',
                  color: '#2b2b2b'
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search bar and send button (only on AI) */}
      {selected === 'ai' && (
        <div style={{ position: 'absolute', left: 320, right: 40, bottom: 30, height: 96 }}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #4960ac', borderRadius: 15 }} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="พิมพ์ข้อความที่นี่..."
            style={{ position: 'absolute', left: 20, top: 26, right: 80, height: 58, border: 'none', outline: 'none', fontSize: 16, background: 'transparent' }}
          />
          <button
            onClick={handleSend}
            style={{ position: 'absolute', right: 20, top: 28, width: 40, height: 40, borderRadius: 100, background: '#7587b8', border: 'none', cursor: 'pointer' }}
            aria-label="Send"
          />
          <div style={{ position: 'absolute', right: 26, top: 34, width: 27.586, height: 27.586, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: '20.83%' }}>
              <div style={{ position: 'absolute', inset: '-7.77%' }}>
                <img alt="" src={img} style={{ display: 'block', width: '100%', height: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder Q&A content */}
      {selected === 'qa' && (
        <div style={{ position: 'absolute', left: 320, top: 120, right: 40, bottom: 30, overflow: 'auto', padding: 24, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 12 }}>
          <FAQsAccordion faqs={faqs} />
        </div>
      )}

      {selected === 'doc' && (
        <div style={{ position: 'absolute', left: 320, top: 100, right: 40, bottom: 30, overflow: 'auto', padding: 24, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 16 }}>
          <DocumentsPage />
        </div>
      )}

      {/* Logout icon example (position loosely based) */}
      {/* <LogOut style={{ position: 'absolute', left: 341, top: 499, width: 18, height: 18, overflow: 'hidden' }} /> */}

      {/* Sign In trigger */}
      <SignInButton onClick={openSignIn} style={{ position: 'absolute', left: 25, bottom: 30 }} />

      <Suspense fallback={null}>
        {modal === 'signin' && (
          <SignInModal
            open={true}
            onClose={closeModal}
            onSwitchToSignUp={openSignUp}
            onSubmitSignIn={handleSubmitSignIn}
          />
        )}
        {modal === 'signup' && (
          <SignUpModal
            open={true}
            onBackToSignIn={openSignIn}
          />
        )}
      </Suspense>
    </div>
  );
}
