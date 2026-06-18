import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, X, Trash2, FileText, Download, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import { slideFromRight, fadeUp, SPRING_SMOOTH, SPRING_SNAPPY } from '../lib/motion';

const HighlightsDrawer = ({ isOpen, onClose }) => {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) fetchHighlights();
  }, [isOpen]);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/highlights');
      setHighlights(Array.isArray(data) ? data : []);
    } catch (error) {
      // Silently fail
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
      // Silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/highlights/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'second-brain-highlights.md');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Silently fail
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING_SMOOTH}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[380px] z-[70] flex flex-col border-l border-border-subtle"
            style={{ background: 'var(--surface-base)' }}
          >
            {/* Header */}
            <div className="h-14 px-5 flex items-center justify-between border-b border-border-subtle shrink-0">
              <div className="flex items-center gap-3">
                <Bookmark size={16} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <p className="text-[13px] font-medium text-text-primary">Saved Highlights</p>
                  <p className="text-meta text-[10px] normal-case">{highlights.length} saved</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {highlights.length > 0 && (
                  <button onClick={handleExport} className="btn-ghost text-[10px] uppercase tracking-[0.02em] px-2.5 py-1 gap-1">
                    <Download size={11} />
                    Export
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-overlay"
                  style={{ transition: 'all 120ms ease' }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
              {loading ? (
                <div className="space-y-3 mt-4">
                  {[80, 60, 70].map((w, i) => (
                    <div key={i} className="space-y-2 py-3 border-b border-border-subtle">
                      <div className="h-[14px] shimmer rounded-sm" style={{ width: `${w}%` }} />
                      <div className="h-[14px] shimmer rounded-sm" style={{ width: `${w - 20}%` }} />
                    </div>
                  ))}
                </div>
              ) : highlights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <Bookmark size={24} style={{ color: 'var(--text-tertiary)' }} className="mb-4" />
                  <p className="text-[14px] font-medium text-text-secondary mb-1">No highlights yet</p>
                  <p className="text-[13px] text-text-tertiary leading-relaxed max-w-[240px]">
                    Click the bookmark icon on any AI response to save important excerpts here.
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([docName, items]) => (
                  <div key={docName} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={12} style={{ color: 'var(--text-tertiary)' }} className="shrink-0" />
                      <span className="text-meta truncate">{docName}</span>
                      <span className="text-meta text-[10px] px-1.5 py-0.5 rounded-sm border border-border-subtle shrink-0">{items.length}</span>
                    </div>

                    <div className="space-y-1">
                      {items.map((h) => (
                        <div
                          key={h._id}
                          className="group py-3 border-b border-border-subtle"
                        >
                          <p className="text-[13px] text-text-secondary leading-relaxed mb-2 line-clamp-4">
                            {h.aiExcerpt}
                          </p>

                          {h.sourceChunk && (
                            <button
                              onClick={() => setExpandedId(expandedId === h._id ? null : h._id)}
                              className="flex items-center gap-1.5 text-meta text-[10px] normal-case mb-2 text-text-tertiary hover:text-text-secondary"
                              style={{ transition: 'color 120ms ease' }}
                            >
                              Source context
                              <motion.span
                                animate={{ rotate: expandedId === h._id ? 180 : 0 }}
                                transition={SPRING_SNAPPY}
                              >
                                <ChevronDown size={10} />
                              </motion.span>
                            </button>
                          )}

                          <AnimatePresence>
                            {expandedId === h._id && h.sourceChunk && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <p className="text-[12px] text-text-tertiary italic border-l-2 border-border-emphasis pl-3 mb-2 leading-relaxed">
                                  &ldquo;{h.sourceChunk.substring(0, 300)}{h.sourceChunk.length > 300 ? '...' : ''}&rdquo;
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {h.note && (
                            <div className="flex items-start gap-1.5 mb-2 px-2 py-1.5 rounded-sm border border-border-subtle" style={{ background: 'var(--surface-raised)' }}>
                              <p className="text-[12px] text-text-secondary leading-relaxed">{h.note}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-meta text-[10px] normal-case text-text-tertiary">{formatDate(h.createdAt)}</span>
                            <button
                              onClick={() => handleDelete(h._id)}
                              disabled={deletingId === h._id}
                              className="flex items-center gap-1 px-2 py-1 rounded-sm text-meta text-[10px] normal-case text-text-tertiary hover:text-status-error opacity-0 group-hover:opacity-100"
                              style={{ transition: 'all 120ms ease' }}
                            >
                              <Trash2 size={10} />
                              Delete
                            </button>
                          </div>
                        </div>
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
