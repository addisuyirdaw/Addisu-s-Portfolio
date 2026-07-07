import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiService } from '../../infrastructure/gateways';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

interface MessageLog {
  sender: 'user' | 'bot';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageLog[]>([
    { sender: 'bot', text: 'Hello! I am Addisu\'s AI Assistant. Ask me anything about his qualifications, projects, or how to contact him.' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPills = [
    'Tell me about Addisu',
    'Explain MyHealthID',
    'Explain EduAudio',
    'Download Resume',
    'Contact Addisu'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    // Add user message
    const userMsg = textToSend.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Query the AI Service
      const answer = await aiService.askQuestion(userMsg, {});
      setMessages(prev => [...prev, { sender: 'bot', text: answer }]);
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: 'Sorry, I encountered an issue connecting to the AI helper. Please try again later!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Icon */}
      <button 
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          padding: 0,
          zIndex: 90,
          boxShadow: '0 8px 30px var(--accent-glow)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Career Helper"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Floating Sidebar Chatbox Drawer */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '360px',
            height: '480px',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--accent-gradient)',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={18} />
              <span style={{ fontWeight: 700, fontFamily: 'var(--font-header)', fontSize: '0.95rem' }}>{t('aiTitle')}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Scroll Box */}
          <div 
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: msg.sender === 'user' ? 'var(--accent-gradient)' : 'var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: msg.sender === 'user' ? '#fff' : 'hsl(var(--text-secondary))',
                    flexShrink: 0
                  }}
                >
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                <div 
                  style={{
                    background: msg.sender === 'user' ? 'var(--accent-glow)' : 'var(--bg-glass-active)',
                    border: '1px solid var(--border-glass)',
                    padding: '10px 12px',
                    borderRadius: msg.sender === 'user' ? '12px 0 12px 12px' : '0 12px 12px 12px',
                    fontSize: '0.85rem',
                    color: 'hsl(var(--text-primary))',
                    wordBreak: 'break-word',
                    lineHeight: '1.4'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'hsl(var(--text-muted))', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={14} />
                <span>Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick pills */}
          <div 
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid var(--border-glass)',
              whiteSpace: 'nowrap',
              background: 'var(--bg-glass)'
            }}
          >
            {quickPills.map(pill => (
              <button
                key={pill}
                onClick={() => handleSend(pill)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass-hover)',
                  background: 'var(--bg-glass-active)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  color: 'hsl(var(--text-secondary))'
                }}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            style={{
              padding: '12px',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              gap: '8px',
              background: 'var(--bg-glass)'
            }}
          >
            <input
              type="text"
              placeholder={t('aiPlaceholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: 'var(--bg-glass-active)',
                border: '1px solid var(--border-glass-hover)',
                borderRadius: '8px',
                color: 'hsl(var(--text-primary))',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '8px 12px', borderRadius: '8px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

