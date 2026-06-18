// PLAN: ChatInterface.jsx
// - Layout tree: flex-col h-full → Header (h-12) → Messages (flex-1 scroll) → Input bar (border-top)
// - State: messages, input, loading, savedMessageIndices, seeded prompts
// - Motion: fadeUp (messages), fadeIn (skeleton), SPRING_SNAPPY (send button), AnimatePresence (error)
// - Key constraints: No bubble backgrounds, plain text blocks with border-bottom. No typing dots. No avatar circles. No emoji. Mono source chips.
// END PLAN

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import { ArrowUp, FileText, Trash2, X, AlertTriangle, RefreshCw, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, fadeIn, SPRING_SNAPPY, SPRING_SMOOTH } from '../lib/motion';

const ChatInterface = ({ documentId, documentName, documentIds, onClearDocument }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Upload a PDF and ask me anything about it.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedMessageIndices, setSavedMessageIndices] = useState(new Set());

  const userId = user?._id;

  const handleSaveHighlight = async (msg, index) => {
    try {
      await api.post('/api/highlights', {
        documentName: documentName || 'General',
        aiExcerpt: msg.content,
        sourceChunk: msg.sources?.[0]?.snippet || '',
      });
      setSavedMessageIndices(prev => new Set([...prev, index]));
    } catch (error) {
      // Silently fail — non-critical feature
    }
  };

  useEffect(() => {
    if (documentId && userId) {
      const savedHistory = localStorage.getItem(`chatHistory_${userId}_${documentId}`);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
        setMessages([
          { role: 'assistant', content: 'Ask me anything about this document.' }
        ]);
      }
    }
  }, [documentId, userId]);

  useEffect(() => {
    if (documentId && userId && messages.length > 0) {
      localStorage.setItem(`chatHistory_${userId}_${documentId}`, JSON.stringify(messages));
    }
  }, [messages, documentId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  }, [input]);

  const handleClearChat = () => {
    if (documentId && userId) {
      localStorage.removeItem(`chatHistory_${userId}_${documentId}`);
      setMessages([
        { role: 'assistant', content: 'Chat history cleared. Ask me anything.' }
      ]);
    }
  };

  const handleSend = async (e, retryContent = null) => {
    if (e) e.preventDefault();
    const messageContent = retryContent || input.trim();
    if (!messageContent) return;

    if (!user) { navigate('/login'); return; }

    const userMessage = { role: 'user', content: messageContent };
    if (!retryContent) {
      setMessages(prev => [...prev, userMessage]);
    }
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', {
        question: messageContent,
        history: [],
        documentId,
        documentIds: documentIds || undefined
      });

      const aiMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const status = error.response?.status;
      let errorType = 'generic';
      let errorMessage = 'Something went wrong. Click Retry to try again.';

      if (status === 504 || error.message?.includes('timeout')) {
        errorType = 'timeout';
        errorMessage = 'AI took too long to respond. Click Retry.';
      } else if (status === 429) {
        errorType = 'rate_limit';
        errorMessage = 'Rate limit reached. Wait a moment, then retry.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: null,
        error: true,
        errorType,
        errorMessage,
        retryContent: messageContent
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleRetry = (retryContent) => {
    setMessages(prev => prev.filter(m => !m.error || m.retryContent !== retryContent));
    handleSend(null, retryContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const seededPrompts = documentId
    ? [
        'Summarize the key points of this document',
        'What are the main topics covered?',
        'What are the most important takeaways?',
      ]
    : [
        'Upload a PDF to get started',
        'Ask about any indexed document',
        'Query across multiple files at once',
      ];

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div
        className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-border-subtle"
      >
        <div className="flex items-center gap-2">
          {documentId ? (
            <div
              className="flex items-center gap-2 h-[26px] px-2 rounded-sm border border-border-default"
              style={{ background: 'var(--surface-overlay)' }}
            >
              <FileText size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-[13px] text-text-primary truncate" style={{ maxWidth: '200px' }}>
                {documentName || 'Document'}
              </span>
              <button
                onClick={onClearDocument}
                className="text-text-tertiary hover:text-text-primary ml-1"
                style={{ transition: 'color 120ms ease' }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <span className="text-[13px] text-text-tertiary italic">All documents</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {documentId && (
            <button
              onClick={handleClearChat}
              className="text-meta text-[10px] text-text-tertiary hover:text-text-primary"
              style={{ transition: 'color 120ms ease' }}
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-4 md:px-6">
        {/* Seeded prompts */}
        {messages.length <= 1 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="mt-6"
          >
            <p className="text-meta mb-3">
              {documentId ? 'TRY ASKING' : 'GET STARTED'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {seededPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (documentId) {
                      setInput(prompt);
                      setTimeout(() => handleSend(null, prompt), 50);
                    }
                  }}
                  disabled={!documentId}
                  className="text-left p-3 rounded border border-border-subtle text-[13px] text-text-secondary hover:border-border-emphasis hover:text-text-primary disabled:opacity-40 disabled:cursor-default"
                  style={{ background: 'var(--surface-raised)', transition: 'all 120ms ease' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className="py-4 border-b border-border-subtle"
          >
            {/* Error message */}
            {msg.error ? (
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} style={{ color: 'var(--status-error)', marginTop: 2 }} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-[14px] text-text-primary">{msg.errorMessage}</p>
                  <button
                    onClick={() => handleRetry(msg.retryContent)}
                    className="mt-2 btn-ghost text-[11px] uppercase tracking-[0.02em] px-3 py-1 gap-1.5"
                    style={{ color: 'var(--status-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    <RefreshCw size={11} />
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Label */}
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === 'user' ? (
                    <span className="text-meta">YOU</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
                      <span className="text-meta">SECOND BRAIN</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`text-[14px] leading-relaxed max-w-[68ch] relative group/msg ${msg.role === 'user' ? 'text-text-primary' : 'text-text-primary'}`}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-text-secondary">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                      code: ({ children }) => <code className="font-mono text-[12px] px-1 py-0.5 rounded-sm bg-surface-overlay text-text-secondary">{children}</code>,
                      pre: ({ children }) => <pre className="font-mono text-[12px] p-3 rounded border border-border-subtle bg-surface-sunken overflow-x-auto mb-3">{children}</pre>,
                      h1: ({ children }) => <h1 className="text-[18px] font-semibold text-text-primary mt-4 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-[16px] font-medium text-text-primary mt-3 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-[15px] font-medium text-text-primary mt-2 mb-1">{children}</h3>,
                    }}
                  >
                    {msg.content || ''}
                  </ReactMarkdown>

                  {/* Bookmark button — AI messages only */}
                  {msg.role === 'assistant' && msg.content && (
                    <button
                      onClick={() => handleSaveHighlight(msg, index)}
                      className="absolute top-0 right-0 p-1 rounded opacity-0 group-hover/msg:opacity-100"
                      style={{
                        color: savedMessageIndices.has(index) ? 'var(--accent)' : 'var(--text-tertiary)',
                        transition: 'all 120ms ease',
                      }}
                      title={savedMessageIndices.has(index) ? 'Saved' : 'Save to highlights'}
                    >
                      <Bookmark size={14} className={savedMessageIndices.has(index) ? 'fill-current' : ''} />
                    </button>
                  )}
                </div>

                {/* Source citations — horizontal chips */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.sources.map((src, srcIdx) => (
                      <span
                        key={srcIdx}
                        className="font-mono text-[12px] px-2 py-1 rounded-sm border border-border-subtle text-text-tertiary hover:border-border-emphasis hover:text-text-secondary"
                        style={{ background: 'var(--surface-raised)', transition: 'all 120ms ease' }}
                      >
                        {src.filename} -- chunk {srcIdx + 1}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Skeleton loading */}
        {loading && (
          <div className="py-4 border-b border-border-subtle">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="text-meta">SECOND BRAIN</span>
            </div>
            <div className="space-y-2">
              <div className="h-[14px] w-[80%] rounded-sm shimmer" />
              <div className="h-[14px] w-[55%] rounded-sm shimmer" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="shrink-0 border-t border-border-subtle px-4 py-3">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            ref={(el) => { textareaRef.current = el; inputRef.current = el; }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 font-mono text-[13px] leading-relaxed resize-none rounded border border-border-subtle focus:border-border-emphasis outline-none px-3 py-2.5"
            style={{
              background: 'var(--surface-sunken)',
              color: 'var(--text-primary)',
              minHeight: '44px',
              maxHeight: '140px',
              transition: 'border-color 120ms ease',
            }}
            disabled={loading}
          />
          <motion.button
            type="submit"
            disabled={loading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-sm disabled:opacity-30"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-text)',
              transition: 'opacity 120ms ease',
            }}
          >
            <ArrowUp size={16} />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
