import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import * as api from '../../utils/api';
import { toast } from 'sonner';

interface WalletBalance {
  balance: number;
  pending: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  timestamp: string;
  metadata?: any;
}

export function WalletDashboard() {
  const [balance, setBalance] = useState<WalletBalance>({ balance: 0, pending: 0, currency: 'GHS' });
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [linkedCardsCount, setLinkedCardsCount] = useState(0);
  const [linkedMoMoCount, setLinkedMoMoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet balance
      const { wallet } = await api.getWalletBalance();
      setBalance(wallet);

      // Fetch linked accounts
      const { cards } = await api.getLinkedCards();
      setLinkedCardsCount(cards.length);

      const { momos } = await api.getLinkedMobileMoney();
      setLinkedMoMoCount(momos.length);

      // Fetch recent transactions
      const { transactions } = await api.getTransactions();
      setRecentTransactions(transactions.slice(0, 5));
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `GHS ${amount.toFixed(2)}`;
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'send') return <ArrowUpRight className="size-4 text-red-400" />;
    if (transaction.type === 'receive' || transaction.type === 'fund') return <ArrowDownLeft className="size-4 text-green-400" />;
    return <CreditCard className="size-4 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="glass-card bg-gradient-to-br from-purple-600/80 to-pink-600/80 border-0 text-white backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-normal text-purple-100 glass-text">Available Balance</CardTitle>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-4xl font-bold glass-text">
                {showBalance ? formatAmount(balance.balance) : '••••••'}
              </p>
              {balance.pending > 0 && (
                <p className="text-sm text-purple-200 mt-2 glass-text">
                  Pending: {showBalance ? formatAmount(balance.pending) : '••••••'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                className="bg-white text-purple-600 hover:bg-purple-50 glass-text"
              >
                <Link to="/add-money">
                  <ArrowDownLeft className="size-4 mr-2" />
                  Add Money
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/20 glass-text"
              >
                <Link to="/send-money">
                  <ArrowUpRight className="size-4 mr-2" />
                  Send Money
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Accounts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass border-gray-800/30">
          <CardContent className="p-6">
            <Link to="/accounts" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center glass-subtle">
                  <CreditCard className="size-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 glass-text">Linked Cards</p>
                  <p className="text-2xl font-bold glass-text">{linkedCardsCount}</p>
                </div>
              </div>
              <ArrowUpRight className="size-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glass border-gray-800/30">
          <CardContent className="p-6">
            <Link to="/accounts" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center glass-subtle">
                  <Smartphone className="size-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 glass-text">Mobile Money</p>
                  <p className="text-2xl font-bold glass-text">{linkedMoMoCount}</p>
                </div>
              </div>
              <ArrowUpRight className="size-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="glass border-gray-800/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="glass-text">Recent Transactions</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              <Link to="/transactions">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="glass-subtle rounded-lg p-8 text-center text-gray-500">
              <p className="glass-text">No transactions yet</p>
              <p className="text-sm mt-2 glass-text">Start by adding money to your wallet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between glass-subtle rounded-lg p-3 hover:glass transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gray-800 flex items-center justify-center">
                      {getTransactionIcon(transaction)}
                    </div>
                    <div>
                      <p className="font-medium glass-text">{transaction.type.toUpperCase()}</p>
                      <p className="text-sm text-gray-400 glass-text">
                        {new Date(transaction.timestamp).toLocaleDateString()} • {transaction.method.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold glass-text ${
                      transaction.type === 'send' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {transaction.type === 'send' ? '-' : '+'}{formatAmount(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize glass-text">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}