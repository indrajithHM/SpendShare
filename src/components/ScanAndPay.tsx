"use client";
import { useState } from 'react';
import { push, ref } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import QRScanner from './QRScanner';
import { parseUPIQR, generateUPILink, openUPIPayment, UPI_APPS, UPIData } from '@/lib/upiUtils';
import { useUserCategories } from '@/hooks/useUserCategories';
import { CategoryIcon } from './CategoryIcon';
import BottomSheet from './BottomSheet';
import { ChevronDown, Scan, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

const getMonthKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
interface ScanAndPayProps {
  onClose: () => void;
}


export default function ScanAndPay({ onClose }: ScanAndPayProps) {
  const [step, setStep] = useState<'scan' | 'details' | 'payment' | 'confirm'>('scan');
  const [upiData, setUpiData] = useState<UPIData | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Groceries');
  const [isCredit, setIsCredit] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [loading, setLoading] = useState(false);

  const { allCategories } = useUserCategories();

  const resetAll = () => {
    setStep('scan');
    setUpiData(null);
    setAmount('');
    setDescription('');
    setSelectedCategory('Groceries');
    setIsCredit(false);
  };

  const handleScan = (data: string) => {
    const parsed = parseUPIQR(data);
    if (parsed && parsed.payeeAddress) {
      setUpiData(parsed);
      setAmount(parsed.amount || '');
      setDescription(parsed.transactionNote || '');
      setStep('details');
    } else {
      alert('Invalid QR code. Please scan a valid UPI payment QR code.');
    }
  };

  const getCategoryIcon = (key: string) => {
    const cat = allCategories.find(c => c.key === key);
    return cat?.icon || 'Tag';
  };

  const handlePayment = (appScheme?: string) => {
    if (!upiData) return;
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount before proceeding.');
      return;
    }
    openUPIPayment({ ...upiData, amount }, appScheme);
    setStep('confirm');
  };

  const addExpense = async () => {
    if (!upiData) return;
    setLoading(true);
    try {
      const timestamp = Date.now();
      const data = {
        amount: Number(amount) || 0,
        description: description.trim() || upiData.payeeName || upiData.payeeAddress || 'UPI Payment',
        bank: 'UPI',
        category: selectedCategory,
        type: isCredit ? 'CREDIT' : 'DEBIT',
        timestamp,
        createdAt: timestamp,
        upiId: upiData.payeeAddress,
      };
      const monthKey = getMonthKey(timestamp);
      await push(ref(db, `expenses/${auth.currentUser!.uid}/${monthKey}`), data);
      alert('Expense added successfully!');
      resetAll();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP: SCAN ──────────────────────────────────────────────────────────────
  if (step === 'scan') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <Scan className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Payment QR</h3>
          <p className="text-sm text-gray-600">
            Scan a UPI payment QR code to make payment and add expense
          </p>
        </div>
       // In the scan step JSX:
<QRScanner onScan={handleScan} onClose={onClose} />
      </div>
    );
  }

  // ── STEP: DETAILS ───────────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={resetAll}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {/* Merchant */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant</label>
            <p className="text-gray-900 font-medium mt-0.5">
              {upiData?.payeeName || upiData?.payeeAddress}
            </p>
          </div>

          {/* UPI ID */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">UPI ID</label>
            <p className="text-gray-600 text-sm mt-0.5">{upiData?.payeeAddress}</p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Description <span className="normal-case text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note…"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white mt-1"
            />
          </div>

          {/* Payment Type toggle */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Type</label>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{isCredit ? 'Credit' : 'Debit'}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCredit((prev) => !prev)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isCredit ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isCredit ? 'Set Debit' : 'Set Credit'}
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Category
          </label>
          <button
            type="button"
            onClick={() => setShowCategorySheet(true)}
            className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-3 bg-white hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <CategoryIcon name={getCategoryIcon(selectedCategory)} className="w-4.5 h-4.5 text-indigo-500" />
              <span>{selectedCategory}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <button
          onClick={() => {
            if (!amount || Number(amount) <= 0) {
              alert('Please enter a valid amount before proceeding.');
              return;
            }
            setStep('payment');
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition-colors"
        >
          Continue to Payment
        </button>

        <BottomSheet
          open={showCategorySheet}
          onClose={() => setShowCategorySheet(false)}
          title="Select Category"
        >
          <div className="grid grid-cols-3 gap-2">
            {allCategories.map((cat) => {
              const selected = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setShowCategorySheet(false);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 transition-all border ${
                    selected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <CategoryIcon
                    name={cat.icon}
                    className={`w-5 h-5 ${selected ? 'text-white' : 'text-indigo-500'}`}
                  />
                  <span className="text-xs text-center">{cat.key}</span>
                </button>
              );
            })}
          </div>
        </BottomSheet>
      </div>
    );
  }

  // ── STEP: PAYMENT ───────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('details')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">Choose Payment App</h3>
        </div>

        {/* Summary card */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-gray-900">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">To</span>
            <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
              {upiData?.payeeName || upiData?.payeeAddress}
            </span>
          </div>
          {description ? (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Note</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
                {description}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Category</span>
            <span className="font-semibold text-gray-900">{selectedCategory}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center">Select your preferred UPI app</p>

        <div className="space-y-2">
          {UPI_APPS.map((app) => (
            <button
              key={app.scheme}
              onClick={() => handlePayment(app.scheme)}
              className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              {app.iconSrc ? (
                <img src={app.iconSrc} alt={app.name} className="w-8 h-8 rounded-full bg-white p-1" />
              ) : (
                <span className="text-2xl">{app.icon}</span>
              )}
              <span className="flex-1 text-left font-medium text-gray-800">{app.name}</span>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </button>
          ))}

          <button
            onClick={() => handlePayment()}
            className="w-full flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <span className="text-2xl">🔗</span>
            <span className="flex-1 text-left font-medium text-gray-700">Other UPI apps</span>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  // ── STEP: CONFIRM ───────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Initiated</h3>
          <p className="text-sm text-gray-500 mt-1">
            Complete the payment in your UPI app, then save this transaction.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="font-semibold text-gray-900">₹{amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Merchant</span>
            <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
              {upiData?.payeeName || upiData?.payeeAddress}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Description</span>
            <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
              {description.trim() || upiData?.payeeName || upiData?.payeeAddress || 'UPI Payment'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Type</span>
            <span className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
              {isCredit ? 'Credit' : 'Debit'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Category</span>
            <span className="font-semibold text-gray-900">{selectedCategory}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={addExpense}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save to Expenses'}
          </button>
          <button
            onClick={resetAll}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
          >
            Scan Another QR
          </button>
        </div>
      </div>
    );
  }

  return null;
}