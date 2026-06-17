import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const checkAuth = useCallback(() => {
        if (!user) {
            navigate('/login');
            return false;
        }
        return true;
    }, [user, navigate]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        if (!user) {
            navigate('/login');
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setStatus('idle');
                setMessage('');
            } else {
                setStatus('error');
                setMessage('Please upload a PDF file.');
            }
        }
    };

    const handleFileChange = (e) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setStatus('idle');
                setMessage('');
            } else {
                setStatus('error');
                setMessage('Please upload a PDF file.');
            }
        }
    };

    const handleZoneClick = (e) => {
        if (!user) {
            e.preventDefault();
            navigate('/login');
        }
    };

    const clearFile = () => {
        setFile(null);
        setStatus('idle');
        setMessage('');
    };

    const uploadFile = async () => {
        if (!file) return;
        if (!checkAuth()) return;

        setStatus('uploading');
        setMessage('Processing PDF and generating embeddings...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStatus('success');
            setMessage(`Successfully processed ${file.name}`);
            setFile(null);

            if (onUploadSuccess && response.data.documentId) {
                onUploadSuccess(response.data.documentId, response.data.filename || file.name);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error uploading file');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full h-full flex flex-col gap-3">
            {/* Dropzone */}
            <div
                className={`flex-1 flex flex-col items-center justify-center w-full rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden
                    ${status === 'error'
                        ? 'border border-red-500/30 bg-red-500/[0.03]'
                        : isDragOver
                            ? 'border-2 border-brain-primary/50 bg-brain-primary/[0.04] shadow-[0_0_30px_rgba(0,224,255,0.08)]'
                            : 'border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/[0.15]'
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleZoneClick}
            >
                {/* Drag-over glow effect */}
                {isDragOver && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brain-primary/[0.06] via-transparent to-brain-secondary/[0.03] pointer-events-none" />
                )}

                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full p-4 cursor-pointer">
                    <div className="flex flex-col items-center justify-center text-center">
                        <motion.div
                            animate={
                                status === 'uploading'
                                    ? { y: [0, -8, 0] }
                                    : isDragOver
                                        ? { scale: 1.1 }
                                        : { scale: 1 }
                            }
                            transition={
                                status === 'uploading'
                                    ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                                    : { duration: 0.2 }
                            }
                            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-500
                                ${status === 'uploading'
                                    ? 'bg-brain-primary/10 border-brain-primary/25 shadow-[0_0_25px_rgba(0,224,255,0.12)]'
                                    : status === 'success'
                                        ? 'bg-green-500/10 border-green-500/20'
                                        : 'bg-gradient-to-br from-white/[0.05] to-transparent border-white/[0.08]'
                                }
                            `}
                        >
                            {status === 'success' ? (
                                <CheckCircle className="w-7 h-7 text-green-400" />
                            ) : status === 'uploading' ? (
                                <Upload className="w-7 h-7 text-brain-primary" />
                            ) : (
                                <Upload className="w-7 h-7 text-slate-500" />
                            )}
                        </motion.div>

                        <p className="mb-1 text-sm text-white/80 font-semibold">
                            {status === 'uploading' ? 'Initializing Neural Link...' : 'Upload Knowledge Base'}
                        </p>
                        <p className="text-[11px] text-slate-600">
                            {status === 'uploading' ? 'Generating vector embeddings' : 'Drag & drop or click • PDF (Max 10MB)'}
                        </p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} disabled={!user && false} />
                </label>

                {/* Upload progress bar */}
                {status === 'uploading' && (
                    <div className="absolute bottom-0 left-0 w-full h-[2px]">
                        <motion.div
                            className="h-full bg-gradient-to-r from-brain-primary via-brain-secondary to-brain-primary"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 8, ease: 'easeInOut' }}
                        />
                    </div>
                )}
            </div>

            {/* File Selected Card */}
            <AnimatePresence>
                {file && status !== 'uploading' && status !== 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-brain-primary/10 border border-brain-primary/15 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-brain-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate max-w-[140px]">{file.name}</p>
                                <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={clearFile}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
                            >
                                <X size={14} />
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={uploadFile}
                                className="px-4 py-1.5 text-xs font-bold bg-brain-primary text-brain-dark rounded-lg hover:shadow-[0_0_15px_rgba(0,224,255,0.2)] transition-all duration-200"
                            >
                                Ingest
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status Messages */}
            <AnimatePresence>
                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="p-3 bg-red-500/[0.06] border border-red-500/20 rounded-xl flex items-center gap-2.5 text-red-400"
                    >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-medium">{message}</span>
                    </motion.div>
                )}
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="p-3 bg-green-500/[0.06] border border-green-500/20 rounded-xl flex items-center gap-2.5 text-green-400"
                    >
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-medium">{message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileUpload;
