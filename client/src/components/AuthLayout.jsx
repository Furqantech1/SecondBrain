import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import DeepSpaceBackground from './DeepSpaceBackground';

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

                    {/* Feature Pills */}
                    <div className="flex gap-4 pt-4">
                        <div className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80">
                            ✨ AI Powered
                        </div>
                        <div className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80">
                            🚀 Instant Recall
                        </div>
                        <div className="px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm font-medium text-white/80">
                            🔒 Private Design
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
