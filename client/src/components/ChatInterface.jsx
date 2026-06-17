import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader, FileText, Brain, Trash2, MessageSquare, Sparkles, X, AlertTriangle, RefreshCw, ChevronDown, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const messageVariants = {
    hidden: (isUser) => ({
        opacity: 0,
        x: isUser ? 20 : -20,
        y: 6,
    }),
    visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

const SourceCard = ({ src }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="group/src flex flex-col rounded-lg bg-white/[0.02] border border-white/[0.05] overflow-hidden transition-all duration-300">
            <div 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2.5 p-2 hover:bg-white/[0.02] cursor-pointer"
            >
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-white/[0.06] to-transparent border border-white/[0.06] flex items-center justify-center shrink-0 group-hover/src:border-brain-primary/20 transition-all duration-300">
                    <FileText size={11} className="text-slate-500 group-hover/src:text-brain-primary transition-colors duration-300" />
                </div>
                <span className="text-[11px] text-slate-400 truncate flex-1 group-hover/src:text-slate-300 transition-colors">{src.filename}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-brain-primary/[0.08] border border-brain-primary/15 text-brain-primary shrink-0">
                    {Math.round(src.score * 100)}% Match
                </span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
            </div>
            
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-3 pt-0 text-[11px] text-slate-400 border-t border-white/[0.05] bg-black/20">
                            {src.snippet ? (
                                <p className="leading-relaxed mt-2 italic border-l-2 border-brain-primary/30 pl-2">
                                    "{src.snippet}"
                                </p>
                            ) : (
                                <p className="mt-2 text-slate-500 italic">Preview not available.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ChatInterface = ({ documentId, documentName, documentIds, onClearDocument }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Second Brain. Upload a PDF and ask me anything about it.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [savedMessageIndices, setSavedMessageIndices] = useState(new Set());

    const userId = user?._id;

    const handleSaveHighlight = async (msg, index) => {
        try {
            await api.post('/api/highlights', {
                documentName: documentName || 'General',
                aiExcerpt: msg.content,
                sourceChunk: msg.sources?.[0]?.snippet || '',
            });
            setSavedMessageIndices(prev => new Set([...prev, index]));
        } catch (error) {
            console.error('Error saving highlight:', error);
        }
    };

    useEffect(() => {
        if (documentId && userId) {
            const savedHistory = localStorage.getItem(`chatHistory_${userId}_${documentId}`);
            if (savedHistory) {
                setMessages(JSON.parse(savedHistory));
            } else {
                setMessages([
                    { role: 'assistant', content: 'Hello! I am your Second Brain. Ask me anything about this document.' }
                ]);
            }
        }
    }, [documentId, userId]);

    useEffect(() => {
        if (documentId && userId && messages.length > 0) {
            localStorage.setItem(`chatHistory_${userId}_${documentId}`, JSON.stringify(messages));
        }
    }, [messages, documentId, userId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleClearChat = () => {
        if (documentId && userId) {
            localStorage.removeItem(`chatHistory_${userId}_${documentId}`);
            setMessages([
                { role: 'assistant', content: 'Chat history cleared. Ask me anything about this document.' }
            ]);
        }
    };

    const handleSend = async (e, retryContent = null) => {
        if (e) e.preventDefault();
        const messageContent = retryContent || input.trim();
        if (!messageContent) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const userMessage = { role: 'user', content: messageContent };
        if (!retryContent) {
            setMessages(prev => [...prev, userMessage]);
        }
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/api/chat', {
                question: messageContent,
                history: [],
                documentId,
                documentIds: documentIds || undefined
            });

            const aiMessage = {
                role: 'assistant',
                content: data.answer,
                sources: data.sources
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const status = error.response?.status;
            let errorType = 'generic';
            let errorMessage = 'Something went wrong. Click Retry to try again.';

            if (status === 504 || error.message?.includes('timeout')) {
                errorType = 'timeout';
                errorMessage = 'AI took too long to respond. Click Retry to try again.';
            } else if (status === 429) {
                errorType = 'rate_limit';
                errorMessage = 'Rate limit reached. Please wait a moment, then retry.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: null,
                error: true,
                errorType,
                errorMessage,
                retryContent: messageContent
            }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleRetry = (retryContent) => {
        // Remove the error message, then re-send
        setMessages(prev => prev.filter(m => !m.error || m.retryContent !== retryContent));
        handleSend(null, retryContent);
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* ═══════════ CHAT HEADER ═══════════ */}
            <div className="px-6 py-3.5 border-b border-white/[0.06] flex items-center justify-between shrink-0" style={{ backgroundColor: 'rgba(10,10,20,0.6)' }}>
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 250 }}
                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-brain-primary/10 to-brain-primary/[0.02] border border-brain-primary/15 flex items-center justify-center hover:border-brain-primary/40 hover:shadow-[0_0_20px_rgba(0,224,255,0.1)] transition-all duration-500"
                    >
                        <Brain className="w-4 h-4 text-brain-primary" />
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">Second Brain AI</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[8px] font-semibold text-brain-primary uppercase tracking-wider">RAG</span>
                        </div>
                        {documentId ? (
                            <p className="text-[10px] text-green-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Active — Document Loaded
                            </p>
                        ) : (
                            <p className="text-[10px] text-slate-600">Waiting for document...</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {documentId && (
                        <button
                            onClick={handleClearChat}
                            className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-red-400 transition-all duration-200 uppercase tracking-wider overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/[0.06] rounded-lg transition-colors duration-200" />
                            <Trash2 size={11} className="relative z-10" />
                            <span className="relative z-10 hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ═══════════ MESSAGES AREA ═══════════ */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
                {/* Seeded Prompts — shown when chat is empty */}
                {messages.length <= 1 && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-4"
                    >
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold mb-3">
                            {documentId ? 'Try asking:' : 'Get started:'}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {(documentId ? [
                                { emoji: '📊', text: 'Summarize the key points of this document' },
                                { emoji: '🔍', text: 'What are the main topics covered?' },
                                { emoji: '💡', text: 'What are the most important takeaways?' },
                            ] : [
                                { emoji: '📥', text: 'Upload a document to start chatting' },
                                { emoji: '🧠', text: 'Ask about any uploaded document' },
                                { emoji: '📚', text: 'Query across all your documents' },
                            ]).map((prompt, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ y: -2, scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (documentId) {
                                            setInput(prompt.text);
                                            setTimeout(() => handleSend(null, prompt.text), 50);
                                        }
                                    }}
                                    disabled={!documentId}
                                    className={`text-left p-3.5 rounded-xl border transition-all duration-300 ${
                                        documentId
                                            ? 'bg-white/[0.02] border-white/[0.06] hover:border-brain-primary/20 hover:bg-brain-primary/[0.03] cursor-pointer'
                                            : 'bg-white/[0.01] border-white/[0.04] cursor-default opacity-60'
                                    }`}
                                >
                                    <span className="text-lg mb-1.5 block">{prompt.emoji}</span>
                                    <span className="text-[11px] text-slate-400 leading-relaxed">{prompt.text}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        custom={msg.role === 'user'}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* ── Error Card ── */}
                        {msg.error ? (
                            <div className="flex items-start gap-3 max-w-[85%]">
                                <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-red-500/20 bg-red-500/10 text-red-400">
                                    <AlertTriangle size={14} />
                                </div>
                                <div className="relative rounded-2xl rounded-tl-sm overflow-hidden">
                                    <div className="absolute inset-0 rounded-2xl rounded-tl-sm bg-gradient-to-br from-red-500/[0.08] to-red-500/[0.02]" />
                                    <div className="absolute inset-[1px] rounded-2xl rounded-tl-sm bg-[#0a0a14] z-[1]" />
                                    <div className="relative z-10 p-4">
                                        <p className="text-[13px] text-red-300/90 mb-3">{msg.errorMessage}</p>
                                        <button
                                            onClick={() => handleRetry(msg.retryContent)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-300 text-[11px] font-semibold hover:bg-red-500/[0.15] hover:border-red-500/30 transition-all duration-200"
                                        >
                                            <RefreshCw size={11} />
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
                            {/* Avatar — matching landing page icon style */}
                            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300
                                ${msg.role === 'user'
                                    ? 'bg-brain-primary text-brain-dark border-brain-primary/30 shadow-[0_0_12px_rgba(0,224,255,0.15)]'
                                    : 'bg-gradient-to-br from-white/[0.06] to-transparent border-white/[0.08] text-brain-primary'
                                }`}
                            >
                                {msg.role === 'user'
                                    ? <User size={14} />
                                    : <Bot size={14} />
                                }
                            </div>

                            {/* Message Bubble */}
                            <div className={`group/msg relative rounded-2xl overflow-hidden
                                ${msg.role === 'user'
                                    ? 'rounded-tr-sm'
                                    : 'rounded-tl-sm'
                                }`}
                            >
                                {/* Subtle gradient border on hover — matching landing feature cards */}
                                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover/msg:opacity-100 transition-opacity duration-500
                                    ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-brain-primary/20 to-brain-primary/5'
                                        : 'bg-gradient-to-br from-white/[0.08] to-white/[0.02]'
                                    }`}
                                />
                                <div className={`absolute inset-[1px] z-[1]
                                    ${msg.role === 'user'
                                        ? 'rounded-2xl rounded-tr-sm bg-[#0a0e18]'
                                        : 'rounded-2xl rounded-tl-sm bg-[#0a0a14]'
                                    }`}
                                />

                                <div className="relative z-10 p-4">
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0 prose-code:bg-black/50 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-brain-primary prose-code:text-xs prose-a:text-brain-primary hover:prose-a:text-brain-primary-dark text-[13px]" style={{ maxWidth: msg.role === 'user' ? 'none' : '72ch' }}>
                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Bookmark / Highlight save button — AI messages only */}
                                    {msg.role === 'assistant' && msg.content && (
                                        <button
                                            onClick={() => handleSaveHighlight(msg, index)}
                                            className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-300 z-20 ${
                                                savedMessageIndices.has(index)
                                                    ? 'text-amber-400 bg-amber-400/[0.08] border border-amber-400/20'
                                                    : 'text-slate-600 hover:text-amber-400 hover:bg-amber-400/[0.06] opacity-0 group-hover/msg:opacity-100'
                                            }`}
                                            title={savedMessageIndices.has(index) ? 'Saved!' : 'Save to highlights'}
                                        >
                                            <Bookmark size={13} className={savedMessageIndices.has(index) ? 'fill-amber-400' : ''} />
                                        </button>
                                    )}

                                    {/* Sources — card-style like landing page */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-white/[0.05]">
                                            <p className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                                                <Sparkles size={10} className="text-brain-primary" />
                                                Verified Sources
                                            </p>
                                            <div className="space-y-1.5">
                                                {msg.sources.map((src, idx) => (
                                                    <SourceCard key={idx} src={src} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )}
                    </motion.div>
                ))}

                {/* Skeleton Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="flex justify-start"
                        >
                            <div className="flex items-start gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/[0.06] to-transparent border border-white/[0.08] flex items-center justify-center shrink-0">
                                    <Bot size={14} className="text-brain-primary animate-pulse" />
                                </div>
                                <div className="relative rounded-2xl rounded-tl-sm overflow-hidden min-w-[280px]" style={{ maxWidth: '72ch' }}>
                                    <div className="absolute inset-0 rounded-2xl rounded-tl-sm bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
                                    <div className="absolute inset-[1px] rounded-2xl rounded-tl-sm bg-[#0a0a14] z-[1]" />
                                    <div className="relative z-10 p-4 space-y-3">
                                        {/* Shimmer lines */}
                                        {[100, 90, 75, 50].map((width, i) => (
                                            <div
                                                key={i}
                                                className="h-3 rounded-md"
                                                style={{
                                                    width: `${width}%`,
                                                    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
                                                    backgroundSize: '200% 100%',
                                                    animation: `shimmer 1.5s linear infinite`,
                                                    animationDelay: `${i * 100}ms`,
                                                }}
                                            />
                                        ))}
                                        <div className="flex items-center gap-2 pt-1">
                                            <span className="text-[10px] text-slate-600 font-semibold tracking-wider uppercase">Thinking</span>
                                            <div className="flex space-x-1">
                                                <span className="w-1 h-1 bg-brain-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1 h-1 bg-brain-primary/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1 h-1 bg-brain-primary/20 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* ═══════════ INPUT AREA ═══════════ */}
            <div className="px-5 py-4 border-t border-white/[0.06] shrink-0" style={{ backgroundColor: 'rgba(10,10,20,0.4)' }}>
                {/* Active Document Chip */}
                {documentId && (
                    <div className="mb-3 flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brain-primary/[0.06] border border-brain-primary/20 hover:border-brain-primary/35 transition-all duration-300 group/chip max-w-[280px]">
                            <FileText size={12} className="text-brain-primary shrink-0" />
                            <span className="text-[11px] font-medium text-brain-primary truncate">
                                {documentName || 'Document loaded'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                            {onClearDocument && (
                                <button
                                    onClick={onClearDocument}
                                    className="p-0.5 rounded-md text-brain-primary/50 hover:text-white hover:bg-white/[0.08] transition-all duration-200 shrink-0 ml-0.5"
                                    title="Clear document context"
                                >
                                    <X size={10} />
                                </button>
                            )}
                        </div>
                        <span className="text-[9px] text-slate-600 uppercase tracking-wider font-medium">Active context</span>
                    </div>
                )}
                {!documentId && (
                    <div className="mb-3 flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] border-dashed">
                            <FileText size={12} className="text-slate-600" />
                            <span className="text-[11px] text-slate-600">No document selected — querying all documents</span>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSend}>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                                <MessageSquare size={15} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={documentId ? `Ask about ${documentName || 'this document'}...` : 'Ask anything about your documents...'}
                                className="w-full bg-white/[0.03] text-white text-sm placeholder-slate-600 border border-white/[0.08] rounded-xl py-3.5 pl-11 pr-4 focus:border-brain-primary/30 focus:ring-1 focus:ring-brain-primary/15 focus:bg-white/[0.05] transition-all outline-none"
                                disabled={loading}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={loading || !input.trim()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-brain-primary text-brain-dark rounded-xl hover:shadow-[0_0_20px_rgba(0,224,255,0.2)] disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none transition-all duration-300 shrink-0"
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        </motion.button>
                    </div>
                </form>
                {!user && (
                    <p className="text-center text-[10px] text-slate-600 mt-3">
                        <span className="cursor-pointer hover:text-brain-primary transition-colors underline decoration-brain-primary/30 underline-offset-2" onClick={() => navigate('/login')}>Initialize session</span> to access memory banks.
                    </p>
                )}
            </div>
        </div>
    );
};


export default ChatInterface;
