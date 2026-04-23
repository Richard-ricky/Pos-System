import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  UserPlus, AlertCircle, CheckCircle2, Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signUp } from '../../utils/api';

// ─── Liquid Glass CSS ─────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  .login-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: #04040a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    position: relative;
    overflow: hidden;
  }

  /* Animated orbs */
  .login-orb-1 {
    position: absolute;
    width: 480px; height: 480px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%);
    top: -120px; left: -120px;
    filter: blur(60px);
    animation: orbDrift1 12s ease-in-out infinite;
    pointer-events: none;
  }
  .login-orb-2 {
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 70%);
    bottom: -100px; right: -80px;
    filter: blur(60px);
    animation: orbDrift2 14s ease-in-out infinite;
    pointer-events: none;
  }
  .login-orb-3 {
    position: absolute;
    width: 280px; height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    filter: blur(50px);
    animation: orbDrift3 10s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes orbDrift1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(40px, 30px) scale(1.08); }
    66%      { transform: translate(-20px, 50px) scale(0.95); }
  }
  @keyframes orbDrift2 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(-30px,-40px) scale(1.06); }
    66%      { transform: translate(20px,-20px) scale(0.97); }
  }
  @keyframes orbDrift3 {
    0%,100% { transform: translate(-50%,-50%) scale(1); }
    50%      { transform: translate(-50%,-50%) scale(1.3); }
  }

  /* Grid overlay */
  .login-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* iOS liquid glass card */
  .lg-card-login {
    background: linear-gradient(
      145deg,
      rgba(255,255,255,0.11) 0%,
      rgba(255,255,255,0.05) 40%,
      rgba(255,255,255,0.09) 100%
    );
    backdrop-filter: blur(40px) saturate(200%) brightness(1.08);
    -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.08);
    border: 1px solid rgba(255,255,255,0.16);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.08) inset,
      0 24px 64px rgba(0,0,0,0.55),
      0 1px 0 rgba(255,255,255,0.15) inset,
      0 -1px 0 rgba(0,0,0,0.25) inset;
    border-radius: 24px;
    padding: 28px;
    position: relative;
    overflow: hidden;
  }

  /* Inner top-edge specular shine */
  .lg-card-login::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    border-radius: 50%;
  }

  /* Subtle noise texture */
  .lg-card-login::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.5;
  }

  /* Toggle tab */
  .login-toggle {
    display: flex;
    gap: 4px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 4px;
    margin-bottom: 20px;
  }
  .login-tab {
    flex: 1;
    padding: 8px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    color: rgba(255,255,255,0.45);
    background: transparent;
  }
  .login-tab.active {
    background: linear-gradient(135deg, rgba(139,92,246,0.9), rgba(236,72,153,0.9));
    color: white;
    box-shadow: 0 2px 12px rgba(139,92,246,0.4), 0 1px 0 rgba(255,255,255,0.15) inset;
  }
  .login-tab:not(.active):hover { color: rgba(255,255,255,0.7); }

  /* Input */
  .lg-input {
    width: 100%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 11px 12px 11px 38px;
    color: #fff;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
    box-sizing: border-box;
  }
  .lg-input::placeholder { color: rgba(255,255,255,0.3); }
  .lg-input:focus {
    border-color: rgba(139,92,246,0.6);
    background: rgba(255,255,255,0.09);
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15), 0 0 0 0.5px rgba(139,92,246,0.4);
  }

  /* Submit button */
  .lg-submit {
    width: 100%;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.2);
    background: linear-gradient(135deg, rgba(139,92,246,0.95), rgba(236,72,153,0.95));
    color: white;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow:
      0 4px 20px rgba(139,92,246,0.45),
      0 1px 0 rgba(255,255,255,0.2) inset;
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    margin-top: 4px;
  }
  .lg-submit:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 8px 32px rgba(139,92,246,0.6), 0 1px 0 rgba(255,255,255,0.25) inset;
  }
  .lg-submit:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Alert */
  .lg-alert-error {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px; margin-bottom: 16px;
    border-radius: 14px;
    background: rgba(212,24,61,0.12);
    border: 1px solid rgba(212,24,61,0.25);
    backdrop-filter: blur(8px);
  }
  .lg-alert-success {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px; margin-bottom: 16px;
    border-radius: 14px;
    background: rgba(22,163,74,0.12);
    border: 1px solid rgba(22,163,74,0.25);
    backdrop-filter: blur(8px);
  }

  /* Label */
  .lg-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.55);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  /* Logo icon */
  .login-logo {
    width: 56px; height: 56px;
    border-radius: 18px;
    background: linear-gradient(135deg, #7c3aed, #db2777);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 8px 32px rgba(139,92,246,0.5), 0 1px 0 rgba(255,255,255,0.2) inset;
    margin: 0 auto 16px;
  }

  /* Fade in */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .login-card-wrap {
    width: 100%;
    max-width: 380px;
    position: relative;
    z-index: 10;
    animation: fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  /* Input icon wrapper */
  .input-wrap { position: relative; }
  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    width: 16px; height: 16px;
  }
  .input-icon-right {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.3);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .input-icon-right:hover { color: rgba(255,255,255,0.7); }

  /* Footer trust badges */
  .login-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 20px;
    color: rgba(255,255,255,0.2);
    font-size: 11px;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginScreen() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/app/wallet';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name, 'cashier');
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword(''); setName('');
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${mode === 'login' ? 'sign in' : 'sign up'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'signup') => {
    setMode(m); setError(''); setSuccess('');
  };

  return (
    <div className="login-root">
      <style>{CSS}</style>

      {/* Orbs */}
      <div className="login-orb-1" />
      <div className="login-orb-2" />
      <div className="login-orb-3" />
      <div className="login-grid" />

      <div className="login-card-wrap">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="login-logo">
            <Wallet size={26} color="white" />
          </div>
          <p style={{ color: 'white', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', margin: 0 }}>
            FinTech Wallet
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '2px 0 0' }}>
            Payments Made Simple
          </p>
        </div>

        {/* Glass card */}
        <div className="lg-card-login">

          {/* Heading */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ color: 'white', fontWeight: 600, fontSize: 17, margin: 0, letterSpacing: '-0.01em' }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '3px 0 0' }}>
              {mode === 'login' ? 'Sign in to access your dashboard' : 'Join and start transacting instantly'}
            </p>
          </div>

          {/* Toggle */}
          <div className="login-toggle">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`login-tab${mode === m ? ' active' : ''}`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="lg-alert-error">
              <AlertCircle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: '#f87171', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{error}</p>
            </div>
          )}
          {success && (
            <div className="lg-alert-success">
              <CheckCircle2 size={15} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: '#4ade80', fontSize: 12, margin: 0, lineHeight: 1.5 }}>{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Name */}
            {mode === 'signup' && (
              <div>
                <label className="lg-label">Full Name</label>
                <div className="input-wrap">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="lg-input"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="lg-label">Email Address</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="lg-input"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="lg-label">Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="lg-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-right"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'signup' && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 5 }}>
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="lg-submit">
              {isLoading ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : mode === 'login' ? (
                <><span>Sign In</span><ArrowRight size={16} /></>
              ) : (
                <><UserPlus size={16} /><span>Create Account</span></>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 18, marginBottom: 0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              style={{ color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: 0 }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer trust badges */}
        <div className="login-footer">
          <span>Supabase Auth</span>
          <span>·</span>
          <span>Paystack</span>
          <span>·</span>
          <span>256-bit SSL</span>
        </div>
      </div>
    </div>
  );
}