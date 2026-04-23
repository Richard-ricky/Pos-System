import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  Wallet, ShoppingCart, BarChart3, Shield,
  Zap, Smartphone, ArrowRight, CheckCircle,
  Globe, Lock, TrendingUp, ChevronDown,
} from 'lucide-react';

// ─── Liquid Glass CSS injected once ──────────────────────────────────────────

const GLASS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  .landing-root {
    font-family: 'DM Sans', sans-serif;
    background: #04040a;
    color: #f0f0f5;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .serif { font-family: 'Instrument Serif', serif; }

  /* Orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    will-change: transform;
  }

  /* Liquid glass panel */
  .lg-panel {
    background: linear-gradient(
      135deg,
      rgba(255,255,255,0.07) 0%,
      rgba(255,255,255,0.03) 50%,
      rgba(255,255,255,0.06) 100%
    );
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.05) inset,
      0 8px 40px rgba(0,0,0,0.4),
      0 1px 0 rgba(255,255,255,0.1) inset;
  }

  /* Liquid glass card — more depth */
  .lg-card {
    background: linear-gradient(
      145deg,
      rgba(255,255,255,0.09) 0%,
      rgba(255,255,255,0.04) 40%,
      rgba(255,255,255,0.07) 100%
    );
    backdrop-filter: blur(32px) saturate(200%) brightness(1.05);
    -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.05);
    border: 1px solid rgba(255,255,255,0.14);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.06) inset,
      0 12px 48px rgba(0,0,0,0.5),
      0 1px 0 rgba(255,255,255,0.12) inset,
      0 -1px 0 rgba(0,0,0,0.2) inset;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .lg-card:hover {
    background: linear-gradient(
      145deg,
      rgba(255,255,255,0.13) 0%,
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.10) 100%
    );
    border-color: rgba(255,255,255,0.22);
    transform: translateY(-4px) scale(1.01);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.08) inset,
      0 20px 60px rgba(0,0,0,0.6),
      0 1px 0 rgba(255,255,255,0.15) inset;
  }

  /* Liquid button */
  .lg-btn-primary {
    background: linear-gradient(135deg, rgba(139,92,246,0.9), rgba(236,72,153,0.9));
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.1) inset,
      0 4px 20px rgba(139,92,246,0.4),
      0 1px 0 rgba(255,255,255,0.2) inset;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .lg-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.15) inset,
      0 8px 32px rgba(139,92,246,0.6),
      0 1px 0 rgba(255,255,255,0.25) inset;
  }

  .lg-btn-ghost {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.12);
    transition: all 0.2s ease;
  }
  .lg-btn-ghost:hover {
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.2);
  }

  /* Gradient text */
  .grad-text {
    background: linear-gradient(135deg, #c084fc, #e879f9, #fb7185);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .grad-text-gold {
    background: linear-gradient(135deg, #fbbf24, #f59e0b, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Shimmer line */
  .shimmer-line {
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.4) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Float animation */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  .float { animation: float 6s ease-in-out infinite; }
  .float-delay { animation: float 6s ease-in-out infinite 2s; }
  .float-delay-2 { animation: float 6s ease-in-out infinite 4s; }

  /* Fade up */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
  .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
  .fade-up-3 { animation-delay: 0.35s; opacity: 0; }
  .fade-up-4 { animation-delay: 0.5s; opacity: 0; }

  /* Scroll indicator */
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(6px); }
  }
  .bounce { animation: bounce 1.5s ease-in-out infinite; }

  /* Noise texture overlay */
  .noise::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
    opacity: 0.4;
  }

  /* Nav */
  .landing-nav {
    background: rgba(4, 4, 10, 0.6);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  /* Stat pill */
  .stat-pill {
    background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04));
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(16px);
  }

  /* Feature icon */
  .feature-icon {
    background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15));
    border: 1px solid rgba(139,92,246,0.3);
    box-shadow: 0 0 20px rgba(139,92,246,0.15);
  }
`;

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Wallet,
    title: 'Smart Wallet',
    desc: 'Multi-currency wallet with real-time balance tracking, instant transfers, and intelligent spending insights.',
    color: 'rgba(139,92,246,0.25)',
    border: 'rgba(139,92,246,0.3)',
    glow: 'rgba(139,92,246,0.15)',
  },
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    desc: 'Full-featured POS with barcode scanning, smart search, cart management, and multi-payment support.',
    color: 'rgba(236,72,153,0.25)',
    border: 'rgba(236,72,153,0.3)',
    glow: 'rgba(236,72,153,0.15)',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Deep transaction analytics with visual reports, trend detection, and exportable data for your accountant.',
    color: 'rgba(34,211,238,0.2)',
    border: 'rgba(34,211,238,0.3)',
    glow: 'rgba(34,211,238,0.12)',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    desc: 'Native integration with MTN MoMo, Vodafone Cash, and AirtelTigo Money. Pay and receive instantly.',
    color: 'rgba(251,191,36,0.2)',
    border: 'rgba(251,191,36,0.3)',
    glow: 'rgba(251,191,36,0.12)',
  },
  {
    icon: Shield,
    title: 'Bank-grade Security',
    desc: 'End-to-end encryption, Supabase RLS, and Paystack PCI-DSS compliance protect every transaction.',
    color: 'rgba(52,211,153,0.2)',
    border: 'rgba(52,211,153,0.3)',
    glow: 'rgba(52,211,153,0.12)',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    desc: 'Settle to any Ghana bank or mobile money account within seconds — no waiting, no delays.',
    color: 'rgba(251,146,60,0.2)',
    border: 'rgba(251,146,60,0.3)',
    glow: 'rgba(251,146,60,0.12)',
  },
];

const STATS = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 2s', label: 'Settlement' },
  { value: '256-bit', label: 'Encryption' },
  { value: 'PCI-DSS', label: 'Compliant' },
];

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'forever',
    features: ['1 cashier account', '50 transactions/mo', 'Wallet & POS', 'Email support'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Business',
    price: 'GHS 99',
    sub: 'per month',
    features: ['5 cashier accounts', 'Unlimited transactions', 'Analytics dashboard', 'Mobile money + cards', 'Priority support'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    sub: 'contact us',
    features: ['Unlimited accounts', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'On-site training'],
    cta: 'Contact sales',
    highlight: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Parallax values
  const parallax1 = scrollY * 0.15;
  const parallax2 = scrollY * 0.25;
  const navOpacity = Math.min(scrollY / 80, 1);

  return (
    <div className="landing-root">
      <style>{GLASS_CSS}</style>

      {/* ── Sticky Nav ── */}
      <nav
        className="landing-nav fixed top-0 left-0 right-0 z-50"
        style={{ opacity: 0.6 + navOpacity * 0.4 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Wallet className="size-4 text-white" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">FinTech Wallet</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            {['Features', 'Pricing', 'Security'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition-colors">
                {l}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="lg-btn-ghost px-4 py-2 rounded-xl text-sm text-white/80 hover:text-white font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              className="lg-btn-primary px-4 py-2 rounded-xl text-sm text-white font-semibold"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">

        {/* Background orbs */}
        <div className="orb size-96 bg-violet-600/40 -top-20 -left-20" style={{ transform: `translateY(${parallax1}px)` }} />
        <div className="orb size-80 bg-pink-600/30 top-1/3 -right-10" style={{ transform: `translateY(${-parallax2}px)` }} />
        <div className="orb size-64 bg-cyan-600/20 bottom-10 left-1/3" style={{ transform: `translateY(${parallax1 * 0.5}px)` }} />
        <div className="orb size-48 bg-purple-400/20 top-1/4 left-1/2" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Badge */}
        <div className="fade-up fade-up-1 stat-pill flex items-center gap-2 px-4 py-2 rounded-full mb-8">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-white/70">Live on Netlify · Powered by Supabase & Paystack</span>
        </div>

        {/* Headline */}
        <h1 className="fade-up fade-up-2 text-center max-w-3xl mx-auto leading-[1.1] mb-6">
          <span className="serif text-6xl md:text-7xl lg:text-8xl text-white block">
            Payments that
          </span>
          <span className="serif italic text-6xl md:text-7xl lg:text-8xl grad-text block mt-1">
            just work.
          </span>
        </h1>

        <p className="fade-up fade-up-3 text-center text-white/55 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          A complete fintech platform for Ghanaian merchants. Wallet, POS, analytics,
          and mobile money — beautifully unified.
        </p>

        {/* CTAs */}
        <div className="fade-up fade-up-4 flex flex-col sm:flex-row items-center gap-3 mb-16">
          <Link
            to="/login"
            className="lg-btn-primary flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-sm"
          >
            Start for free
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="#features"
            className="lg-btn-ghost flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white/70 font-medium text-sm hover:text-white"
          >
            See features
            <ChevronDown className="size-4" />
          </a>
        </div>

        {/* Stats strip */}
        <div className="fade-up fade-up-4 flex flex-wrap items-center justify-center gap-3">
          {STATS.map(s => (
            <div key={s.label} className="stat-pill px-5 py-3 rounded-2xl text-center">
              <p className="text-lg font-bold text-white grad-text">{s.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bounce text-white/30">
          <ChevronDown className="size-5" />
        </div>
      </section>

      {/* ── Dashboard preview ── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="orb size-80 bg-violet-700/20 -left-20 top-0" />
        <div className="orb size-60 bg-pink-700/15 -right-10 bottom-0" />

        <div className="max-w-4xl mx-auto relative">
          {/* Floating cards */}
          <div className="relative">
            {/* Main dashboard mock */}
            <div className="lg-panel rounded-3xl overflow-hidden relative noise">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="size-3 rounded-full bg-red-400/60" />
                <div className="size-3 rounded-full bg-amber-400/60" />
                <div className="size-3 rounded-full bg-emerald-400/60" />
                <div className="flex-1 mx-4 h-6 rounded-lg bg-white/[0.05] flex items-center justify-center">
                  <span className="text-xs text-white/30">yourapp.netlify.app</span>
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-6 space-y-4">
                {/* Balance card mock */}
                <div className="rounded-2xl bg-gradient-to-br from-violet-600/80 to-pink-600/60 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-200">Available Balance</p>
                    <p className="text-3xl font-bold text-white mt-1">GHS 4,280.00</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-8 w-24 rounded-xl bg-white/20 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">Add Money</span>
                    </div>
                    <div className="h-8 w-24 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <span className="text-xs text-white/80 font-medium">Send Money</span>
                    </div>
                  </div>
                </div>

                {/* Mini cards row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Transactions', val: '128', color: 'bg-violet-500/15 text-violet-300' },
                    { label: 'Revenue', val: 'GHS 12k', color: 'bg-emerald-500/15 text-emerald-300' },
                    { label: 'Products', val: '34', color: 'bg-pink-500/15 text-pink-300' },
                  ].map(c => (
                    <div key={c.label} className="lg-card rounded-xl p-4">
                      <p className="text-xs text-white/40">{c.label}</p>
                      <p className={`text-xl font-bold mt-1 ${c.color.split(' ')[1]}`}>{c.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating feature pills */}
            <div className="absolute -left-8 top-1/3 lg-card rounded-2xl px-4 py-3 float hidden md:flex items-center gap-3">
              <div className="size-8 rounded-xl feature-icon flex items-center justify-center">
                <Zap className="size-4 text-violet-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Instant payment</p>
                <p className="text-xs text-white/40">GHS 250 received</p>
              </div>
            </div>

            <div className="absolute -right-6 top-1/4 lg-card rounded-2xl px-4 py-3 float-delay hidden md:flex items-center gap-3">
              <div className="size-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <TrendingUp className="size-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Revenue up 24%</p>
                <p className="text-xs text-white/40">vs last month</p>
              </div>
            </div>

            <div className="absolute -right-4 bottom-16 lg-card rounded-2xl px-4 py-3 float-delay-2 hidden md:flex items-center gap-3">
              <div className="size-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Globe className="size-4 text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">MoMo linked</p>
                <p className="text-xs text-white/40">MTN · 055 *** 4821</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative px-6 py-24 overflow-hidden">
        <div className="orb size-72 bg-pink-700/15 right-0 top-0" />

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="stat-pill inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6">
              <CheckCircle className="size-3.5 text-violet-400" />
              <span className="text-xs font-medium text-white/60">Everything you need</span>
            </div>
            <h2 className="serif text-5xl md:text-6xl text-white mb-4">
              Built for <span className="italic grad-text">merchants</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Every tool a Ghanaian business needs to accept payments, manage inventory, and grow.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="lg-card rounded-2xl p-6 relative overflow-hidden"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Subtle glow in corner */}
                <div
                  className="absolute -top-4 -right-4 size-24 rounded-full blur-2xl pointer-events-none"
                  style={{ background: f.glow }}
                />

                <div
                  className="size-11 rounded-xl flex items-center justify-center mb-4 relative"
                  style={{
                    background: f.color,
                    border: `1px solid ${f.border}`,
                    boxShadow: `0 0 20px ${f.glow}`,
                  }}
                >
                  <f.icon className="size-5 text-white" />
                </div>

                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security strip ── */}
      <section id="security" className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="lg-panel rounded-3xl p-10 noise relative overflow-hidden">
            <div className="orb size-64 bg-violet-600/20 -top-10 -right-10" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="stat-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5">
                  <Lock className="size-3 text-emerald-400" />
                  <span className="text-xs text-white/60">Security first</span>
                </div>
                <h2 className="serif text-4xl text-white mb-4">
                  Your money is<br />
                  <span className="italic grad-text">safe with us.</span>
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Every transaction is protected by Paystack's PCI-DSS Level 1 infrastructure,
                  Supabase Row Level Security, and 256-bit TLS encryption in transit.
                </p>
                <div className="space-y-3">
                  {[
                    'Paystack PCI-DSS Level 1',
                    'Supabase Row Level Security',
                    '256-bit TLS encryption',
                    'Multi-factor authentication ready',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="size-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle className="size-3 text-emerald-400" />
                      </div>
                      <span className="text-sm text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual */}
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Encryption', val: '256-bit AES', icon: Lock },
                  { label: 'Compliance', val: 'PCI-DSS L1', icon: Shield },
                  { label: 'Uptime', val: '99.9% SLA', icon: Globe },
                ].map(item => (
                  <div key={item.label} className="lg-card rounded-2xl px-5 py-4 flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <item.icon className="size-4 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40">{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.val}</p>
                    </div>
                    {/* Shimmer line */}
                    <div className="ml-auto h-0.5 w-12 rounded-full shimmer-line" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative px-6 py-24 overflow-hidden">
        <div className="orb size-80 bg-violet-700/15 left-0 top-0" />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="serif text-5xl md:text-6xl text-white mb-4">
              Simple <span className="italic grad-text">pricing</span>
            </h2>
            <p className="text-white/50 text-lg">No hidden fees. No surprises.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-violet-600/20 to-pink-600/10 border border-violet-500/30 shadow-[0_0_60px_rgba(139,92,246,0.15)]'
                    : 'lg-card'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                    Most popular
                  </div>
                )}

                <div className="mb-5">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">{plan.name}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'grad-text' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/40">{plan.sub}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                      <CheckCircle className="size-3.5 text-violet-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/login"
                  className={`w-full py-3 rounded-xl text-sm font-semibold text-center transition-all ${
                    plan.highlight
                      ? 'lg-btn-primary text-white'
                      : 'lg-btn-ghost text-white/70 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="max-w-3xl mx-auto text-center">
          <div className="lg-panel rounded-3xl p-12 noise relative overflow-hidden">
            <div className="orb size-64 bg-violet-600/25 -top-10 -left-10" />
            <div className="orb size-64 bg-pink-600/20 -bottom-10 -right-10" />

            <div className="relative">
              <h2 className="serif text-5xl md:text-6xl text-white mb-4">
                Ready to <span className="italic grad-text">simplify</span><br />payments?
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
                Join merchants across Ghana using FinTech Wallet to accept payments, manage stock, and grow their business.
              </p>

              <Link
                to="/login"
                className="lg-btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold"
              >
                Get started — it's free
                <ArrowRight className="size-4" />
              </Link>

              <p className="text-xs text-white/30 mt-5">No credit card required · Live in 60 seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center">
              <Wallet className="size-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/70">FinTech Wallet</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/30">
            <span>© 2026 FinTech Wallet</span>
            <span>·</span>
            <span>Powered by Supabase & Paystack</span>
            <span>·</span>
            <span>Made in Ghana 🇬🇭</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}