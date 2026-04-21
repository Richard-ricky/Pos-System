import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  UserPlus, AlertCircle, CheckCircle2, Wallet,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signUp } from '../../utils/api';

export function LoginScreen() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/wallet';

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
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name, 'cashier');
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
        setName('');
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
    setMode(m);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-purple-600/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg mb-4">
            <Wallet className="size-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">FinTech Wallet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Payments Made Simple</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-xl p-6">

          {/* Mode heading */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Join and start transacting instantly'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-surface-3 rounded-xl p-1 mb-5">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={[
                  'flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200',
                  mode === m
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-destructive text-xs leading-relaxed">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle2 className="size-4 text-success mt-0.5 shrink-0" />
              <p className="text-success text-xs leading-relaxed">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Name — signup only */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-input-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-violet-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Switch mode link */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 mt-5 text-muted-foreground text-xs">
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