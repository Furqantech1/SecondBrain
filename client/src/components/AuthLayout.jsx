import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Brain, Zap, Shield } from 'lucide-react';
import DeepSpaceBackground from './DeepSpaceBackground';

const features = [
    { icon: Brain, text: 'AI-Powered RAG', color: 'from-cyan-400 to-blue-500' },
    { icon: Zap, text: 'Instant Recall', color: 'from-amber-400 to-orange-500' },
    { icon: Shield, text: 'Private & Secure', color: 'from-emerald-400 to-green-500' },
];

const AuthLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isSignup = location.pathname === '/signup';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full flex overflow-hidden"
        >
            {/* Left Side - Visual & Branding (60% width) */}
            <div className="hidden lg:flex lg:w-[60%] relative bg-brain-dark items-center justify-center p-12 overflow-hidden">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brain-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-brain-secondary/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                </div>

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
                        backgroundSize: '70px 70px',
                    }}
                />

                {/* Content */}
                <div className="relative z-10 max-w-2xl text-left space-y-8">
                    <div className="flex items-center gap-3 mb-8">
                        <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-xl shadow-neon" />
                        <h1 className="text-4xl font-bold tracking-tighter text-white">Second Brain</h1>
                    </div>

                    <h2 className="text-6xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        Your External <br />
                        <span className="text-brain-primary">Neural Network.</span>
                    </h2>

                    <p className="text-xl text-brain-text-secondary/80 leading-relaxed max-w-lg">
                        Upload documents, retain knowledge, and query your personal intelligence database with zero latency.
                    </p>

                    {/* Feature Chips — with gradient icon backgrounds */}
                    <div className="flex gap-4 pt-4">
                        {features.map((feat, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80"
                            >
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center shadow-lg`}>
                                    <feat.icon size={14} className="text-white" />
                                </div>
                                {feat.text}
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-8 pt-4">
                        <div>
                            <p className="text-2xl font-bold text-white">10K+</p>
                            <p className="text-sm text-brain-text-secondary/60 mt-0.5">Documents Indexed</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-brain-text-secondary/60 mt-0.5">Uptime</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <p className="text-2xl font-bold text-white">&lt;2s</p>
                            <p className="text-sm text-brain-text-secondary/60 mt-0.5">Avg Response</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form (40% width) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 relative bg-brain-dark/95 backdrop-blur-xl">
                {/* Mobile Background Elements (visible only on small screens) */}
                <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-brain-primary/20 rounded-full blur-[80px]"></div>

                <div className="w-full max-w-md space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-sm mx-auto"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default AuthLayout;
