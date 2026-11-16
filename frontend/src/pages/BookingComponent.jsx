import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle2, XCircle, Ticket, RefreshCw } from 'lucide-react';

export default function BookingStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showData, selectedSeats = [], finalTotal, error, isSuccess = true } = location.state || {};

  // If accessed directly without state, fallback home
  if (!showData && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <p className="text-sm font-bold text-slate-700">No booking details found.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">Go Home</button>
      </div>
    );
  }

  // --- FAILURE VIEW ---
  if (!isSuccess || error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-900">Payment Failed</h1>
            <p className="text-xs text-slate-500">{error || 'Your transaction could not be completed.'}</p>
          </div>
          <div className="space-y-2 pt-2">
            <button onClick={() => navigate(-1)} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button onClick={() => navigate('/')} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUCCESS VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
        <div className="bg-emerald-600 text-white p-6 text-center space-y-1">
          <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" />
          <h1 className="text-lg font-black">Booking Confirmed!</h1>
          <p className="text-xs text-emerald-100">Your seats are successfully locked & secured.</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{showData?.movieTitle}</h2>
              <span className="text-[11px] text-slate-500 font-medium">{showData?.format} • Censor: {showData?.censor}</span>
            </div>
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md">
              {showData?.screenSnapShot?.name || 'Screen 1'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">DATE & TIME</span>
              <span className="font-bold text-slate-800">{new Date(showData?.startTime).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">SEATS ({selectedSeats.length})</span>
              <span className="font-bold text-slate-800">{selectedSeats.map(s => s.id).join(', ')}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
            <Ticket className="w-8 h-8 mx-auto text-rose-600" />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Booking ID: CV-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>

          <button onClick={() => navigate('/')} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer">
            Back to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}