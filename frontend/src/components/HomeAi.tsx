import React, { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { faqAPI, chatAPI } from '../services/api';
import FAQsAccordion from './FAQsAccordion';
import DocumentsPage from './DocumentsPage';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
const SignInModal = React.lazy(() => import('./SignInModal'));
const SignUpModal = React.lazy(() => import('./SignUpModal'));
const ForgotPasswordModal = React.lazy(() => import('./ForgotPasswordModal'));
const AdminUserManagementModal = React.lazy(() => import('./AdminUserManagementModal'));

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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '0 12px'
        }}
      >
        <LogIn style={{ width: 18, height: 18, overflow: 'hidden', flexShrink: 0 }} />
        <span style={{ color: '#000', fontSize: 16, whiteSpace: 'nowrap', lineHeight: 1 }}>
          Sign in
        </span>
      </div>
    </button>
  );
}

export default function HomeAi({ onSignedIn }: { onSignedIn?: () => void }) {
  const layout = useResponsiveLayout();
  const isMobileView = layout.isMobile;
  const isTabletView = layout.isTablet;
  const isCompactSidebar = layout.isMobile || layout.isTablet;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const compactSidebarWidth = Math.max(260, Math.min(320, Math.round(viewportWidth * 0.78)));
  
  // Calculate responsive positions based on layout
  const sidebarWidth = isCompactSidebar ? compactSidebarWidth : Math.max(layout.sidebarWidth, 240);
  const visualSidebarWidth = isCompactSidebar ? Math.min(sidebarWidth, Math.round(viewportWidth * 0.82)) : sidebarWidth;
  const contentLeft = isCompactSidebar ? 12 : sidebarWidth + 35;
  const sidebarLeftPadding = Math.round(Math.max(12, visualSidebarWidth * 0.08));
  const iconLeft = Math.round(Math.max(24, visualSidebarWidth * 0.25));
  const labelLeft = Math.round(Math.max(70, visualSidebarWidth * 0.38));
  const chatDisplayLeft = contentLeft;
  const chatDisplayRight = isCompactSidebar ? 12 : 40;
  const contentTopOffset = isMobileView ? 68 : isTabletView ? 78 : isCompactSidebar ? 84 : 86;
  const contentBottomOffset = isTabletView ? 102 : isCompactSidebar ? 108 : 150;
  const inputBottomOffset = isTabletView ? 14 : isCompactSidebar ? 12 : 30;
  
  const [modal, setModal] = useState<'none' | 'signin' | 'signup' | 'forgotpassword'>('none');
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [selected, setSelected] = useState<'ai' | 'qa' | 'doc'>('ai');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [messages, setMessages] = useState<Array<{ id: number; role: 'user' | 'bot'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [nextId, setNextId] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const chatDisplayRef = React.useRef<HTMLDivElement>(null);

  const linkifyText = useCallback((value: string, keyPrefix: string): React.ReactNode[] => {
    const urlRegex = /((?:https?:\/\/|www\.)[^\s<]+)/gi;
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = urlRegex.exec(value)) !== null) {
      const rawMatch = match[0];
      const start = match.index;
      const end = start + rawMatch.length;

      if (start > lastIndex) {
        nodes.push(value.slice(lastIndex, start));
      }

      let cleanUrl = rawMatch;
      let trailing = '';
      while (cleanUrl && /[),.!?:;]$/.test(cleanUrl)) {
        trailing = cleanUrl.slice(-1) + trailing;
        cleanUrl = cleanUrl.slice(0, -1);
      }

      const href = cleanUrl.startsWith('www.') ? `https://${cleanUrl}` : cleanUrl;
      nodes.push(
        <a key={`${keyPrefix}-url-${index}`} href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2b5b9f', textDecoration: 'underline', wordBreak: 'break-all' }}>
          {cleanUrl}
        </a>
      );
      if (trailing) {
        nodes.push(trailing);
      }

      lastIndex = end;
      index += 1;
    }

    if (lastIndex < value.length) {
      nodes.push(value.slice(lastIndex));
    }

    return nodes;
  }, []);

  const renderBotMessage = useCallback((text: string) => {
    const lines = text.split('\n');
    const nodes: JSX.Element[] = [];
    let paragraphBuffer: string[] = [];
    let listBuffer: string[] = [];

    const flushParagraph = () => {
      if (!paragraphBuffer.length) return;
      nodes.push(
        <div key={`p-${nodes.length}`} style={{ whiteSpace: 'pre-wrap' }}>
          {linkifyText(paragraphBuffer.join('\n'), `p-${nodes.length}`)}
        </div>
      );
      paragraphBuffer = [];
    };

    const flushList = () => {
      if (!listBuffer.length) return;
      nodes.push(
        <ul
          key={`ul-${nodes.length}`}
          style={{
            margin: '4px 0',
            paddingLeft: '1.25em',
            listStyleType: 'disc'
          }}
        >
          {listBuffer.map((item, idx) => (
            <li key={`li-${idx}`} style={{ margin: '2px 0' }}>
              {linkifyText(item, `li-${idx}`)}
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    };

    for (const line of lines) {
      const bulletMatch = line.match(/^\s*[-•]\s+(.+)$/);
      if (bulletMatch) {
        flushParagraph();
        listBuffer.push(bulletMatch[1]);
      } else {
        flushList();
        paragraphBuffer.push(line);
      }
    }

    flushParagraph();
    flushList();

    return nodes;
  }, [linkifyText]);

  // Animate typing dots
  useEffect(() => {
    if (!isTyping) {
      setTypingDots('');
      return;
    }
    const interval = setInterval(() => {
      setTypingDots((prev) => (prev.length >= 3 ? '' : prev + '•'));
    }, 400);
    return () => clearInterval(interval);
  }, [isTyping]);

  useEffect(() => {
    loadFAQs();
  }, []);

  // Auto-scroll to bottom when messages change or typing state changes
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
  const openForgotPassword = useCallback(() => setModal('forgotpassword'), []);
  const closeModal = useCallback(() => setModal('none'), []);
  const openUserManagement = useCallback(() => setUserManagementOpen(true), []);
  const closeUserManagement = useCallback(() => setUserManagementOpen(false), []);
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
    await Promise.resolve();
    setIsTyping(true);

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
    } finally {
      setIsTyping(false);
    }
  }, [input, nextId]);
  return (
    <div
      data-name="Home - ai"
      data-node-id="10:122"
      style={{
        position: 'relative',
        width: '100%',
        height: isTabletView ? '100dvh' : '100svh',
        minHeight: '100svh',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)'
      }}
    >
      {isMobileView && (
        <>
          <div style={{ position: 'absolute', width: 220, height: 220, right: -70, top: 90, borderRadius: '50%', background: 'radial-gradient(circle, rgba(112,138,196,0.20), rgba(112,138,196,0))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 180, height: 180, left: -60, top: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,165,56,0.16), rgba(250,165,56,0))', pointerEvents: 'none' }} />
        </>
      )}

      {!isCompactSidebar && (
        <>
          {/* Left sidebar */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: sidebarWidth, height: isTabletView ? '100dvh' : '100svh', background: '#e4eef8' }} />

          {/* Logo */}
          <div
        style={{
          position: 'absolute',
          left: 0,
          top: 12,
          width: sidebarWidth,
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
          <div style={{ position: 'absolute', left: sidebarLeftPadding, top: 233, width: sidebarWidth - (sidebarLeftPadding * 2), height: 1 }}>
            <img alt="" src={imgLine1} style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>

          {/* Dynamic highlight background */}
          <div style={{ position: 'absolute', left: sidebarLeftPadding, top: highlightTop, width: sidebarWidth - (sidebarLeftPadding * 2), height: 44, borderRadius: 10, background: '#7587b8', transition: 'top 0.25s' }} />
          <div style={{ position: 'absolute', left: sidebarLeftPadding + 6, top: highlightTop, width: sidebarWidth - (sidebarLeftPadding * 2) - 12, height: 44, borderRadius: 10, background: '#fff', transition: 'top 0.25s' }} />

          {/* AI Chat */}
          <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: iconLeft, top: 266, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '12.5%' }}>
          <div style={{ position: 'absolute', inset: '-5.93%' }}>
            <img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'brightness(0) saturate(100%)' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} />
          </div>
        </div>
          </button>
          <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: labelLeft, top: 275.48, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

          {/* FAQs */}
          <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: iconLeft, top: 319, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
          <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
            <img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
          </button>
          <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: labelLeft, top: 328.48, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>FAQs</button>

          {/* Document */}
          <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: iconLeft, top: 372, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5.78% 10.67% 8.34% 8.34%' }}>
          <div style={{ position: 'absolute', inset: '-5.18% -5.49%' }}>
            <img alt="" src={img1} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'doc' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
          </button>
          <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: labelLeft, top: 381.48, transform: 'translateY(-50%)', color: selected === 'doc' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Document</button>

          {/* New chat */}
          <button onClick={handleNewChat} style={{ position: 'absolute', left: 68, top: 183.83, width: 24, height: 24, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5% 10% 5% 10%' }}>
          <div style={{ position: 'absolute', inset: '-5%' }}>
            <img alt="New chat" src={imgNewChat} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} />
          </div>
        </div>
          </button>
          <button onClick={handleNewChat} style={{ position: 'absolute', left: 109.47, top: 196.31, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>New Chat</button>
        </>
      )}

      {isCompactSidebar && (
        <div style={{ position: 'absolute', left: 12, right: 12, top: 10, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setMobileSidebarOpen(true)} style={{ border: 'none', background: '#dfe9f7', color: '#445c94', borderRadius: 8, width: 36, height: 36, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>≡</button>
          <img alt="CPE Logo" src={imgLogoCpe} style={{ width: 96, height: 40, objectFit: 'contain' }} />
          <div style={{ width: 36, height: 36 }} />
        </div>
      )}

      {isCompactSidebar && mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.35)' }} onClick={() => setMobileSidebarOpen(false)}>
          <div style={{ position: 'relative', width: visualSidebarWidth, height: '100%', background: '#e4eef8' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobileSidebarOpen(false)} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', color: '#445c94', fontSize: 24, cursor: 'pointer', lineHeight: 1, zIndex: 2 }}>×</button>

            <div style={{ position: 'absolute', left: 0, top: 12, width: visualSidebarWidth, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <img alt="CPE Logo" src={imgLogoCpe} style={{ maxWidth: '70%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>

            <div style={{ position: 'absolute', left: sidebarLeftPadding, top: 233, width: visualSidebarWidth - (sidebarLeftPadding * 2), height: 1 }}>
              <img alt="" src={imgLine1} style={{ display: 'block', width: '100%', height: '100%' }} />
            </div>

            <div style={{ position: 'absolute', left: sidebarLeftPadding, top: highlightTop, width: visualSidebarWidth - (sidebarLeftPadding * 2), height: 44, borderRadius: 10, background: '#7587b8', transition: 'top 0.25s' }} />
            <div style={{ position: 'absolute', left: sidebarLeftPadding + 6, top: highlightTop, width: visualSidebarWidth - (sidebarLeftPadding * 2) - 12, height: 44, borderRadius: 10, background: '#fff', transition: 'top 0.25s' }} />

            <button onClick={() => { handleNewChat(); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: 68, top: 183.83, width: 24, height: 24, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: '5% 10% 5% 10%' }}>
                <div style={{ position: 'absolute', inset: '-5%' }}>
                  <img alt="New chat" src={imgNewChat} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} />
                </div>
              </div>
            </button>
            <button onClick={() => { handleNewChat(); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: 109.47, top: 196.31, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>New Chat</button>

            <button onClick={() => { setSelected('ai'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: 266, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: '12.5%' }}><div style={{ position: 'absolute', inset: '-5.93%' }}><img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'brightness(0) saturate(100%)' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} /></div></div>
            </button>
            <button onClick={() => { setSelected('ai'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: 275.48, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

            <button onClick={() => { setSelected('qa'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: 319, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}><div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}><img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} /></div></div>
            </button>
            <button onClick={() => { setSelected('qa'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: 328.48, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>FAQs</button>

            <button onClick={() => { setSelected('doc'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: 372, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: '5.78% 10.67% 8.34% 8.34%' }}><div style={{ position: 'absolute', inset: '-5.18% -5.49%' }}><img alt="" src={img1} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'doc' ? 'brightness(0) saturate(100%)' : 'none' }} /></div></div>
            </button>
            <button onClick={() => { setSelected('doc'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: 381.48, transform: 'translateY(-50%)', color: selected === 'doc' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Document</button>

            <SignInButton onClick={() => { openSignIn(); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 24, width: Math.max(168, visualSidebarWidth - 32) }} />
          </div>
        </div>
      )}

      {/* Welcome text (only visible on AI when no messages) */}
      {selected === 'ai' && messages.length === 0 && (
        <div style={{ position: 'absolute', left: chatDisplayLeft, right: chatDisplayRight, top: '35%', transform: 'translateY(-50%)', textAlign: 'center', padding: '0 20px' }}>
          <p style={{ margin: 0, color: '#757575', fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1 }}>Hello</p>
          <p style={{ margin: 0, fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1, background: 'linear-gradient(90deg, #faa538 20%, #708ac4 52%, #4960ac 81%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Chat CPE</p>
        </div>
      )}

      {/* Chat display (only visible when messages exist) */}
      {selected === 'ai' && messages.length > 0 && (
        <div ref={chatDisplayRef} style={{ position: 'absolute', left: chatDisplayLeft, top: contentTopOffset, right: chatDisplayRight, bottom: contentBottomOffset, overflow: 'auto', padding: 20, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 12 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 12, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: isMobileView ? '82%' : '60%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: msg.role === 'user' ? '#e6efff' : '#f4f6fb',
                  color: '#2b2b2b',
                  whiteSpace: msg.role === 'bot' ? 'normal' : 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg.role === 'bot' ? renderBotMessage(msg.text) : msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  maxWidth: '60%',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: '#f4f6fb',
                  color: '#2b2b2b',
                  minHeight: '20px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>กำลังพิมพ์{typingDots}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search bar and send button (only on AI) */}
      {selected === 'ai' && (
        <div style={{ position: 'absolute', left: chatDisplayLeft, right: chatDisplayRight, bottom: inputBottomOffset, height: isTabletView ? 80 : isCompactSidebar ? 84 : 96 }}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #4960ac', borderRadius: 15 }} />
          <input
            disabled={isTyping}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isTyping) handleSend();
            }}
            placeholder="พิมพ์ข้อความที่นี่..."
            style={{ position: 'absolute', left: 16, top: isTabletView ? 14 : isCompactSidebar ? 18 : 26, right: 72, height: isTabletView ? 48 : isCompactSidebar ? 46 : 58, border: 'none', outline: 'none', fontSize: isCompactSidebar ? 14 : 16, lineHeight: 'normal', paddingTop: isTabletView ? 10 : isCompactSidebar ? 12 : 20, paddingBottom: isTabletView ? 10 : isCompactSidebar ? 12 : 20, background: 'transparent', color: '#24324f', WebkitTextFillColor: '#24324f', caretColor: '#24324f', opacity: isTyping ? 0.6 : 1, cursor: isTyping ? 'not-allowed' : 'text' }}
          />
          <button
            disabled={isTyping}
            onClick={handleSend}
            style={{ position: 'absolute', right: 16, top: isCompactSidebar ? 24 : 28, width: isCompactSidebar ? 34 : 40, height: isCompactSidebar ? 34 : 40, borderRadius: 100, background: '#7587b8', border: 'none', cursor: isTyping ? 'not-allowed' : 'pointer', opacity: isTyping ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Send"
          >
            <img
              alt=""
              src={img}
              style={{
                display: 'block',
                width: isCompactSidebar ? 18 : 22,
                height: isCompactSidebar ? 18 : 22,
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
            />
          </button>
        </div>
      )}

      {/* Placeholder Q&A content */}
      {selected === 'qa' && (
        <div style={{ position: 'absolute', left: chatDisplayLeft, top: contentTopOffset, right: chatDisplayRight, bottom: inputBottomOffset, overflow: 'auto', padding: 16 }}>
          <FAQsAccordion faqs={faqs} />
        </div>
      )}

      {selected === 'doc' && (
        <div style={{ position: 'absolute', left: chatDisplayLeft, top: contentTopOffset, right: chatDisplayRight, bottom: inputBottomOffset, overflow: 'auto', padding: isCompactSidebar ? 14 : 24, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 16 }}>
          <DocumentsPage />
        </div>
      )}

      {/* Logout icon example (position loosely based) */}
      {/* <LogOut style={{ position: 'absolute', left: 341, top: 499, width: 18, height: 18, overflow: 'hidden' }} /> */}

      {/* Sign In trigger */}
      {!isCompactSidebar && (
        <SignInButton
          onClick={openSignIn}
          style={{
            position: 'absolute',
            left: Math.round(sidebarWidth / 2),
            transform: 'translateX(-50%)',
            bottom: 30,
            width: Math.max(168, sidebarWidth - 32)
          }}
        />
      )}

      <Suspense fallback={null}>
        {modal === 'signin' && (
          <SignInModal
            open={true}
            onClose={closeModal}
            onSwitchToSignUp={openSignUp}
            onSwitchToForgotPassword={openForgotPassword}
            onSubmitSignIn={handleSubmitSignIn}
          />
        )}
        {modal === 'signup' && (
          <SignUpModal
            open={true}
            onBackToSignIn={openSignIn}
          />
        )}
        {modal === 'forgotpassword' && (
          <ForgotPasswordModal
            open={true}
            onClose={closeModal}
            onBackToSignIn={openSignIn}
          />
        )}
      </Suspense>
    </div>
  );
}
