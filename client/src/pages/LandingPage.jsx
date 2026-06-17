import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Upload, MessageSquare, Shield, ChevronDown, ChevronUp, Zap, Search, FileText, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { API_URL } from '../api/axios';

/* ───────── Animation Variants ───────── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideFromLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const slideFromRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ───────── Animated Counter ───────── */
const AnimatedCounter = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = parseInt(target);
        const duration = 2000;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target]);
    return <span>{count}{suffix}</span>;
};

/* ───────── Glowing Orb Component ───────── */
const GlowOrb = ({ className, color = 'brain-primary', size = 400, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay }}
        className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`}
        style={{
            width: size,
            height: size,
            background: color === 'brain-primary'
                ? 'radial-gradient(circle, rgba(0,224,255,0.12) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)',
        }}
    />
);

/* ───────── FAQ Accordion Item ───────── */
const FAQItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const btnRef = useRef(null);

    const handleToggle = useCallback(() => {
        // Lock scroll position so the question doesn't move
        const scrollY = window.scrollY;
        const html = document.documentElement;
        const prevBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';

        setIsOpen(prev => !prev);

        // Restore scroll on the next two frames to catch layout shifts
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
            requestAnimationFrame(() => {
                window.scrollTo(0, scrollY);
                html.style.scrollBehavior = prevBehavior;
            });
        });
    }, []);

    return (
        <div className="border-b border-white/[0.06] last:border-b-0" style={{ overflowAnchor: 'none' }}>
            <button
                ref={btnRef}
                onClick={handleToggle}
                className="w-full flex items-center justify-between py-6 px-4 text-left group transition-all"
            >
                <span className="text-base md:text-lg font-semibold text-white/90 group-hover:text-brain-primary transition-colors duration-300">
                    {question}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="ml-4 shrink-0 w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:border-brain-primary/40 group-hover:bg-brain-primary/5 transition-all duration-300"
                >
                    <ChevronDown size={16} className="text-slate-400 group-hover:text-brain-primary transition-colors" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                        style={{ overflowAnchor: 'none' }}
                    >
                        <p className="px-4 pb-6 text-slate-400 leading-relaxed text-sm md:text-base">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ───────── Feature Card (Premium) ───────── */
const FeatureCard = ({ feature, index }) => (
    <motion.div
        variants={fadeUp}
        custom={index}
        whileHover={{ y: -10, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }}
        className="group relative rounded-2xl overflow-hidden"
    >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brain-primary/20 via-brain-secondary/10 to-brain-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a14] z-[1]" />

        {/* Glow behind card on hover */}
        <div className="absolute -inset-1 bg-gradient-to-br from-brain-primary/15 to-brain-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

        <div className="relative z-10 p-8 md:p-10">
            {/* Icon with animated glow ring */}
            <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brain-primary/10 to-brain-primary/[0.02] border border-brain-primary/15 flex items-center justify-center mb-7 group-hover:border-brain-primary/40 group-hover:shadow-[0_0_30px_rgba(0,224,255,0.15)] transition-all duration-700"
            >
                <div className="absolute inset-0 rounded-2xl bg-brain-primary/5 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500" />
                <span className="relative text-brain-primary">{feature.icon}</span>
            </motion.div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-brain-primary transition-colors duration-400">
                {feature.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors duration-500">
                {feature.desc}
            </p>

            {/* Bottom accent line */}
            <div className="mt-6 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-brain-primary/60 to-transparent rounded-full transition-all duration-700 ease-out" />
        </div>
    </motion.div>
);

/* ═══════════ MAIN COMPONENT ═══════════ */
const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const navOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const handleMobileNavClick = (href) => {
        setIsMobileMenuOpen(false);
        setTimeout(() => {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 350);
    };

    const features = [
        { icon: <Upload className="w-6 h-6" />, title: "Instant PDF Ingestion", desc: "Drop your PDFs and we automatically parse, chunk, and index them into a high-performance vector database — in seconds. Zero manual work." },
        { icon: <MessageSquare className="w-6 h-6" />, title: "AI-Powered Chat", desc: "Ask questions in plain language. Our RAG engine retrieves the most relevant context from your documents and generates accurate, source-cited answers instantly." },
        { icon: <Zap className="w-6 h-6" />, title: "Powered by Gemini", desc: "Built on Google's Gemini AI with Pinecone vector search for state-of-the-art language understanding. Fast, reliable, private, and always improving." }
    ];

    const faqs = [
        { question: "How does Second Brain work?", answer: "Upload a PDF document, and our system automatically extracts the text, splits it into chunks, generates vector embeddings, and stores them in a Pinecone database. When you ask a question, we search for the most relevant chunks and use Gemini AI to generate an accurate answer based on your document." },
        { question: "Is my data safe and private?", answer: "Absolutely. All documents and chats are isolated per user account. Your data is never shared with other users or used for model training. Authentication is handled via JWT tokens, and all API calls are protected." },
        { question: "What file formats are supported?", answer: "Currently, Second Brain supports PDF files. We're working on adding support for DOCX, TXT, and other document formats in future updates." },
        { question: "Can I chat with multiple documents?", answer: "Yes! Each uploaded document gets its own context. You can switch between documents from your Profile page's Document History section, and the chat will automatically load the relevant context." },
        { question: "How do I get started?", answer: "Simply create a free account, navigate to the Dashboard, upload a PDF using the drag-and-drop uploader, and start asking questions in the chat interface. It's that simple!" }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen text-white relative overflow-x-hidden font-sans selection:bg-brain-primary/30"
            style={{ background: '#06060b' }}
        >
            {/* ── Grid Background ── */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
                backgroundSize: '70px 70px',
            }} />

            {/* ── Ambient Glow Orbs ── */}
            <GlowOrb className="top-[-200px] left-[25%]" color="brain-primary" size={600} delay={0.5} />
            <GlowOrb className="top-[400px] right-[-100px]" color="brain-secondary" size={500} delay={1} />
            <GlowOrb className="bottom-[200px] left-[-50px]" color="brain-primary" size={400} delay={1.5} />

            {/* ═══════════ NAVBAR ═══════════ */}
            <motion.nav
                className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] backdrop-blur-2xl"
                style={{ backgroundColor: 'rgba(6,6,11,0.8)' }}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center space-x-3"
                    >
                        <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-lg shadow-lg shadow-brain-primary/10" />
                        <span className="text-lg font-bold tracking-tight">Second Brain</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400"
                    >
                        {['Features', 'How it Works', 'FAQ'].map((link) => (
                            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                className="relative hover:text-white transition-colors duration-300 group"
                            >
                                {link}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brain-primary rounded-full group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                    </motion.div>

                    {/* Desktop auth buttons */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="hidden md:flex items-center space-x-4"
                    >
                        <button onClick={() => navigate('/login')}
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300"
                        >
                            Login
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/signup')}
                            className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-shadow duration-300"
                        >
                            Register
                        </motion.button>
                    </motion.div>

                    {/* ── Mobile Hamburger Button ── */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:border-brain-primary/40 hover:bg-brain-primary/5 hover:shadow-[0_0_20px_rgba(0,224,255,0.1)] transition-all duration-300"
                        aria-label="Toggle mobile menu"
                    >
                        <AnimatePresence mode="wait">
                            {isMobileMenuOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <X size={18} className="text-brain-primary" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                    transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <Menu size={18} className="text-slate-300" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.nav>

            {/* ═══════════ MOBILE MENU OVERLAY ═══════════ */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        />

                        {/* Slide-in Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed top-0 right-0 z-50 h-full w-[280px] md:hidden border-l border-white/[0.06] overflow-y-auto"
                            style={{
                                background: 'linear-gradient(180deg, rgba(6,6,11,0.97) 0%, rgba(10,10,20,0.98) 100%)',
                                backdropFilter: 'blur(40px)',
                            }}
                        >
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-brain-primary/60 via-brain-secondary/40 to-transparent" />

                            {/* Close button */}
                            <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
                                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Menu</span>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:border-brain-primary/40 hover:bg-brain-primary/5 transition-all duration-300"
                                >
                                    <X size={16} className="text-slate-400" />
                                </motion.button>
                            </div>

                            {/* Nav Links */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
                                }}
                                className="px-4 py-6 space-y-1"
                            >
                                {['Features', 'How it Works', 'FAQ'].map((link, idx) => (
                                    <motion.a
                                        key={link}
                                        variants={{
                                            hidden: { opacity: 0, x: 30 },
                                            visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
                                        }}
                                        href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMobileNavClick(`#${link.toLowerCase().replace(/\s+/g, '-')}`);
                                        }}
                                        className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all duration-300"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-brain-primary/40 group-hover:bg-brain-primary group-hover:shadow-[0_0_8px_rgba(0,224,255,0.4)] transition-all duration-300" />
                                        <span className="text-[15px] font-medium">{link}</span>
                                    </motion.a>
                                ))}
                            </motion.div>

                            {/* Divider */}
                            <div className="mx-6 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.1] to-white/[0.06]" />

                            {/* Auth Buttons */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
                                }}
                                className="px-6 py-6 space-y-3"
                            >
                                <motion.button
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                                    }}
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                                    className="w-full py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm font-semibold hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
                                >
                                    Login
                                </motion.button>
                                <motion.button
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                                    }}
                                    onClick={() => { setIsMobileMenuOpen(false); navigate('/signup'); }}
                                    className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300"
                                >
                                    Register
                                </motion.button>
                            </motion.div>

                            {/* Bottom glow decoration */}
                            <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center bottom, rgba(0,224,255,0.06) 0%, transparent 70%)' }} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section className="relative z-10 pt-40 pb-44 px-6">
                {/* Decorative SVG Curves */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-25" viewBox="0 0 1400 700" preserveAspectRatio="none">
                    <motion.path
                        d="M0,350 Q350,100 700,350 T1400,350"
                        fill="none" stroke="url(#heroGrad1)" strokeWidth="1.5"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                    <motion.path
                        d="M0,400 Q500,50 1000,400 T1400,200"
                        fill="none" stroke="url(#heroGrad2)" strokeWidth="1"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
                    />
                    <motion.path
                        d="M-100,250 Q400,500 800,200 T1500,350"
                        fill="none" stroke="url(#heroGrad3)" strokeWidth="0.8"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: 'easeInOut', delay: 1 }}
                    />
                    <defs>
                        <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff00cc" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#7B61FF" stopOpacity="0.7" />
                        </linearGradient>
                        <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00E0FF" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#7B61FF" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="heroGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7B61FF" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#00E0FF" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm mb-6"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">AI-Powered Document Intelligence</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6"
                    >
                        <span className="text-brain-primary drop-shadow-[0_0_30px_rgba(0,224,255,0.2)]">The AI Brain</span>{' '}
                        That Never
                        <br className="hidden md:block" />
                        Forgets Your{' '}
                        <span className="relative inline-block">
                            Documents
                            <motion.span
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 1.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-brain-primary to-brain-secondary rounded-full origin-left"
                            />
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
                    >
                        Upload your PDFs, ask questions in plain language, and get instant
                        AI-powered answers with source citations.
                    </motion.p>

                    {/* Dual CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,224,255,0.2)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl text-base transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.06)]"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                            Continue with Google
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/login')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.04] border border-white/10 text-white font-semibold rounded-xl text-base hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
                        >
                            Email Login / Signup
                        </motion.button>
                    </motion.div>

                    {/* Social proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'].map((c, i) => (
                                    <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 border-[#06060b] flex items-center justify-center text-[8px] font-bold text-white`}>
                                        {['A', 'M', 'S', 'K'][i]}
                                    </div>
                                ))}
                            </div>
                            <span className="text-slate-400 font-medium">500+ documents processed</span>
                        </div>
                        <span className="hidden sm:block text-slate-700">|</span>
                        <div className="hidden sm:flex items-center gap-1.5">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                            <span className="text-slate-400 font-medium ml-1">Trusted by researchers</span>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Decorative Emojis */}
                {['\u{1F9E0}', '\u{1F4C4}', '\u{1F50D}', '\u26A1'].map((emoji, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 0.25, y: [0, -18, 0] }}
                        transition={{
                            opacity: { duration: 1, delay: i * 0.4 },
                            y: { duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }
                        }}
                        className="absolute text-3xl md:text-4xl pointer-events-none"
                        style={{
                            top: `${20 + i * 18}%`,
                            [i % 2 === 0 ? 'left' : 'right']: `${8 + i * 5}%`,
                        }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </section>

            {/* ═══════════ STATS BAR ═══════════ */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={staggerContainer}
                className="relative z-10 py-12 px-6 border-y border-white/[0.04]"
            >
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: '500', suffix: '+', label: 'Documents Processed' },
                        { value: '98', suffix: '%', label: 'Accuracy Rate' },
                        { value: '2', suffix: 's', label: 'Avg Response Time' },
                        { value: '24', suffix: '/7', label: 'AI Availability' }
                    ].map((stat, idx) => (
                        <motion.div key={idx} variants={fadeUp} custom={idx} className="text-center">
                            <p className="text-3xl md:text-4xl font-extrabold text-brain-primary mb-1">
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                            </p>
                            <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ═══════════ FEATURES SECTION ═══════════ */}
            <section id="features" className="relative z-10 py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
                            Everything You Need to{' '}
                            <span className="text-brain-primary drop-shadow-[0_0_20px_rgba(0,224,255,0.15)]">Learn</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Upload documents, get AI-powered answers, and build your personal knowledge base
                            — so you're never stuck searching for information again.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} feature={feature} index={idx} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS / SHOWCASE ═══════════ */}
            <section id="how-it-works" className="relative z-10 py-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="text-center mb-20"
                    >
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
                            <span className="text-brain-primary">Smart AI</span> That Understands
                            <br className="hidden md:block" />
                            Your Documents Inside Out
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Contextual chat powered by RAG, real-time document retrieval, and 24/7 AI
                            support — so you always get the right answer.
                        </motion.p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* ── Chat Mockup ── */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={slideFromLeft}
                            className="relative"
                        >
                            <div className="absolute inset-[-20px] bg-gradient-to-br from-brain-primary/10 to-brain-secondary/5 rounded-3xl blur-2xl" />
                            <motion.div
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.4 }}
                                className="relative rounded-2xl border border-white/10 bg-[#0c0c14] overflow-hidden shadow-2xl shadow-brain-primary/5"
                            >
                                {/* Window Header */}
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                                    <div className="flex gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                                    </div>
                                    <span className="text-xs text-slate-500 ml-3 font-mono">Second Brain — Chat</span>
                                </div>
                                {/* Chat Body */}
                                <div className="p-6 space-y-5 text-sm min-h-[280px]">
                                    {/* AI Message */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="flex gap-3 items-start"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-brain-primary/15 flex items-center justify-center shrink-0 ring-1 ring-brain-primary/20">
                                            <Brain className="w-4 h-4 text-brain-primary" />
                                        </div>
                                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 text-slate-300 max-w-[85%]">
                                            Hello! I am your Second Brain. Upload a PDF and ask me anything.
                                        </div>
                                    </motion.div>
                                    {/* User Message */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.6 }}
                                        className="flex gap-3 items-start justify-end"
                                    >
                                        <div className="bg-brain-primary/10 border border-brain-primary/20 rounded-2xl rounded-tr-sm px-4 py-3 text-white max-w-[85%]">
                                            What are the key findings in the Q3 report?
                                        </div>
                                    </motion.div>
                                    {/* AI Response */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.9 }}
                                        className="flex gap-3 items-start"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-brain-primary/15 flex items-center justify-center shrink-0 ring-1 ring-brain-primary/20">
                                            <Brain className="w-4 h-4 text-brain-primary" />
                                        </div>
                                        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3 text-slate-300 max-w-[85%]">
                                            <p className="font-semibold text-white mb-2">📊 Key Findings:</p>
                                            <ul className="space-y-1.5 text-xs text-slate-400">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                    Revenue increased by <span className="text-brain-primary font-semibold ml-1">23%</span> YoY
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                    Customer retention at <span className="text-brain-primary font-semibold ml-1">94.5%</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                                    New product line: <span className="text-brain-primary font-semibold ml-1">$2.1M</span> contribution
                                                </li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                </div>
                                {/* Input Bar */}
                                <div className="px-5 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center gap-3">
                                    <div className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-4 flex items-center">
                                        <span className="text-xs text-slate-500">Ask anything about your document...</span>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-11 h-11 rounded-xl bg-brain-primary flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(0,224,255,0.2)]"
                                    >
                                        <ArrowRight className="w-4 h-4 text-black" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* ── Right: Description ── */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={slideFromRight}
                            className="space-y-8"
                        >
                            <motion.div
                                whileHover={{ rotate: 5, scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 flex items-center justify-center"
                            >
                                <Brain className="w-7 h-7 text-brain-primary" />
                            </motion.div>
                            <h3 className="text-3xl md:text-4xl font-extrabold leading-tight">
                                With RAG-Powered Chat
                                <br className="hidden md:block" />
                                and <span className="text-brain-primary">Instant Source Citations</span>
                            </h3>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Our system uses Retrieval-Augmented Generation to find the exact excerpts from your
                                documents that answer your question. No hallucination — just facts backed by your own data,
                                with source citations and relevance scores for every answer.
                            </p>

                            <div className="flex gap-5 pt-2">
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    className="px-6 py-4 rounded-2xl bg-brain-primary/[0.06] border border-brain-primary/20 text-center"
                                >
                                    <p className="text-3xl font-extrabold text-brain-primary">5+</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Sources / query</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    className="px-6 py-4 rounded-2xl bg-brain-secondary/[0.06] border border-brain-secondary/20 text-center"
                                >
                                    <p className="text-3xl font-extrabold text-brain-secondary">~2s</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Avg response</p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════ FAQ SECTION ═══════════ */}
            <section id="faq" className="relative z-10 py-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-80px' }}
                        variants={staggerContainer}
                        className="text-center mb-14"
                    >
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                            Frequently Asked <span className="text-brain-primary">Questions</span>
                        </motion.h2>
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-30px' }}
                        variants={staggerContainer}
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3 md:p-5 backdrop-blur-sm"
                    >
                        {faqs.map((faq, idx) => (
                            <FAQItem key={idx} question={faq.question} answer={faq.answer} index={idx} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="relative z-10 border-t border-white/[0.06] bg-[#050509] py-16 px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12"
                >
                    {/* Brand */}
                    <motion.div variants={fadeUp} className="md:col-span-2 space-y-5">
                        <div className="flex items-center gap-3">
                            <img src="/logo.jpg" alt="Logo" className="w-9 h-9 rounded-lg" />
                            <span className="text-lg font-bold">Second Brain</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Your AI-powered knowledge assistant. Upload documents, ask questions, and get instant
                            answers — all in one place. Built for students, researchers, and professionals.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {[
                                { icon: '📸', label: 'Instagram' },
                                { icon: '💼', label: 'LinkedIn' },
                                { icon: '▶️', label: 'YouTube' },
                                { icon: '💬', label: 'Discord' }
                            ].map((social, idx) => (
                                <motion.a
                                    key={idx}
                                    href="#"
                                    title={social.label}
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:border-brain-primary/40 hover:bg-brain-primary/5 transition-all duration-300 text-sm"
                                >
                                    {social.icon}
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Browse Links */}
                    <motion.div variants={fadeUp} custom={1}>
                        <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Browse</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'Features', href: '#features' },
                                { label: 'How it Works', href: '#how-it-works' },
                                { label: 'FAQ', href: '#faq' }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm text-slate-400 hover:text-brain-primary transition-colors duration-300 flex items-center gap-2 group">
                                        <span className="text-brain-primary/40 group-hover:text-brain-primary transition-colors">›</span> {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={fadeUp} custom={2}>
                        <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { label: 'Login', href: '/login' },
                                { label: 'Register', href: '/signup' },
                                { label: 'Profile', href: '/profile' },
                                { label: 'Privacy Policy', href: '#' }
                            ].map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-sm text-slate-400 hover:text-brain-primary transition-colors duration-300 flex items-center gap-2 group">
                                        <span className="text-brain-primary/40 group-hover:text-brain-primary transition-colors">›</span> {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Bottom Bar */}
                <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">&copy; 2026 Second Brain. All rights reserved.</p>
                    <div className="flex gap-6 text-xs text-slate-500">
                        {['Terms', 'Privacy', 'Cookies'].map((link) => (
                            <a key={link} href="#" className="hover:text-white transition-colors duration-300">{link}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </motion.div>
    );
};

export default LandingPage;
