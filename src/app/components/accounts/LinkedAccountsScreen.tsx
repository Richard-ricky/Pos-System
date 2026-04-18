import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { CreditCard, Smartphone, Plus, Trash2, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import * as api from '../../utils/api';
import { LinkedCard, LinkedMobileMoney } from '../../types';
import { toast } from 'sonner';

export function LinkedAccountsScreen() {
  const [cards, setCards] = useState<LinkedCard[]>([]);
  const [momoAccounts, setMomoAccounts] = useState<LinkedMobileMoney[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'card' | 'momo'; id: string } | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const [cardsRes, momoRes] = await Promise.all([
        api.getLinkedCards(),
        api.getLinkedMobileMoney(),
      ]);
      setCards(cardsRes.cards ?? []);
      setMomoAccounts(momoRes.momos ?? []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load linked accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = (id: string) => {
    setItemToDelete({ type: 'card', id });
    setDeleteDialogOpen(true);
  };

  const handleDeleteMomo = (id: string) => {
    setItemToDelete({ type: 'momo', id });
    setDeleteDialogOpen(true);
  };

  // Delete just removes from local state (no delete endpoint yet — add one if needed)
  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'card') {
      setCards((prev) => prev.filter((c) => c.id !== itemToDelete.id));
      toast.success('Card removed');
    } else {
      setMomoAccounts((prev) => prev.filter((a) => a.id !== itemToDelete.id));
      toast.success('Mobile money account removed');
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Set default updates local state only (persist via updateCard/updateMomo if you add those endpoints)
  const setAsDefault = (type: 'card' | 'momo', id: string) => {
    if (type === 'card') {
      setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
      toast.success('Default card updated');
    } else {
      setMomoAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
      toast.success('Default mobile money account updated');
    }
  };

  const getCardLogo = (cardType: string) =>
    cardType === 'visa' ? '💳 VISA' : '💳 Mastercard';

  const getMoMoLogo = (network: string) =>
    ({ MTN: '📱 MTN', Vodafone: '📱 Vodafone', AirtelTigo: '📱 AirtelTigo' }[network] ?? '📱');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Linked Cards ── */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Linked Cards
            </CardTitle>
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Link to="/link-card">
                <Plus className="size-4 mr-2" />
                Add Card
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="size-12 mx-auto mb-3 opacity-50" />
              <p>No cards linked</p>
              <p className="text-sm mt-1">Add a debit or credit card to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <CreditCard className="size-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getCardLogo(card.cardType)}</p>
                        {card.isDefault && (
                          <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                            <Star className="size-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      {/* cardNumber here is last 4 digits */}
                      <p className="text-sm text-gray-400">•••• •••• •••• {card.cardNumber}</p>
                      <p className="text-sm text-gray-500">
                        {card.cardholderName} • Expires {card.expiryDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAsDefault('card', card.id)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Mobile Money ── */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="size-5" />
              Mobile Money Accounts
            </CardTitle>
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Link to="/link-momo">
                <Plus className="size-4 mr-2" />
                Add Account
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {momoAccounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Smartphone className="size-12 mx-auto mb-3 opacity-50" />
              <p>No mobile money accounts linked</p>
              <p className="text-sm mt-1">Link MTN, Vodafone, or AirtelTigo account</p>
            </div>
          ) : (
            <div className="space-y-3">
              {momoAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="size-6 text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getMoMoLogo(account.network)}</p>
                        {account.isDefault && (
                          <span className="flex items-center gap-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                            <Star className="size-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{account.phoneNumber}</p>
                      <p className="text-sm text-gray-500">{account.accountName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!account.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAsDefault('momo', account.id)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteMomo(account.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {itemToDelete?.type === 'card' ? 'Card' : 'Account'}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. Are you sure you want to remove this{' '}
              {itemToDelete?.type === 'card' ? 'card' : 'mobile money account'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}