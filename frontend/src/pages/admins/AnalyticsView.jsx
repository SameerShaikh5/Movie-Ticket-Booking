import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Users, Ticket, Tv, ArrowUpRight, Award, ShieldCheck, Loader2, AlertCircle 
} from 'lucide-react';
import { getAnalytics } from '../../apis/analytics.api.js';


export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState('all'); // 'today' | 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    grossRevenue: '₹0',
    averageOccupancy: '0%',
    totalTickets: '0 Seats',
    activeScreens: '0 Screens',
    topMovies: []
  });

  // Fallback mock data if API fails or backend is unreachable during demo
  const fallbackData = {
    today: {
      grossRevenue: '₹1,42,800',
      averageOccupancy: '85.7%',
      totalTickets: '310 Seats',
      activeScreens: '3 Screens',
      topMovies: [
        { rank: 1, title: 'Udta Teer', format: 'IMAX 3D', revenue: '₹78,400', occupancy: '94%' },
        { rank: 2, title: "Namit Malhotra's Ramayana", format: 'IMAX 3D', revenue: '₹42,300', occupancy: '88%' },
        { rank: 3, title: 'Rajini: The Jailer 2', format: '4DX', revenue: '₹22,100', occupancy: '76%' },
      ]
    },
    all: {
      grossRevenue: '₹8,45,200',
      averageOccupancy: '78.4%',
      totalTickets: '1,840 Seats',
      activeScreens: '3 Screens',
      topMovies: [
        { rank: 1, title: "Namit Malhotra's Ramayana", format: 'IMAX 3D', revenue: '₹3,42,300', occupancy: '91%' },
        { rank: 2, title: 'Udta Teer', format: 'IMAX 3D', revenue: '₹2,78,400', occupancy: '89%' },
        { rank: 3, title: 'Rajini: The Jailer 2', format: '4DX', revenue: '₹1,22,100', occupancy: '82%' },
      ]
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAnalytics(timeRange);
        if (response && response.success) {
          setAnalyticsData(response.data);
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to mock data:', err);
        setError('Could not connect to backend server. Displaying cached demo data.');
        setAnalyticsData(fallbackData[timeRange]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Dashboard & Analytics</h2>
          <p className="text-xs text-slate-500">Monitor overall theater revenue, ticket sales, and screen utilization.</p>
        </div>
        
        {/* Time Filter Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              timeRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All-Time Aggregate
          </button>
        </div>
      </div>

      {/* Error / Fallback Banner Notice */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Core Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center"><Loader2 className="w-5 h-5 text-rose-600 animate-spin" /></div>}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Gross Revenue</span>
            <h3 className="text-2xl font-black text-slate-900">{analyticsData.grossRevenue}</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Net of cancelled refunds
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center"><Loader2 className="w-5 h-5 text-amber-600 animate-spin" /></div>}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Average Occupancy</span>
            <h3 className="text-2xl font-black text-slate-900">{analyticsData.averageOccupancy}</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Across all screens
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center"><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /></div>}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Tickets Booked</span>
            <h3 className="text-2xl font-black text-slate-900">{analyticsData.totalTickets}</h3>
            <span className="text-[10px] font-bold text-slate-500">
              VIP Recliners: <strong className="text-amber-600">32%</strong>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center"><Loader2 className="w-5 h-5 text-emerald-600 animate-spin" /></div>}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Auditorium Status</span>
            <h3 className="text-2xl font-black text-slate-900">{analyticsData.activeScreens}</h3>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> Fully Operational
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Tv className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Top Performing Movies Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-rose-600 animate-spin" />
          </div>
        )}

        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Performing Movies ({timeRange === 'today' ? 'Today' : 'All-Time'})</h3>
            <p className="text-xs text-slate-500">Ranked by cumulative gross ticket sales and occupancy rate.</p>
          </div>
          <Award className="w-5 h-5 text-amber-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Rank & Title</th>
                <th className="p-4">Format</th>
                <th className="p-4">Occupancy Rate</th>
                <th className="p-4 text-right">Gross Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {analyticsData.topMovies && analyticsData.topMovies.length > 0 ? (
                analyticsData.topMovies.map((movie) => (
                  <tr key={movie.rank} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                        movie.rank === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{movie.rank}
                      </span>
                      <span className="font-bold text-slate-900">{movie.title}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {movie.format}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600">{movie.occupancy}</td>
                    <td className="p-4 text-right font-black text-slate-900">{movie.revenue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                    No active screenings or bookings found for this time range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}