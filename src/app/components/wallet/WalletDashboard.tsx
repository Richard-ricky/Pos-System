import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Eye, EyeOff, ArrowUpRight, ArrowDownLeft,
  CreditCard, Smartphone, ImageOff,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import * as api from '../../utils/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletBalance { balance: number; pending: number; currency: string; }
interface Transaction {
  id: string; type: string; amount: number;
  method: string; status: string; timestamp: string;
}
interface Product {
  id: string; name: string; price: number;
  stock: number; image?: string; category: string;
}

// ─── Product Slideshow ────────────────────────────────────────────────────────

function ProductSlideshow({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: 'left' | 'right' = 'right') => {
    if (animating || index === current) return;
    setDirection(dir);
    setPrev(current);
    setAnimating(true);
    setCurrent(index);
    setTimeout(() => {
      setPrev(null);
      setAnimating(false);
    }, 400);
  }, [animating, current]);

  const goNext = useCallback(() => {
    goTo((current + 1) % products.length, 'right');
  }, [current, products.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + products.length) % products.length, 'left');
  }, [current, products.length, goTo]);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    timerRef.current = setInterval(goNext, 4500);
    return () => clearInterval(timerRef.current!);
  }, [paused, goNext, products.length]);

  if (products.length === 0) return null;

  const product = products[current];
  const prevProduct = prev !== null ? products[prev] : null;
  const outOfStock = product.stock <= 0;

  // Slide-in/out animation classes
  const enterClass = direction === 'right'
    ? 'translate-x-full'
    : '-translate-x-full';

  return (
    <div
      className="space-y-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Our Products</h2>
          <p className="text-xs text-muted-foreground">{products.length} products available</p>
        </div>
        <Link
          to="/pos"
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Shop now <ArrowUpRight className="size-3" />
        </Link>
      </div>

      {/* Slideshow frame */}
      <Link to="/pos" className="block relative rounded-2xl overflow-hidden border border-border bg-surface-3 shadow-sm" style={{ height: 240 }}>

        {/* Previous slide (exit) */}
        {prevProduct && animating && (
          <div
            className="absolute inset-0 transition-transform duration-400 ease-in-out"
            style={{
              transform: direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)',
              transition: 'transform 0.4s ease-in-out',
            }}
          >
            {prevProduct.image ? (
              <img src={prevProduct.image} alt={prevProduct.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface-4 flex items-center justify-center">
                <ImageOff className="size-10 text-muted-foreground opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          </div>
        )}

        {/* Current slide (enter) */}
        <div
          className="absolute inset-0"
          style={{
            transform: animating ? 'translateX(0)' : 'translateX(0)',
            animation: animating ? `slideIn${direction === 'right' ? 'Right' : 'Left'} 0.4s ease-in-out forwards` : 'none',
          }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{
                transform: animating ? `translateX(${direction === 'right' ? '100%' : '-100%'})` : 'translateX(0)',
                transition: 'transform 0.4s ease-in-out',
              }}
            />
          ) : (
            <div className="w-full h-full bg-surface-4 flex items-center justify-center">
              <ImageOff className="size-10 text-muted-foreground opacity-20" />
            </div>
          )}
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="text-xs font-medium bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full">
            {product.category}
          </span>
          {outOfStock ? (
            <span className="text-xs font-semibold bg-destructive text-white px-2.5 py-1 rounded-full">
              Out of stock
            </span>
          ) : product.stock <= 5 ? (
            <span className="text-xs font-semibold bg-amber-500 text-white px-2.5 py-1 rounded-full">
              Only {product.stock} left
            </span>
          ) : null}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          {/* Dots */}
          {products.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3">
              {products.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full bg-white transition-all duration-300"
                  style={{
                    width: i === current ? 20 : 6,
                    height: 6,
                    opacity: i === current ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-lg leading-tight drop-shadow-sm">
                {product.name}
              </p>
              <p className="text-white/60 text-xs mt-0.5">
                {outOfStock ? 'Currently unavailable' : `${product.stock} units in stock`}
              </p>
            </div>
            <p className="text-white font-bold text-xl tabular-nums drop-shadow-sm">
              GHS {product.price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Prev/Next buttons */}
        {products.length > 1 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); goPrev(); }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm flex items-center justify-center text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
              style={{ opacity: paused ? 1 : undefined }}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); goNext(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm flex items-center justify-center text-white transition-opacity"
              style={{ opacity: paused ? 1 : 0.6 }}
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </Link>

      {/* Thumbnail strip */}
      {products.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {products.map((p, i) => (
            <button
              key={p.id}
              onClick={() => goTo(i, i > current ? 'right' : 'left')}
              className={[
                'flex-shrink-0 size-12 rounded-xl overflow-hidden border-2 transition-all duration-200',
                i === current
                  ? 'border-primary scale-105 shadow-sm'
                  : 'border-transparent opacity-50 hover:opacity-80',
              ].join(' ')}
            >
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                  <ImageOff className="size-3 text-muted-foreground opacity-40" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WalletDashboard() {
  const [balance, setBalance] = useState<WalletBalance>({ balance: 0, pending: 0, currency: 'GHS' });
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [linkedCardsCount, setLinkedCardsCount] = useState(0);
  const [linkedMoMoCount, setLinkedMoMoCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, cardsRes, momosRes, txRes, productsRes] = await Promise.all([
        api.getWalletBalance(),
        api.getLinkedCards(),
        api.getLinkedMobileMoney(),
        api.getTransactions(),
        api.getProducts(),
      ]);
      setBalance(walletRes.wallet);
      setLinkedCardsCount(cardsRes.cards?.length ?? 0);
      setLinkedMoMoCount(momosRes.momos?.length ?? 0);
      setRecentTransactions((txRes.transactions ?? []).slice(0, 5));
      const all: Product[] = productsRes.products ?? productsRes.data ?? productsRes ?? [];
      setProducts(all);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `GHS ${n.toFixed(2)}`;

  const getTransactionMeta = (t: Transaction) => {
    const isDebit = t.type === 'send' || t.type === 'pos';
    return {
      icon: isDebit
        ? <ArrowUpRight className="size-3.5 text-destructive" />
        : <ArrowDownLeft className="size-3.5 text-success" />,
      amountClass: isDebit ? 'text-destructive' : 'text-success',
      prefix: isDebit ? '-' : '+',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">

      {/* ── Compact Wallet Card ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 shadow-lg px-5 py-4">
        {/* Decorative */}
        <div className="absolute -top-6 -right-6 size-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-4 size-36 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          {/* Balance */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-xs font-medium text-purple-200">Available Balance</p>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="size-5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                {showBalance
                  ? <EyeOff className="size-2.5 text-white" />
                  : <Eye className="size-2.5 text-white" />}
              </button>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight truncate">
              {showBalance ? fmt(balance.balance) : '••••••'}
            </p>
            {balance.pending > 0 && (
              <p className="text-xs text-purple-200 mt-0.5">
                Pending: {showBalance ? fmt(balance.pending) : '•••'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className="h-8 bg-white text-purple-700 hover:bg-purple-50 text-xs font-semibold px-4 shadow-sm"
            >
              <Link to="/add-money">
                <ArrowDownLeft className="size-3.5" />
                Add Money
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-4"
            >
              <Link to="/send-money">
                <ArrowUpRight className="size-3.5" />
                Send Money
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Linked Accounts ── */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/accounts" className="group">
          <Card className="border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <CreditCard className="size-4 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Cards</p>
                <p className="text-xl font-bold text-foreground tabular-nums">{linkedCardsCount}</p>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/accounts" className="group">
          <Card className="border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Smartphone className="size-4 text-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Mobile Money</p>
                <p className="text-xl font-bold text-foreground tabular-nums">{linkedMoMoCount}</p>
              </div>
              <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Product Slideshow ── */}
      <ProductSlideshow products={products} />

      {/* ── Recent Transactions ── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">Recent Transactions</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-7 text-xs -mr-1">
              <Link to="/transactions">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-3 pt-0">
          {recentTransactions.length === 0 ? (
            <div className="rounded-xl bg-surface-3 p-6 text-center mx-2">
              <p className="text-sm font-medium text-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start by adding money to your wallet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentTransactions.map((transaction) => {
                const { icon, amountClass, prefix } = getTransactionMeta(transaction);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-surface-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-surface-3 flex items-center justify-center shrink-0">
                        {icon}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground capitalize">
                          {transaction.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.timestamp).toLocaleDateString('en-GH', {
                            day: 'numeric', month: 'short',
                          })} · {transaction.method.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold tabular-nums ${amountClass}`}>
                        {prefix}{fmt(transaction.amount)}
                      </p>
                      <p className={`text-xs capitalize ${
                        transaction.status === 'success' ? 'text-success' :
                        transaction.status === 'failed' ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}