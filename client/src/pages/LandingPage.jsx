import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageSquare, Upload, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import DeepSpaceBackground from '../components/DeepSpaceBackground';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen text-white relative overflow-x-hidden font-sans selection:bg-indigo-500/30"
        >
            <DeepSpaceBackground />

            {/* --- Navigation --- */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center space-x-3">
                    <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-brain-primary/20 ring-1 ring-white/10" />
                    <span className="text-xl font-display font-bold tracking-tight">Second Brain</span>
                </div>
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="group relative px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-slate-100 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                    >
                        <span>Get Started</span>
                        <ArrowRight className="inline-block w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <main className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Copy */}
                    <div className="space-y-10 animate-fadeIn">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            <span className="text-sm font-medium text-slate-300">v2.0 Now Available</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            Your Personal <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-indigo-300 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                Intelligence
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                            Stop organizing. Start thinking. Upload your documents and chat with a second brain that remembers everything for you.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Try the Demo
                            </button>
                            <button
                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold backdrop-blur-md transition-all text-lg"
                            >
                                View Features
                            </button>
                        </div>

                        <div className="pt-8 flex items-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                                <span>Powered by Gemini</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual (Abstract 3D Representation) */}
                    <div className="relative hidden lg:block">
                        {/* Abstract Floating Cards / UI */}
                        <div className="relative z-10 grid gap-6 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out shadow-2xl shadow-indigo-500/10">
                            {/* Fake UI Elements */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700/50"></div>
                                    <div className="space-y-2">
                                        <div className="w-24 h-3 rounded-full bg-slate-700/50"></div>
                                        <div className="w-16 h-2 rounded-full bg-slate-800/50"></div>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4 items-start">
                                    <MessageSquare className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                                    <div className="space-y-2 w-full">
                                        <div className="w-3/4 h-3 rounded-full bg-slate-700/50"></div>
                                        <div className="w-1/2 h-3 rounded-full bg-slate-700/50"></div>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-600/20 rounded-xl border border-indigo-500/30 flex gap-4 items-start">
                                    <Zap className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
                                    <div className="space-y-2 w-full">
                                        <div className="w-5/6 h-3 rounded-full bg-indigo-400/30"></div>
                                        <div className="w-2/3 h-3 rounded-full bg-indigo-400/30"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating decorative elements */}
                        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full blur-[60px] opacity-60 animate-bounce delay-1000"></div>
                        <div className="absolute bottom-[-50px] left-[-30px] w-40 h-40 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-[80px] opacity-60 animate-pulse"></div>
                    </div>
                </div>
            </main>

            {/* --- Features Section --- */}
            <section id="features" className="relative z-10 py-32 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Built for <span className="text-brain-primary">Maximum Recall</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Our architecture is designed to handle thousands of documents with sub-second retrieval times.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 text-brain-primary" />,
                                title: "Instant Ingestion",
                                desc: "Upload PDFs, DOCX, or TXT files. We parse and index them in milliseconds."
                            },
                            {
                                icon: <MessageSquare className="w-6 h-6 text-brain-secondary" />,
                                title: "Contextual Chat",
                                desc: "Ask questions naturally. The AI understands context and cites its sources."
                            },
                            {
                                icon: <CheckCircle2 className="w-6 h-6 text-green-400" />,
                                title: "Secure by Design",
                                desc: "Your data is encrypted at rest and in transit. Private access only."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-brain-primary/30 transition-colors group">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- How It Works Section --- */}
            <section id="how-it-works" className="relative z-10 py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                                Connect your data.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brain-primary to-brain-secondary">We handle the rest.</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Upload Documents", desc: "Drag and drop your knowledge base." },
                                    { step: "02", title: "AI Indexing", desc: "We convert text into vector embeddings." },
                                    { step: "03", title: "Start Querying", desc: "Get instant answers with citations." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6">
                                        <div className="text-3xl font-display font-bold text-white/10">{item.step}</div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                                            <p className="text-slate-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-brain-primary to-brain-secondary blur-[100px] opacity-20"></div>
                            <div className="relative glass-panel p-8 rounded-2xl border border-white/10 bg-black/40">
                                <pre className="font-mono text-xs md:text-sm text-slate-300 overflow-x-auto">
                                    <span className="text-brain-primary">const</span> <span className="text-brain-secondary">query</span> = <span className="text-green-400">"Summarize Q3 report"</span>;{"\n"}
                                    <span className="text-slate-500">// Searching vector database...</span>{"\n"}
                                    <span className="text-brain-primary">await</span> brain.recall(query);{"\n\n"}
                                    <span className="text-slate-500">{`> Found 3 relevant chunks`}</span>{"\n"}
                                    <span className="text-slate-500">{`> Generating detailed response...`}</span>
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Pricing Section --- */}
            <section id="pricing" className="relative z-10 py-32 border-t border-white/5 bg-black/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Simple Pricing</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Start for free, upgrade when you need more power.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Tier */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-300 mb-2">Starter</h3>
                                <div className="text-4xl font-display font-bold">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['50 Documents', 'Basic Chat Support', '10MB File Limit', 'Community Support'].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <CheckCircle2 className="w-5 h-5 text-white/20" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold">Get Started</button>
                        </div>

                        {/* Pro Tier */}
                        <div className="p-8 rounded-3xl bg-brain-primary/10 border border-brain-primary/50 relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 px-4 py-1 bg-brain-primary text-brain-dark text-xs font-bold rounded-bl-xl">POPULAR</div>
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Pro Brain</h3>
                                <div className="text-4xl font-display font-bold">$29<span className="text-lg text-slate-400 font-normal">/mo</span></div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {['Unlimited Documents', 'GPT-4 Integration', '100MB File Limit', 'Priority Support', 'API Access'].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white">
                                        <CheckCircle2 className="w-5 h-5 text-brain-primary" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-brain-primary text-brain-dark hover:brightness-110 transition-all font-bold shadow-neon">Upgrade Now</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="relative z-10 py-12 border-t border-white/10 bg-black/40">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.jpg" alt="Logo" className="w-6 h-6 rounded-md opacity-80" />
                        <span className="text-slate-400 font-medium">Second Brain &copy; 2026 All rights reserved</span>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                </div>
            </footer>        </motion.div>
    );
};

export default LandingPage;
