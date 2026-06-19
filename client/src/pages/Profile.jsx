import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit, FileText, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        phoneNumber: '',
        location: ''
    });

    // Helper to safely get token
    const getAuthToken = () => {
        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) return null;
            const userInfo = JSON.parse(userInfoStr);
            return userInfo?.token || null;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    };

    // Load user data into form
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                bio: user.bio || '',
                phoneNumber: user.phoneNumber || '',
                location: user.location || ''
            });
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            console.log('Fetching history...');
            const { data } = await api.get('/api/upload');
            setHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Network error fetching history', error);
        }
    };

    const handleDocumentClick = (doc) => {
        if (doc && doc.vectorId) {
            const userId = user?._id;
            if (userId) {
                localStorage.setItem(`lastActiveDocId_${userId}`, doc.vectorId);
            }
            window.location.href = '/dashboard';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!user) {
            setMessage({ type: 'error', text: 'You are not logged in.' });
            return;
        }

        try {
            const { data } = await api.put('/api/auth/profile', formData);

            // Update local storage carefully
            try {
                const storedStr = localStorage.getItem('userInfo');
                const storedInfo = storedStr ? JSON.parse(storedStr) : {};
                const updatedUser = { ...storedInfo, ...data };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));

                setMessage({ type: 'success', text: 'Profile updated!' });
                setIsEditing(false);
                // Force reload to update context
                window.location.reload();
            } catch (storeError) {
                console.error('Error updating local storage', storeError);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('avatar', file);
        setUploading(true);

        try {
            const { data } = await api.post('/api/auth/avatar', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            try {
                const storedStr = localStorage.getItem('userInfo');
                const storedInfo = storedStr ? JSON.parse(storedStr) : {};
                const updatedUser = { ...storedInfo, profilePicture: data.profilePicture };
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                window.location.reload();
            } catch (err) {
                console.error('Error saving avatar to storage', err);
            }
        } catch (error) {
            console.error('Avatar upload network error', error);
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-text-primary bg-surface-base">
                <span className="text-[14px]">Loading Profile...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen font-sans"
            style={{ background: 'var(--surface-base)' }}
        >
            <div className="max-w-[1080px] mx-auto px-6 py-12 md:py-16">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-md hover:bg-surface-overlay transition-colors border border-border-default"
                        style={{ background: 'var(--surface-raised)' }}
                    >
                        <ArrowLeft className="w-5 h-5 text-text-secondary" />
                    </button>
                    <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Your Profile</h1>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass-panel p-8 flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 mb-6 group">
                                <div className="w-full h-full rounded-full bg-surface-overlay border border-border-default flex items-center justify-center overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-text-tertiary" />
                                    )}
                                </div>
                                <label className={`absolute bottom-0 right-0 p-2.5 rounded-full shadow-md cursor-pointer ${uploading ? 'opacity-50 cursor-wait' : ''}`} style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                </label>
                            </div>

                            <h2 className="text-[20px] font-semibold text-text-primary mb-1">{user?.username || 'Explorer'}</h2>
                            <p className="text-[14px] text-text-secondary mb-8">{user?.email}</p>

                            <div className="w-full space-y-3 pt-6 border-t border-border-subtle">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="w-full btn-ghost py-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-panel p-6">
                            <h3 className="text-meta mb-4">Recent Uploads</h3>
                            {history.length > 0 ? (
                                <div className="space-y-3">
                                    {history.slice(0, 5).map((doc, i) => (
                                        <div key={i} onClick={() => handleDocumentClick(doc)} className="flex gap-3 items-start p-3 rounded-md hover:bg-surface-overlay border border-transparent transition-colors cursor-pointer group">
                                            <div className="mt-0.5"><FileText className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors" /></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[13px] font-medium text-text-secondary truncate group-hover:text-text-primary transition-colors">{doc.filename}</p>
                                                <p className="text-[11px] text-text-tertiary mt-1">{doc.size ? (doc.size / 1024).toFixed(1) : '0'} KB • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {history.length > 5 && (
                                        <button onClick={() => navigate('/dashboard')} className="w-full text-center text-[12px] text-text-secondary hover:text-text-primary mt-2 pt-3 border-t border-border-subtle">
                                            View all in Documents
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-[13px] text-text-tertiary">No uploads yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="md:col-span-2">
                        <div className="glass-panel p-8">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
                                <h3 className="text-[18px] font-semibold text-text-primary">Personal Information</h3>
                                {!isEditing && <span className="text-[11px] px-2 py-1 rounded bg-surface-overlay text-status-active border border-border-default uppercase tracking-wider">Verified User</span>}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-text-secondary flex items-center gap-2">
                                            <User className="w-4 h-4" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="glass-input disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-text-secondary flex items-center gap-2">
                                            <Mail className="w-4 h-4" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email || ''}
                                            className="glass-input opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-text-secondary flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            disabled={!isEditing}
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            className="glass-input disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-medium text-text-secondary flex items-center gap-2">
                                            <MapPin className="w-4 h-4" /> Location
                                        </label>
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="glass-input disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="San Francisco, CA"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-medium text-text-secondary flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Bio
                                    </label>
                                    <textarea
                                        disabled={!isEditing}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="glass-input h-32 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                        placeholder="Tell us a bit about yourself..."
                                    ></textarea>
                                </div>

                                {isEditing && (
                                    <div className="pt-6 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="btn-ghost"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-primary"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
