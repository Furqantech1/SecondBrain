import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api/axios';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred during login');
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-brain-text-secondary/70 mb-8 text-lg">
                Access your intelligence database
            </p>

            {/* Social Logins */}
            <div className="mb-8">
                <button
                    onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                    className="w-full btn-ghost flex items-center justify-center gap-3 group"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                    <span className="text-white/90">Continue with Google</span>
                </button>
            </div>

            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative bg-brain-dark/95 px-4 text-xs text-brain-text-secondary/50 uppercase tracking-widest font-medium">
                    Or sign in with email
                </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
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

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center text-brain-text-secondary/70 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 text-brain-primary focus:ring-brain-primary/20 transition-all" />
                        <span className="ml-2">Remember me</span>
                    </label>
                    <a href="#" className="font-medium text-brain-primary hover:text-brain-primary-dark transition-colors">Forgot password?</a>
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
                    Sign in
                </button>
            </form>

            <div className="text-center mt-8">
                <span className="text-brain-text-secondary/60 text-sm">New to Second Brain? </span>
                <Link to="/signup" className="text-white hover:text-brain-primary font-bold text-sm transition-colors ml-1">
                    Create account
                </Link>
            </div>
        </div>
    );
};

export default Login;
