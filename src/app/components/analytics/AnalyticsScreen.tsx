import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getAnalytics, getRecommendations } from '../../utils/api';
import { AnalyticsSummary } from '../../types';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="size-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No analytics data available</p>
      </div>
    );
  }

  const { overview, salesByDate, topProducts, topCustomers } = analytics;

  // Prepare chart data
  const salesChartData = Object.entries(salesByDate || {}).map(([date, amount]) => ({
    date,
    sales: amount,
  }));

  const productChartData = Object.entries(topProducts || {})
    .map(([productId, data]: [string, any]) => ({
      product: productId.split(':')[1] || productId,
      revenue: data.revenue || 0,
      units: data.count || 0,
    }))
    .slice(0, 5);

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-950 border-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-400">
                  GHS {(overview?.totalRevenue || 0).toFixed(2)}
                </p>
              </div>
              <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="size-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-blue-400">
                  {overview?.totalTransactions || 0}
                </p>
              </div>
              <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="size-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-400">
                  GHS {(overview?.averageTransactionValue || 0).toFixed(2)}
                </p>
              </div>
              <div className="size-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="size-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-pink-400">
                  {overview?.totalCustomers || 0}
                </p>
              </div>
              <div className="size-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                <Users className="size-6 text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time */}
        <Card className="bg-gray-950 border-gray-900">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products by Revenue */}
        <Card className="bg-gray-950 border-gray-900">
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="product" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ML Recommendations */}
      {recommendations && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Promoted Products */}
          <Card className="bg-gray-950 border-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-purple-400" />
                AI-Recommended Promotions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.promoted?.slice(0, 5).map((productId: string, idx: number) => (
                  <div
                    key={productId}
                    className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-purple-400 font-bold">#{idx + 1}</span>
                      <span className="text-sm">{productId}</span>
                    </div>
                    <span className="text-xs text-gray-400">High Priority</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="bg-gray-950 border-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-yellow-400" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.lowStock?.slice(0, 5).map((productId: string, idx: number) => (
                  <div
                    key={productId}
                    className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="size-4 text-yellow-400" />
                      <span className="text-sm">{productId}</span>
                    </div>
                    <span className="text-xs text-yellow-400">Restock Needed</span>
                  </div>
                ))}
                {(!recommendations.lowStock || recommendations.lowStock.length === 0) && (
                  <p className="text-center py-4 text-gray-500 text-sm">
                    All products are well stocked
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Customers */}
      <Card className="bg-gray-950 border-gray-900">
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCustomers?.slice(0, 5).map((customer: any, idx: number) => (
              <div
                key={customer.id}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-purple-400 font-bold">#{idx + 1}</span>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-400">{customer.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">
                    GHS {(customer.totalSpent || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {customer.transactionCount || 0} transactions
                  </p>
                  <p className="text-xs text-purple-400">
                    {customer.loyaltyPoints || 0} pts
                  </p>
                </div>
              </div>
            ))}
            {(!topCustomers || topCustomers.length === 0) && (
              <p className="text-center py-8 text-gray-500">No customer data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}