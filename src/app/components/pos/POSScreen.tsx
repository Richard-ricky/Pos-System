import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Plus, Minus, ShoppingCart, CreditCard, Loader2, ImageOff, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as api from '../../utils/api';
import { paystackService } from '../../services/paystack';
import { useAuth } from '../../contexts/AuthContext';
import { Product, CartItem, LinkedCard, LinkedMobileMoney } from '../../types';
import { toast } from 'sonner';
import { TernarySearchTree, bruteForceSearch } from '../../utils/productSearch';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentMethod = 'wallet' | 'card' | 'momo' | 'new_card' | 'new_momo';

/**
 * Which search engine to use.
 *   'tst'         — Ternary Search Tree (prefix match, O(k·log n))
 *   'bruteforce'  — Linear scan (substring match, O(n·k))
 *
 * TST is faster on large catalogs; brute-force supports mid-word matches
 * (e.g. "cola" matching "Coca-Cola"). Both are available and can be toggled.
 */
type SearchMode = 'tst' | 'bruteforce';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractArray<T>(res: unknown, ...keys: string[]): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === 'object') {
    for (const key of keys) {
      const val = (res as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as T[];
    }
  }
  return [];
}

function extractNumber(res: unknown, ...paths: string[]): number {
  if (typeof res === 'number') return res;
  if (res && typeof res === 'object') {
    for (const path of paths) {
      const parts = path.split('.');
      let cur: unknown = res;
      for (const p of parts) cur = (cur as Record<string, unknown>)?.[p];
      if (typeof cur === 'number') return cur;
    }
  }
  return 0;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockLabel({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-xs text-destructive font-medium">Out of stock</span>;
  if (stock <= 5) return <span className="text-xs text-warning font-medium">{stock} left</span>;
  return <span className="text-xs text-muted-foreground">Stock: {stock}</span>;
}

interface ProductTileProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function ProductTile({ product, onAdd }: ProductTileProps) {
  const outOfStock = product.stock <= 0;
  return (
    <div
      onClick={() => !outOfStock && onAdd(product)}
      className={[
        'group rounded-xl border bg-card overflow-hidden transition-all duration-150',
        outOfStock
          ? 'opacity-50 cursor-not-allowed border-border'
          : 'cursor-pointer border-border hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
      ].join(' ')}
    >
      <div className="w-full h-28 bg-surface-3 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <ImageOff className="size-6 text-muted-foreground opacity-30" />
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium leading-snug line-clamp-1 text-foreground">
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-1">
          <StockLabel stock={product.stock} />
          <p className="text-sm font-bold text-foreground tabular-nums">
            GHS {product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function POSScreen() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchMode, setSearchMode] = useState<SearchMode>('tst');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedMoMoId, setSelectedMoMoId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([]);
  const [linkedMoMo, setLinkedMoMo] = useState<LinkedMobileMoney[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  // ── TST instance persisted across renders ─────────────────────────────────
  const tstRef = useRef<TernarySearchTree<Product>>(new TernarySearchTree<Product>());

  useEffect(() => { loadAll(); }, []);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadAll = async () => {
    setLoadingProducts(true);
    try {
      const [productsRes, cardsRes, momoRes, walletRes] = await Promise.all([
        api.getProducts(),
        api.getLinkedCards(),
        api.getLinkedMobileMoney(),
        api.getWalletBalance(),
      ]);

      const loadedProducts = extractArray<Product>(productsRes, 'products', 'data', 'items');

      // Rebuild TST whenever the product list changes
      tstRef.current.rebuild(loadedProducts);

      setProducts(loadedProducts);
      setLinkedCards(extractArray<LinkedCard>(cardsRes, 'cards', 'data', 'items'));
      setLinkedMoMo(extractArray<LinkedMobileMoney>(momoRes, 'momos', 'data', 'items'));
      setWalletBalance(extractNumber(walletRes, 'wallet.balance', 'balance', 'data.balance'));
    } catch (error) {
      console.error('Failed to load POS data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // ── Search logic ──────────────────────────────────────────────────────────

  /**
   * Runs the active search strategy and returns matching products.
   *
   * TST mode:        prefix search — fast, ideal for name/barcode typing.
   * Brute-force mode: substring search — slower but finds mid-word matches.
   *
   * For very short queries (≤ 1 char) we always use the TST to keep things
   * snappy; brute-force substring scan on 1 char could match everything
   * and still be slow on a large catalog.
   */
  const runSearch = useCallback(
    (query: string, category: string, mode: SearchMode): Product[] => {
      if (query.trim() === '') {
        // Empty query: return all (filtered by category if needed)
        return category === 'All'
          ? products
          : products.filter(p => p.category === category);
      }

      if (mode === 'tst' || query.trim().length <= 1) {
        return tstRef.current.search(query, category);
      }

      return bruteForceSearch(products, query, category);
    },
    [products],
  );

  // ── Derived values ────────────────────────────────────────────────────────

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const filteredProducts = useMemo(
    () => runSearch(searchQuery, selectedCategory, searchMode),
    [runSearch, searchQuery, selectedCategory, searchMode],
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ── Cart actions ──────────────────────────────────────────────────────────

  const addToCart = (product: Product) => {
    if (product.stock <= 0) { toast.error('Product out of stock'); return; }
    const existing = cart.find((i) => i.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) { toast.error('Insufficient stock'); return; }
      setCart(cart.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) =>
    setCart(cart.filter((i) => i.product.id !== productId));

  const updateQuantity = (productId: string, change: number) => {
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty <= 0) { removeFromCart(productId); return; }
    if (newQty > item.product.stock) { toast.error('Insufficient stock'); return; }
    setCart(cart.map((i) =>
      i.product.id === productId ? { ...i, quantity: newQty } : i,
    ));
  };

  // ── Checkout ──────────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    if (cart.length === 0 || !user) return;
    if (paymentMethod === 'wallet' && walletBalance < total) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsProcessing(true);
    try {
      if (paymentMethod === 'new_card' || paymentMethod === 'new_momo') {
        const channels = paymentMethod === 'new_card' ? ['card'] : ['mobile_money'];
        await new Promise<void>((resolve, reject) => {
          paystackService.initializePayment({
            email: user.email,
            amount: total,
            metadata: {
              userId: user.id,
              items: cart.map((i) => ({ id: i.product.id, qty: i.quantity })),
            },
            channels,
            onSuccess: async (reference) => {
              try {
                await api.verifyPayment(reference);
                await api.createTransaction({
                  type: 'pos', amount: total, status: 'success',
                  method: paymentMethod === 'new_card' ? 'card' : 'momo',
                  description: `POS Sale - ${cart.length} item(s)`,
                  reference, items: cart, subtotal: total, discount: 0, tax: 0,
                });
                toast.success('Payment successful!');
                setCart([]);
                setShowCheckout(false);
                await loadAll();
                resolve();
              } catch (err) { reject(err); }
            },
            onError: reject,
            onClose: () => reject(new Error('Payment cancelled')),
          });
        });

      } else if (paymentMethod === 'card' || paymentMethod === 'momo') {
        const channels = paymentMethod === 'card' ? ['card'] : ['mobile_money'];
        await new Promise<void>((resolve, reject) => {
          paystackService.initializePayment({
            email: user.email,
            amount: total,
            metadata: {
              userId: user.id,
              items: cart.map((i) => ({ id: i.product.id, qty: i.quantity })),
            },
            channels,
            onSuccess: async (reference) => {
              try {
                await api.verifyPayment(reference);
                await api.createTransaction({
                  type: 'pos', amount: total, status: 'success',
                  method: paymentMethod,
                  description: `POS Sale - ${cart.length} item(s)`,
                  reference, items: cart, subtotal: total, discount: 0, tax: 0,
                });
                toast.success('Payment successful!');
                setCart([]);
                setShowCheckout(false);
                await loadAll();
                resolve();
              } catch (err) { reject(err); }
            },
            onError: reject,
            onClose: () => reject(new Error('Payment cancelled')),
          });
        });

      } else {
        await api.createTransaction({
          type: 'pos', amount: total, status: 'success', method: 'wallet',
          description: `POS Sale - ${cart.length} item(s)`,
          items: cart, subtotal: total, discount: 0, tax: 0,
        });
        toast.success('Payment successful!');
        setCart([]);
        setShowCheckout(false);
        await loadAll();
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Payment failed';
      if (msg !== 'Payment cancelled') toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 p-1">

      {/* ── Products panel ── */}
      <div className="lg:col-span-2 space-y-4">

        {/* Search + filters */}
        <div className="space-y-3 p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or barcode…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 bg-input-background border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category pills + search mode toggle */}
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={[
                    'text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border hover:bg-accent',
                  ].join(' ')}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search mode toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-surface-2 shrink-0">
              {(['tst', 'bruteforce'] as SearchMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  title={
                    mode === 'tst'
                      ? 'TST: fast prefix search'
                      : 'Brute force: slower but finds mid-word matches'
                  }
                  className={[
                    'text-xs px-2.5 py-1 rounded-md transition-all duration-150 font-medium',
                    searchMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  {mode === 'tst' ? 'TST' : 'Brute'}
                </button>
              ))}
            </div>
          </div>

          {/* Result count hint */}
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              &nbsp;·&nbsp;
              <span className="font-medium">
                {searchMode === 'tst' ? 'prefix match (TST)' : 'substring match (brute force)'}
              </span>
            </p>
          )}
        </div>

        {/* Product grid */}
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <p className="text-sm">Loading products…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2 text-muted-foreground">
            <div className="size-14 rounded-2xl bg-surface-3 flex items-center justify-center">
              <ShoppingCart className="size-6 opacity-30" />
            </div>
            <p className="text-sm font-medium text-foreground">No products found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
            {searchMode === 'tst' && searchQuery && (
              <button
                onClick={() => setSearchMode('bruteforce')}
                className="mt-1 text-xs text-primary underline underline-offset-2"
              >
                Try brute-force (substring) search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => (
              <ProductTile key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>

      {/* ── Cart panel ── */}
      <div>
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden sticky top-4">

          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Cart</span>
              {cartCount > 0 && (
                <span className="size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground px-4">
              <ShoppingCart className="size-8 opacity-20" />
              <p className="text-sm font-medium text-foreground">Cart is empty</p>
              <p className="text-xs text-center">Tap a product to add it</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border/60 max-h-[360px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="size-9 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          GHS {item.product.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="size-6 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="size-6 rounded-md border border-border flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        GHS {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 space-y-3 border-t border-border bg-surface-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Wallet balance</span>
                  <span className="tabular-nums">GHS {walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    GHS {total.toFixed(2)}
                  </span>
                </div>
                <Button className="w-full gap-2" onClick={() => setShowCheckout(true)}>
                  <CreditCard className="size-4" />
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Checkout Dialog ── */}
      <Dialog open={showCheckout} onOpenChange={(open) => !isProcessing && setShowCheckout(open)}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Complete Payment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="rounded-xl bg-surface-3 p-4 space-y-0.5">
              <p className="text-xs text-muted-foreground">Total amount</p>
              <p className="text-3xl font-bold tabular-nums text-foreground">
                GHS {total.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-border divide-y divide-border/60 max-h-32 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between px-3 py-2 text-xs">
                  <span className="text-foreground truncate mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground tabular-nums shrink-0">
                    GHS {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}
              >
                <SelectTrigger className="bg-input-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="wallet">Wallet — GHS {walletBalance.toFixed(2)}</SelectItem>
                  <SelectItem value="card" disabled={linkedCards.length === 0}>
                    Saved card{linkedCards.length === 0 ? ' (none linked)' : ''}
                  </SelectItem>
                  <SelectItem value="momo" disabled={linkedMoMo.length === 0}>
                    Saved mobile money{linkedMoMo.length === 0 ? ' (none linked)' : ''}
                  </SelectItem>
                  <SelectItem value="new_card">Pay with new card</SelectItem>
                  <SelectItem value="new_momo">Pay with new mobile money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === 'card' && linkedCards.length > 0 && (
              <div className="space-y-1.5">
                <Label>Select Card</Label>
                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue placeholder="Choose a card" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {linkedCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        •••• {card.cardNumber} — {card.cardholderName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {paymentMethod === 'momo' && linkedMoMo.length > 0 && (
              <div className="space-y-1.5">
                <Label>Select Account</Label>
                <Select value={selectedMoMoId} onValueChange={setSelectedMoMoId}>
                  <SelectTrigger className="bg-input-background border-border">
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {linkedMoMo.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.network} — {account.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(paymentMethod === 'new_card' || paymentMethod === 'new_momo') && (
              <p className="text-xs text-muted-foreground rounded-lg bg-surface-3 px-3 py-2">
                You'll be taken to a secure Paystack page to complete payment.
                No details will be saved.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCheckout(false)}
              disabled={isProcessing}
              className="border-border"
            >
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isProcessing} className="flex-1 gap-2">
              {isProcessing ? (
                <><Loader2 className="size-3.5 animate-spin" />Processing…</>
              ) : (paymentMethod === 'new_card' || paymentMethod === 'new_momo') ? (
                <><CreditCard className="size-3.5" />Continue — GHS {total.toFixed(2)}</>
              ) : (
                <><CreditCard className="size-3.5" />Pay GHS {total.toFixed(2)}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}