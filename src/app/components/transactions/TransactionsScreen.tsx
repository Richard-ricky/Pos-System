import { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Search,
  X,
  Loader2,
  ReceiptText,
  ChevronDown,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import * as api from '../../utils/api';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type TransactionType = 'fund' | 'send' | 'receive' | 'pos';
type PaymentMethod = 'card' | 'momo' | 'wallet';
type TransactionStatus = 'success' | 'pending' | 'failed' | 'pending_review' | 'completed';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  timestamp: string;
  reference?: string;
  recipient?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<TransactionType, string> = {
  pos: 'POS Sale',
  send: 'Send Money',
  receive: 'Receive Money',
  fund: 'Wallet Funding',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Card',
  momo: 'Mobile Money',
  wallet: 'Wallet',
};

const STATUS_META: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  success:        { label: 'Success',      className: 'bg-success/10 text-success border-success/20' },
  completed:      { label: 'Completed',    className: 'bg-success/10 text-success border-success/20' },
  pending:        { label: 'Pending',      className: 'bg-warning/10 text-warning border-warning/20' },
  pending_review: { label: 'Under Review', className: 'bg-warning/10 text-warning border-warning/20' },
  failed:         { label: 'Failed',       className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const isDebit = (tx: Transaction) => tx.type === 'send' || tx.type === 'pos';

function groupByDate(txs: Transaction[]): [string, Transaction[]][] {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of txs) {
    const key = new Date(tx.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    (groups[key] ??= []).push(tx);
  }
  return Object.entries(groups);
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TransactionIcon({ tx }: { tx: Transaction }) {
  const base = 'size-10 rounded-xl flex items-center justify-center shrink-0';

  if (tx.type === 'send') {
    return (
      <div className={`${base} bg-destructive/10`}>
        <ArrowUpRight className="size-4 text-destructive" />
      </div>
    );
  }
  if (tx.type === 'receive' || tx.type === 'fund') {
    return (
      <div className={`${base} bg-success/10`}>
        <ArrowDownLeft className="size-4 text-success" />
      </div>
    );
  }
  return (
    <div className={`${base} bg-info/10`}>
      <CreditCard className="size-4 text-info" />
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const debit = isDebit(tx);
  const status = STATUS_META[tx.status] ?? { label: tx.status, className: 'bg-muted text-muted-foreground border-border' };

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors duration-100 group">
      <TransactionIcon tx={tx} />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground leading-none">
            {TYPE_LABELS[tx.type]}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] font-medium px-1.5 py-0 leading-5 border ${status.className}`}
          >
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{METHOD_LABELS[tx.method]}</span>
          {tx.recipient && (
            <>
              <span className="opacity-40">·</span>
              <span className="truncate max-w-[140px]">{tx.recipient}</span>
            </>
          )}
          <span className="opacity-40">·</span>
          <span className="font-mono">{tx.reference ?? 'N/A'}</span>
        </div>
      </div>

      {/* Time */}
      <span className="text-xs text-muted-foreground tabular-nums shrink-0 hidden sm:block">
        {formatTime(tx.timestamp)}
      </span>

      {/* Amount */}
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 min-w-[90px] text-right ${
          debit ? 'text-destructive' : 'text-success'
        }`}
      >
        {debit ? '−' : '+'}GHS {tx.amount.toFixed(2)}
      </span>
    </div>
  );
}

function DateGroup({ date, transactions }: { date: string; transactions: Transaction[] }) {
  const [collapsed, setCollapsed] = useState(false);

  const dayTotal = transactions.reduce((sum, tx) => {
    return sum + (isDebit(tx) ? -tx.amount : tx.amount);
  }, 0);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      {/* Date header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-2 hover:bg-surface-3 transition-colors duration-100 border-b border-border"
      >
        <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
          {date}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold tabular-nums ${
              dayTotal >= 0 ? 'text-success' : 'text-destructive'
            }`}
          >
            {dayTotal >= 0 ? '+' : '−'}GHS {Math.abs(dayTotal).toFixed(2)}
          </span>
          <ChevronDown
            className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
              collapsed ? '-rotate-90' : ''
            }`}
          />
        </div>
      </button>

      {/* Rows */}
      {!collapsed && (
        <div className="divide-y divide-border/60">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  // ── Data loading ─────────────────────────────────────────────────────────

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { transactions: txs } = await api.getTransactions();
      setTransactions(txs ?? []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // ── Filtering (memoised) ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return transactions.filter((tx) => {
      if (q && !(tx.reference ?? '').toLowerCase().includes(q) && !(tx.recipient ?? '').toLowerCase().includes(q)) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (methodFilter !== 'all' && tx.method !== methodFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    });
  }, [searchQuery, typeFilter, methodFilter, statusFilter, transactions]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const hasActiveFilters =
    searchQuery || typeFilter !== 'all' || methodFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setMethodFilter('all');
    setStatusFilter('all');
  };

  // ── Summary stats ─────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const totalIn = filtered
      .filter((tx) => !isDebit(tx))
      .reduce((s, tx) => s + tx.amount, 0);
    const totalOut = filtered
      .filter((tx) => isDebit(tx))
      .reduce((s, tx) => s + tx.amount, 0);
    return { totalIn, totalOut, net: totalIn - totalOut };
  }, [filtered]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">Loading transactions…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} record{transactions.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Money In</p>
          <p className="text-lg font-bold text-success tabular-nums">
            +GHS {summary.totalIn.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Money Out</p>
          <p className="text-lg font-bold text-destructive tabular-nums">
            −GHS {summary.totalOut.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Net</p>
          <p
            className={`text-lg font-bold tabular-nums ${
              summary.net >= 0 ? 'text-foreground' : 'text-destructive'
            }`}
          >
            {summary.net >= 0 ? '+' : '−'}GHS {Math.abs(summary.net).toFixed(2)}
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search reference or recipient…"
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

          {/* Type */}
          <Select value={typeFilter} onValueChange={(v: TransactionType | 'all') => setTypeFilter(v)}>
            <SelectTrigger className="bg-input-background border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pos">POS Sales</SelectItem>
              <SelectItem value="send">Sent</SelectItem>
              <SelectItem value="receive">Received</SelectItem>
              <SelectItem value="fund">Funding</SelectItem>
            </SelectContent>
          </Select>

          {/* Method */}
          <Select value={methodFilter} onValueChange={(v: PaymentMethod | 'all') => setMethodFilter(v)}>
            <SelectTrigger className="bg-input-background border-border">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="momo">Mobile Money</SelectItem>
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={statusFilter} onValueChange={(v: TransactionStatus | 'all') => setStatusFilter(v)}>
            <SelectTrigger className="bg-input-background border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending_review">Under Review</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filter strip */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{' '}
              {transactions.length} transactions
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Transaction list ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <div className="size-14 rounded-2xl bg-surface-3 flex items-center justify-center">
            <ReceiptText className="size-6 opacity-40" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters ? 'Try adjusting or clearing your filters' : 'Transactions will appear here once recorded'}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(([date, txs]) => (
            <DateGroup key={date} date={date} transactions={txs} />
          ))}
        </div>
      )}
    </div>
  );
}