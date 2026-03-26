import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authAPI, faqAPI, chatAPI } from '../services/api';
import FAQsAccordion from './FAQsAccordion';
import DocumentsPage from './DocumentsPage';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ProfileModal = React.lazy(() => import('./ProfileModal'));
const EditProfileModal = React.lazy(() => import('./EditProfileModal'));
const LogoutConfirmModal = React.lazy(() => import('./LogoutConfirmModal'));
const AdminDashboard = React.lazy(() => import('./AdminDashboard'));
const ManageDocumentPage = React.lazy(() => import('./ManageDocumentPage'));

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

type ChatMessage = { id: string; role: 'user' | 'bot'; text: string; createdAt: number };
type ChatThread = { id: string; title: string; messages: ChatMessage[]; createdAt: number; updatedAt: number };

export default function LoggedInPage({ onLogout }: LoggedInPageProps) {
  const layout = useResponsiveLayout();
  const isMobileView = layout.isMobile;
  const isTabletView = layout.isTablet;
  const isCompactSidebar = layout.isMobile || layout.isTablet;
  const isLikelyIPad = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const touchPoints = navigator.maxTouchPoints || 0;
    return /iPad/i.test(ua) || (platform === 'MacIntel' && touchPoints > 1);
  }, []);
  const [windowSize, setWindowSize] = useState({ width: typeof window !== 'undefined' ? window.innerWidth : 1200, height: typeof window !== 'undefined' ? window.innerHeight : 900 });
  
  // Handle window resize with debounce
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      }, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Memoize all sidebar calculations to ensure they update together
  const sidebarLayoutCalcs = useMemo(() => {
    const viewportWidth = windowSize.width;
    const viewHeight = windowSize.height;
    const scale = (!isCompactSidebar && isLikelyIPad)
      ? Math.min(1.08, Math.max(0.85, viewportWidth / 1180))
      : isTabletView
        ? Math.min(0.92, Math.max(0.74, viewHeight / 980))
        : Math.min(1.0, Math.max(isMobileView ? 0.72 : 0.85, viewHeight / 900));
    const compactSidebarWidth = Math.max(260, Math.min(400, Math.round(viewportWidth * 0.75)));
    const sidebarWidth = isCompactSidebar ? compactSidebarWidth : layout.sidebarWidth;
    const sidebarInnerWidth = Math.max(sidebarWidth - Math.round(49 * scale), 180);
    const sidebarHighlightWidth = Math.max(sidebarWidth - Math.round(55 * scale), 170);
    const contentLeft = isCompactSidebar ? 12 : sidebarWidth + Math.round(35 * scale);
    const contentRight = isCompactSidebar ? 12 : 40;
    const sidebarLeftPadding = Math.round(Math.max(12, sidebarWidth * 0.08));
    const iconLeft = Math.round(Math.max(24, sidebarWidth * 0.25));
    const labelLeft = Math.round(Math.max(70, sidebarWidth * 0.38));

    const logoTop = Math.round(54 * scale);
    const logoHeight = Math.round(120 * scale);
    const adminBadgeSidebarTop = Math.round(10 * scale);
    const dividerTop = Math.round(233 * scale);
    const newChatTop = Math.round(186.83 * scale);
    const aiTop = Math.round(266 * scale);
    const qaTop = Math.round(319 * scale);
    const docTop = Math.round(372 * scale);
    const dashboardTop = Math.round(319 * scale);
    const adminTop = Math.round(372 * scale);
    const adminInfoTop = Math.round(425 * scale);
    const manageDocTop = Math.round(478 * scale);
    const sidebarIconSize = Math.round(18 * scale);
    const sidebarLabelFont = Math.max(12, Math.round(16 * scale));
    const sidebarLabelOffset = Math.round(9.5 * scale);

    const chatDisplayTop = isMobileView ? 104 : isTabletView ? 112 : isCompactSidebar ? 126 : Math.round(84 * scale);
    const faqTop = isMobileView ? 104 : isTabletView ? 112 : isCompactSidebar ? 126 : Math.round(68 * scale);
    const docTopContent = isMobileView ? 104 : isTabletView ? 112 : isCompactSidebar ? 126 : Math.round(88 * scale);

    const chatInputHeight = isMobileView ? 80 : isTabletView ? 86 : Math.round(96 * scale);
    const chatInputBottom = isMobileView ? 12 : isTabletView ? 16 : Math.round(30 * scale);
    const chatDisplayBottom = chatInputBottom + chatInputHeight + Math.round(10 * scale);
    const inputTop = isMobileView ? 18 : isTabletView ? 16 : Math.round(26 * scale);
    const inputHeight = isMobileView ? 44 : isTabletView ? 52 : Math.round(58 * scale);
    const inputRight = isMobileView ? 62 : isTabletView ? 74 : Math.round(80 * scale);
    const inputFontSize = isMobileView ? 14 : Math.max(12, Math.round(16 * scale));
    const inputPadY = isMobileView ? 0 : Math.max(0, Math.round((inputHeight - inputFontSize) / 2) - 1);
    const sendBtnSize = isMobileView ? 34 : Math.round(40 * scale);
    const sendBtnTop = Math.round((chatInputHeight - sendBtnSize) / 2);
    const sendIconSize = isMobileView ? 22 : Math.round(28 * scale);

    const profileBottom = Math.round(70 * scale);
    const profileHeight = Math.round(60 * scale);
    const logoutBottom = Math.round(30 * scale);
    const logoutHeight = Math.round(28 * scale);
    const chatHistoryBottom = profileBottom + profileHeight + logoutHeight + Math.round(20 * scale);

    return {
      scale, sidebarWidth, sidebarInnerWidth, sidebarHighlightWidth, contentLeft, contentRight,
      sidebarLeftPadding, iconLeft, labelLeft, logoTop, logoHeight, adminBadgeSidebarTop,
      dividerTop, newChatTop, aiTop, qaTop, docTop, dashboardTop, adminTop, adminInfoTop, manageDocTop,
      sidebarIconSize, sidebarLabelFont, sidebarLabelOffset, chatDisplayTop, faqTop, docTopContent,
      chatInputHeight, chatInputBottom, chatDisplayBottom, inputTop, inputHeight, inputRight,
      inputFontSize, inputPadY, sendBtnSize, sendBtnTop, sendIconSize, profileBottom, profileHeight,
      logoutBottom, logoutHeight, chatHistoryBottom,
    };
  }, [windowSize.width, windowSize.height, isMobileView, isTabletView, isCompactSidebar, layout.sidebarWidth, isLikelyIPad]);

  const {
    scale, sidebarWidth, sidebarInnerWidth, sidebarHighlightWidth, contentLeft, contentRight,
    sidebarLeftPadding, iconLeft, labelLeft, logoTop, logoHeight, adminBadgeSidebarTop,
    dividerTop, newChatTop, aiTop, qaTop, docTop, dashboardTop, adminTop, adminInfoTop, manageDocTop,
    sidebarIconSize, sidebarLabelFont, sidebarLabelOffset, chatDisplayTop, faqTop, docTopContent,
    chatInputHeight, chatInputBottom, chatDisplayBottom, inputTop, inputHeight, inputRight,
    inputFontSize, inputPadY, sendBtnSize, sendBtnTop, sendIconSize, profileBottom, profileHeight,
    logoutBottom, logoutHeight, chatHistoryBottom,
  } = sidebarLayoutCalcs;
  const [selected, setSelected] = useState<'ai' | 'qa' | 'doc' | 'dashboard' | 'admin' | 'admin-info' | 'manage-doc'>('ai');
  const [profile, setProfile] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const nextIdRef = useRef(1);
  const isAdmin = (profile?.role || '').toLowerCase() === 'admin';
  const chatHistoryTop = useMemo(() => {
    const lastMenuTop = isAdmin ? adminInfoTop : docTop;
    const menuRowHeight = Math.round(44 * scale);
    const lastMenuBottom = lastMenuTop + menuRowHeight;
    const baseTop = lastMenuBottom + Math.round((isAdmin ? 16 : 20) * scale);
    const minHistoryHeight = Math.round(96 * scale);
    const maxTopForMinHeight = windowSize.height - chatHistoryBottom - minHistoryHeight;
    const minTopAllowed = lastMenuTop + Math.round(36 * scale);
    return Math.max(minTopAllowed, Math.min(baseTop, maxTopForMinHeight));
  }, [isAdmin, adminInfoTop, docTop, scale, windowSize.height, chatHistoryBottom]);
  const iconPositions: Record<'ai' | 'qa' | 'doc' | 'dashboard' | 'admin' | 'admin-info' | 'manage-doc', number> = {
    ai: aiTop,
    qa: qaTop,
    doc: docTop,
    dashboard: dashboardTop,
    admin: adminTop,
    'admin-info': adminInfoTop,
    'manage-doc': manageDocTop
  };
  const highlightTop = useMemo(() => {
    if (selected === 'admin') {
      return isAdmin ? adminTop - Math.round(13 * scale) : aiTop - Math.round(13 * scale);
    }
    return iconPositions[selected] - Math.round(13 * scale);
  }, [iconPositions, selected, scale, isAdmin]);

  useEffect(() => {
    if (isAdmin && (selected === 'qa' || selected === 'doc')) {
      setSelected('ai');
    }
  }, [isAdmin, selected]);

  const [profileView, setProfileView] = useState<'none' | 'profile' | 'edit'>('none');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const chatDisplayRef = useRef<HTMLDivElement>(null);

  const createTempThreadId = useCallback(() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `temp-${crypto.randomUUID()}`;
    }
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }, []);

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

  const loadProfileAndFAQ = useCallback(async () => {
    try {
      const profileRes = await authAPI.getProfile();
      console.log('Profile API response:', profileRes.data);
      console.log('Profile role:', profileRes.data?.role);
      setProfile(profileRes.data);
      console.log('Profile set to state');
      const faqRes = await faqAPI.getAllFAQs();
      setFaqs(faqRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    loadProfileAndFAQ();
  }, [loadProfileAndFAQ]);

  // Log profile changes
  useEffect(() => {
    console.log('Profile state updated:', profile);
    console.log('Is admin?', isAdmin);
  }, [profile, isAdmin]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [threads, activeThreadId, isTyping]);

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
            const sourceId = msg.id ?? idx;
            const roleTag = msg.role === 'bot' ? 'b' : 'u';
            return {
              id: `${roleTag}-${sourceId}-${createdAt}-${idx}`,
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

        // Seed local message id counter based on total loaded messages.
        const totalMessages = threadsFormatted.reduce((sum, t) => sum + t.messages.length, 0);
        nextIdRef.current = Math.max(1, totalMessages + 1);
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
    const tempThreadId = createTempThreadId();
    
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
  }, [createTempThreadId]);
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
    if (!trimmed || isSending) return; // Prevent duplicate sends
    
    const startId = nextIdRef.current;
    nextIdRef.current += 2;
    const now = Date.now();
    const userLocalId = `local-u-${startId}-${now}`;
    const botLocalId = `local-b-${startId + 1}-${now + 1}`;
    const userMsg: ChatMessage = { id: userLocalId, role: 'user', text: trimmed, createdAt: now };
    
    // ถ้าไม่มี active thread ให้สร้างใหม่
    let currentThreadId = activeThreadId;
    if (!currentThreadId) {
      currentThreadId = createTempThreadId();
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

    // แสดงข้อความผู้ใช้ทันที
    setThreads((prev) => {
      const existing = prev.find((t) => t.id === currentThreadId);

      if (!existing) {
        const title = trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed;
        return [
          {
            id: currentThreadId!,
            title,
            messages: [userMsg],
            createdAt: now,
            updatedAt: now
          },
          ...prev
        ];
      }

      const updatedMessages = [...existing.messages, userMsg];
      const updatedThread: ChatThread = {
        ...existing,
        title: existing.title === 'New Chat' ? (trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed) : existing.title,
        messages: updatedMessages,
        updatedAt: now
      };
      const others = prev.filter((t) => t.id !== existing.id);
      return [updatedThread, ...others];
    });

    setInput('');
    setIsSending(true);
    setErrorMessage(null);
    await Promise.resolve();

    let answerText = '...';
    let realThreadId = currentThreadId;
    setIsTyping(true);
    
    try {
      // ส่ง message พร้อม thread_id (มี retry mechanism)
      const res = await chatAPI.sendMessage(trimmed, currentThreadId);
      answerText = res.data?.answer || 'ระบบไม่สามารถตอบได้ในขณะนี้';
      // ถ้า API return thread_id ที่ต่างจากใหญ่ให้ใช้อันนั้น (เช่นจากการ save ใน backend)
      if (res.data?.thread_id) {
        realThreadId = res.data.thread_id;
      }
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      
      // แสดง error message ที่ชัดเจน
      let errorMsg = 'เกิดข้อผิดพลาดในการส่งข้อความ';
      
      if (err?.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err?.response?.status === 0) {
        errorMsg = 'หมดเวลาการเชื่อมต่อ กรุณาตรวจสอบเน็ตเวิร์ก';
      } else if (err?.response?.status === 401) {
        errorMsg = 'Session หมดอายุ กรุณา Refresh หน้า';
      } else if (err?.response?.status === 500) {
        errorMsg = 'เซิร์ฟเวอร์มีข้อผิดพลาด กรุณาลองใหม่';
      }
      
      setErrorMessage(errorMsg);
      answerText = `❌ ${errorMsg}`;
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }

    setThreads((prev) => {
      const existing = prev.find((t) => t.id === currentThreadId);
      const botMsg: ChatMessage = { id: botLocalId, role: 'bot', text: answerText, createdAt: now + 1 };
      
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
      
      const hasUserMsg = existing.messages.some((msg) => msg.id === userLocalId);
      const updatedMessages = hasUserMsg
        ? [...existing.messages, botMsg]
        : [...existing.messages, userMsg, botMsg];
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
  }, [input, activeThreadId, isSending, createTempThreadId]);
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
    <div style={{ position: 'relative', width: '100%', height: isTabletView ? '100dvh' : '100svh', minHeight: '100svh', overflow: 'hidden', background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)' }}>
      {!isCompactSidebar && (
        <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: sidebarWidth, height: '100svh', background: '#e4eef8' }} />

      {/* Logo */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: logoTop,
          width: sidebarWidth,
          height: logoHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <img alt="CPE Logo" src={imgLogoCpe} style={{ maxWidth: '70%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>

      {isAdmin && (
        <div
          style={{
            position: 'absolute',
            left: Math.round(sidebarWidth / 2),
            transform: 'translateX(-50%)',
            top: adminBadgeSidebarTop,
            width: 'max-content',
            maxWidth: Math.max(170, Math.round(sidebarWidth * 0.82)),
            height: Math.round(34 * scale),
            borderRadius: Math.round(10 * scale),
            border: '1px solid #e16a75',
            background: '#fff2f4',
            color: '#b23b4b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '0 16px',
            fontSize: Math.max(11, Math.round(13 * scale)),
            fontWeight: 700,
            letterSpacing: 0.2,
            whiteSpace: 'nowrap'
          }}
          aria-label="Current role: Admin"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b23b4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Admin Mode</span>
        </div>
      )}

      {/* Divider line */}
      <div style={{ position: 'absolute', left: sidebarLeftPadding, top: dividerTop, width: sidebarInnerWidth, height: 1, background: '#6277ac' }} />

      <div style={{ position: 'absolute', left: sidebarLeftPadding, top: highlightTop, width: sidebarInnerWidth, height: Math.round(44 * scale), borderRadius: Math.round(10 * scale), background: '#7587b8', transition: 'top 0.25s' }} />
      <div style={{ position: 'absolute', left: sidebarLeftPadding + Math.round(6 * scale), top: highlightTop, width: sidebarHighlightWidth, height: Math.round(44 * scale), borderRadius: Math.round(10 * scale), background: '#fff', transition: 'top 0.25s' }} />

      {/* AI Chat with icon */}
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: iconLeft, top: aiTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '12.5%' }}>
          <div style={{ position: 'absolute', inset: '-5.93%' }}>
            <img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'brightness(0) saturate(100%)' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: labelLeft, top: aiTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

      {!isAdmin && (
        <>
          {/* FAQs with icon */}
          <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: iconLeft, top: qaTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
              <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
                <img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} />
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
        </>
      )}

      {/* User Information - only for admin */}
      {isAdmin && (
        <>
          <button onClick={() => setSelected('dashboard')} style={{ position: 'absolute', left: iconLeft, top: dashboardTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
              <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
                <img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'dashboard' ? 'brightness(0) saturate(100%)' : 'none' }} />
              </div>
            </div>
          </button>
          <button onClick={() => setSelected('dashboard')} style={{ position: 'absolute', left: labelLeft, top: dashboardTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'dashboard' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Dashboard</button>

          <button onClick={() => setSelected('admin')} style={{ position: 'absolute', left: iconLeft, top: adminTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', inset: '12.5%' }}>
              <div style={{ position: 'absolute', inset: '-5.93%' }}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={selected === 'admin' ? '#000' : '#6277ac'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                >
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </button>
          <button onClick={() => setSelected('admin')} style={{ position: 'absolute', left: labelLeft, top: adminTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'admin' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>User Information</button>

          <button onClick={() => setSelected('admin-info')} style={{ position: 'absolute', left: iconLeft, top: adminInfoTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', inset: '12.5%' }}>
              <div style={{ position: 'absolute', inset: '-5.93%' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={selected === 'admin-info' ? '#000' : '#6277ac'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            </div>
          </button>
          <button onClick={() => setSelected('admin-info')} style={{ position: 'absolute', left: labelLeft, top: adminInfoTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'admin-info' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Admin Information</button>

        </>
      )}
      {/* Debug: Show profile role */}
      {(import.meta as any).env.MODE === 'development' && (
        <div style={{ position: 'absolute', left: 20, top: 20, fontSize: 12, color: '#f00', background: '#fff', padding: '4px 8px', zIndex: 9999 }}>
          Debug: profile.role = {JSON.stringify(profile?.role)} (admin={String(profile?.role === 'admin')})
        </div>
      )}

      {/* New chat */}
      <button onClick={handleNewChat} style={{ position: 'absolute', left: iconLeft - Math.round(3 * scale), top: newChatTop - Math.round(3 * scale), width: Math.round(24 * scale), height: Math.round(24 * scale), overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '5% 10% 5% 10%' }}>
          <div style={{ position: 'absolute', inset: '-5%' }}>
            <img alt="New chat" src={imgNewChat} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} />
          </div>
        </div>
      </button>
      <button onClick={handleNewChat} style={{ position: 'absolute', left: labelLeft, top: newChatTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>New Chat</button>

      {/* Chat history */}
      <div style={{ position: 'absolute', left: sidebarLeftPadding, top: chatHistoryTop, width: sidebarInnerWidth, bottom: chatHistoryBottom, display: 'flex', flexDirection: 'column', minHeight: Math.round(72 * scale) }}>
        <div style={{ fontSize: Math.max(10, Math.round(12 * scale)), color: '#6277ac', marginBottom: Math.round(6 * scale) }}>Chat History</div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: Math.round(4 * scale) }}>
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
        </>
      )}

      {isCompactSidebar && (
        <div style={{ position: 'absolute', left: 12, right: 12, top: 10, zIndex: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setMobileSidebarOpen(true)} style={{ border: 'none', background: '#dfe9f7', color: '#445c94', borderRadius: 8, width: 36, height: 36, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>≡</button>
          <img alt="CPE Logo" src={imgLogoCpe} style={{ width: 96, height: 40, objectFit: 'contain' }} />
          <div style={{ width: 36, height: 36 }} />
        </div>
      )}

      {isCompactSidebar && mobileSidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.35)' }} onClick={() => setMobileSidebarOpen(false)}>
          <div style={{ position: 'relative', width: sidebarWidth, maxWidth: '82vw', height: '100%', background: '#e4eef8' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMobileSidebarOpen(false)} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', color: '#445c94', fontSize: 24, cursor: 'pointer', lineHeight: 1, zIndex: 2 }}>×</button>

            <div style={{ position: 'absolute', left: 0, top: logoTop, width: sidebarWidth, height: logoHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <img alt="CPE Logo" src={imgLogoCpe} style={{ maxWidth: '70%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>

            {isAdmin && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.round(sidebarWidth / 2),
                  transform: 'translateX(-50%)',
                  top: adminBadgeSidebarTop,
                  width: 'max-content',
                  maxWidth: Math.max(170, Math.round(sidebarWidth * 0.82)),
                  height: Math.round(34 * scale),
                  borderRadius: Math.round(10 * scale),
                  border: '1px solid #e16a75',
                  background: '#fff2f4',
                  color: '#b23b4b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '0 16px',
                  fontSize: Math.max(11, Math.round(13 * scale)),
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  whiteSpace: 'nowrap'
                }}
                aria-label="Current role: Admin"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b23b4b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Admin Mode</span>
              </div>
            )}

            <div style={{ position: 'absolute', left: sidebarLeftPadding, top: dividerTop, width: sidebarInnerWidth, height: 1, background: '#6277ac' }} />
            <div style={{ position: 'absolute', left: sidebarLeftPadding, top: highlightTop, width: sidebarInnerWidth, height: Math.round(44 * scale), borderRadius: Math.round(10 * scale), background: '#7587b8', transition: 'top 0.25s' }} />
            <div style={{ position: 'absolute', left: sidebarLeftPadding + Math.round(6 * scale), top: highlightTop, width: sidebarHighlightWidth, height: Math.round(44 * scale), borderRadius: Math.round(10 * scale), background: '#fff', transition: 'top 0.25s' }} />

            <button onClick={() => { setSelected('ai'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: aiTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: '12.5%' }}><div style={{ position: 'absolute', inset: '-5.93%' }}><img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'brightness(0) saturate(100%)' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} /></div></div>
            </button>
            <button onClick={() => { setSelected('ai'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: aiTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

            {!isAdmin && (
              <>
                <button onClick={() => { setSelected('qa'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: qaTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}><div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}><img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} /></div></div>
                </button>
                <button onClick={() => { setSelected('qa'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: qaTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>FAQs</button>

                <button onClick={() => { setSelected('doc'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: docTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: '5.78% 10.67% 8.34% 8.34%' }}><div style={{ position: 'absolute', inset: '-5.18% -5.49%' }}><img alt="" src={img1} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'doc' ? 'brightness(0) saturate(100%)' : 'none' }} /></div></div>
                </button>
                <button onClick={() => { setSelected('doc'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: docTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'doc' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Documents</button>
              </>
            )}

            {isAdmin && (
              <>
                <button onClick={() => { setSelected('dashboard'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: dashboardTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}><div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}><img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'dashboard' ? 'brightness(0) saturate(100%)' : 'none' }} /></div></div>
                </button>
                <button onClick={() => { setSelected('dashboard'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: dashboardTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'dashboard' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Dashboard</button>

                <button onClick={() => { setSelected('admin'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: adminTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: '12.5%' }}><div style={{ position: 'absolute', inset: '-5.93%' }}><svg viewBox="0 0 24 24" fill="none" stroke={selected === 'admin' ? '#000' : '#6277ac'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></svg></div></div>
                </button>
                <button onClick={() => { setSelected('admin'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: adminTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'admin' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>User Information</button>

                <button onClick={() => { setSelected('admin-info'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft, top: adminInfoTop, width: sidebarIconSize, height: sidebarIconSize, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', inset: '12.5%' }}><div style={{ position: 'absolute', inset: '-5.93%' }}><svg viewBox="0 0 24 24" fill="none" stroke={selected === 'admin-info' ? '#000' : '#6277ac'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', width: '100%', height: '100%' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div></div>
                </button>
                <button onClick={() => { setSelected('admin-info'); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: adminInfoTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: selected === 'admin-info' ? '#000' : '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Admin Information</button>

              </>
            )}

            <button onClick={() => { handleNewChat(); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: iconLeft - Math.round(3 * scale), top: newChatTop - Math.round(3 * scale), width: Math.round(24 * scale), height: Math.round(24 * scale), overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <div style={{ position: 'absolute', inset: '5% 10% 5% 10%' }}><div style={{ position: 'absolute', inset: '-5%' }}><img alt="New chat" src={imgNewChat} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', opacity: 0.9 }} /></div></div>
            </button>
            <button onClick={() => { handleNewChat(); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: labelLeft, top: newChatTop + sidebarLabelOffset, transform: 'translateY(-50%)', color: '#6277ac', fontSize: sidebarLabelFont, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>New Chat</button>

            <div style={{ position: 'absolute', left: sidebarLeftPadding, top: chatHistoryTop, width: sidebarInnerWidth, bottom: chatHistoryBottom, display: 'flex', flexDirection: 'column', minHeight: Math.round(72 * scale) }}>
              <div style={{ fontSize: Math.max(10, Math.round(12 * scale)), color: '#6277ac', marginBottom: Math.round(6 * scale) }}>Chat History</div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: Math.round(4 * scale) }}>
                {threads.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#9aa4bf' }}>ยังไม่มีประวัติ</div>
                ) : (
                  threads.map((t) => (
                    <div key={t.id} style={{ position: 'relative', width: '100%', marginBottom: 4 }}>
                      <button onClick={() => { handleSelectThread(t.id); setMobileSidebarOpen(false); }} style={{ width: '100%', textAlign: 'left', border: 'none', background: t.id === activeThreadId ? '#ffffff' : 'transparent', color: t.id === activeThreadId ? '#000' : '#6277ac', fontSize: 12, padding: '6px 8px', paddingRight: '32px', borderRadius: 8, cursor: 'pointer', display: 'block' }}>{t.title}</button>
                      <button onClick={(e) => handleDeleteThread(t.id, e)} style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }} aria-label="Delete thread"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg></button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ position: 'absolute', left: sidebarLeftPadding, bottom: profileBottom, width: sidebarInnerWidth, height: profileHeight, background: '#d4e2f4', borderRadius: Math.round(12 * scale), display: 'flex', alignItems: 'center', padding: `${Math.round(8 * scale)}px ${Math.round(12 * scale)}px`, gap: Math.round(12 * scale) }}>
              <div style={{ width: Math.round(44 * scale), height: Math.round(44 * scale), borderRadius: '50%', background: '#6277ac', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: Math.max(12, Math.round(18 * scale)), fontWeight: 600 }}>{profile?.name?.[0]?.toUpperCase() || 'U'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#2b2b2b', fontSize: Math.max(11, Math.round(14 * scale)), fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name || 'Username'}</div>
                <div style={{ color: '#6277ac', fontSize: Math.max(9, Math.round(11 * scale)), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: Math.round(2 * scale) }}>{profile?.email || 'user@example.com'}</div>
              </div>
              <button onClick={() => { openProfile(); setMobileSidebarOpen(false); }} style={{ width: Math.round(24 * scale), height: Math.round(24 * scale), flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Edit profile"><svg width={Math.round(20 * scale)} height={Math.round(20 * scale)} viewBox="0 0 24 24" fill="none" stroke="#6277ac" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
            </div>

            <button onClick={() => { openLogoutConfirm(); setMobileSidebarOpen(false); }} style={{ position: 'absolute', left: sidebarLeftPadding, bottom: logoutBottom, width: sidebarInnerWidth, height: logoutHeight, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: Math.round(8 * scale), padding: 0 }} aria-label="Logout"><img src={imgLogout} alt="Logout" style={{ width: Math.round(18 * scale), height: Math.round(18 * scale) }} /><span style={{ color: '#6277ac', fontSize: Math.max(11, Math.round(14 * scale)), fontWeight: 500 }}>Logout</span></button>
          </div>
        </div>
      )}

      {selected === 'ai' && (
        <>
          {(() => {
            const activeThread = threads.find((t) => t.id === activeThreadId);
            const hasMessages = activeThread && activeThread.messages.length > 0;

            return (
              <>
                {/* Welcome message (when no active thread or no messages) */}
                {!hasMessages && (
                  <div style={{ position: 'absolute', left: contentLeft, right: contentRight, top: '35%', transform: 'translateY(-50%)', textAlign: 'center', padding: '0 20px' }}>
                    <p style={{ margin: 0, color: '#757575', fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1 }}>Hello</p>
                    <p style={{ margin: 0, fontSize: 'clamp(32px, 6vw, 70px)', fontWeight: 600, lineHeight: 1.1, background: 'linear-gradient(90deg, #faa538 20%, #708ac4 52%, #4960ac 81%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Chat CPE</p>
                  </div>
                )}

                {/* Chat display (when messages exist) */}
                {hasMessages && (
                  <div ref={chatDisplayRef} style={{ position: 'absolute', left: contentLeft, top: chatDisplayTop, right: contentRight, bottom: chatDisplayBottom, overflow: 'auto', padding: Math.round(20 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(12 * scale) }}>
                    {activeThread?.messages.map((msg) => (
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
              </>
            );
          })()}

          <div style={{ position: 'absolute', left: contentLeft, right: contentRight, bottom: chatInputBottom, height: chatInputHeight }}>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #4960ac', borderRadius: Math.round(15 * scale) }} />
            {errorMessage && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8, padding: '8px 12px', background: '#ffebee', border: '1px solid #ef5350', borderRadius: 8, fontSize: 13, color: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>
              </div>
            )}
            <input
              disabled={isSending || isTyping}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSending && !isTyping) handleSend();
              }}
              placeholder="พิมพ์ข้อความที่นี่..."
              style={{ position: 'absolute', left: Math.round(20 * scale), top: inputTop, right: inputRight, height: inputHeight, border: 'none', outline: 'none', fontSize: inputFontSize, lineHeight: 'normal', paddingTop: inputPadY, paddingBottom: inputPadY, background: 'transparent', color: '#24324f', WebkitTextFillColor: '#24324f', caretColor: '#24324f', opacity: isSending || isTyping ? 0.6 : 1, cursor: isSending || isTyping ? 'not-allowed' : 'text' }}
            />
            <button
              disabled={isSending || isTyping}
              onClick={handleSend}
              style={{ position: 'absolute', right: Math.round(20 * scale), top: sendBtnTop, width: sendBtnSize, height: sendBtnSize, borderRadius: sendBtnSize, background: '#7587b8', border: 'none', cursor: isSending || isTyping ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSending || isTyping ? 0.6 : 1 }}
              aria-label="Send"
            >
              <img
                alt=""
                src={imgSend}
                style={{
                  display: 'block',
                  width: Math.round(sendIconSize * 0.75),
                  height: Math.round(sendIconSize * 0.75),
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            </button>
          </div>
        </>
      )}
      {selected === 'qa' && (
        <div style={{ position: 'absolute', left: contentLeft, top: faqTop, right: contentRight, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(16 * scale) }}>
          <FAQsAccordion faqs={faqs} />
        </div>
      )}
      {selected === 'doc' && (
        <div style={{ position: 'absolute', left: contentLeft, top: docTopContent, right: contentRight, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(24 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <DocumentsPage />
        </div>
      )}
      {selected === 'admin' && isAdmin && (
        <div style={{ position: 'absolute', left: contentLeft, top: docTopContent, right: contentRight, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(24 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
            <AdminDashboard view="information" />
          </Suspense>
        </div>
      )}
      {selected === 'admin-info' && isAdmin && (
        <div style={{ position: 'absolute', left: contentLeft, top: docTopContent, right: contentRight, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(24 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
            <AdminDashboard view="admin-info" />
          </Suspense>
        </div>
      )}
      {selected === 'dashboard' && isAdmin && (
        <div style={{ position: 'absolute', left: contentLeft, top: docTopContent, right: contentRight, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(24 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
            <AdminDashboard view="dashboard" />
          </Suspense>
        </div>
      )}
      {selected === 'manage-doc' && isAdmin && (
        <div style={{ position: 'absolute', left: contentLeft, top: docTopContent, right: contentRight, bottom: chatInputBottom, overflow: 'auto', padding: Math.round(24 * scale), background: '#ffffff', border: '1px solid #4960ac', borderRadius: Math.round(16 * scale) }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>}>
            <ManageDocumentPage />
          </Suspense>
        </div>
      )}

      {/* Profile Section */}
      {!isCompactSidebar && (
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
      )}

      {/* Logout Button */}
      {!isCompactSidebar && (
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
      )}

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
