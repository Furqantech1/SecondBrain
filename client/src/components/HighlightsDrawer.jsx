import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Trash2, FileText, Download, Loader, StickyNote, ChevronDown } from 'lucide-react';
import api from '../api/axios';

const HighlightsDrawer = ({ isOpen, onClose }) => {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchHighlights();
        }
    }, [isOpen]);

    const fetchHighlights = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/highlights');
            setHighlights(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching highlights:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await api.delete(`/api/highlights/${id}`);
            setHighlights(prev => prev.filter(h => h._id !== id));
        } catch (error) {
            console.error('Error deleting highlight:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/api/highlights/export', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'second-brain-highlights.md');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting highlights:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now - date) / 36e5;
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    // Group highlights by document name
    const grouped = {};
    highlights.forEach(h => {
        const key = h.documentName || 'General';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(h);
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] z-[70] flex flex-col"
                        style={{ backgroundColor: 'rgba(8,8,16,0.98)' }}
                    >
                        {/* Accent line */}
                        <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-brain-primary/60 via-brain-primary/20 to-transparent" />

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/[0.04] border border-amber-500/20 flex items-center justify-center">
                                    <Bookmark size={18} className="text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white">Saved Highlights</h2>
                                    <p className="text-[10px] text-slate-500">{highlights.length} saved excerpts</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {highlights.length > 0 && (
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-semibold text-slate-400 hover:text-brain-primary hover:border-brain-primary/20 transition-all duration-200 uppercase tracking-wider"
                                    >
                                        <Download size={11} />
                                        Export
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-5">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-16 opacity-50">
                                    <Loader size={24} className="text-amber-400 animate-spin mb-3" />
                                    <p className="text-xs text-slate-500">Loading highlights...</p>
                                </div>
                            ) : highlights.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed flex items-center justify-center mb-4">
                                        <Bookmark size={24} className="text-slate-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-300 mb-1">No highlights yet</p>
                                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-[240px]">
                                        Click the bookmark icon on any AI response to save important excerpts here.
                                    </p>
                                </div>
                            ) : (
                                Object.entries(grouped).map(([docName, items]) => (
                                    <div key={docName}>
                                        {/* Document Group Header */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText size={12} className="text-brain-primary shrink-0" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{docName}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500 font-medium shrink-0">{items.length}</span>
                                        </div>

                                        {/* Highlight Cards */}
                                        <div className="space-y-2.5 ml-1">
                                            {items.map((h) => (
                                                <motion.div
                                                    key={h._id}
                                                    layout
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    className="group relative rounded-xl overflow-hidden"
                                                >
                                                    {/* Card border */}
                                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="absolute inset-[1px] rounded-xl bg-[#0a0a14] z-[1]" />

                                                    <div className="relative z-10 p-3.5">
                                                        {/* AI Excerpt */}
                                                        <p className="text-[12px] text-slate-300 leading-relaxed mb-2.5 line-clamp-4">
                                                            {h.aiExcerpt}
                                                        </p>

                                                        {/* Source Chunk (expandable) */}
                                                        {h.sourceChunk && (
                                                            <button
                                                                onClick={() => setExpandedId(expandedId === h._id ? null : h._id)}
                                                                className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors mb-2"
                                                            >
                                                                <StickyNote size={10} />
                                                                <span>Source context</span>
                                                                <ChevronDown size={10} className={`transition-transform duration-200 ${expandedId === h._id ? 'rotate-180' : ''}`} />
                                                            </button>
                                                        )}

                                                        <AnimatePresence>
                                                            {expandedId === h._id && h.sourceChunk && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <p className="text-[10px] text-slate-500 italic border-l-2 border-amber-500/30 pl-2.5 mb-2.5 leading-relaxed">
                                                                        "{h.sourceChunk.substring(0, 300)}{h.sourceChunk.length > 300 ? '...' : ''}"
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                        {/* Note */}
                                                        {h.note && (
                                                            <div className="flex items-start gap-1.5 mb-2.5 px-2 py-1.5 rounded-lg bg-amber-500/[0.04] border border-amber-500/10">
                                                                <StickyNote size={10} className="text-amber-400 mt-0.5 shrink-0" />
                                                                <p className="text-[10px] text-amber-300/80 leading-relaxed">{h.note}</p>
                                                            </div>
                                                        )}

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between pt-1">
                                                            <span className="text-[9px] text-slate-600">{formatDate(h.createdAt)}</span>
                                                            <button
                                                                onClick={() => handleDelete(h._id)}
                                                                disabled={deletingId === h._id}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] text-slate-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 opacity-0 group-hover:opacity-100"
                                                            >
                                                                {deletingId === h._id ? (
                                                                    <Loader size={9} className="animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={9} />
                                                                )}
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HighlightsDrawer;
