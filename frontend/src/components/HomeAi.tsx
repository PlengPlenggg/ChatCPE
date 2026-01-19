import React, { useState, useCallback, useMemo, Suspense, useEffect } from 'react';
import { faqAPI } from '../services/api';
const SignInModal = React.lazy(() => import('./SignInModal'));
const SignUpModal = React.lazy(() => import('./SignUpModal'));

const imgLogoCpe = "https://www.figma.com/api/mcp/asset/5ead37b8-0b06-4579-a22c-ab76303fc739";
const imgNewChat = "https://www.figma.com/api/mcp/asset/13520a87-5b57-47cf-88fb-44389e773b6a";
const imgIcon = "https://www.figma.com/api/mcp/asset/a9fd42b3-6dd5-45c7-9fcc-b0f6c76602f1";
const imgIcon1 = "https://www.figma.com/api/mcp/asset/a942c11a-5bc3-4521-afef-725ca64e56bb";
const imgLine1 = "https://www.figma.com/api/mcp/asset/7fe8991d-2258-4f8c-88e5-c8ae4893d32e";
const img = "https://www.figma.com/api/mcp/asset/4c20ca8d-22e3-4466-b61d-868765075c02";
const img1 = "https://www.figma.com/api/mcp/asset/87e62f57-e565-430b-88fc-8fd24ef45113";
const img2 = "https://www.figma.com/api/mcp/asset/e20bd231-fa71-4e49-add9-1a0a996b5262";
const img3 = "https://www.figma.com/api/mcp/asset/ec710b3d-d4e5-4369-91f9-8497f013950b";

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
  const [modal, setModal] = useState<'none' | 'signin' | 'signup'>('none');
  const [selected, setSelected] = useState<'ai' | 'qa' | 'doc'>('ai');
  const [faqs, setFaqs] = useState<any[]>([]);

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
  return (
    <div
      data-name="Home - ai"
      data-node-id="10:122"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 730,
        background: 'linear-gradient(to bottom, #f0f6fe, #ffffff)'
      }}
    >
      {/* Left sidebar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 285, height: 730, background: '#e4eef8' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', left: 42, top: 19, width: 143, height: 122, overflow: 'hidden', pointerEvents: 'none' }}>
        <img alt="CPE Logo" src={imgLogoCpe} style={{ position: 'absolute', width: '212.39%', height: '140.6%', left: '-112.38%', top: '-18.6%' }} />
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
            <img alt="" src={img3} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'ai' ? 'none' : 'brightness(0) saturate(100%) invert(46%) sepia(10%) saturate(842%) hue-rotate(178deg) brightness(94%) contrast(87%)' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('ai')} style={{ position: 'absolute', left: 109.47, top: 275.48, transform: 'translateY(-50%)', color: selected === 'ai' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>AI Chat</button>

      {/* Q & A */}
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: 70, top: 319, width: 18, height: 18, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: '8.33% 8.33% 12.42% 8.33%' }}>
          <div style={{ position: 'absolute', inset: '-5.61% -5.33%' }}>
            <img alt="" src={img2} style={{ display: 'block', width: '100%', height: '100%', filter: selected === 'qa' ? 'brightness(0) saturate(100%)' : 'none' }} />
          </div>
        </div>
      </button>
      <button onClick={() => setSelected('qa')} style={{ position: 'absolute', left: 109.47, top: 328.48, transform: 'translateY(-50%)', color: selected === 'qa' ? '#000' : '#6277ac', fontSize: 16, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Q & A</button>

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
      <div style={{ position: 'absolute', left: 70, top: 186.83, width: 34, height: 27, overflow: 'hidden' }}>
        <img alt="New chat" src={imgNewChat} style={{ position: 'absolute', width: 25, height: 25, left: 0, bottom: 3, opacity: 0.9 }} />
      </div>
      <div style={{ position: 'absolute', left: 109.47, top: 196.31, transform: 'translateY(-50%)', color: '#6277ac', fontSize: 16 }}>New Chat</div>

      {/* Welcome text (only visible on AI) */}
      {selected === 'ai' && (
        <div style={{ position: 'absolute', left: 912.76, top: 236.5, transform: 'translate(-50%, -50%)', width: 995, height: 197, textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#757575', fontSize: 70, fontWeight: 600 }}>Hello</p>
          <p style={{ margin: 0, fontSize: 70, fontWeight: 600, background: 'linear-gradient(90deg, #faa538 20%, #708ac4 52%, #4960ac 81%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Welcome to Chat CPE</p>
        </div>
      )}

      {/* Search bar and send button (only on AI) */}
      {selected === 'ai' && (
        <div style={{ position: 'absolute', left: 371, top: 567.78, width: 1084.255, height: 110.852 }}>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', border: '1px solid #4960ac', borderRadius: 15 }} />
          <div style={{ position: 'absolute', left: 1395.68 - 371, top: 625.91 - 567.78, width: 40, height: 40, borderRadius: 100, background: '#7587b8' }} />
          <div style={{ position: 'absolute', left: 1401.89 - 371, top: 632.11 - 567.78, width: 27.586, height: 27.586, overflow: 'hidden' }}>
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
        <div style={{ position: 'absolute', left: 371, top: 250, width: 800, minHeight: 300, padding: 24, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 12 }}>
          <h2 style={{ marginTop: 0, color: '#4960ac', fontFamily: 'Inter, system-ui, sans-serif' }}>Frequently Asked Questions</h2>
          {faqs.length > 0 ? (
            faqs.map((faq) => (
              <div key={faq.id} style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4960ac' }}>{faq.question}</h4>
                <p style={{ margin: 0, color: '#6277ac', fontSize: 14 }}>{faq.answer}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#6277ac' }}>No FAQs available</p>
          )}
        </div>
      )}

      {/* Placeholder Document content */}
      {selected === 'doc' && (
        <div style={{ position: 'absolute', left: 371, top: 250, width: 900, minHeight: 360, padding: 32, background: '#ffffff', border: '1px solid #4960ac', borderRadius: 16 }}>
          <h2 style={{ marginTop: 0, color: '#4960ac', fontFamily: 'Inter, system-ui, sans-serif' }}>Documents</h2>
          <p style={{ color: '#6277ac', lineHeight: '1.5' }}>
            A list of imported documents will appear here. You can later replace this placeholder with an upload
            area or a document navigator.
          </p>
          <ul style={{ paddingLeft: 18, margin: 0, color: '#000' }}>
            <li style={{ marginBottom: 8 }}>Example.pdf</li>
            <li style={{ marginBottom: 8 }}>Syllabus.docx</li>
            <li style={{ marginBottom: 8 }}>Notes.txt</li>
          </ul>
          <div style={{ marginTop: 24, padding: 12, border: '1px dashed #7587b8', borderRadius: 8, background: '#f0f6fe' }}>
            <span style={{ color: '#6277ac' }}>Placeholder: drag & drop files here (to implement later)</span>
          </div>
        </div>
      )}

      {/* Logout icon example (position loosely based) */}
      {/* <LogOut style={{ position: 'absolute', left: 341, top: 499, width: 18, height: 18, overflow: 'hidden' }} /> */}

      {/* Sign In trigger */}
      <SignInButton onClick={openSignIn} style={{ position: 'absolute', left: 25, top: 635 }} />

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
