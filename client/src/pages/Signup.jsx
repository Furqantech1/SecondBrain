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

  const inputClass = "w-full rounded border border-border-default py-2.5 pl-11 pr-4 text-[14px] bg-surface-sunken text-text-primary placeholder-text-tertiary focus:border-border-emphasis outline-none transition-colors";
  const iconClass = "absolute left-3.5 top-[11px] h-4 w-4 text-text-tertiary group-focus-within:text-text-primary transition-colors";

  return (
    <div className="w-full">
      <h2 className="text-[28px] font-semibold text-text-primary mb-2 tracking-tight">Create account</h2>
      <p className="text-[14px] text-text-secondary mb-8">
        Join the intelligence network
      </p>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="relative group">
            <User className={iconClass} />
            <input
              type="text"
              required
              className={inputClass}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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

        {/* Password Strength Meter */}
        {password && (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-medium">
              <span className={`${password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'text-status-active' :
                password.length >= 6 ? 'text-status-pending' : 'text-status-error'
                }`}>
                {password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'Strong' :
                  password.length >= 6 ? 'Medium' : 'Weak'}
              </span>
            </div>
            <div className="h-1.5 w-full bg-border-subtle rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${password.length >= 8 && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'w-full bg-status-active' :
                  password.length >= 6 ? 'w-2/3 bg-status-pending' : 'w-1/3 bg-status-error'
                  }`}
              ></div>
            </div>
            <ul className="text-[10px] text-text-tertiary space-y-1 pl-1">
              <li className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-status-active' : ''}`}>
                <div className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-status-active' : 'bg-border-emphasis'}`}></div>
                At least 8 characters
              </li>
              <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-status-active' : ''}`}>
                <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(password) ? 'bg-status-active' : 'bg-border-emphasis'}`}></div>
                Contains a number
              </li>
              <li className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(password) ? 'text-status-active' : ''}`}>
                <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-status-active' : 'bg-border-emphasis'}`}></div>
                Contains a special character
              </li>
            </ul>
          </div>
        )}

        <div className="flex items-center text-[13px]">
          <label className="flex items-center text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
            <input type="checkbox" required className="w-3.5 h-3.5 rounded border border-border-default bg-surface-sunken" />
            <span className="ml-2">I agree to the <a href="#" className="underline hover:text-text-primary transition-colors">Terms & Conditions</a></span>
          </label>
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
          Create account
        </button>
      </form>

      <div className="relative flex items-center justify-center mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-subtle"></div>
        </div>
        <div className="relative px-4 text-meta normal-case text-text-tertiary tracking-widest bg-surface-base">
          Or register with
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => window.location.href = `${API_URL}/api/auth/google`}
          className="w-full btn-ghost"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
          <span className="text-text-secondary">Google</span>
        </button>
      </div>

      <div className="text-center mt-8">
        <span className="text-text-secondary text-[13px]">Already have an account? </span>
        <Link to="/login" className="text-text-primary font-semibold text-[13px] hover:text-text-primary transition-colors ml-1">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Signup;
