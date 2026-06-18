import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Shield, Database } from 'lucide-react';
import { fadeUp, stagger } from '../lib/motion';

const features = [
  { icon: Brain, text: 'AI-Powered RAG' },
  { icon: Zap, text: 'Instant Recall' },
  { icon: Shield, text: 'Private & Secure' },
];

const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex overflow-hidden" style={{ background: 'var(--surface-base)' }}>
      {/* Left Side - Visual & Branding (60% width) */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-center p-16 border-r border-border-subtle overflow-hidden">
        
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger(0.05, 0.05)}
            className="space-y-10"
          >
            {/* Logo */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-12">
              <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-lg" />
              <span className="font-mono text-[14px] font-medium tracking-[0.12em] text-text-primary">
                SECOND BRAIN
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} className="space-y-4">
              <h1 className="text-[48px] md:text-[64px] font-bold tracking-tight text-text-primary leading-[1.1]">
                Your External <br />
                <span style={{ color: 'var(--accent)' }}>Neural Network.</span>
              </h1>
              <p className="text-[16px] text-text-secondary leading-relaxed max-w-md">
                Upload documents, retain knowledge, and query your personal intelligence database with zero latency.
              </p>
            </motion.div>

            {/* Feature Chips */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 pt-4">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-default bg-surface-raised text-[13px] font-medium text-text-secondary"
                >
                  <feat.icon size={14} style={{ color: 'var(--accent)' }} />
                  {feat.text}
                </div>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeUp} className="flex items-center gap-8 pt-8 mt-8 border-t border-border-subtle">
              <div>
                <p className="text-[24px] font-bold text-text-primary">10K+</p>
                <p className="text-meta normal-case mt-1">Documents Indexed</p>
              </div>
              <div className="w-px h-8 bg-border-subtle" />
              <div>
                <p className="text-[24px] font-bold text-text-primary">99.9%</p>
                <p className="text-meta normal-case mt-1">Uptime</p>
              </div>
              <div className="w-px h-8 bg-border-subtle" />
              <div>
                <p className="text-[24px] font-bold text-text-primary">&lt;2s</p>
                <p className="text-meta normal-case mt-1">Avg Response</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form (40% width) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-surface-base">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
