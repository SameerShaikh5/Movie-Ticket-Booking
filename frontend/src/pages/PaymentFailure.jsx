import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { XCircle, RefreshCcw, Home } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = location.state || {};

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <XCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-black text-slate-900">Payment Failed</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'Your transaction could not be verified or was cancelled. Any held seats have been released.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home Page</span>
          </button>
        </div>

      </div>
    </div>
  );
}