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

  const inputClass = "w-full rounded border border-border-default py-2.5 pl-11 pr-4 text-[14px] bg-surface-sunken text-text-primary placeholder-text-tertiary focus:border-border-emphasis outline-none transition-colors";
  const iconClass = "absolute left-3.5 top-[11px] h-4 w-4 text-text-tertiary group-focus-within:text-text-primary transition-colors";

  return (
    <div className="w-full">
      <h2 className="text-[28px] font-semibold text-text-primary mb-2 tracking-tight">Welcome back</h2>
      <p className="text-[14px] text-text-secondary mb-8">
        Access your intelligence database
      </p>

      {/* Social Logins */}
      <div className="mb-8">
        <button
          onClick={() => window.location.href = `${API_URL}/api/auth/google`}
          className="w-full btn-ghost"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
          <span className="text-text-secondary">Continue with Google</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle"></div>
        </div>
        <div className="relative px-4 text-meta normal-case text-text-tertiary tracking-widest bg-surface-base">
          Or sign in with email
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative group">
            <Mail className={iconClass} />
            <input
              type="email"
              required
              className={inputClass}
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Lock className={iconClass} />
            <input
              type={showPassword ? "text" : "password"}
              required
              className={inputClass + " pr-11"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-[11px] text-text-tertiary hover:text-text-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <label className="flex items-center text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
            <input type="checkbox" className="w-3.5 h-3.5 rounded border border-border-default bg-surface-sunken" />
            <span className="ml-2">Remember me</span>
          </label>
          <a href="#" className="font-medium text-text-primary hover:text-accent transition-colors">Forgot password?</a>
        </div>

        {error && (
          <div className="p-3 rounded bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[13px] text-status-error text-center font-medium">
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
        <span className="text-text-secondary text-[13px]">New to Second Brain? </span>
        <Link to="/signup" className="text-text-primary font-semibold text-[13px] hover:text-text-primary transition-colors ml-1">
          Create account
        </Link>
      </div>
    </div>
  );
};

export default Login;
