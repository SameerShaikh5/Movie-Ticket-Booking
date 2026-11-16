import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle2, Ticket, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showData, booking } = location.state || {};

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-6">
        
        {/* Header Banner */}
        <div className="bg-emerald-600 text-white p-6 text-center space-y-1">
          <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" />
          <h1 className="text-lg font-black">Payment Successful!</h1>
          <p className="text-xs text-emerald-100">Your seats are successfully locked & confirmed.</p>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{showData?.movieTitle || 'Movie Ticket'}</h2>
              <span className="text-[11px] text-slate-500 font-medium">{showData?.format || '2D'} • {showData?.language || 'Hindi'}</span>
            </div>
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md">
              {showData?.screenSnapShot?.name || 'Screen 1'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">DATE & TIME</span>
              <span className="font-bold text-slate-800">
                {showData?.startTime ? new Date(showData.startTime).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">SEATS</span>
              <span className="font-bold text-rose-600 text-sm">
                {booking?.seats ? booking.seats.map(s => s.seatNumber).join(', ') : 'N/A'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
            <Ticket className="w-8 h-8 mx-auto text-rose-600" />
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Booking ID: {booking?._id || 'CV-SUCCESS'}
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home Page</span>
          </button>
        </div>

      </div>
    </div>
  );
}