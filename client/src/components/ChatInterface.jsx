import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatInterface = ({ documentId }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Second Brain. Upload a PDF and ask me anything about it.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Load messages from local storage when documentId changes
    useEffect(() => {
        if (documentId) {
            const savedHistory = localStorage.getItem(`chatHistory_${documentId}`);
            if (savedHistory) {
                setMessages(JSON.parse(savedHistory));
            } else {
                // Default welcome message for new document interaction
                setMessages([
                    { role: 'assistant', content: 'Hello! I am your Second Brain. Ask me anything about this document.' }
                ]);
            }
        }
    }, [documentId]);

    // Save messages to local storage whenever they change
    useEffect(() => {
        if (documentId && messages.length > 0) {
            localStorage.setItem(`chatHistory_${documentId}`, JSON.stringify(messages));
        }
    }, [messages, documentId]);

    const handleClearChat = () => {
        if (documentId) {
            localStorage.removeItem(`chatHistory_${documentId}`);
            setMessages([
                { role: 'assistant', content: 'Chat history cleared. Ask me anything about this document.' }
            ]);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (!user) {
            navigate('/login');
            return;
        }

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/api/chat', {
                question: userMessage.content,
                history: [],
                documentId
            });

            const aiMessage = {
                role: 'assistant',
                content: data.answer,
                sources: data.sources
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while trying to think. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative">
            {/* Header with Clear Button */}
            {documentId && (
                <div className="absolute top-4 right-6 z-10">
                    <button
                        onClick={handleClearChat}
                        className="text-xs text-white/30 hover:text-white/80 transition-colors uppercase tracking-wider font-bold"
                    >
                        Clear Memory
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 custom-scrollbar pt-12">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
                            <div className={`p-2.5 rounded-xl shadow-lg shrink-0 ${msg.role === 'user' ? 'bg-brain-primary text-brain-dark' : 'bg-white/10 text-brain-primary border border-white/5'}`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            <div className={`p-5 rounded-2xl shadow-sm backdrop-blur-sm ${msg.role === 'user'
                                ? 'bg-brain-primary/10 border border-brain-primary/20 text-white rounded-tr-none shadow-[0_0_15px_rgba(0,224,255,0.1)]'
                                : 'bg-white/5 border border-white/10 text-brain-text-secondary rounded-tl-none'
                                }`}>
                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-code:bg-black/50 prose-code:rounded prose-code:px-1 prose-a:text-brain-primary hover:prose-a:text-brain-primary-dark">
                                    <ReactMarkdown>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <p className="text-xs font-bold text-brain-text-secondary/70 mb-2 flex items-center uppercase tracking-wider">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brain-primary mr-2 shadow-neon"></span>
                                            Verified Sources
                                        </p>
                                        <ul className="space-y-1.5">
                                            {msg.sources.map((src, idx) => (
                                                <li key={idx} className="text-xs text-brain-text-secondary/60 hover:text-brain-primary transition-colors flex items-center gap-2 cursor-pointer group">
                                                    <FileText size={12} className="text-white/20 group-hover:text-brain-primary transition-colors" />
                                                    <span className="truncate">{src.filename}</span>
                                                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/30">{Math.round(src.score * 100)}% Match</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl rounded-tl-none border border-white/10 ml-16 shadow-lg">
                            <div className="flex space-x-1.5">
                                <span className="w-2 h-2 bg-brain-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-brain-secondary rounded-full animate-bounce"></span>
                            </div>
                            <span className="text-xs text-brain-text-secondary font-medium tracking-wide">PROCESSING...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-brain-dark/30 border-t border-white/5 backdrop-blur-md">
                <div className="relative flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Query your Neural Network..."
                        className="w-full bg-white/5 text-white placeholder-white/30 border border-white/10 rounded-xl py-4 pl-5 pr-14 focus:border-brain-primary/50 focus:ring-1 focus:ring-brain-primary/50 focus:bg-white/10 transition-all outline-none"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2.5 bg-brain-primary text-brain-dark rounded-lg hover:shadow-neon hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
                    >
                        {loading ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
                {!user && (
                    <p className="text-center text-xs text-brain-text-secondary/50 mt-3">
                        <span className="cursor-pointer hover:text-brain-primary transition-colors underline decoration-brain-primary/30" onClick={() => navigate('/login')}>Initialize session</span> to access memory banks.
                    </p>
                )}
            </form>
        </div>
    );
};


export default ChatInterface;
