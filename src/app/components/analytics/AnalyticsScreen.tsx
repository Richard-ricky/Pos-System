import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getAnalytics, getRecommendations } from '../../utils/api';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [analyticsData, recsData] = await Promise.all([
        getAnalytics(),
        getRecommendations(),
      ]);
      setAnalytics(analyticsData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="size-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const { overview, salesByDate, topProducts, topCustomers } = analytics as {
    overview: Record<string, number>;
    salesByDate: Record<string, number>;
    topProducts: Record<string, { revenue: number; count: number }>;
    topCustomers: Array<Record<string, unknown>>;
  };

  // ── Chart data ────────────────────────────────────────────────────────────

  const salesChartData = Object.entries(salesByDate ?? {}).map(([date, amount]) => ({
    date, sales: amount,
  }));

  const productChartData = Object.entries(topProducts ?? {})
    .map(([productId, data]) => ({
      product: productId.split(':')[1] || productId,
      revenue: data.revenue ?? 0,
      units: data.count ?? 0,
    }))
    .slice(0, 5);

  // Use CSS variables for chart colours so they work in both themes
  const CHART_COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  // Recharts tooltip styled with CSS variables
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      color: 'var(--foreground)',
      fontSize: 12,
    },
    labelStyle: { color: 'var(--foreground)' },
    cursor: { fill: 'var(--accent)' },
  };

  const axisStyle = { stroke: 'var(--muted-foreground)', fontSize: 11 };

  // ── Stat cards config ────────────────────────────────────────────────────

  const STATS = [
    {
      label: 'Total Revenue',
      value: `GHS ${(overview?.totalRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Transactions',
      value: String(overview?.totalTransactions ?? 0),
      icon: ShoppingBag,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      label: 'Avg Transaction',
      value: `GHS ${(overview?.averageTransactionValue ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Customers',
      value: String(overview?.totalCustomers ?? 0),
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Overview stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                </div>
                <div className={`size-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Sales over time */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products by revenue */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="product" {...axisStyle} />
                <YAxis {...axisStyle} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }} />
                <Bar dataKey="revenue" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── ML Recommendations ── */}
      {recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* AI Promoted */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                AI-Recommended Promotions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(recommendations.promoted as string[] | undefined)?.slice(0, 5).map(
                  (productId, idx) => (
                    <div
                      key={productId}
                      className="flex items-center justify-between bg-surface-3 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-primary w-5">#{idx + 1}</span>
                        <span className="text-sm text-foreground truncate">{productId}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        High priority
                      </span>
                    </div>
                  ),
                )}
                {!(recommendations.promoted as unknown[])?.length && (
                  <p className="text-center py-6 text-sm text-muted-foreground">
                    No promotion recommendations yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low stock alerts */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-4 text-warning" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(recommendations.lowStock as string[] | undefined)?.slice(0, 5).map(
                  (productId) => (
                    <div
                      key={productId}
                      className="flex items-center justify-between bg-warning/5 border border-warning/20 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="size-3.5 text-warning shrink-0" />
                        <span className="text-sm text-foreground truncate">{productId}</span>
                      </div>
                      <span className="text-xs text-warning font-medium shrink-0 ml-2">
                        Restock
                      </span>
                    </div>
                  ),
                )}
                {!(recommendations.lowStock as unknown[])?.length && (
                  <div className="flex flex-col items-center justify-center py-6 gap-1">
                    <p className="text-sm font-medium text-foreground">All good!</p>
                    <p className="text-xs text-muted-foreground">All products are well stocked</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Top customers ── */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Top Customers</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3 pt-0">
          {topCustomers?.length ? (
            <div className="space-y-1">
              {topCustomers.slice(0, 5).map((customer, idx) => (
                <div
                  key={String(customer.id ?? idx)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary w-5">
                      #{idx + 1}
                    </span>
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {String(customer.name ?? '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {String(customer.name ?? 'Unknown')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {String(customer.phone ?? '')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-success tabular-nums">
                      GHS {(Number(customer.totalSpent) || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(customer.transactionCount) || 0} txns
                    </p>
                    <p className="text-xs text-primary">
                      {Number(customer.loyaltyPoints) || 0} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-1">
              <p className="text-sm font-medium text-foreground">No customers yet</p>
              <p className="text-xs text-muted-foreground">
                Customer data will appear after transactions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}