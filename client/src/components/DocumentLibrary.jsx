import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Clock, Database, Loader, ArrowRight, Trash2, CheckSquare, Square, Layers } from 'lucide-react';
import api from '../api/axios';

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
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        setDeletingId(docId);
        // Optimistic removal
        const previousDocs = [...documents];
        setDocuments(prev => prev.filter(d => d._id !== docId));
        setConfirmDeleteId(null);

        try {
            await api.delete(`/api/upload/${docId}`);
        } catch (error) {
            console.error('Error deleting document:', error);
            // Rollback on error
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
        
        if (diffInHours < 24) {
            return 'Today';
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const filteredDocuments = documents.filter(doc => 
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brain-primary/10 to-brain-primary/[0.02] border border-brain-primary/15 flex items-center justify-center">
                        <Database className="w-4 h-4 text-brain-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white">Knowledge Base</h2>
                        <p className="text-[10px] text-slate-500">{documents.length} Indexed Files</p>
                    </div>
                </div>
                {/* Multi-select toggle */}
                {documents.length > 1 && (
                    <button
                        onClick={() => {
                            setMultiSelectMode(!multiSelectMode);
                            if (multiSelectMode && onMultiSelect) onMultiSelect([]);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 ${
                            multiSelectMode
                                ? 'bg-brain-primary/10 text-brain-primary border border-brain-primary/25'
                                : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:text-brain-primary hover:border-brain-primary/20'
                        }`}
                        title="Toggle multi-select"
                    >
                        <Layers size={11} />
                        Multi
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative mb-4 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brain-primary/30 transition-all"
                />
            </div>

            {/* Multi-select action bar */}
            <AnimatePresence>
                {multiSelectMode && selectedDocumentIds.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mb-3 shrink-0"
                    >
                        <button
                            onClick={() => {
                                if (onSelectDocument) onSelectDocument(null, null);
                                setMultiSelectMode(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brain-primary/10 border border-brain-primary/25 text-brain-primary text-xs font-semibold hover:bg-brain-primary/15 transition-all duration-300"
                        >
                            <Layers size={13} />
                            Query {selectedDocumentIds.length} Selected Documents
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Query All Button */}
            {!multiSelectMode && (
                <button
                    onClick={() => onSelectDocument(null, null)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 mb-4 shrink-0
                        ${!currentDocumentId 
                            ? 'bg-brain-primary/[0.08] border-brain-primary/30 shadow-[0_0_15px_rgba(0,224,255,0.08)]' 
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.15]'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300
                            ${!currentDocumentId
                                ? 'bg-brain-primary/20 border-brain-primary/30'
                                : 'bg-gradient-to-br from-white/[0.06] to-transparent border-white/[0.08]'
                            }`}
                        >
                            <Database size={14} className={!currentDocumentId ? 'text-brain-primary' : 'text-slate-400'} />
                        </div>
                        <div className="text-left">
                            <p className={`text-xs font-semibold ${!currentDocumentId ? 'text-brain-primary' : 'text-white'}`}>Query All Documents</p>
                            <p className="text-[10px] text-slate-500">Global search context</p>
                        </div>
                    </div>
                    {!currentDocumentId && <div className="w-1.5 h-1.5 rounded-full bg-brain-primary animate-pulse mr-2" />}
                </button>
            )}

            {/* Document List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <Loader size={24} className="text-brain-primary animate-spin mb-3" />
                        <p className="text-xs text-slate-500">Loading library...</p>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white/[0.01] rounded-xl border border-white/[0.04] border-dashed">
                        <FileText size={24} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-xs font-medium text-slate-300 mb-1">No documents found</p>
                        <p className="text-[10px] text-slate-500">Upload a PDF to get started.</p>
                    </div>
                ) : (
                    filteredDocuments.map((doc, idx) => {
                        const isActive = !multiSelectMode && currentDocumentId === doc.vectorId;
                        const isSelected = multiSelectMode && selectedDocumentIds.includes(doc.vectorId);
                        const isBeingDeleted = deletingId === doc._id;
                        const isConfirmingDelete = confirmDeleteId === doc._id;

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: isBeingDeleted ? 0.4 : 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={doc._id}
                                className={`group flex flex-col p-3 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden
                                    ${isActive 
                                        ? 'bg-brain-primary/[0.05] border-brain-primary/20 shadow-[0_0_15px_rgba(0,224,255,0.05)]' 
                                        : isSelected
                                            ? 'bg-brain-primary/[0.04] border-brain-primary/15'
                                            : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.1]'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brain-primary shadow-[0_0_8px_rgba(0,224,255,0.5)]" />
                                )}
                                
                                <div className="flex items-start gap-3"
                                    onClick={() => {
                                        if (multiSelectMode) {
                                            handleMultiSelectToggle(doc.vectorId);
                                        } else {
                                            onSelectDocument(doc.vectorId, doc.filename);
                                        }
                                    }}
                                >
                                    {/* Multi-select checkbox */}
                                    {multiSelectMode ? (
                                        <div className="mt-0.5 shrink-0">
                                            {isSelected ? (
                                                <CheckSquare size={18} className="text-brain-primary" />
                                            ) : (
                                                <Square size={18} className="text-slate-500" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-0.5 w-6 h-6 rounded-md bg-gradient-to-br from-white/[0.06] to-transparent border border-white/[0.06] flex items-center justify-center shrink-0">
                                            <FileText size={12} className={isActive ? 'text-brain-primary' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-medium truncate mb-1 transition-colors ${isActive || isSelected ? 'text-brain-primary' : 'text-slate-200 group-hover:text-white'}`}>
                                            {doc.filename}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                            <span>{formatSize(doc.size)}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {formatDate(doc.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right side: delete or arrow */}
                                    {!multiSelectMode && (
                                        <div className="shrink-0 self-center flex items-center gap-1">
                                            {/* Delete button */}
                                            {isConfirmingDelete ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}
                                                        className="px-2 py-1 rounded-md text-[9px] font-bold text-red-400 bg-red-500/[0.08] border border-red-500/20 hover:bg-red-500/[0.15] transition-all"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                                                        className="px-2 py-1 rounded-md text-[9px] text-slate-500 hover:text-white transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc._id); }}
                                                        className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/[0.06] opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                        title="Delete document"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    <div className={`opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : ''}`}>
                                                        <ArrowRight size={14} className={isActive ? 'text-brain-primary' : 'text-slate-400'} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {doc.lastQueried && (
                                    <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[9px] text-slate-600">
                                        <span>Last queried: {formatDate(doc.lastQueried)}</span>
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
