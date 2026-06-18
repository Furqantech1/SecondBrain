// PLAN: Dashboard.jsx
// - Layout tree: Full-height flex → Nav (h-14) → Main (flex-1, flex-row) → [Nav sidebar 240/48px] [Document area / Chat flex-1] [Inspector 320px opt.]
// - State: sidebarExpanded, activeSidebarTab, highlightsOpen, selectedDocumentIds, currentDocumentId/Name, searchParams token
// - Motion: collapseWidth (sidebar), slideFromRight (inspector), fadeUp (content), stagger (nav items)
// - Key constraints: No DeepSpaceBackground, no neon, no glow, no gradient borders, no rounded-2xl, no emoji
// END PLAN

import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import ChatInterface from '../components/ChatInterface';
import DocumentLibrary from '../components/DocumentLibrary';
import HighlightsDrawer from '../components/HighlightsDrawer';
import { LogOut, Upload, FolderOpen, Bookmark, ChevronLeft, ChevronRight, FileText, User, Settings, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, SPRING_SNAPPY, SPRING_PANEL, collapseWidth } from '../lib/motion';

const NAV_ITEMS_WORKSPACE = [
  { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'library', icon: FolderOpen, label: 'Documents' },
  { id: 'chat', icon: MessageSquare, label: 'Conversation' },
];

const NAV_ITEMS_ACCOUNT = [
  { id: 'profile', icon: User, label: 'Profile', route: '/profile' },
];

const Dashboard = () => {
  const { user, logout, loginWithToken } = useAuth();
  const navigate = useNavigate();

  const [currentDocumentId, setCurrentDocumentId] = useState(() => {
    const userId = user?._id;
    if (!userId) return null;
    return localStorage.getItem(`lastActiveDocId_${userId}`) || null;
  });

  const [currentDocumentName, setCurrentDocumentName] = useState(() => {
    const userId = user?._id;
    if (!userId) return null;
    return localStorage.getItem(`lastActiveDocName_${userId}`) || null;
  });

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeView, setActiveView] = useState('chat');
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);

  useEffect(() => {
    const userId = user?._id;
    if (currentDocumentId && userId) {
      localStorage.setItem(`lastActiveDocId_${userId}`, currentDocumentId);
    }
    if (currentDocumentName && userId) {
      localStorage.setItem(`lastActiveDocName_${userId}`, currentDocumentName);
    }
  }, [currentDocumentId, currentDocumentName, user]);

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      loginWithToken(token);
      navigate('/dashboard', { replace: true });
    }
  }, [token, loginWithToken, navigate]);

  const handleUploadSuccess = (documentId, filename) => {
    setCurrentDocumentId(documentId);
    setCurrentDocumentName(filename || documentId);
    setActiveView('chat');
  };

  const handleClearDocument = () => {
    setCurrentDocumentId(null);
    setCurrentDocumentName(null);
    const userId = user?._id;
    if (userId) {
      localStorage.removeItem(`lastActiveDocId_${userId}`);
      localStorage.removeItem(`lastActiveDocName_${userId}`);
    }
  };

  const userInitial = user?.username?.[0] || user?.email?.[0]?.toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col"
      style={{ background: 'var(--surface-base)' }}
    >
      {/* NAV BAR */}
      <nav className="h-14 shrink-0 border-b border-border-subtle flex items-center px-4 md:px-6" style={{ background: 'var(--surface-base)' }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-mono text-[13px] font-medium tracking-[0.12em] text-text-primary">SECOND BRAIN</span>
        </div>

        <div className="flex-1" />

        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-surface-overlay"
              style={{ transition: 'background 120ms ease' }}
            >
              <div className="w-7 h-7 rounded-sm bg-surface-overlay border border-border-default flex items-center justify-center text-[11px] font-semibold text-text-secondary overflow-hidden">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <span className="hidden sm:block text-[13px] text-text-secondary">{user.username || 'User'}</span>
            </button>

            <div className="h-5 w-px bg-border-subtle" />

            <button
              onClick={logout}
              className="p-2 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-overlay"
              style={{ transition: 'all 120ms ease' }}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="btn-ghost text-[12px] uppercase tracking-[0.02em] px-3 py-1.5">Sign In</button>
            <button onClick={() => navigate('/signup')} className="btn-primary text-[12px] uppercase tracking-[0.02em] px-3 py-1.5">Start Free</button>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex overflow-hidden">

        {/* SIDEBAR — desktop */}
        <motion.aside
          initial={false}
          animate={sidebarExpanded ? 'expanded' : 'collapsed'}
          variants={collapseWidth(48, 240)}
          className="hidden lg:flex flex-col shrink-0 border-r border-border-subtle bg-surface-raised overflow-hidden"
        >
          <div className="flex flex-col h-full" style={{ width: sidebarExpanded ? 240 : 48 }}>
            {/* Toggle */}
            <div className={`flex items-center ${sidebarExpanded ? 'justify-end px-3' : 'justify-center'} h-10 shrink-0`}>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-overlay"
                style={{ transition: 'all 120ms ease' }}
              >
                {sidebarExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </button>
            </div>

            {/* WORKSPACE section */}
            {sidebarExpanded && <p className="text-meta px-4 mb-2">WORKSPACE</p>}

            <div className="space-y-0.5 px-1.5">
              {NAV_ITEMS_WORKSPACE.map(item => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 rounded-sm relative ${sidebarExpanded ? 'px-3 py-2' : 'justify-center py-2'}`}
                    style={{
                      background: isActive ? 'var(--surface-overlay)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all 120ms ease',
                    }}
                    title={!sidebarExpanded ? item.label : undefined}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-sm"
                        style={{ background: 'var(--surface-overlay)' }}
                        transition={SPRING_SNAPPY}
                      />
                    )}
                    <item.icon size={16} className="relative z-10 shrink-0" />
                    {sidebarExpanded && <span className="relative z-10 text-[14px]">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Highlights button */}
            <div className="px-1.5 mt-1">
              <button
                onClick={() => setHighlightsOpen(true)}
                className={`w-full flex items-center gap-3 rounded-sm ${sidebarExpanded ? 'px-3 py-2' : 'justify-center py-2'} text-text-secondary hover:text-text-primary hover:bg-surface-overlay`}
                style={{ transition: 'all 120ms ease' }}
                title={!sidebarExpanded ? 'Highlights' : undefined}
              >
                <Bookmark size={16} className="shrink-0" />
                {sidebarExpanded && <span className="text-[14px]">Highlights</span>}
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* ACCOUNT section */}
            {sidebarExpanded && <p className="text-meta px-4 mb-2">ACCOUNT</p>}

            <div className="space-y-0.5 px-1.5 mb-3">
              {NAV_ITEMS_ACCOUNT.map(item => (
                <button
                  key={item.id}
                  onClick={() => item.route && navigate(item.route)}
                  className={`w-full flex items-center gap-3 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-overlay ${sidebarExpanded ? 'px-3 py-2' : 'justify-center py-2'}`}
                  style={{ transition: 'all 120ms ease' }}
                  title={!sidebarExpanded ? item.label : undefined}
                >
                  <item.icon size={16} className="shrink-0" />
                  {sidebarExpanded && <span className="text-[14px]">{item.label}</span>}
                </button>
              ))}
            </div>

            {/* User footer */}
            {sidebarExpanded && user && (
              <div className="px-3 py-3 border-t border-border-subtle flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-surface-overlay border border-border-default flex items-center justify-center text-[12px] font-medium text-text-secondary overflow-hidden shrink-0">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userInitial
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-text-primary truncate">{user.username || 'User'}</p>
                  <p className="text-[11px] text-text-tertiary truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </motion.aside>

        {/* MOBILE: Tab buttons + content */}
        <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
          <div className="flex border-b border-border-subtle shrink-0">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'library', label: 'Library' },
              { id: 'chat', label: 'Chat' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 py-3 text-[12px] font-medium uppercase tracking-[0.02em] border-b-2 ${
                  activeView === tab.id
                    ? 'border-accent text-text-primary'
                    : 'border-transparent text-text-tertiary'
                }`}
                style={{ transition: 'all 120ms ease' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeView === 'upload' && (
              <div className="h-full p-4 overflow-y-auto">
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            )}
            {activeView === 'library' && (
              <div className="h-full p-4 overflow-y-auto">
                <DocumentLibrary
                  currentDocumentId={currentDocumentId}
                  onSelectDocument={handleUploadSuccess}
                  onMultiSelect={setSelectedDocumentIds}
                  selectedDocumentIds={selectedDocumentIds}
                />
              </div>
            )}
            {activeView === 'chat' && (
              <div className="h-full flex flex-col">
                <ChatInterface
                  documentId={currentDocumentId}
                  documentName={currentDocumentName}
                  documentIds={selectedDocumentIds}
                  onClearDocument={handleClearDocument}
                />
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP: Content area */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          {/* Left panel — upload or library */}
          {(activeView === 'upload' || activeView === 'library') && (
            <div className="w-[340px] shrink-0 border-r border-border-subtle flex flex-col overflow-hidden">
              <div className="h-12 flex items-center px-4 border-b border-border-subtle shrink-0">
                <p className="text-meta">{activeView === 'upload' ? 'UPLOAD' : 'DOCUMENTS'}</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {activeView === 'upload' ? (
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                ) : (
                  <DocumentLibrary
                    currentDocumentId={currentDocumentId}
                    onSelectDocument={handleUploadSuccess}
                    onMultiSelect={setSelectedDocumentIds}
                    selectedDocumentIds={selectedDocumentIds}
                  />
                )}
              </div>
            </div>
          )}

          {/* Chat panel — always visible on desktop */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <ChatInterface
              documentId={currentDocumentId}
              documentName={currentDocumentName}
              documentIds={selectedDocumentIds}
              onClearDocument={handleClearDocument}
            />
          </div>
        </div>
      </main>

      {/* Highlights Drawer */}
      <HighlightsDrawer isOpen={highlightsOpen} onClose={() => setHighlightsOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
