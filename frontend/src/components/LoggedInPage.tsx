import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authAPI, faqAPI, chatAPI } from '../services/api';
import FAQsAccordion from './FAQsAccordion';
import DocumentsPage from './DocumentsPage';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ProfileModal = React.lazy(() => import('./ProfileModal'));
const EditProfileModal = React.lazy(() => import('./EditProfileModal'));
const LogoutConfirmModal = React.lazy(() => import('./LogoutConfirmModal'));

// Image paths from public/images folder
const imgLogoCpe = "/images/LogoCPE.png";
const imgNewChat = "/images/Newchat.png";
const img1 = "/images/Paperclip.png";
const img2 = "/images/Messagecircle.png";
const img3 = "/images/Star.png";
const imgSend = "/images/Arrow.png";
const imgLogout = "/images/Logout.png";

interface LoggedInPageProps {
  onLogout?: () => void;
}

type ChatMessage = { id: number; role: 'user' | 'bot'; text: string; createdAt: number };
type ChatThread = { id: string; title: string; messages: ChatMessage[]; createdAt: number; updatedAt: number };

export default function LoggedInPage({ onLogout }: LoggedInPageProps) {
  const layout = useResponsiveLayout();
  const viewHeight = typeof layout.minHeight === 'number' ? layout.minHeight : window.innerHeight;
  const scale = Math.min(1.15, Math.max(0.85, viewHeight / 900));
  const sidebarInnerWidth = Math.max(layout.sidebarWidth - Math.round(49 * scale), 180);
  const sidebarHighlightWidth = Math.max(layout.sidebarWidth - Math.round(55 * scale), 170);
  const contentLeft = layout.sidebarWidth + Math.round(35 * scale);
  const sidebarLeftPadding = Math.round(Math.max(12, layout.sidebarWidth * 0.08));
  const iconLeft = Math.round(Math.max(24, layout.sidebarWidth * 0.25));
  const labelLeft = Math.round(Math.max(70, layout.sidebarWidth * 0.38));

  const logoTop = Math.round(12 * scale);
  const logoHeight = Math.round(120 * scale);
  const dividerTop = Math.round(233 * scale);
  const newChatTop = Math.round(186.83 * scale);
  const aiTop = Math.round(266 * scale);
  const qaTop = Math.round(319 * scale);
  const docTop = Math.round(372 * scale);
  const chatHistoryTop = Math.round(430 * scale);
  const sidebarIconSize = Math.round(18 * scale);
  const sidebarLabelFont = Math.max(12, Math.round(16 * scale));
  const sidebarLabelOffset = Math.round(9.5 * scale);

  const chatDisplayTop = Math.round(120 * scale);
  const faqTop = chatDisplayTop;
  const docTopContent = Math.round(100 * scale);

  const chatInputHeight = Math.round(96 * scale);
  const chatInputBottom = Math.round(30 * scale);
  const chatDisplayBottom = chatInputBottom + chatInputHeight + Math.round(10 * scale);
  const inputTop = Math.round(26 * scale);
  const inputHeight = Math.round(58 * scale);
  const inputRight = Math.round(80 * scale);
  const sendBtnSize = Math.round(40 * scale);
  const sendBtnTop = Math.round((chatInputHeight - sendBtnSize) / 2);
  const sendIconSize = Math.round(28 * scale);

  const profileBottom = Math.round(70 * scale);
  const profileHeight = Math.round(60 * scale);
  const logoutBottom = Math.round(30 * scale);
  const logoutHeight = Math.round(28 * scale);
  const chatHistoryBottom = profileBottom + profileHeight + Math.round(20 * scale);
  const [selected, setSelected] = useState<'ai' | 'qa' | 'doc'>('ai');
  const [profile, setProfile] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const nextIdRef = useRef(1);
  const iconPositions: Record<'ai' | 'qa' | 'doc', number> = { ai: aiTop, qa: qaTop, doc: docTop };
  const highlightTop = useMemo(() => iconPositions[selected] - Math.round(13 * scale), [iconPositions, selected, scale]);

  const [profileView, setProfileView] = useState<'none' | 'profile' | 'edit'>('none');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadProfileAndFAQ = useCallback(async () => {
    try {
      const profileRes = await authAPI.getProfile();
      setProfile(profileRes.data);
      const faqRes = await faqAPI.getAllFAQs();
      setFaqs(faqRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    loadProfileAndFAQ();
  }, [loadProfileAndFAQ]);

  useEffect(() => {
    const loadHistory = async () => {
      const userIdRaw = localStorage.getItem('user_id');
      if (!userIdRaw) return;
      
      try {
        const historyRes = await chatAPI.getHistory();
        const threads_data = historyRes.data || [];

        // แปลงข้อมูล threads จาก API เป็น ChatThread format
        const threadsFormatted: ChatThread[] = threads_data.map((thread: any) => {
          const messages: ChatMessage[] = (thread.messages || []).map((msg: any, idx: number) => {
            const createdAt = msg.created_at ? new Date(msg.created_at).getTime() : Date.now() + idx;
            return {
              id: msg.id || idx,
              role: msg.role as 'user' | 'bot',
              text: msg.text,
              createdAt
            };
          });

          return {
            id: thread.id,
            title: thread.title,
            messages,
            createdAt: thread.created_at ? new Date(thread.created_at).getTime() : Date.now(),
            updatedAt: thread.created_at ? new Date(thread.created_at).getTime() : Date.now()
          };
        });

        setThreads(threadsFormatted);
        if (threadsFormatted.length > 0) {
          setActiveThreadId(threadsFormatted[0].id);
        }

        // Calculate next ID based on existing messages
        let maxId = 1;
        threadsFormatted.forEach(t => {
          t.messages.forEach(m => {
            if (m.id > maxId) maxId = m.id;
          });
        });
        nextIdRef.current = maxId + 1;
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setThreads([]);
        setActiveThreadId(null);
      }
    };

    loadHistory();
  }, []);

  const openProfile = useCallback(() => setProfileView('profile'), []);
  const openEditProfile = useCallback(() => setProfileView('edit'), []);
  const closeProfile = useCallback(() => setProfileView('none'), []);
  const openLogoutConfirm = useCallback(() => setShowLogoutConfirm(true), []);
  const cancelLogout = useCallback(() => setShowLogoutConfirm(false), []);
  const handleNewChat = useCallback(async () => {
    setSelected('ai');
    const now = Date.now();
    // สร้าง thread ID ใหม่ (สำหรับ optimistic update)
    const tempThreadId = `temp-${now}`;
    
    const newThread: ChatThread = {
      id: tempThreadId,
      title: 'New Chat',
      messages: [],
      createdAt: now,
      updatedAt: now
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(tempThreadId);
    setInput('');
  }, []);
  const handleSelectThread = useCallback((id: string) => {
    setSelected('ai');
    setActiveThreadId(id);
  }, []);
  const handleDeleteThread = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteThread(id);
      // Remove only the specific thread from local state
      setThreads((prev) => prev.filter((t) => t.id !== id));
      
      // If the deleted thread was active, clear the active thread
      if (activeThreadId === id) {
        setActiveThreadId(null);
      }
      
      // Optionally call API to delete from backend if needed
      // For now, just remove from local state
    } catch (err) {
      console.error('Error in handleDeleteThread:', err);
    }
  }, [activeThreadId]);
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    const startId = nextIdRef.current;
    nextIdRef.current += 2;
    const now = Date.now();
    
    // ถ้าไม่มี active thread ให้สร้างใหม่
    let currentThreadId = activeThreadId;
    if (!currentThreadId) {
      currentThreadId = `temp-${now}`;
      const newThread: ChatThread = {
        id: currentThreadId,
        title: trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed,
        messages: [],
        createdAt: now,
        updatedAt: now
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(currentThreadId);
    }

    let answerText = '...';
    let realThreadId = currentThreadId;
    
    try {
      // ส่ง message พร้อม thread_id
      const res = await chatAPI.sendMessage(trimmed, currentThreadId);
      answerText = res.data?.answer || 'ระบบไม่สามารถตอบได้ในขณะนี้';
      // ถ้า API return thread_id ที่ต่างจากใหญ่ให้ใช้อันนั้น (เช่นจากการ save ใน backend)
      if (res.data?.thread_id) {
        realThreadId = res.data.thread_id;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      answerText = 'เกิดข้อผิดพลาดในการส่งข้อความ';
    }

    setThreads((prev) => {
      const existing = prev.find((t) => t.id === currentThreadId);
      const userMsg: ChatMessage = { id: startId, role: 'user', text: trimmed, createdAt: now };
      const botMsg: ChatMessage = { id: startId + 1, role: 'bot', text: answerText, createdAt: now + 1 };
      
      if (!existing) {
        const title = trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed;
        return [
          {
            id: realThreadId,
            title,
            messages: [userMsg, botMsg],
            createdAt: now,
            updatedAt: now
          },
          ...prev
        ];
      }
      
      const updatedMessages = [...existing.messages, userMsg, botMsg];
      const updatedThread: ChatThread = {
        ...existing,
        id: realThreadId,
        title: existing.title === 'New Chat' ? (trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed) : existing.title,
        messages: updatedMessages,
        updatedAt: now
      };
      const others = prev.filter((t) => t.id !== existing.id);
      return [updatedThread, ...others];
    });
    
    // อัพเดต activeThreadId ถ้า thread_id เปลี่ยน
    if (realThreadId !== currentThreadId) {
      setActiveThreadId(realThreadId);
    }
    
    setInput('');
  }, [input, activeThreadId]);
  const confirmLogout = useCallback(async () => {
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
  }, [onLogout]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '100vh', overflow: 'hidden', background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: layout.sidebarWidth, height: '100vh', background: '#e4eef8' }} />

      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: logoTop,
          width: layout.sidebarWidth,
          height: logoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <img alt="CPE Logo" src={imgLogoCpe} style={{ maxWidth: '70%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {/* Divider line */}
      <div style={{ position: 'absolute', left: sidebarLeftPadding, top: dividerTop, width: sidebarInnerWidth, height: 1, background: '#6277ac' }} />

      <div style={{ position: 'absolute', left: sidebarLeftPadding, top: highlightTop, width: sidebarInnerWidth, height: Math.round(44 * scale), borderRadius: Math.round(10 * scale), background: '#7587b8', transition: 'top 0.25s' }} />
      <div style={{ position: 'absolute', left: sidebarLeftPadding + Math.round(6 * scale), top: highlightTop, width: sidebarHighlightWidth, height: Math.round(44 * scale), borderRadius: Math.round(10 * scale), background: '#fff', transition: 'top 0.25s' }} />

      {/* AI Chat with icon */}
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: iconLeft, top: aiTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '12.5%' }}>
          <div style={{ position: 'absolute', inset: '-5.93%' }}>
            <img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'brightness(0) saturate(100%)' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: labelLeft, top: aiTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

      {/* FAQs with icon */}
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: iconLeft, top: qaTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
          <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
            <img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: labelLeft, top: qaTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>FAQs</button>

      {/* Document with icon */}
      <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: iconLeft, top: docTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5.78% 10.67% 8.34% 8.34%' }}>
          <div style={{ position: 'absolute', inset: '-5.18% -5.49%' }}>
            <img alt="" src={img1} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'doc' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('doc')} style={{ position: 'absolute', left: labelLeft, top: docTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'doc' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Documents</button>

      {/* New chat */}
      <button onClick={handleNewChat} style={{ position: 'absolute', left: iconLeft, top: newChatTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5% 10% 5% 10%' }}>
          <div style={{ position: 'absolute', inset: '-5%' }}>
            <img alt="New chat" src={imgNewChat} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} />
          </div>
        </div>
      </button>
      <button onClick={handleNewChat} style={{ position: 'absolute', left: labelLeft, top: newChatTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>New Chat</button>

      {/* Chat history */}
      <div style={{ position: 'absolute', left: sidebarLeftPadding, top: chatHistoryTop, width: sidebarInnerWidth, bottom: chatHistoryBottom }}>
        <div style={{ fontSize: Math.max(10, Math.round(12 * scale)), color: '#6277ac', marginBottom: Math.round(6 * scale) }}>Chat History</div>
        <div style={{ height: 'calc(100% - 20px)', overflowY: 'auto', paddingRight: Math.round(4 * scale) }}>
          {threads.length === 0 ? (
            <div style={{ fontSize: 12, color: '#9aa4bf' }}>ยังไม่มีประวัติ</div>
          ) : (
            threads.map((t) => (
              <div
                key={t.id}
                style={{
                  position: 'relative',
                  width: '100%',
                  marginBottom: 4
                }}
              >
                <button
                  onClick={() => handleSelectThread(t.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: t.id === activeThreadId ? '#ffffff' : 'transparent',
                    color: t.id === activeThreadId ? '#000' : '#6277ac',
                    fontSize: 12,
                    padding: '6px 8px',
                    paddingRight: '32px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  {t.title}
                </button>
                <button
                  onClick={(e) => handleDeleteThread(t.id, e)}
                  style={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 20,
                    height: 20,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6
                  }}
                  aria-label="Delete thread"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {selected === 'ai' && (
        <>
          {(() => {
            const activeThread = threads.find((t) => t.id === activeThreadId);
            const hasMessages = activeThread && activeThread.messages.length > 0;

            return (
              <>
                {/* Welcome message (when no active thread or no messages) */}
                {!hasMessages && (
                  <div style={{ position: 'absolute', left: contentLeft, right: 40, top: '35%', transform: 'translateY(-50%)', textAlign: 'center', padding: '0 20px' }}>
                    <p style={{ margin: 0, color: '#757575', fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1 }}>Hello</p>
                    <p style={{ margin: 0, fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1, background: 'linear-gradient(90deg, #faa538 20%, #708ac4 52%, #4960ac 81%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Chat CPE</p>
                  </div>
                )}

                {/* Chat display (when messages exist) */}
                {hasMessages && (
                  <div style={{ position: 'absolute', left: contentLeft, top: chatDisplayTop, right: 40, bottom: chatDisplayBottom, overflow: 'auto', padding: Math.round(20 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(12 * scale) }}>
                    {activeThread?.messages.map((msg) => (
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
              </>
            );
          })()}

          <div style={{ position: 'absolute', left: contentLeft, right: 40, bottom: chatInputBottom, height: chatInputHeight }}>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #4960ac', borderRadius: Math.round(15 * scale) }} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder="พิมพ์ข้อความที่นี่..."
              style={{ position: 'absolute', left: Math.round(20 * scale), top: inputTop, right: inputRight, height: inputHeight, border: 'none', outline: 'none', fontSize: Math.max(12, Math.round(16 * scale)), background: 'transparent' }}
            />
            <button
              onClick={handleSend}
              style={{ position: 'absolute', right: Math.round(20 * scale), top: sendBtnTop, width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize, background: '#7587b8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Send"
            >
              <div style={{ position: 'relative', width: sendIconSize, height: sendIconSize, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', inset: '20.83%' }}>
                  <div style={{ position: 'absolute', inset: '-7.77%' }}>
                    <img alt="" src={imgSend} style={{ display: 'block', width: '100%', height: '100%' }} />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </>
      )}
      {selected === 'qa' && (
        <div style={{ position: 'absolute', left: contentLeft, top: faqTop, right: 40, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(32 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <FAQsAccordion faqs={faqs} />
        </div>
      )}
      {selected === 'doc' && (
        <div style={{ position: 'absolute', left: contentLeft, top: docTopContent, right: 40, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(24 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <DocumentsPage />
        </div>
      )}

      {/* Profile Section */}
      <div style={{ position: 'absolute', left: sidebarLeftPadding, bottom: profileBottom, width: sidebarInnerWidth, height: profileHeight, background: '#d4e2f4', borderRadius: Math.round(12 * scale), display: 'flex', alignItems: 'center', padding: `${Math.round(8 * scale)}px ${Math.round(12 * scale)}px`, gap: Math.round(12 * scale) }}>
        {/* Profile Avatar */}
        <div style={{ width: Math.round(44 * scale), height: Math.round(44 * scale), borderRadius: '50%', background: '#6277ac', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: Math.max(12, Math.round(18 * scale)), fontWeight: 600 }}>
          {profile?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        
        {/* Username and Email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#2b2b2b', fontSize: Math.max(11, Math.round(14 * scale)), fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile?.name || 'Username'}
          </div>
          <div style={{ color: '#6277ac', fontSize: Math.max(9, Math.round(11 * scale)), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: Math.round(2 * scale) }}>
            {profile?.email || 'user@example.com'}
          </div>
        </div>
        
        {/* Edit Icon */}
        <button 
          onClick={openProfile}
          style={{ 
            width: Math.round(24 * scale), 
            height: Math.round(24 * scale), 
            flexShrink: 0, 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Edit profile"
        >
          <svg width={Math.round(20 * scale)} height={Math.round(20 * scale)} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={openLogoutConfirm}
        style={{ 
          position: 'absolute', 
          left: sidebarLeftPadding, 
          bottom: logoutBottom, 
          width: sidebarInnerWidth, 
          height: logoutHeight,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Math.round(8 * scale),
          padding: 0
        }}
        aria-label="Logout"
      >
        <img src={imgLogout} alt="Logout" style={{ width: Math.round(18 * scale), height: Math.round(18 * scale) }} />
        <span style={{ color: '#6277ac', fontSize: Math.max(11, Math.round(14 * scale)), fontWeight: 500 }}>Logout</span>
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
              setProfile((prev: any) => ({ ...prev, name: newName }));
              setProfileView('profile');
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
