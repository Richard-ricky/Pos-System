import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import * as api from '../../utils/api';
import { toast } from 'sonner';

type MoMoNetwork = 'MTN' | 'Vodafone' | 'AirtelTigo';

export function LinkMobileMoneyScreen() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    network: '' as MoMoNetwork | '',
    accountName: '',
    setAsDefault: false,
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData({ ...formData, phoneNumber: value });
    }
  };

  const formatPhoneNumber = (value: string) => {
    if (value.length <= 3) return value;
    if (value.length <= 6) return `${value.slice(0, 3)} ${value.slice(3)}`;
    return `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
  };

  const validateForm = () => {
    if (formData.phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.network) {
      toast.error('Please select a network');
      return false;
    }
    if (!formData.accountName.trim()) {
      toast.error('Please enter account name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Link mobile money via backend API
      await api.linkMobileMoney({
        phoneNumber: formData.phoneNumber,
        network: formData.network,
        accountName: formData.accountName,
        isDefault: formData.setAsDefault,
      });

      toast.success('Mobile money account linked successfully!');
      navigate('/accounts');
    } catch (error: any) {
      console.error('Error linking mobile money:', error);
      toast.error(error.message || 'Failed to link mobile money account');
    } finally {
      setIsProcessing(false);
    }
  };

  const getNetworkColor = (network: string) => {
    const colors: Record<string, string> = {
      MTN: 'from-yellow-500 to-yellow-600',
      Vodafone: 'from-red-500 to-red-600',
      AirtelTigo: 'from-blue-500 to-blue-600',
    };
    return colors[network] || 'from-gray-500 to-gray-600';
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
            <Smartphone className="size-5" />
            Link Mobile Money Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Preview */}
            <div className={`bg-gradient-to-br ${formData.network ? getNetworkColor(formData.network) : 'from-gray-600 to-gray-700'} rounded-xl p-6 text-white`}>
              <div className="flex items-center justify-between mb-8">
                <Smartphone className="size-8" />
                <div className="text-xl font-bold">
                  {formData.network || 'Mobile Money'}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs opacity-80 mb-1">Phone Number</p>
                  <p className="text-2xl font-mono tracking-wider">
                    {formatPhoneNumber(formData.phoneNumber) || '--- --- ----'}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-80 mb-1">Account Name</p>
                  <p className="font-medium">{formData.accountName || 'YOUR NAME'}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network">Network Provider</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value: MoMoNetwork) => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger id="network" className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select network provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                    <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                    <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0241234567"
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  required
                />
                <p className="text-xs text-gray-500">Enter the number registered with mobile money</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
                <p className="text-xs text-gray-500">Name as registered with mobile money provider</p>
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

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                ℹ️ You will receive a prompt on your phone to authorize this link. Make sure your phone is nearby.
              </p>
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
                {isProcessing ? 'Linking...' : 'Link Account'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}