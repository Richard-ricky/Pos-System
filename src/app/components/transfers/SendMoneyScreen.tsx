import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Send, Smartphone, CreditCard, Building2,
  CheckCircle2, XCircle, Loader2, ChevronRight, Wallet,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as api from '../../utils/api';
import { paystackService } from '../../services/paystack';
import { useAuth } from '../../contexts/AuthContext';
import { LinkedCard, PaymentMethod } from '../../types';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type RecipientType = 'momo' | 'bank' | 'card';
type TransferStep = 'details' | 'confirm' | 'processing' | 'success' | 'failed';

// ─── Recipient type selector ──────────────────────────────────────────────────

const RECIPIENT_TYPES: { value: RecipientType; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    value: 'momo',
    label: 'Mobile Money',
    sub: 'MTN, Vodafone, AirtelTigo',
    icon: <Smartphone className="size-5" />,
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    sub: 'GCB, Ecobank, Stanbic & more',
    icon: <Building2 className="size-5" />,
  },
  {
    value: 'card',
    label: 'Card Transfer',
    sub: 'Visa / Mastercard',
    icon: <CreditCard className="size-5" />,
  },
];

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step }: { step: TransferStep }) {
  const steps = ['details', 'confirm'];
  const current = steps.indexOf(step);
  if (current < 0) return null;
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={[
            'size-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
            i <= current ? 'bg-primary text-primary-foreground' : 'bg-surface-3 text-muted-foreground',
          ].join(' ')}>
            {i + 1}
          </div>
          <span className={[
            'text-xs font-medium capitalize',
            i === current ? 'text-foreground' : 'text-muted-foreground',
          ].join(' ')}>
            {s === 'details' ? 'Transfer details' : 'Review & confirm'}
          </span>
          {i < steps.length - 1 && (
            <ChevronRight className="size-3.5 text-muted-foreground mx-1" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SendMoneyScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipientType, setRecipientType] = useState<RecipientType>('momo');
  const [step, setStep] = useState<TransferStep>('details');
  const [walletBalance, setWalletBalance] = useState(0);
  const [linkedCards, setLinkedCards] = useState<LinkedCard[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    amount: '',
    recipientPhone: '',
    recipientNetwork: '',
    recipientCardNumber: '',
    recipientAccountNumber: '',
    recipientBankName: '',
    recipientName: '',
    fundingSource: 'wallet' as PaymentMethod,
    selectedCardId: '',
  });

  const update = (patch: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const [walletRes, cardsRes] = await Promise.all([
          api.getWalletBalance(),
          api.getLinkedCards(),
        ]);
        setWalletBalance(
          walletRes?.wallet?.balance ?? walletRes?.balance ?? 0,
        );
        setLinkedCards(
          Array.isArray(cardsRes?.cards) ? cardsRes.cards
          : Array.isArray(cardsRes?.data) ? cardsRes.data
          : [],
        );
      } catch {
        toast.error('Failed to load account data');
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return false; }
    if (formData.fundingSource === 'wallet' && amount > walletBalance) {
      toast.error('Insufficient wallet balance'); return false;
    }
    if (recipientType === 'momo') {
      if (formData.recipientPhone.length !== 10) { toast.error('Enter a valid 10-digit phone number'); return false; }
      if (!formData.recipientNetwork) { toast.error('Select a network'); return false; }
    } else if (recipientType === 'card') {
      if (formData.recipientCardNumber.length !== 16) { toast.error('Enter a valid 16-digit card number'); return false; }
    } else if (recipientType === 'bank') {
      if (!formData.recipientAccountNumber || !formData.recipientBankName) {
        toast.error('Enter bank details'); return false;
      }
    }
    if (!formData.recipientName.trim()) { toast.error('Enter recipient name'); return false; }
    return true;
  };

  // ── Confirm & send ─────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    if (!user) return;

    const amount = parseFloat(formData.amount);
    const recipient = recipientType === 'momo' ? formData.recipientPhone : formData.recipientName;

    try {
      if (formData.fundingSource === 'wallet') {
        // Wallet path: safe to set processing before API call (no popup involved)
        setStep('processing');
        await api.createTransaction({
          type: 'send', amount, status: 'success', method: 'wallet',
          description: `Transfer to ${formData.recipientName}`,
          recipient, recipientType,
          recipientNetwork: formData.recipientNetwork || undefined,
        });
        setStep('success');
      } else {
        // Paystack path: DO NOT call setStep or setState before initializePayment.
        // Any React re-render before the popup opens breaks the browser's user-gesture
        // chain and Paystack silently refuses to open the iframe.
        await new Promise<void>((resolve, reject) => {
          paystackService.initializePayment({
            email: user.email,
            amount,
            metadata: { userId: user.id, type: 'send_money', recipient, recipientType },
            channels: formData.fundingSource === 'card' ? ['card'] : ['mobile_money'],
            onSuccess: async (reference) => {
              // Only show processing AFTER popup closes successfully
              setStep('processing');
              try {
                await api.verifyPayment(reference);
                await api.createTransaction({
                  type: 'send', amount, status: 'success', method: formData.fundingSource,
                  description: `Transfer to ${formData.recipientName}`,
                  recipient, reference, recipientType,
                  recipientNetwork: formData.recipientNetwork || undefined,
                });
                resolve();
              } catch (err) { reject(err); }
            },
            onError: (err) => reject(err),
            onClose: () => reject(new Error('Payment cancelled')),
          });
        });
        setStep('success');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transfer failed';
      if (msg === 'Payment cancelled') {
        setStep('details');
        toast.info('Payment cancelled');
      } else {
        console.error('Transfer error:', err);
        setStep('failed');
      }
    }
  };

  const fmtAmount = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  // ─── Full-screen states ────────────────────────────────────────────────────

  if (step === 'processing') {
    return (
      <div className="max-w-lg mx-auto pt-12">
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-4 shadow-sm">
          <div className="size-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="size-7 text-primary animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Processing transfer…</h3>
            <p className="text-sm text-muted-foreground mt-1">Please wait, do not close this page</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto pt-12">
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-5 shadow-sm">
          <div className="size-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transfer successful</h3>
            <p className="text-sm text-muted-foreground mt-1">
              GHS {fmtAmount(formData.amount)} sent to {formData.recipientName}
            </p>
          </div>
          <div className="pt-2 flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStep('details'); setFormData({ amount: '', recipientPhone: '', recipientNetwork: '', recipientCardNumber: '', recipientAccountNumber: '', recipientBankName: '', recipientName: '', fundingSource: 'wallet', selectedCardId: '' }); }} className="border-border">
              Send again
            </Button>
            <Button onClick={() => navigate('/wallet')}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'failed') {
    return (
      <div className="max-w-lg mx-auto pt-12">
        <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-5 shadow-sm">
          <div className="size-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="size-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transfer failed</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn't process your transfer. Please try again.
            </p>
          </div>
          <div className="pt-2 flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/wallet')} className="border-border">
              Cancel
            </Button>
            <Button onClick={() => setStep('details')}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Details + Confirm ────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Back button */}
      <button
        onClick={() => step === 'confirm' ? setStep('details') : navigate('/wallet')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        {step === 'confirm' ? 'Back to details' : 'Back to Wallet'}
      </button>

      {/* Page title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Send Money</h1>
        <p className="text-sm text-muted-foreground">Transfer funds quickly and securely</p>
      </div>

      <StepBar step={step} />

      {step === 'details' ? (
        <div className="space-y-4">

          {loadingData ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* ── Transfer type ── */}
              <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Transfer type
                  </p>
                </div>
                <div className="divide-y divide-border/60">
                  {RECIPIENT_TYPES.map(({ value, label, sub, icon }) => (
                    <button
                      key={value}
                      onClick={() => setRecipientType(value)}
                      className={[
                        'w-full flex items-center gap-4 px-4 py-3.5 transition-colors text-left',
                        recipientType === value ? 'bg-primary/5' : 'hover:bg-accent',
                      ].join(' ')}
                    >
                      <div className={[
                        'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                        recipientType === value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface-3 text-muted-foreground',
                      ].join(' ')}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={[
                          'text-sm font-medium',
                          recipientType === value ? 'text-foreground' : 'text-foreground',
                        ].join(' ')}>
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{sub}</p>
                      </div>
                      <div className={[
                        'size-4 rounded-full border-2 shrink-0 transition-colors',
                        recipientType === value
                          ? 'border-primary bg-primary'
                          : 'border-border',
                      ].join(' ')} />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Recipient details ── */}
              <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Recipient details
                  </p>
                </div>
                <div className="p-4 space-y-4">

                  {recipientType === 'momo' && (
                    <>
                      <div className="space-y-1.5">
                        <Label>Network provider</Label>
                        <Select value={formData.recipientNetwork} onValueChange={(v) => update({ recipientNetwork: v })}>
                          <SelectTrigger className="bg-input-background border-border">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                            <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                            <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="0241234567"
                          value={formData.recipientPhone}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '');
                            if (v.length <= 10) update({ recipientPhone: v });
                          }}
                          className="bg-input-background border-border font-mono"
                        />
                      </div>
                    </>
                  )}

                  {recipientType === 'bank' && (
                    <>
                      <div className="space-y-1.5">
                        <Label>Bank</Label>
                        <Select value={formData.recipientBankName} onValueChange={(v) => update({ recipientBankName: v })}>
                          <SelectTrigger className="bg-input-background border-border">
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="GCB">GCB Bank</SelectItem>
                            <SelectItem value="Ecobank">Ecobank Ghana</SelectItem>
                            <SelectItem value="Stanbic">Stanbic Bank</SelectItem>
                            <SelectItem value="Zenith">Zenith Bank</SelectItem>
                            <SelectItem value="Fidelity">Fidelity Bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="account">Account number</Label>
                        <Input
                          id="account"
                          placeholder="1234567890"
                          value={formData.recipientAccountNumber}
                          onChange={(e) => update({ recipientAccountNumber: e.target.value })}
                          className="bg-input-background border-border font-mono"
                        />
                      </div>
                    </>
                  )}

                  {recipientType === 'card' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="cardnum">Card number</Label>
                      <Input
                        id="cardnum"
                        placeholder="1234 5678 9012 3456"
                        value={formData.recipientCardNumber
                          .replace(/\D/g, '')
                          .replace(/(.{4})/g, '$1 ')
                          .trim()}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          if (v.length <= 16) update({ recipientCardNumber: v });
                        }}
                        className="bg-input-background border-border font-mono tracking-widest"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="rname">Recipient full name</Label>
                    <Input
                      id="rname"
                      placeholder="e.g. Kwame Mensah"
                      value={formData.recipientName}
                      onChange={(e) => update({ recipientName: e.target.value })}
                      className="bg-input-background border-border"
                    />
                  </div>
                </div>
              </div>

              {/* ── Amount & funding ── */}
              <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Amount & payment
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Amount (GHS)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                        GHS
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => update({ amount: e.target.value })}
                        className="bg-input-background border-border pl-12 text-lg font-semibold tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Pay from</Label>
                    <Select
                      value={formData.fundingSource}
                      onValueChange={(v: PaymentMethod) => update({ fundingSource: v })}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="wallet">
                          <div className="flex items-center gap-2">
                            <Wallet className="size-3.5 text-muted-foreground" />
                            Wallet — GHS {walletBalance.toFixed(2)}
                          </div>
                        </SelectItem>
                        {linkedCards.map((card) => (
                          <SelectItem key={card.id} value="card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="size-3.5 text-muted-foreground" />
                              •••• {card.cardNumber} — {card.cardholderName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.fundingSource === 'wallet' && (
                      <p className="text-xs text-muted-foreground">
                        Available: <span className="font-medium text-foreground tabular-nums">GHS {walletBalance.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => { if (validate()) setStep('confirm'); }}
                className="w-full gap-2"
                size="lg"
              >
                Continue <ChevronRight className="size-4" />
              </Button>
            </>
          )}
        </div>

      ) : (
        // ── Confirm step ──────────────────────────────────────────────────────
        <div className="space-y-4">

          {/* Amount hero */}
          <div className="rounded-xl border border-border bg-card shadow-xs p-6 text-center space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              You're sending
            </p>
            <p className="text-5xl font-bold tabular-nums text-foreground">
              GHS {fmtAmount(formData.amount)}
            </p>
          </div>

          {/* Transfer summary */}
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-surface-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Transfer summary
              </p>
            </div>
            <div className="divide-y divide-border/50">
              {[
                { label: 'To', value: formData.recipientName },
                { label: 'Method', value: RECIPIENT_TYPES.find(t => t.value === recipientType)?.label },
                ...(recipientType === 'momo' ? [
                  { label: 'Network', value: formData.recipientNetwork },
                  { label: 'Number', value: formData.recipientPhone },
                ] : []),
                ...(recipientType === 'bank' ? [
                  { label: 'Bank', value: formData.recipientBankName },
                  { label: 'Account', value: formData.recipientAccountNumber },
                ] : []),
                ...(recipientType === 'card' ? [
                  { label: 'Card', value: `•••• ${formData.recipientCardNumber.slice(-4)}` },
                ] : []),
                {
                  label: 'Pay from',
                  value: formData.fundingSource === 'wallet'
                    ? `Wallet (GHS ${walletBalance.toFixed(2)})`
                    : 'Card via Paystack',
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note for non-wallet */}
          {formData.fundingSource !== 'wallet' && (
            <p className="text-xs text-muted-foreground text-center px-4">
              A Paystack payment window will open to complete this transfer securely.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep('details')}
              className="flex-1 border-border"
            >
              Edit details
            </Button>
            <Button onClick={handleConfirm} className="flex-1 gap-2">
              <Send className="size-4" />
              {formData.fundingSource === 'wallet' ? 'Send now' : 'Pay & send'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}