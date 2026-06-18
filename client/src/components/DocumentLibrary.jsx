import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Clock, Database, ArrowRight, Trash2, CheckSquare, Square, Layers } from 'lucide-react';
import api from '../api/axios';
import { fadeUp, SPRING_SNAPPY } from '../lib/motion';

const DocumentLibrary = ({ currentDocumentId, onSelectDocument, onMultiSelect, selectedDocumentIds = [] }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/upload');
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    setDeletingId(docId);
    const previousDocs = [...documents];
    setDocuments(prev => prev.filter(d => d._id !== docId));
    setConfirmDeleteId(null);

    try {
      await api.delete(`/api/upload/${docId}`);
    } catch (error) {
      setDocuments(previousDocs);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMultiSelectToggle = (vectorId) => {
    if (onMultiSelect) {
      const updated = selectedDocumentIds.includes(vectorId)
        ? selectedDocumentIds.filter(id => id !== vectorId)
        : [...selectedDocumentIds, vectorId];
      onMultiSelect(updated);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;
    if (diffInHours < 24) return 'Today';
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-meta">DOCUMENTS</p>
          <span className="text-meta text-[10px] px-1.5 py-0.5 rounded-sm border border-border-subtle">{documents.length}</span>
        </div>
        {documents.length > 1 && (
          <button
            onClick={() => {
              setMultiSelectMode(!multiSelectMode);
              if (multiSelectMode && onMultiSelect) onMultiSelect([]);
            }}
            className="text-meta text-[10px] px-2 py-1 rounded-sm border"
            style={{
              borderColor: multiSelectMode ? 'var(--accent)' : 'var(--border-default)',
              color: multiSelectMode ? 'var(--accent)' : 'var(--text-tertiary)',
              transition: 'all 120ms ease',
            }}
          >
            <span className="flex items-center gap-1.5">
              <Layers size={10} />
              MULTI
            </span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-3 shrink-0">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded border border-border-subtle py-2 pl-8 pr-3 text-[13px] focus:border-border-emphasis outline-none"
          style={{
            background: 'var(--surface-sunken)',
            color: 'var(--text-primary)',
            transition: 'border-color 120ms ease',
          }}
        />
      </div>

      {/* Multi-select action bar */}
      <AnimatePresence>
        {multiSelectMode && selectedDocumentIds.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mb-3 shrink-0"
          >
            <button
              onClick={() => {
                if (onSelectDocument) onSelectDocument(null, null);
                setMultiSelectMode(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded border text-[12px] font-medium"
              style={{
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
                background: 'rgba(200, 241, 53, 0.04)',
                transition: 'all 120ms ease',
              }}
            >
              <Layers size={12} />
              Query {selectedDocumentIds.length} selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Query All Button */}
      {!multiSelectMode && (
        <button
          onClick={() => onSelectDocument(null, null)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded border mb-3 shrink-0"
          style={{
            background: !currentDocumentId ? 'var(--surface-overlay)' : 'transparent',
            borderColor: !currentDocumentId ? 'var(--border-emphasis)' : 'var(--border-default)',
            transition: 'all 120ms ease',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Database size={14} style={{ color: !currentDocumentId ? 'var(--accent)' : 'var(--text-tertiary)' }} />
            <div className="text-left">
              <p className="text-[13px]" style={{ color: !currentDocumentId ? 'var(--text-primary)' : 'var(--text-secondary)' }}>All documents</p>
              <p className="text-meta text-[10px] normal-case">Global context</p>
            </div>
          </div>
          {!currentDocumentId && <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
        </button>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pb-4">
        {loading ? (
          <div className="space-y-2 mt-4">
            {[70, 55, 65].map((w, i) => (
              <div key={i} className="h-[48px] rounded shimmer" />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-4">
            <FileText size={20} style={{ color: 'var(--text-tertiary)' }} className="mb-3" />
            <p className="text-[14px] font-medium text-text-secondary mb-1">No documents found</p>
            <p className="text-[13px] text-text-tertiary">Upload a PDF to get started.</p>
          </div>
        ) : (
          filteredDocuments.map((doc, idx) => {
            const isActive = !multiSelectMode && currentDocumentId === doc.vectorId;
            const isSelected = multiSelectMode && selectedDocumentIds.includes(doc.vectorId);
            const isBeingDeleted = deletingId === doc._id;
            const isConfirmingDelete = confirmDeleteId === doc._id;

            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: isBeingDeleted ? 0.4 : 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={doc._id}
                className="group flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer relative"
                style={{
                  background: isActive || isSelected ? 'var(--surface-overlay)' : 'transparent',
                  transition: 'background 120ms ease',
                }}
                onClick={() => {
                  if (multiSelectMode) {
                    handleMultiSelectToggle(doc.vectorId);
                  } else {
                    onSelectDocument(doc.vectorId, doc.filename);
                  }
                }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full" style={{ background: 'var(--accent)' }} />
                )}

                {/* Checkbox or icon */}
                {multiSelectMode ? (
                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Square size={16} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                ) : (
                  <FileText size={14} style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)' }} className="shrink-0" />
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate" style={{ color: isActive || isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-3 text-meta text-[10px] normal-case text-text-tertiary">
                    <span>{formatSize(doc.size)}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={9} />
                      {formatDate(doc.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {!multiSelectMode && (
                  <div className="shrink-0 flex items-center gap-1">
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}
                          className="px-2 py-1 rounded-sm text-meta text-[10px] normal-case"
                          style={{ color: 'var(--status-error)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', transition: 'all 120ms ease' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                          className="px-2 py-1 rounded-sm text-meta text-[10px] normal-case text-text-tertiary hover:text-text-primary"
                          style={{ transition: 'color 120ms ease' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc._id); }}
                        className="p-1 rounded-sm opacity-0 group-hover:opacity-100"
                        style={{ color: 'var(--text-tertiary)', transition: 'all 120ms ease' }}
                        title="Delete document"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
