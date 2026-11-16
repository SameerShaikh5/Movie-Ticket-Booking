import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Clock, ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { cancelIncompleteBooking, createBookingOrder } from '../apis/booking.api.js';
import { getShowDetails } from '../apis/show.api.js';
import axiosInstance from '../config/axiosInstance.js';


export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showData, setShowData] = useState(null);
  const [isLoadingShow, setIsLoadingShow] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeBookingId, setActiveBookingId] = useState(null);

  useEffect(() => {
    const fetchShow = async () => {
      try {
        setIsLoadingShow(true);
        const res = await getShowDetails(id);
        setShowData(res.data || res);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to load show details.');
      } finally {
        setIsLoadingShow(false);
      }
    };
    fetchShow();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeatClick = (seatId, price) => {
    if (isProcessing) return;
    setErrorMessage('');
    if (selectedSeats.some((s) => s.id === seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        setErrorMessage('You can select a maximum of 6 seats per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, { id: seatId, price }]);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Directly lock seats, generate order, and open Razorpay modal
  const handleProceedToPay = async () => {
    if (selectedSeats.length === 0 || isProcessing) return;

    try {
      setIsProcessing(true);
      setErrorMessage('');
      const seatIds = selectedSeats.map((s) => s.id);

      // 1. Create pending booking and lock seats
      const res = await createBookingOrder({
        showId: id,
        seats: seatIds,
      });

      const { razorpayOrder, booking } = res.data || res;

      // Save the booking ID to state so modal dismissal can reference it
      const bookingId = booking?._id || booking?.id;
      setActiveBookingId(bookingId);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setErrorMessage('Razorpay SDK failed to load.');
        setIsProcessing(false);
        return;
      }

      // 2. Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'CineVault',
        description: `Booking for ${showData?.movieTitle || 'Movie'}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await axiosInstance.post('/bookings/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              navigate('/bookings/success', {
                state: { showData, booking: verifyRes.data.data.booking },
              });
            }
          } catch (err) {
            navigate('/bookings/failure', {
              state: { error: err.response?.data?.message || 'Payment verification failed.' },
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            setIsProcessing(false);
            setErrorMessage('Payment cancelled. Seats have been released.');

            // 3. Call external api function when modal is dismissed
            if (bookingId) {
              try {
                await cancelIncompleteBooking(bookingId);
                setActiveBookingId(null);
              } catch (err) {
                console.error("Failed to release locks on cancel:", err);
              }
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || 'Failed to initialize payment.');
      setIsProcessing(false);
    }
  };


  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (isLoadingShow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const screenSnap = showData?.screenSnapShot || {
    name: 'Screen 1',
    columns: 12,
    standardRows: ['C', 'D', 'E', 'F'],
    vipRows: ['A', 'B'],
    validSeats: [],
  };

  const bookedSeats = showData?.bookedSeats || [];
  const pricing = showData?.pricing || { standard: 280, vip: 450 };

  const rowMap = {};
  if (screenSnap.validSeats && screenSnap.validSeats.length > 0) {
    screenSnap.validSeats.forEach((seatId) => {
      const rowLetter = seatId.charAt(0);
      if (!rowMap[rowLetter]) rowMap[rowLetter] = [];
      rowMap[rowLetter].push(seatId);
    });
  } else {
    const defaultRows = [...(screenSnap.vipRows || []), ...(screenSnap.standardRows || ['C', 'D', 'E', 'F'])];
    defaultRows.forEach((r) => {
      rowMap[r] = Array.from({ length: screenSnap.columns || 12 }, (_, i) => `${r}${i + 1}`);
    });
  }

  const seatRowsToRender = Object.keys(rowMap).map((rowLetter) => {
    const isVip = (screenSnap.vipRows || []).includes(rowLetter);
    const price = isVip ? pricing.vip : pricing.standard;
    const tier = isVip ? 'VIP Recliner' : 'Executive Standard';
    return { row: rowLetter, tier, price, seats: rowMap[rowLetter] };
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-6 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {showData?.movieTitle || 'Movie'} — {screenSnap.name || 'Screen'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {showData?.startTime ? new Date(showData.startTime).toLocaleString() : ''} • {showData?.format || '2D'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-xl text-xs font-bold">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>Seats held for {formatTimer(timeLeft)}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-8 overflow-x-auto">
          {seatRowsToRender.map((rowGroup) => (
            <div key={rowGroup.row} className="space-y-3 min-w-[550px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1 text-[11px] font-bold text-slate-400">
                <span>Row {rowGroup.row} — {rowGroup.tier}</span>
                <span>₹{rowGroup.price}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 text-xs font-bold text-slate-400">{rowGroup.row}</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowGroup.seats.map((seatId) => {
                    const seatNum = seatId.replace(/^\D+/g, '');
                    const isSold = bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.some((s) => s.id === seatId);
                    const isVIP = rowGroup.tier.includes('VIP');

                    return (
                      <button
                        key={seatId}
                        disabled={isSold || isProcessing}
                        onClick={() => handleSeatClick(seatId, rowGroup.price)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${isSold ? 'bg-slate-200 text-slate-400 border-slate-300 opacity-50 cursor-not-allowed' :
                          isSelected ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-105' :
                            isVIP ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' :
                              'bg-white text-slate-700 border-slate-200 hover:border-rose-500'
                          }`}
                      >
                        {seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-2xl p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500">{selectedSeats.length} Seats Selected:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-900">{selectedSeats.map((s) => s.id).join(', ')}</span>
                <span className="text-lg font-black text-rose-600">₹{totalPrice}</span>
              </div>
            </div>
            <button
              onClick={handleProceedToPay}
              disabled={isProcessing}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <span>Proceed to Pay ₹{totalPrice}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}