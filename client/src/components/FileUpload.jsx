// PLAN: FileUpload.jsx
// - Layout tree: Dropzone (idle/drag-active) → Progress track row (processing) → Success/Error row
// - State: file, status (idle/uploading/success/error), message, isDragOver, uploadStage
// - Motion: fadeUp (state transitions), SPRING_SMOOTH (progress bar), AnimatePresence mode="wait" (stage labels)
// - Key constraints: No neon, no bounce, no spinning indicator, no percentage number, dashed border idle
// END PLAN

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { fadeUp, fadeIn, SPRING_SMOOTH, SPRING_SNAPPY } from '../lib/motion';

const STAGES = ['READING PDF', 'CHUNKING', 'EMBEDDING', 'INDEXING'];

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStage, setUploadStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    if (!user) { navigate('/login'); return false; }
    return true;
  }, [user, navigate]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!user) { navigate('/login'); return; }
    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setStatus('idle');
        setMessage('');
      } else {
        setStatus('error');
        setMessage('Only PDF files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (!user) { navigate('/login'); return; }
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setStatus('idle');
        setMessage('');
      } else {
        setStatus('error');
        setMessage('Only PDF files are supported.');
      }
    }
  };

  const handleZoneClick = (e) => {
    if (!user) { e.preventDefault(); navigate('/login'); }
  };

  const clearFile = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    setUploadStage(0);
    setProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const uploadFile = async () => {
    if (!file) return;
    if (!checkAuth()) return;

    setStatus('uploading');
    setUploadStage(0);
    setProgress(5);

    const stageInterval = setInterval(() => {
      setUploadStage(prev => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
      setProgress(prev => Math.min(prev + 22, 90));
    }, 2000);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(stageInterval);
      setProgress(100);
      setStatus('success');
      setMessage(`Indexed -- ${file.name}`);

      if (onUploadSuccess && response.data.documentId) {
        setTimeout(() => {
          onUploadSuccess(response.data.documentId, response.data.filename || file.name);
        }, 800);
      }
      setFile(null);
    } catch (error) {
      clearInterval(stageInterval);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Error uploading file');
    }
  };

  // Auto-upload when file is selected
  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    setStatus('idle');
    setMessage('');
  };

  // IDLE / DRAG state: show dropzone
  if (status === 'idle' && !file) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div
          className="flex flex-col items-center justify-center w-full rounded-md p-10"
          style={{
            border: isDragOver ? '1px solid var(--accent)' : '1px dashed var(--border-default)',
            background: isDragOver ? 'rgba(200, 241, 53, 0.04)' : 'transparent',
            transition: 'border-color 100ms ease, background 100ms ease',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
        >
          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center cursor-pointer w-full">
            <Upload size={20} className="mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-[15px] mb-1" style={{ color: isDragOver ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {isDragOver ? 'Release to upload' : 'Drop a PDF here'}
            </p>
            <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
              or click to browse
            </p>
            <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        </div>
      </div>
    );
  }

  // FILE SELECTED — show file card with ingest button
  if (status === 'idle' && file) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div
          className="flex items-center justify-between h-[52px] px-4 rounded border border-border-default"
          style={{ background: 'var(--surface-raised)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={16} style={{ color: 'var(--text-tertiary)' }} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] text-text-primary truncate" style={{ maxWidth: '180px' }}>{file.name}</p>
              <p className="text-meta text-[12px] normal-case">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={clearFile} className="p-1 rounded text-text-tertiary hover:text-text-primary hover:bg-surface-overlay" style={{ transition: 'all 120ms ease' }}>
              <X size={14} />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              onClick={uploadFile}
              className="btn-primary text-[12px] uppercase tracking-[0.02em] px-4 py-1.5"
            >
              Ingest
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // UPLOADING — progress track
  if (status === 'uploading') {
    return (
      <div className="w-full flex flex-col gap-3">
        <div
          className="flex items-center justify-between h-[52px] px-4 rounded border border-border-default"
          style={{ background: 'var(--surface-raised)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={16} style={{ color: 'var(--text-tertiary)' }} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[14px] text-text-primary truncate" style={{ maxWidth: '160px' }}>{file?.name || 'Document'}</p>
              <p className="text-meta text-[12px] normal-case">{file ? formatFileSize(file.size) : ''}</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={uploadStage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="text-meta text-[12px] shrink-0"
            >
              {STAGES[uploadStage]}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="h-[2px] w-full rounded-sm" style={{ background: 'var(--border-subtle)' }}>
          <motion.div
            className="h-full rounded-sm"
            style={{ background: 'var(--accent)' }}
            animate={{ width: `${progress}%` }}
            transition={SPRING_SMOOTH}
          />
        </div>
      </div>
    );
  }

  // SUCCESS
  if (status === 'success') {
    return (
      <div className="w-full">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between h-[52px] px-4 rounded border border-border-default"
          style={{ background: 'var(--surface-raised)' }}
        >
          <div className="flex items-center gap-3">
            <Check size={16} style={{ color: 'var(--status-active)' }} />
            <p className="text-[14px] text-text-primary">{message || 'Indexed successfully'}</p>
          </div>
          <button
            onClick={clearFile}
            className="btn-ghost text-[12px] uppercase tracking-[0.02em] px-3 py-1 gap-1"
          >
            Upload another
          </button>
        </motion.div>
      </div>
    );
  }

  // ERROR
  if (status === 'error') {
    return (
      <div className="w-full">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between h-[52px] px-4 rounded border"
          style={{ background: 'var(--surface-raised)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} style={{ color: 'var(--status-error)' }} />
            <p className="text-[14px] text-text-primary">{message}</p>
          </div>
          <button
            onClick={clearFile}
            className="btn-ghost text-[12px] uppercase tracking-[0.02em] px-3 py-1"
            style={{ color: 'var(--status-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default FileUpload;
