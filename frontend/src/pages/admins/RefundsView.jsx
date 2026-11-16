import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Wallet, CheckCircle2 } from 'lucide-react';

const FAILED_REFUNDS = [
  { id: 'ref_101', userName: 'Rohan Sharma', userId: 'usr_99', amount: 700, showTitle: "Namit Malhotra's Ramayana", reason: 'Razorpay: Insufficient Merchant Balance' },
  { id: 'ref_102', userName: 'Priya Patel', userId: 'usr_104', amount: 1000, showTitle: 'Udta Teer', reason: 'Razorpay: Account Fraud Lock' },
];

export default function RefundsView() {
  const [failedRefunds, setFailedRefunds] = useState(FAILED_REFUNDS);

  const handleResolve = (id, action) => {
    alert(`Action "${action}" executed for refund ID ${id}`);
    setFailedRefunds(failedRefunds.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Refund Exception Management</h2>
        <p className="text-xs text-slate-500">Resolve gateway reversals rejected by Razorpay due to merchant balance limits or fraud locks.</p>
      </div>

      <div className="space-y-4">
        {failedRefunds.map((refund) => (
          <div key={refund.id} className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{refund.userName}</span>
                <span className="text-slate-400 font-mono text-[10px]">({refund.userId})</span>
              </div>
              <p className="text-slate-600 font-medium">Movie: {refund.showTitle}</p>
              <span className="inline-block bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                {refund.reason}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-900 mr-2">₹{refund.amount}</span>
              <button 
                onClick={() => handleResolve(refund.id, 'Razorpay Retry')}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Gateway Reversal
              </button>
              <button 
                onClick={() => handleResolve(refund.id, 'CineVault Wallet Credit')}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5" /> Credit to Wallet
              </button>
            </div>
          </div>
        ))}

        {failedRefunds.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-600">All refund exception queues cleared!</p>
          </div>
        )}
      </div>
    </div>
  );
}