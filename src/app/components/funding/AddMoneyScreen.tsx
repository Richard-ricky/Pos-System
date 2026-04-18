import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, PlusCircle, Smartphone, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import * as api from '../../utils/api';
import { paystackService } from '../../services/paystack';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

type FundingSource = 'momo' | 'card';
type FundingStep = 'details' | 'processing' | 'success' | 'failed';

export function AddMoneyScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fundingSource, setFundingSource] = useState<FundingSource>('momo');
  const [step, setStep] = useState<FundingStep>('details');
  const [formData, setFormData] = useState({
    amount: '',
    selectedCardId: '',
    selectedMoMoId: '',
  });

  const [balance, setBalance] = useState({ balance: 0, pending: 0, currency: 'GHS' });
  const [linkedCards, setLinkedCards] = useState<any[]>([]);
  const [linkedMoMo, setLinkedMoMo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletData, cardsData, momoData] = await Promise.all([
        api.getWalletBalance(),
        api.getLinkedCards(),
        api.getLinkedMobileMoney(),
      ]);

      setBalance(walletData.wallet);
      setLinkedCards(cardsData.cards);
      setLinkedMoMo(momoData.momos);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }

    if (amount < 1) {
      toast.error('Minimum amount is GHS 1.00');
      return false;
    }

    if (fundingSource === 'card' && !formData.selectedCardId && linkedCards.length > 0) {
      toast.error('Please select a card');
      return false;
    }

    if (fundingSource === 'momo' && !formData.selectedMoMoId && linkedMoMo.length > 0) {
      toast.error('Please select a mobile money account');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setStep('processing');

    try {
      const amount = parseFloat(formData.amount);

      // Initialize Paystack payment
      await paystackService.initializePayment({
        email: user?.email || '',
        amount,
        currency: 'GHS',
        metadata: {
          userId: user?.id,
          fundingSource,
          selectedAccountId: fundingSource === 'momo' ? formData.selectedMoMoId : formData.selectedCardId,
        },
        channels: fundingSource === 'momo' ? ['mobile_money'] : ['card'],
        onSuccess: async (reference) => {
          setPaymentReference(reference);
          await handlePaymentSuccess(reference, amount);
        },
        onError: (error) => {
          console.error('Payment error:', error);
          setStep('failed');
          toast.error('Payment failed. Please try again.');
        },
        onClose: () => {
          if (step === 'processing') {
            setStep('details');
          }
        },
      });
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setStep('failed');
      toast.error(error.message || 'Failed to initialize payment');
    }
  };

  const handlePaymentSuccess = async (reference: string, amount: number) => {
    try {
      // Verify and fund wallet via backend
      const result = await api.fundWallet(amount, reference, fundingSource);

      if (result.success) {
        setBalance(result.wallet);
        setStep('success');
        toast.success('Wallet funded successfully!');
      } else {
        setStep('failed');
        toast.error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Wallet funding error:', error);
      setStep('failed');
      toast.error(error.message || 'Failed to update wallet');
    }
  };

  const handleDone = () => {
    navigate('/wallet');
  };

  const handleTryAgain = () => {
    setStep('details');
    setFormData({ ...formData, amount: '' });
  };

  const formatAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getSelectedCard = () => {
    return linkedCards.find(card => card.id === formData.selectedCardId);
  };

  const getSelectedMoMo = () => {
    return linkedMoMo.find(account => account.id === formData.selectedMoMoId);
  };

  // Render steps
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="size-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="size-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Processing Payment...</h3>
                <p className="text-gray-400">Please complete the payment in the popup window</p>
                {fundingSource === 'momo' && (
                  <p className="text-sm text-yellow-400 mt-2">📱 A prompt will be sent to your phone</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="size-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Wallet Funded Successfully!</h3>
                <p className="text-gray-400">GHS {formatAmount(formData.amount)} added to your wallet</p>
                <p className="text-2xl font-bold text-purple-400 mt-4">
                  New Balance: GHS {formatAmount(balance.balance)}
                </p>
                {paymentReference && (
                  <p className="text-xs text-gray-500 mt-2">Reference: {paymentReference}</p>
                )}
              </div>
              <div className="pt-4">
                <Button onClick={handleDone} className="bg-purple-600 hover:bg-purple-700">
                  Done
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'failed') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="size-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="size-10 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transaction Failed</h3>
                <p className="text-gray-400">We couldn't process your payment. Please try again.</p>
              </div>
              <div className="pt-4 flex gap-3 justify-center">
                <Button variant="outline" onClick={handleDone} className="border-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleTryAgain} className="bg-purple-600 hover:bg-purple-700">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/wallet')}
        className="mb-4 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Wallet
      </Button>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="size-5" />
            Add Money to Wallet
          </CardTitle>
          {paystackService.isTestMode() && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-3">
              <p className="text-xs text-yellow-400">
                🧪 Test Mode: Use Paystack test card 5061 1406 5869 5780 (CVV: 123, PIN: 1234)
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-80 mb-1">Current Balance</p>
              <p className="text-3xl font-bold">GHS {formatAmount(balance.balance)}</p>
            </div>

            {/* Amount to Add */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add (GHS)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white text-2xl font-semibold"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 200, 500].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                  className="border-gray-700 hover:bg-purple-600 hover:border-purple-600"
                >
                  +{amount}
                </Button>
              ))}
            </div>

            {/* Funding Source */}
            <Tabs value={fundingSource} onValueChange={(value: any) => setFundingSource(value)}>
              <TabsList className="grid grid-cols-2 bg-gray-800">
                <TabsTrigger value="momo" className="data-[state=active]:bg-purple-600">
                  <Smartphone className="size-4 mr-2" />
                  Mobile Money
                </TabsTrigger>
                <TabsTrigger value="card" className="data-[state=active]:bg-purple-600">
                  <CreditCard className="size-4 mr-2" />
                  Card
                </TabsTrigger>
              </TabsList>

              <TabsContent value="momo" className="space-y-4 mt-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-400">
                    💡 Mobile money payments are processed instantly via Paystack
                  </p>
                </div>
                {linkedMoMo.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Smartphone className="size-12 mx-auto mb-3 opacity-50" />
                    <p>No mobile money accounts linked</p>
                    <Button
                      onClick={() => navigate('/link-momo')}
                      variant="link"
                      className="text-purple-400 mt-2"
                    >
                      Link an account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Select Mobile Money Account</Label>
                    <Select
                      value={formData.selectedMoMoId}
                      onValueChange={(value) => setFormData({ ...formData, selectedMoMoId: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Choose an account" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {linkedMoMo.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.network} - {account.phoneNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="card" className="space-y-4 mt-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-400">
                    💳 Secure card payments powered by Paystack
                  </p>
                </div>
                {linkedCards.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="size-12 mx-auto mb-3 opacity-50" />
                    <p>No cards linked</p>
                    <Button
                      onClick={() => navigate('/link-card')}
                      variant="link"
                      className="text-purple-400 mt-2"
                    >
                      Link a card
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Select Card</Label>
                    <Select
                      value={formData.selectedCardId}
                      onValueChange={(value) => setFormData({ ...formData, selectedCardId: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Choose a card" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {linkedCards.map((card) => (
                          <SelectItem key={card.id} value={card.id}>
                            •••• {card.last4Digits || card.cardNumber} - {card.cardholderName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleContinue}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={
                !formData.amount ||
                parseFloat(formData.amount) <= 0 ||
                (fundingSource === 'momo' && linkedMoMo.length === 0) ||
                (fundingSource === 'card' && linkedCards.length === 0)
              }
            >
              Continue to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
