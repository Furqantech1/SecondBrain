import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/axios';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Password Strength Validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        if (!/[0-9]/.test(password)) {
            setError('Password must contain at least one number');
            return;
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            setError('Password must contain at least one special character');
            return;
        }

        try {
            const result = await signup(email, password, name);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Error creating account');
            }
        } catch (err) {
            setError('Error creating account');
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Create account</h2>
            <p className="text-brain-text-secondary/70 mb-8 text-lg">
                Join the intelligence network
            </p>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div className="relative group">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-brain-text-secondary/50 group-focus-within:text-brain-primary transition-colors" />
                        <input
                            type="text"
                            required
                            className="glass-input pl-12"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-brain-text-secondary/50 group-focus-within:text-brain-primary transition-colors" />
                        <input
                            type="email"
                            required
                            className="glass-input pl-12"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-brain-text-secondary/50 group-focus-within:text-brain-primary transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="glass-input pl-12 pr-12"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-brain-text-secondary/50 hover:text-white transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className={`${password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'text-green-400' :
                                password.length >= 6 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                {password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'Strong' :
                                    password.length >= 6 ? 'Medium' : 'Weak'}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'w-full bg-green-400' :
                                    password.length >= 6 ? 'w-2/3 bg-yellow-400' : 'w-1/3 bg-red-400'
                                    }`}
                            ></div>
                        </div>
                        <ul className="text-[10px] text-brain-text-secondary/60 space-y-1 pl-1">
                            <li className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-green-400' : ''}`}>
                                <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-400' : 'bg-white/20'}`}></div>
                                At least 8 characters
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-green-400' : ''}`}>
                                <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-green-400' : 'bg-white/20'}`}></div>
                                Contains a number
                            </li>
                            <li className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}`}>
                                <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-400' : 'bg-white/20'}`}></div>
                                Contains a special character
                            </li>
                        </ul>
                    </div>
                )}

                <div className="flex items-center text-sm">
                    <label className="flex items-center text-brain-text-secondary/70 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" required className="w-4 h-4 rounded border-white/10 bg-white/5 text-brain-primary focus:ring-brain-primary/20 transition-all" />
                        <span className="ml-2">I agree to the <a href="#" className="text-brain-primary hover:text-brain-primary-dark transition-colors">Terms & Conditions</a></span>
                    </label>
                </div>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium animate-fadeIn">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full btn-primary"
                >
                    Create account
                </button>
            </form>

            <div className="relative flex items-center justify-center mt-8 mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative bg-brain-dark/95 px-4 text-xs text-brain-text-secondary/50 uppercase tracking-widest font-medium">
                    Or register with
                </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                    className="w-full btn-ghost flex items-center justify-center gap-3 group"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                    <span className="text-white/90">Google</span>
                </button>
            </div>

            <div className="text-center mt-8">
                <span className="text-brain-text-secondary/60 text-sm">Already have an account? </span>
                <Link to="/login" className="text-white hover:text-brain-primary font-bold text-sm transition-colors ml-1">
                    Sign in
                </Link>
            </div>
        </div>
    );
};

export default Signup;
