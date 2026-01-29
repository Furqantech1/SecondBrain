import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import FileUpload from '../components/FileUpload';
import ChatInterface from '../components/ChatInterface';
import DeepSpaceBackground from '../components/DeepSpaceBackground';

import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user, logout, loginWithToken } = useAuth();
    const navigate = useNavigate();

    // State to track the currently active document context
    const [currentDocumentId, setCurrentDocumentId] = useState(() => localStorage.getItem('lastActiveDocumentId') || null);

    useEffect(() => {
        if (currentDocumentId) {
            localStorage.setItem('lastActiveDocumentId', currentDocumentId);
        }
    }, [currentDocumentId]);

    // Check for social login token
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            loginWithToken(token);
            // Clear param
            navigate('/dashboard', { replace: true });
        }
    }, [token, loginWithToken, navigate]);

    const handleUploadSuccess = (documentId) => {
        console.log("Upload success, setting context to:", documentId);
        setCurrentDocumentId(documentId);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen text-white font-sans selection:bg-brain-primary selection:text-brain-dark relative overflow-x-hidden"
        >
            <DeepSpaceBackground />

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen lg:h-screen">
                {/* Navbar */}
                <nav className="border-b border-white/5 bg-brain-dark/50 backdrop-blur-xl sticky top-0 z-50 shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center space-x-3">
                                {/* Logo Icon */}
                                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl shadow-neon" />
                                <h1 className="text-2xl font-display font-bold tracking-tight text-white">Second Brain</h1>
                            </div>
                            <div className="flex items-center space-x-6">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="flex items-center space-x-2 text-left group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-brain-primary/50 transition-all overflow-hidden">
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user.username?.[0] || user.email[0].toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="hidden sm:block">
                                                <div className="text-sm font-medium text-white group-hover:text-brain-primary transition-colors">{user.username || 'User'}</div>
                                                <div className="text-[10px] text-slate-400 capitalize">{user.role || 'Explorer'}</div>
                                            </div>
                                        </button>
                                        <div className="h-6 w-px bg-white/10 mx-2"></div>
                                        <button
                                            onClick={logout}
                                            className="text-sm font-medium text-brain-text-secondary hover:text-white transition-colors px-2 py-2 rounded-lg hover:bg-white/5"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="text-sm font-medium text-brain-text-secondary hover:text-white transition-colors"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => navigate('/signup')}
                                            className="btn-primary text-sm px-5 py-2 rounded-lg"
                                        >
                                            Get Started
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 lg:overflow-hidden p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto w-full h-full">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full h-auto">
                            {/* Left Side: Upload & Info - Spans 4 columns */}
                            <div className="lg:col-span-4 flex flex-col gap-6 lg:h-full h-auto lg:overflow-y-auto">
                                <div className="glass-panel p-6 flex flex-col lg:h-auto min-h-[400px]">
                                    <h2 className="text-lg font-display font-bold mb-6 text-white flex items-center shrink-0">
                                        <span className="w-1 h-6 bg-brain-primary rounded-full mr-3 shadow-neon"></span>
                                        Data Ingestion
                                    </h2>

                                    <div className="flex-1 min-h-0 relative flex flex-col">
                                        <FileUpload onUploadSuccess={handleUploadSuccess} />
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 shrink-0">
                                        <h3 className="text-xs font-bold text-brain-text-secondary mb-4 uppercase tracking-widest">System Status</h3>
                                        <ul className="space-y-4">
                                            {[
                                                { text: 'Neural Engine Online', status: 'online' },
                                                { text: 'Vector Database Connected', status: 'online' },
                                                { text: 'Upload Gateway Active', status: 'online' }
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-center justify-between text-sm text-brain-text-secondary/80">
                                                    <span>{item.text}</span>
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brain-primary opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brain-primary"></span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Chat Interface - Spans 8 columns */}
                            <div className="lg:col-span-8 lg:h-full h-[600px]">
                                <div className="h-full glass-panel overflow-hidden flex flex-col shadow-2xl relative group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brain-primary to-brain-secondary opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                    <ChatInterface documentId={currentDocumentId} />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </motion.div>
    );
};

export default Dashboard;
