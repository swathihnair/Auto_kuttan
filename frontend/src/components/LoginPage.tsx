import { useState } from 'react';
import CheckeredBackground from './CheckeredBackground';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/chat';
  };

  return (
    <>
      <CheckeredBackground />
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        background: 'transparent'
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px', 
          boxShadow: '0 20px 60px rgba(255, 182, 193, 0.3)', 
          padding: '48px', 
          width: '100%', 
          maxWidth: '440px',
          border: '1px solid rgba(255, 182, 193, 0.3)'
        }}>
          
          {/* Logo */}
          <div style={{ position: 'relative', width: '72px', margin: '0 auto 24px' }}>
            <div style={{ 
              width: '72px', 
              height: '72px', 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)'
            }}>
              <RobotIcon size={38} />
            </div>
            {/* Sparkles */}
            <div style={{ position: 'absolute', top: '-6px', right: '4px' }}>
              <Sparkle size={14} delay={0} />
            </div>
            <div style={{ position: 'absolute', top: '8px', left: '-6px' }}>
              <Sparkle size={10} delay={0.5} />
            </div>
            <div style={{ position: 'absolute', bottom: '6px', right: '-4px' }}>
              <Sparkle size={12} delay={1} />
            </div>
          </div>
          
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Auto Kuttan
            </h1>
          </div>
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '15px', marginBottom: '36px' }}>
            Your intelligent AI assistant
          </p>
          
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 182, 193, 0.3)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f9a8d4';
                  e.target.style.boxShadow = '0 0 0 3px rgba(249, 168, 212, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 182, 193, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 182, 193, 0.3)',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: '#1f2937'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f9a8d4';
                  e.target.style.boxShadow = '0 0 0 3px rgba(249, 168, 212, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 182, 193, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize: '15px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Sign in
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </form>
          
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255, 182, 193, 0.3)' }}></div>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>or</span>
            <div style={{ height: '1px', flex: 1, background: 'rgba(255, 182, 193, 0.3)' }}></div>
          </div>
          
          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
            New here? <a href="#" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>Create account</a>
          </p>
        </div>
      </div>
      
      <style>{`
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
        ::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </>
  );
}
