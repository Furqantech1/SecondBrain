import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit, FileText, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DeepSpaceBackground from '../components/DeepSpaceBackground';

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
        if (doc && doc.filename) {
            localStorage.setItem('lastActiveDocumentId', doc.filename);
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
            <div className="min-h-screen flex items-center justify-center text-white bg-brain-dark">
                Loading Profile...
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen text-white font-sans selection:bg-brain-primary selection:text-brain-dark relative"
        >
            <DeepSpaceBackground />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-300" />
                    </button>
                    <h1 className="text-3xl font-display font-bold">Your Profile</h1>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="glass-panel p-6 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brain-primary to-brain-secondary opacity-50"></div>

                            <div className="relative w-32 h-32 mb-6 group-hover:scale-105 transition-transform duration-300">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-slate-500" />
                                    )}
                                </div>
                                <label className={`absolute bottom-0 right-0 p-2 rounded-full bg-brain-primary text-brain-dark hover:brightness-110 transition-all shadow-lg cursor-pointer ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                                    <Camera className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
                                </label>
                            </div>

                            <h2 className="text-xl font-bold text-white mb-1">{user?.username || 'Explorer'}</h2>
                            <p className="text-sm text-slate-400 mb-6">{user?.email}</p>

                            <div className="w-full space-y-3 pt-6 border-t border-white/10">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity (Real) */}
                        <div className="glass-panel p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Upload History</h3>
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    {history.map((doc, i) => (
                                        <div key={i} onClick={() => handleDocumentClick(doc)} className="flex gap-3 items-start p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5">
                                            <div className="mt-1"><FileText className="w-4 h-4 text-brain-secondary group-hover:text-brain-primary transition-colors" /></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">{doc.filename}</p>
                                                <p className="text-xs text-slate-500">{doc.size ? (doc.size / 1024).toFixed(1) : '0'} KB • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No uploads yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details Form */}
                    <div className="md:col-span-2">
                        <div className="glass-panel p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold">Personal Information</h3>
                                {!isEditing && <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Verified User</span>}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
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
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
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
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
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
                                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
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
                                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
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
                                            className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium"
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
