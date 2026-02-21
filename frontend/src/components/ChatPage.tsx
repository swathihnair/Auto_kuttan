import { useState, useRef, useEffect } from 'react';
import CheckeredBackground from './CheckeredBackground';

const BASE_URL = 'http://localhost:8000';

interface Message {
  text: string;
  isUser: boolean;
  icon?: 'download' | 'email' | 'success';
}

const RobotIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="7" y="9" width="10" height="8" rx="2" fill="white" opacity="0.95"/>
    <line x1="12" y1="9" x2="12" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="5" r="1" fill="white"/>
    <circle cx="10" cy="12" r="1.2" fill="#1e3a8a"/>
    <circle cx="10" cy="12" r="0.6" fill="white"/>
    <circle cx="14" cy="12" r="1.2" fill="#1e3a8a"/>
    <circle cx="14" cy="12" r="0.6" fill="white"/>
    <rect x="9" y="17" width="6" height="2" rx="1" fill="white" opacity="0.8"/>
  </svg>
);

const Sparkle = ({ delay = 0, size = 12 }: { delay?: number; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="#60a5fa"
    style={{ animation: `sparkle 2s infinite ${delay}s` }}
  >
    <path d="M12 0l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/>
  </svg>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const triggerDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `${BASE_URL}/download/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { text, isUser: true }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${BASE_URL}/fetcher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.download_available && data.filename) {
        setMessages(prev => [...prev, { 
          text: `Downloading "${data.filename}" from Google Drive...`,
          isUser: false,
          icon: 'download'
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: 'Download complete!',
            isUser: false,
            icon: 'success'
          }]);
        }, 1500);
        
        triggerDownload(data.filename);
      } else {
        setMessages(prev => [...prev, { text: data.result, isUser: false }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: 'Sorry, something went wrong. Please try again.', 
        isUser: false 
      }]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages(prev => [...prev, { text: `Upload ${file.name}`, isUser: true }]);
    setIsTyping(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BASE_URL}/organizer`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.status === 'completed') {
        setMessages(prev => [...prev, { 
          text: `File "${file.name}" organized successfully!`,
          isUser: false,
          icon: 'success'
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: data.message || data.result || data.status || JSON.stringify(data), 
          isUser: false 
        }]);
      }
    } catch (error: any) {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: `Failed to upload: ${error.message}`, 
        isUser: false 
      }]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIcon = (icon?: string) => {
    if (icon === 'download') {
      return (
        <svg style={{ width: '18px', height: '18px', color: '#60a5fa', marginRight: '10px', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      );
    }
    if (icon === 'success') {
      return (
        <svg style={{ width: '18px', height: '18px', color: '#4ade80', marginRight: '10px', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <>
      <CheckeredBackground />
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        display: 'flex', 
        flexDirection: 'column',
        background: 'transparent',
        zIndex: 10 
      }}>
        {/* Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 32px',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'transparent',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.7), 0 0 50px rgba(59, 130, 246, 0.3)'
              }}>
                <RobotIcon size={24} />
              </div>
              <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
                <Sparkle size={14} delay={0} />
              </div>
              <div style={{ position: 'absolute', bottom: '-4px', left: '-6px' }}>
                <Sparkle size={10} delay={0.7} />
              </div>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Auto Kuttan
            </h1>
          </div>
          <a href="/" style={{ 
            padding: '10px', 
            borderRadius: '10px', 
            display: 'flex',
            color: '#94a3b8',
            transition: 'all 0.2s',
            border: '1px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}>
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </a>
        </header>

        {/* Messages */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
          {messages.length === 0 ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              textAlign: 'center'
            }}>
              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 0 60px rgba(59, 130, 246, 0.6), 0 0 100px rgba(59, 130, 246, 0.3)',
                  animation: 'pulse 3s ease-in-out infinite'
                }}>
                  <RobotIcon size={50} />
                </div>
                <div style={{ position: 'absolute', top: '-10px', right: '5px' }}>
                  <Sparkle size={18} delay={0} />
                </div>
                <div style={{ position: 'absolute', top: '15px', left: '-10px' }}>
                  <Sparkle size={14} delay={0.5} />
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '-8px' }}>
                  <Sparkle size={16} delay={1} />
                </div>
              </div>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#f1f5f9',
                marginBottom: '16px',
                letterSpacing: '-0.03em'
              }}>
                Welcome to Auto Kuttan
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '500px' }}>
                Your intelligent AI assistant for file management and automation
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flexDirection: msg.isUser ? 'row-reverse' : 'row' }}>
                  {!msg.isUser && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                      }}>
                        <RobotIcon size={22} />
                      </div>
                    </div>
                  )}
                  <div style={{ 
                    maxWidth: msg.isUser ? '70%' : '85%',
                    padding: '16px 22px', 
                    borderRadius: '18px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    background: msg.isUser 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                      : 'rgba(30, 41, 59, 0.85)',
                    color: '#f1f5f9',
                    border: msg.isUser ? 'none' : '1px solid rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: msg.isUser 
                      ? '0 4px 16px rgba(59, 130, 246, 0.4)'
                      : '0 2px 12px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {getIcon(msg.icon)}
                    <span>{msg.text}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                  }}>
                    <RobotIcon size={22} />
                  </div>
                  <div style={{ 
                    padding: '16px 22px', 
                    borderRadius: '18px',
                    background: 'rgba(30, 41, 59, 0.85)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', 
                    gap: '6px'
                  }}>
                    <span style={{ width: '8px', height: '8px', background: '#60a5fa', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#60a5fa', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#60a5fa', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input */}
        <div style={{ 
          padding: '24px 32px 32px', 
          borderTop: '1px solid rgba(59, 130, 246, 0.2)',
          background: 'transparent',
          backdropFilter: 'blur(10px)'
        }}>
          <form onSubmit={handleSubmit} style={{ 
            maxWidth: '900px', 
            margin: '0 auto',
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px', 
            padding: '18px 24px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What task should I do for you?"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                color: '#f1f5f9',
                placeholder: '#64748b'
              }}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              }}
            >
              <svg style={{ width: '18px', height: '18px', color: '#60a5fa' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button type="submit" style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.7)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
            }}>
              <svg style={{ width: '20px', height: '20px', color: 'white' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        @keyframes sparkle {
          0%, 100% { 
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% { 
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 60px rgba(59, 130, 246, 0.6), 0 0 100px rgba(59, 130, 246, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 80px rgba(59, 130, 246, 0.8), 0 0 120px rgba(59, 130, 246, 0.4);
          }
        }
        ::placeholder {
          color: #64748b;
        }
      `}</style>
    </>
  );
}
