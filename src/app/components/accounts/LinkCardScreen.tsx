import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import * as api from '../../utils/api';
import { toast } from 'sonner';

export function LinkCardScreen() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    cardType: 'visa' as 'visa' | 'mastercard',
    setAsDefault: false,
  });

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const matches = cleaned.match(/.{1,4}/g);
    return matches ? matches.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setFormData({ ...formData, cardNumber: value });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setFormData({ ...formData, expiryDate: value });
    }
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setFormData({ ...formData, cvv: value });
    }
  };

  const validateForm = () => {
    if (formData.cardNumber.length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return false;
    }
    if (!formData.cardholderName.trim()) {
      toast.error('Please enter cardholder name');
      return false;
    }
    if (formData.expiryDate.length !== 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return false;
    }
    if (formData.cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Link card via backend API
      await api.linkCard({
        last4Digits: formData.cardNumber.slice(-4),
        cardholderName: formData.cardholderName,
        expiryDate: formData.expiryDate,
        cardType: formData.cardType,
        isDefault: formData.setAsDefault,
      });

      toast.success('Card linked successfully!');
      navigate('/accounts');
    } catch (error: any) {
      console.error('Error linking card:', error);
      toast.error(error.message || 'Failed to link card');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/accounts')}
        className="mb-4 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to Linked Accounts
      </Button>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Link Debit/Credit Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Preview */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <div className="text-xs opacity-80">Debit Card</div>
                <div className="text-sm">{formData.cardType === 'visa' ? 'VISA' : 'Mastercard'}</div>
              </div>
              <div className="mb-6">
                <p className="text-xl tracking-wider font-mono">
                  {formatCardNumber(formData.cardNumber) || '•••• •••• •••• ••••'}
                </p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-80 mb-1">Cardholder Name</p>
                  <p className="font-medium">{formData.cardholderName || 'YOUR NAME'}</p>
                </div>
                <div>
                  <p className="text-xs opacity-80 mb-1">Expires</p>
                  <p className="font-medium">{formData.expiryDate || 'MM/YY'}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(formData.cardNumber)}
                  onChange={handleCardNumberChange}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value.toUpperCase() })}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleExpiryChange}
                    className="bg-gray-800 border-gray-700 text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleCVVChange}
                    className="bg-gray-800 border-gray-700 text-white font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardType">Card Type</Label>
                  <Select
                    value={formData.cardType}
                    onValueChange={(value: 'visa' | 'mastercard') => setFormData({ ...formData, cardType: value })}
                  >
                    <SelectTrigger id="cardType" className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="visa">VISA</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="setAsDefault"
                  checked={formData.setAsDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, setAsDefault: checked as boolean })}
                />
                <label
                  htmlFor="setAsDefault"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  Set as default payment method
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/accounts')}
                disabled={isProcessing}
                className="flex-1 border-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isProcessing ? 'Verifying...' : 'Link Card'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}