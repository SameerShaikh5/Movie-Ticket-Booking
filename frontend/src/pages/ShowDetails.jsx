import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Star,
  Clock,
  Calendar,
  Monitor,
  Ticket,
  Armchair,
  Languages,
  Film,
  Loader2,
  ChevronLeft,
  IndianRupee,
} from 'lucide-react';
import { getShowDetails } from '../apis/show.api.js';

const formatRuntime = (minutes) => {
  if (minutes == null || Number.isNaN(Number(minutes))) return '—';
  const total = Number(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const prettyFormat = (format) => {
  if (!format) return '—';
  return String(format).replace(/IMAX3D/i, 'IMAX 3D');
};

const formatPrice = (amount) => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export default function ShowDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchShow = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getShowDetails(id);
        const details = response?.data || null;
        if (!cancelled) {
          if (!details) {
            setErrorMessage('Show details are unavailable.');
            setShow(null);
          } else {
            setShow(details);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setShow(null);
          setErrorMessage(error?.message || 'Failed to load show details.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (id) fetchShow();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading show details...</p>
      </div>
    );
  }

  if (errorMessage || !show) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-rose-300 space-y-4">
          <Film className="w-8 h-8 mx-auto text-rose-400" />
          <p className="text-sm font-semibold text-rose-600">{errorMessage || 'Show not found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Back to shows
          </button>
        </div>
      </div>
    );
  }

  const screen = show.screenSnapShot || {};
  const bookedCount = Array.isArray(show.bookedSeats) ? show.bookedSeats.length : 0;
  const totalSeats = Number(screen.totalSeats) || 0;
  const seatsLeft = Math.max(totalSeats - bookedCount, 0);
  const isCancelled = show.status === 'CANCELLED';
  const hasStarted = show.startTime ? new Date(show.startTime) <= new Date() : false;
  const canBook = !isCancelled && !hasStarted && seatsLeft > 0;
  const genres = Array.isArray(show.genre) ? show.genre : [];

  const facts = [
    { label: 'Starts', value: formatDateTime(show.startTime), icon: Calendar },
    { label: 'Ends', value: formatDateTime(show.endTime), icon: Clock },
    { label: 'Runtime', value: formatRuntime(show.runtime), icon: Film },
    { label: 'Language', value: show.language || '—', icon: Languages },
    { label: 'Screen', value: screen.name || '—', icon: Monitor },
    {
      label: 'Seats left',
      value: totalSeats ? `${totalSeats-bookedCount} of ${totalSeats}` : '—',
      icon: Armchair,
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-25 filter blur-sm">
          <img src={show.posterImage} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
            <img src={show.posterImage} alt={show.movieTitle} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-4 text-center md:text-left max-w-2xl w-full">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold">
              {show.censor && (
                <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-md">{show.censor}</span>
              )}
              <span className="bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-md text-slate-200 border border-white/10">
                {formatRuntime(show.runtime)}
              </span>
              {show.language && (
                <span className="bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-md text-slate-200 border border-white/10">
                  {show.language}
                </span>
              )}
              <span className="bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-md text-slate-200 border border-white/10">
                {prettyFormat(show.format)}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{show.movieTitle}</h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">{show.description}</p>

            {genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/30"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <div className="inline-flex items-center gap-3 bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-md">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-lg">
                <Star className="w-5 h-5 fill-amber-400" /> {show.rating}
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCancelled ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isCancelled ? 'Cancelled' : 'Scheduled'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Show details</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Screening time, runtime, screen, and seats for this show.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {prettyFormat(show.format)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facts.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900">Ticket prices</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="min-w-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Standard</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />
                    {show.pricing?.standard != null
                      ? Number(show.pricing.standard).toLocaleString('en-IN')
                      : '—'}
                  </p>
                </div>
                <div className="min-w-[140px] rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">VIP</p>
                  <p className="text-lg font-black text-rose-700 mt-0.5 flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />
                    {show.pricing?.vip != null
                      ? Number(show.pricing.vip).toLocaleString('en-IN')
                      : '—'}
                  </p>
                </div>
              </div>
              {screen.rows && screen.columns && (
                <p className="text-xs text-slate-500 font-medium">
                  {screen.name || 'Screen'} · {screen.rows} rows × {screen.columns} seats
                  {Array.isArray(screen.vipRows) && screen.vipRows.length > 0
                    ? ` · VIP rows ${screen.vipRows.join(', ')}`
                    : ''}
                </p>
              )}
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
              <button
                disabled={!canBook}
                onClick={() => canBook && navigate(`/select-seats/${show._id || id}`)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  canBook
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 active:scale-95 cursor-pointer'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {canBook ? 'Select seats' : isCancelled ? 'Show cancelled' : hasStarted ? 'Show started' : 'Sold out'}
              </button>
              <p className="text-[11px] text-slate-500 font-medium sm:text-right">
                {canBook
                  ? `${formatPrice(show.pricing?.standard)} standard · ${formatPrice(show.pricing?.vip)} VIP`
                  : 'Booking is closed for this show.'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
