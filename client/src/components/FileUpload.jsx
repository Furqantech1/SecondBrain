import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
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
    };

    const handleDrop = (e) => {
        e.preventDefault();

        // Auth Check
        if (!user) {
            navigate('/login');
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
            } else {
                setStatus('error');
                setMessage('Please upload a PDF file.');
            }
        }
    };

    const handleFileChange = (e) => {
        // Auth Check
        if (!user) {
            navigate('/login');
            return;
        }

        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
            } else {
                setStatus('error');
                setMessage('Please upload a PDF file.');
            }
        }
    };

    // Trigger auth check if user clicks the dropzone to browse
    const handleZoneClick = (e) => {
        if (!user) {
            e.preventDefault(); // Prevent file dialog
            navigate('/login');
        }
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
            setFile(null); // Reset after success

            // Trigger callback if provided
            if (onUploadSuccess && response.data.documentId) {
                onUploadSuccess(response.data.documentId);
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error uploading file');
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div
                className={`flex-1 flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.01]
                    ${status === 'error' ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-brain-primary hover:shadow-neon-soft'}
                `}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleZoneClick}
            >
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full p-4 cursor-pointer">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className={`p-5 rounded-full mb-6 transition-all duration-300 ${status === 'uploading' ? 'bg-brain-primary/20 shadow-neon' : 'bg-white/5 group-hover:bg-brain-primary/10'}`}>
                            {status === 'success' ? (
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            ) : status === 'uploading' ? (
                                <Upload className="w-10 h-10 text-brain-primary animate-bounce-slow" />
                            ) : (
                                <Upload className="w-10 h-10 text-white/50 group-hover:text-brain-primary transition-colors" />
                            )}
                        </div>

                        <p className="mb-2 text-base text-white/90 font-medium">
                            {status === 'uploading' ? 'Initializing Neural Link...' : 'Upload Knowledge Base'}
                        </p>
                        <p className="text-xs text-brain-text-secondary/60">PDF Supported (Max 10MB)</p>
                    </div>
                    {/* Only enable input if we haven't redirected */}
                    <input id="dropzone-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} disabled={!user && false} />
                </label>
            </div>

            {/* Application State Feedback */}
            {file && status !== 'uploading' && status !== 'success' && (
                <div className="mt-4 p-4 bg-brain-dark border border-white/10 rounded-xl flex items-center justify-between shadow-lg animate-fadeIn">
                    <div className="flex items-center truncate">
                        <FileText className="w-5 h-5 text-brain-primary mr-3" />
                        <span className="text-sm text-white/80 truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <button
                        onClick={uploadFile}
                        className="ml-3 btn-primary py-1.5 px-4 text-xs h-auto min-h-0"
                    >
                        Ingest
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center text-red-400 animate-shake">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                    <span className="text-xs font-medium">{message}</span>
                </div>
            )}
            {status === 'success' && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center text-green-400 animate-fadeIn">
                    <CheckCircle className="w-5 h-5 mr-3 shrink-0" />
                    <span className="text-xs font-medium">{message}</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
