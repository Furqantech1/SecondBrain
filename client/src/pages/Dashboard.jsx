import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import ChatInterface from '../components/ChatInterface';
import DeepSpaceBackground from '../components/DeepSpaceBackground';
import DocumentLibrary from '../components/DocumentLibrary';
import HighlightsDrawer from '../components/HighlightsDrawer';
import { Brain, LogOut, Zap, Database, Radio, Upload, ChevronLeft, ChevronRight, FolderOpen, Bookmark } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

/* ───────── Animation Variants ───────── */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    },
};

const systemStatusItems = [
    { text: 'Neural Engine', icon: Zap, status: 'Online' },
    { text: 'Vector Database', icon: Database, status: 'Connected' },
    { text: 'Upload Gateway', icon: Radio, status: 'Active' },
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

    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState('upload'); // 'upload' | 'library'
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
        console.log("Upload success, setting context to:", documentId, filename);
        setCurrentDocumentId(documentId);
        setCurrentDocumentName(filename || documentId);
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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen text-white relative overflow-x-hidden font-sans selection:bg-brain-primary/30"
        >
            <DeepSpaceBackground />

            <div className="relative z-10 flex flex-col min-h-screen lg:h-screen">
                {/* ═══════════ NAVBAR ═══════════ */}
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border-b border-white/[0.04] backdrop-blur-2xl sticky top-0 z-50 shrink-0"
                    style={{ backgroundColor: 'rgba(6,6,11,0.8)' }}
                >
                    <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-lg shadow-lg shadow-brain-primary/10" />
                            <span className="text-lg font-bold tracking-tight group-hover:text-brain-primary transition-colors duration-300">Second Brain</span>
                        </motion.div>

                        {/* Right nav */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            {user ? (
                                <>
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200 group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brain-primary/20 to-brain-secondary/20 border border-white/10 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-brain-primary/30 transition-all overflow-hidden">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-brain-primary">{user.username?.[0] || user.email[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <div className="text-sm font-medium text-white group-hover:text-brain-primary transition-colors">{user.username || 'User'}</div>
                                            <div className="text-[10px] text-slate-500 capitalize">{user.role || 'Explorer'}</div>
                                        </div>
                                    </button>

                                    <div className="h-6 w-px bg-white/[0.06]" />

                                    <button
                                        onClick={logout}
                                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                                        title="Logout"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300"
                                    >
                                        Login
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => navigate('/signup')}
                                        className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300"
                                    >
                                        Get Started
                                    </motion.button>
                                </>
                            )}
                        </motion.div>
                    </div>
                </motion.nav>

                {/* ═══════════ MAIN CONTENT — Sidebar + Chat ═══════════ */}
                <main className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row">
                    {/* ── Icon Rail (always visible on desktop) ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="hidden lg:flex flex-col items-center w-[56px] shrink-0 border-r border-white/[0.04] py-4 gap-2"
                        style={{ backgroundColor: 'rgba(6,6,11,0.6)' }}
                    >
                        {/* Toggle sidebar */}
                        <button
                            onClick={() => setSidebarExpanded(!sidebarExpanded)}
                            className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-brain-primary hover:border-brain-primary/20 hover:bg-brain-primary/[0.04] transition-all duration-300 mb-2"
                            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                        >
                            {sidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {/* Upload icon */}
                        <button
                            onClick={() => { setSidebarExpanded(true); setActiveSidebarTab('upload'); }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                sidebarExpanded && activeSidebarTab === 'upload'
                                    ? 'bg-brain-primary/10 border border-brain-primary/25 text-brain-primary shadow-[0_0_15px_rgba(0,224,255,0.08)]'
                                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-brain-primary hover:border-brain-primary/20'
                            }`}
                            title="Upload & Ingest"
                        >
                            <Upload size={16} />
                        </button>

                        <button
                            onClick={() => { setSidebarExpanded(true); setActiveSidebarTab('library'); }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                sidebarExpanded && activeSidebarTab === 'library'
                                    ? 'bg-brain-primary/10 border border-brain-primary/25 text-brain-primary shadow-[0_0_15px_rgba(0,224,255,0.08)]'
                                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-brain-primary hover:border-brain-primary/20'
                            }`}
                            title="Document Library"
                        >
                            <FolderOpen size={16} />
                        </button>

                        {/* Highlights icon */}
                        <button
                            onClick={() => setHighlightsOpen(true)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/[0.03] border border-white/[0.06] text-slate-500 hover:text-amber-400 hover:border-amber-400/20 hover:bg-amber-400/[0.04]"
                            title="Saved Highlights"
                        >
                            <Bookmark size={16} />
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* System Status — compact dots */}
                        <div className="flex flex-col items-center gap-3 pb-2">
                            {systemStatusItems.map((item, idx) => (
                                <div key={idx} className="relative group/status">
                                    <span className="flex h-2.5 w-2.5 relative cursor-help">
                                        <span
                                            className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"
                                            style={{ animationDelay: `${idx * 400}ms`, animationDuration: '2s' }}
                                        />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/status:opacity-100 transition-opacity duration-200 z-50">
                                        <div className="px-3 py-1.5 rounded-lg bg-[#0a0a14] border border-white/[0.08] shadow-lg whitespace-nowrap">
                                            <p className="text-[10px] font-semibold text-white">{item.text}</p>
                                            <p className="text-[9px] text-green-400">{item.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Expanded Sidebar Panel ── */}
                    <AnimatePresence>
                        {sidebarExpanded && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 320, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="hidden lg:flex flex-col border-r border-white/[0.04] overflow-hidden shrink-0"
                                style={{ backgroundColor: 'rgba(6,6,11,0.4)' }}
                            >
                                <div className="w-[320px] h-full flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">
                                    {activeSidebarTab === 'upload' ? (
                                        <>
                                            {/* Upload Card */}
                                            <div className="group relative rounded-2xl overflow-hidden flex-1 min-h-[320px] flex flex-col">
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brain-primary/20 via-brain-secondary/10 to-brain-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a14] z-[1]" />

                                                <div className="relative z-10 p-5 flex flex-col flex-1">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brain-primary/10 to-brain-primary/[0.02] border border-brain-primary/15 flex items-center justify-center">
                                                                <Brain className="w-4 h-4 text-brain-primary" />
                                                            </div>
                                                            <div>
                                                                <h2 className="text-sm font-bold text-white">Data Ingestion</h2>
                                                                <p className="text-[10px] text-slate-500">Upload & Index</p>
                                                            </div>
                                                        </div>
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                            <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">RAG</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-h-0 relative flex flex-col">
                                                        <FileUpload onUploadSuccess={handleUploadSuccess} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* System Status Card */}
                                            <div className="group relative rounded-2xl overflow-hidden shrink-0">
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brain-secondary/15 via-brain-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a14] z-[1]" />

                                                <div className="relative z-10 p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">System Status</h3>
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-400/[0.06] border border-green-400/15">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                            <span className="text-[9px] font-semibold text-green-400">All Go</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {systemStatusItems.map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300">
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] flex items-center justify-center">
                                                                        <item.icon size={12} className="text-slate-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[11px] font-medium text-slate-300">{item.text}</p>
                                                                        <p className="text-[9px] text-slate-600">{item.status}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="w-2 h-2 rounded-full bg-green-400" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 min-h-[320px] relative rounded-2xl bg-[#0a0a14] border border-white/[0.08] p-4 flex flex-col">
                                            <DocumentLibrary
                                                currentDocumentId={currentDocumentId}
                                                onSelectDocument={handleUploadSuccess}
                                                onMultiSelect={setSelectedDocumentIds}
                                                selectedDocumentIds={selectedDocumentIds}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Mobile: Upload panel (shown above chat on small screens) ── */}
                    <div className="lg:hidden flex flex-col w-full">
                        <div className="p-4 flex gap-2">
                            <button
                                onClick={() => setActiveSidebarTab('upload')}
                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeSidebarTab === 'upload' ? 'bg-brain-primary/10 text-brain-primary border border-brain-primary/20' : 'bg-white/[0.03] text-slate-400 border border-white/[0.06]'}`}
                            >
                                Upload
                            </button>
                            <button
                                onClick={() => setActiveSidebarTab('library')}
                                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeSidebarTab === 'library' ? 'bg-brain-primary/10 text-brain-primary border border-brain-primary/20' : 'bg-white/[0.03] text-slate-400 border border-white/[0.06]'}`}
                            >
                                Library
                            </button>
                        </div>
                        <div className="p-4 pt-0">
                            <div className="group relative rounded-2xl overflow-hidden min-h-[320px] flex flex-col">
                                <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a14] z-[1]" />
                                <div className="relative z-10 p-4 flex-1 flex flex-col">
                                    {activeSidebarTab === 'upload' ? (
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
                        </div>
                        <div className="flex-1 min-h-[500px] p-4 pt-0">
                            <div className="h-full group relative rounded-2xl overflow-hidden">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brain-primary/15 via-brain-secondary/8 to-brain-primary/5 opacity-40" />
                                <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a14] z-[1]" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brain-primary/40 to-transparent opacity-60" />
                                    <ChatInterface documentId={currentDocumentId} documentName={currentDocumentName} documentIds={selectedDocumentIds} onClearDocument={handleClearDocument} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Chat Canvas (desktop) ── */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="hidden lg:flex flex-1 min-w-0 p-4 lg:p-5"
                    >
                        <div className="h-full w-full group relative rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brain-primary/15 via-brain-secondary/8 to-brain-primary/5 opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a14] z-[1]" />
                            <div className="absolute -inset-1 bg-gradient-to-br from-brain-primary/8 to-brain-secondary/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10" />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brain-primary/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                <ChatInterface documentId={currentDocumentId} documentName={currentDocumentName} documentIds={selectedDocumentIds} onClearDocument={handleClearDocument} />
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Highlights Drawer */}
                <HighlightsDrawer isOpen={highlightsOpen} onClose={() => setHighlightsOpen(false)} />
            </div>
        </motion.div>
    );
};

export default Dashboard;
