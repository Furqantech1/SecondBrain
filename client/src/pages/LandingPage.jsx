// PLAN: LandingPage.jsx
// - Layout tree: Sticky nav → Hero (full viewport) → Bento grid (6 cells) → Social proof bar → FAQ (2-col) → Footer
// - State: isMobileMenuOpen, activePipelineNode (cycles every 1.8s), openFaqIndex
// - Motion: fadeUp, stagger, SPRING_SNAPPY (chevron), SPRING_SMOOTH (content), fadeIn (sections)
// - Key constraints: No neon, no glow orbs, no emoji, no gradient text, no backdrop-blur, no rounded-2xl on containers
// END PLAN

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../api/axios';
import { fadeUp, fadeIn, stagger, SPRING_SNAPPY, SPRING_SMOOTH } from '../lib/motion';

const PIPELINE_NODES = ['PDF UPLOAD', 'CHUNK', 'EMBED', 'PINECONE INDEX', 'QUERY', 'GEMINI', 'RESPONSE'];

const NAV_LINKS = [
  { label: 'WHY', href: '#why' },
  { label: 'HOW IT WORKS', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const btnRef = useRef(null);

  const handleToggle = useCallback(() => {
    const scrollY = window.scrollY;
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    onToggle();
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
        html.style.scrollBehavior = prevBehavior;
      });
    });
  }, [onToggle]);

  return (
    <div className="border-t border-border-subtle" style={{ overflowAnchor: 'none' }}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[15px] font-medium text-text-primary leading-snug pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={SPRING_SNAPPY}
          className="shrink-0 text-text-tertiary"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...SPRING_SMOOTH }}
            className="overflow-hidden"
            style={{ overflowAnchor: 'none' }}
          >
            <p className="pb-5 text-[14px] leading-relaxed text-text-secondary max-w-[68ch]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PipelineDiagram = ({ activeIndex }) => (
  <div className="w-full max-w-[900px] mx-auto mt-16 overflow-x-auto">
    <div className="flex items-center justify-between min-w-[700px] px-4">
      {PIPELINE_NODES.map((node, i) => (
        <div key={node} className="flex items-center">
          <motion.div
            animate={{
              borderColor: i === activeIndex ? 'var(--accent)' : 'var(--border-default)',
              color: i === activeIndex ? 'var(--accent)' : 'var(--text-tertiary)',
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="px-3 py-2 font-mono text-[11px] font-medium tracking-wide border rounded bg-surface-raised whitespace-nowrap"
          >
            {node}
          </motion.div>
          {i < PIPELINE_NODES.length - 1 && (
            <div className="w-6 md:w-10 border-t border-dashed border-border-default mx-1" />
          )}
        </div>
      ))}
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePipelineNode, setActivePipelineNode] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePipelineNode(prev => (prev + 1) % PIPELINE_NODES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleMobileNavClick = (href) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const faqs = [
    { question: 'How does Second Brain work?', answer: 'Upload a PDF document, and our system automatically extracts the text, splits it into chunks, generates vector embeddings, and stores them in a Pinecone database. When you ask a question, we search for the most relevant chunks and use Gemini AI to generate an accurate answer based on your document.' },
    { question: 'Is my data safe and private?', answer: 'Absolutely. All documents and chats are isolated per user account. Your data is never shared with other users or used for model training. Authentication is handled via JWT tokens, and all API calls are protected.' },
    { question: 'What file formats are supported?', answer: 'Currently, Second Brain supports PDF files. We are working on adding support for DOCX, TXT, and other document formats in future updates.' },
    { question: 'Can I chat with multiple documents?', answer: 'Yes. You can select multiple documents from your knowledge base and query across all of them simultaneously. The AI will pull context from all selected documents to generate comprehensive answers.' },
    { question: 'How do I get started?', answer: 'Create a free account, navigate to the Dashboard, upload a PDF using the drag-and-drop uploader, and start asking questions in the chat interface.' },
  ];

  const bentoFeatures = [
    {
      span: 'col-span-1 md:col-span-7',
      label: 'CORE FEATURE',
      title: 'Instant recall',
      desc: 'Ask a question in plain language. Get a precise, source-cited answer in under two seconds.',
      extra: (
        <div className="mt-5 p-4 rounded-md bg-surface-sunken border border-border-subtle font-mono text-[12px] leading-relaxed">
          <span className="text-text-tertiary">{'>'} </span>
          <span className="text-text-secondary">What are the key findings in Q3?</span>
          <div className="mt-3 text-text-tertiary">
            <span className="text-accent">SECOND BRAIN</span>
            <span className="text-text-secondary ml-2">Revenue increased 23% YoY, driven primarily by enterprise segment growth of 41%...</span>
          </div>
        </div>
      ),
    },
    {
      span: 'col-span-1 md:col-span-5',
      label: 'TRANSPARENCY',
      title: 'Source citations',
      desc: 'Every answer links back to the exact chunks it was derived from.',
      extra: (
        <div className="mt-5 space-y-2">
          {[{ file: 'Q3-Report.pdf', chunk: 'chunk 14', score: 0.94 }, { file: 'Q3-Report.pdf', chunk: 'chunk 7', score: 0.87 }].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-sm border border-border-subtle bg-surface-sunken">
              <span className="font-mono text-[11px] text-text-secondary">{s.file} -- {s.chunk}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 rounded-sm bg-border-subtle overflow-hidden">
                  <div className="h-full bg-accent rounded-sm" style={{ width: `${s.score * 100}%` }} />
                </div>
                <span className="font-mono text-[10px] text-text-tertiary">{s.score}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      span: 'col-span-1 md:col-span-4',
      label: 'SCALE',
      title: 'Multi-document',
      desc: 'Query across your entire knowledge base or scope to specific files.',
      extra: (
        <div className="mt-5 font-mono text-center">
          <p className="text-[28px] font-semibold text-text-primary tracking-tight">23 <span className="text-[14px] text-text-tertiary">docs</span></p>
          <p className="text-[14px] text-text-tertiary mt-1">184k vectors</p>
        </div>
      ),
    },
    {
      span: 'col-span-1 md:col-span-4',
      label: 'SECURITY',
      title: '30-day JWT sessions',
      desc: 'Secure token-based authentication with automatic expiry and refresh.',
      extra: (
        <div className="mt-5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-border-subtle rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-status-active rounded-sm"
              initial={{ width: '100%' }}
              animate={{ width: '35%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </div>
          <span className="font-mono text-[10px] text-text-tertiary shrink-0">11d remaining</span>
        </div>
      ),
    },
    {
      span: 'col-span-1 md:col-span-4',
      label: 'ISOLATION',
      title: 'Vector isolation',
      desc: 'Each user gets a fully isolated namespace. Zero data leakage between accounts.',
      extra: (
        <div className="mt-5 flex gap-3">
          {['User A', 'User B'].map((u, i) => (
            <div key={i} className={`flex-1 p-3 rounded-sm border text-center font-mono text-[11px] ${i === 0 ? 'border-border-emphasis text-text-secondary bg-surface-overlay' : 'border-border-subtle text-text-tertiary'}`}>
              {u}
              <div className="text-[9px] mt-1 text-text-tertiary">{i === 0 ? '42 vectors' : '18 vectors'}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      span: 'col-span-1 md:col-span-12',
      label: 'ARCHITECTURE',
      title: 'Processing pipeline',
      desc: 'From PDF upload to AI-generated answer in seven deterministic steps.',
      extra: (
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2">
          {PIPELINE_NODES.map((node, i) => (
            <div key={node} className="flex items-center shrink-0">
              <div className="px-3 py-1.5 font-mono text-[10px] text-text-tertiary border border-border-default rounded-sm bg-surface-sunken whitespace-nowrap">
                {node}
              </div>
              {i < PIPELINE_NODES.length - 1 && (
                <div className="w-4 border-t border-dashed border-border-default mx-1" />
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{ background: 'var(--surface-base)' }}
    >
      {/* NAVBAR */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border-subtle flex items-center"
        style={{ background: 'rgba(13,13,15,0.96)' }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-16 flex items-center justify-between">
          <span className="font-mono text-[13px] font-medium tracking-[0.12em] text-text-primary">
            SECOND BRAIN
          </span>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="text-[12px] font-medium tracking-[0.02em] uppercase text-text-secondary hover:text-text-primary"
                style={{ transition: 'color 120ms ease' }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost text-[12px] uppercase tracking-[0.02em] px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-[12px] uppercase tracking-[0.02em] px-4 py-2"
            >
              Start Free
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            style={{ transition: 'color 120ms ease' }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={SPRING_SMOOTH}
              className="fixed top-0 right-0 z-50 h-full w-[260px] md:hidden border-l border-border-subtle bg-surface-base"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-border-subtle">
                <span className="text-meta">MENU</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-text-tertiary hover:text-text-primary" style={{ transition: 'color 120ms ease' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 py-5 space-y-1">
                {NAV_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleMobileNavClick(link.href); }}
                    className="block px-3 py-3 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-overlay rounded-sm"
                    style={{ transition: 'all 120ms ease' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 space-y-2 border-t border-border-subtle pt-5">
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} className="w-full btn-ghost text-[12px] uppercase tracking-[0.02em]">Sign In</button>
                <button onClick={() => { setIsMobileMenuOpen(false); navigate('/signup'); }} className="w-full btn-primary text-[12px] uppercase tracking-[0.02em]">Start Free</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-14 px-6 md:px-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.08, 0.08)}
          className="max-w-[780px] mx-auto text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-[36px] md:text-[48px] leading-[1.08] font-semibold tracking-[-0.03em] text-text-primary mb-6"
          >
            Your documents.
            <br />
            Precisely recalled.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-[14px] md:text-[16px] leading-relaxed text-text-secondary max-w-[52ch] mx-auto mb-10"
          >
            Upload PDFs, ask questions in plain language, and get{' '}
            <span className="text-accent">instant AI-powered answers</span>{' '}
            with source citations — so you never lose track of what matters.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              onClick={() => window.location.href = `${API_URL}/api/auth/google`}
              className="btn-primary text-[13px] px-6 py-3 gap-3"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
              Continue with Google
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              onClick={() => navigate('/login')}
              className="btn-ghost text-[13px] px-6 py-3"
            >
              Sign in with Email
            </motion.button>
          </motion.div>

          <motion.p variants={fadeIn} className="text-meta">
            USED BY 1,200+ RESEARCHERS & ENGINEERS
          </motion.p>
        </motion.div>

        <PipelineDiagram activeIndex={activePipelineNode} />
      </section>

      <hr className="border-border-subtle" />

      {/* BENTO GRID — FEATURES */}
      <section id="why" className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-[1080px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger(0.05, 0.06)}
            className="mb-14"
          >
            <motion.p variants={fadeUp} className="text-meta mb-3">CAPABILITIES</motion.p>
            <motion.h2 variants={fadeUp} className="text-[22px] md:text-[32px] font-semibold tracking-[-0.025em] text-text-primary">
              Everything you need to learn faster
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger(0.04, 0.06)}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {bentoFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className={`${feat.span} bg-surface-raised border border-border-default rounded-md p-8 hover:border-border-emphasis`}
                style={{ transition: 'border-color 180ms ease' }}
              >
                <p className="text-meta mb-2">{feat.label}</p>
                <h3 className="text-[15px] font-medium tracking-[-0.01em] text-text-primary mb-2">{feat.title}</h3>
                <p className="text-[14px] leading-relaxed text-text-secondary">{feat.desc}</p>
                {feat.extra}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* SOCIAL PROOF BAR */}
      <div className="h-16 flex items-center justify-center border-b border-border-subtle px-6">
        <div className="flex items-center gap-6 font-mono text-[12px] text-text-tertiary tracking-wide">
          {['Stanford NLP Lab', 'MIT CSAIL', 'OpenAI Research', 'DeepMind', 'Meta FAIR'].map((name, i) => (
            <span key={i} className="flex items-center gap-6">
              {i > 0 && <span className="text-border-subtle">·</span>}
              <span>{name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 px-6 md:px-16">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <p className="text-meta mb-3">SUPPORT</p>
              <h2 className="text-[22px] md:text-[32px] font-semibold tracking-[-0.025em] text-text-primary">
                Frequently asked questions
              </h2>
            </div>
          </div>
          <div className="md:col-span-8">
            {faqs.map((faq, idx) => (
              <FAQItem
                key={idx}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === idx}
                onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      <hr className="border-border-subtle" />

      {/* FOOTER */}
      <footer className="py-12 md:py-16 px-6 md:px-16">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <span className="font-mono text-[13px] font-medium tracking-[0.12em] text-text-primary">SECOND BRAIN</span>
              <p className="text-[13px] text-text-secondary mt-4 leading-relaxed max-w-[260px]">
                Your AI-powered knowledge assistant. Upload documents, ask questions, and get instant answers.
              </p>
            </div>
            {[
              { title: 'PRODUCT', links: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Features', href: '#why' }, { label: 'FAQ', href: '#faq' }] },
              { title: 'ACCOUNT', links: [{ label: 'Sign In', href: '/login' }, { label: 'Register', href: '/signup' }, { label: 'Profile', href: '/profile' }] },
              { title: 'LEGAL', links: [{ label: 'Terms', href: '#' }, { label: 'Privacy', href: '#' }, { label: 'Cookies', href: '#' }] },
            ].map((group) => (
              <div key={group.title}>
                <p className="text-meta mb-4">{group.title}</p>
                <ul className="space-y-3">
                  {group.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[13px] text-text-secondary hover:text-text-primary"
                        style={{ transition: 'color 120ms ease' }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-meta text-text-tertiary">&copy; 2026 Second Brain. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default LandingPage;
