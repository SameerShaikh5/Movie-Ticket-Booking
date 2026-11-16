import React, { useState } from 'react';
import { 
  Film, Plus, Monitor, Trash2, Edit, TrendingUp, Users, DollarSign, 
  AlertTriangle, RefreshCw, XCircle, CheckCircle2, ShieldAlert, ChevronRight 
} from 'lucide-react';

const INITIAL_SCREENS = [
  { id: 'scr_1', name: 'Screen 1', formats: ['IMAX 3D'], rows: 8, cols: 12, vipRows: 2 },
  { id: 'scr_2', name: 'Screen 2', formats: ['2D Dolby'], rows: 10, cols: 12, vipRows: 2 },
  { id: 'scr_3', name: 'Screen 3', formats: ['4DX'], rows: 6, cols: 10, vipRows: 1 },
];

const INITIAL_SCHEDULES = [
  { 
    id: 'sch_1', 
    title: 'Udta Teer', 
    screen: 'Screen 1', 
    format: 'IMAX 3D', 
    showtime: '10:30 AM', 
    basePrice: 300, 
    vipPrice: 450, 
    status: 'Scheduled', 
    ticketsSold: 42,
    refundStatus: null 
  },
  { 
    id: 'sch_2', 
    title: "Namit Malhotra's Ramayana", 
    screen: 'Screen 1', 
    format: 'IMAX 3D', 
    showtime: '01:45 PM', 
    basePrice: 350, 
    vipPrice: 500, 
    status: 'Cancelled', 
    ticketsSold: 18,
    refundStatus: 'PARTIAL_FAILURE', // Razorpay failed for some users
    failedRefunds: [
      { userId: 'usr_99', name: 'Rohan Sharma', amount: 700, reason: 'Razorpay: Insufficient Merchant Balance' },
      { userId: 'usr_104', name: 'Priya Patel', amount: 1000, reason: 'Razorpay: Bank Fraud Lock / Account Flagged' }
    ]
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('schedules');
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);
  
  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Form State for Schedule
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    screen: 'Screen 1',
    format: 'IMAX 3D',
    showtime: '',
    basePrice: 200,
    vipPrice: 350, // Auto-calculated (base + 150)
  });

  // Form State for Screen CRUD
  const [screenForm, setScreenForm] = useState({
    name: '',
    formats: '2D Dolby, IMAX 3D',
    rows: 8,
    cols: 10,
    vipRows: 2,
  });

  // Auto-calculate VIP Price when Base Price changes
  const handleBasePriceChange = (val) => {
    const base = Number(val) || 0;
    setScheduleForm({
      ...scheduleForm,
      basePrice: base,
      vipPrice: base + 150, // Best Method: Base + Fixed Delta
    });
  };

  // Create / Update Schedule
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, ...scheduleForm } : s));
    } else {
      setSchedules([
        ...schedules,
        {
          id: `sch_${Date.now()}`,
          ...scheduleForm,
          status: 'Scheduled',
          ticketsSold: 0,
          refundStatus: null,
        }
      ]);
    }
    setIsScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  // Cancel Show with Refund Triggering
  const handleCancelShow = (id) => {
    const target = schedules.find(s => s.id === id);
    if (!target) return;

    if (window.confirm(`Are you sure you want to CANCEL "${target.title}"? This will trigger automated user refunds.`)) {
      setSchedules(schedules.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: 'Cancelled',
            refundStatus: target.ticketsSold > 0 ? 'PROCESSING' : 'COMPLETED',
          };
        }
        return s;
      }));
    }
  };

  // Create Screen
  const handleCreateScreen = (e) => {
    e.preventDefault();
    setScreens([
      ...screens,
      {
        id: `scr_${Date.now()}`,
        name: screenForm.name,
        formats: screenForm.formats.split(',').map(f => f.trim()),
        rows: Number(screenForm.rows),
        cols: Number(screenForm.cols),
        vipRows: Number(screenForm.vipRows),
      }
    ]);
    setIsScreenModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">CineVault Operations Console</h1>
            <p className="text-xs text-slate-500 font-medium">Manage screens, show scheduling, and handle cancellation refunds.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({ title: '', screen: 'Screen 1', format: 'IMAX 3D', showtime: '', basePrice: 200, vipPrice: 350 });
                setIsScheduleModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Show</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'schedules' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Showtimes & Refunds
          </button>
          <button
            onClick={() => setActiveTab('screens')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'screens' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Screen Configuration (Auditoriums)
          </button>
        </div>

        {/* TAB 1: SHOWTIMES & REFUNDS */}
        {activeTab === 'schedules' && (
          <div className="space-y-6">
            
            {/* Show Schedule Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Scheduled Shows</h2>
                <span className="text-xs text-slate-500 font-medium">{schedules.length} Total Shows</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Movie</th>
                      <th className="p-4">Screen & Format</th>
                      <th className="p-4">Time</th>
                      <th className="p-4">Pricing (Standard / VIP)</th>
                      <th className="p-4">Tickets Sold</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {schedules.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{item.title}</td>
                        <td className="p-4">{item.screen} • <span className="font-bold text-slate-900">{item.format}</span></td>
                        <td className="p-4 font-bold text-rose-600">{item.showtime}</td>
                        <td className="p-4">₹{item.basePrice} / <span className="text-amber-600 font-bold">₹{item.vipPrice}</span></td>
                        <td className="p-4 font-bold">{item.ticketsSold} seats</td>
                        <td className="p-4">
                          {item.status === 'Scheduled' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-md">
                              Scheduled
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded-md">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {item.status === 'Scheduled' && (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingSchedule(item);
                                  setScheduleForm({ ...item });
                                  setIsScheduleModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Edit Time
                              </button>
                              <button 
                                onClick={() => handleCancelShow(item.id)}
                                className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Cancel Show
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund Failures Queue Card */}
            <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold">Failed Refunds Queue (Action Required)</h3>
              </div>
              <p className="text-xs text-slate-600">
                Razorpay automatic gateway refunds failed for the following bookings due to merchant balance limits or bank security locks.
              </p>

              <div className="space-y-3">
                {schedules.flatMap(s => s.failedRefunds || []).map((failed, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{failed.name}</span> ({failed.userId})
                      <p className="text-slate-500">{failed.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 mr-2">₹{failed.amount}</span>
                      <button 
                        onClick={() => alert(`Retrying Razorpay refund for ${failed.name}...`)}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Retry Gateway Reversal
                      </button>
                      <button 
                        onClick={() => alert(`Issued ₹${failed.amount} CineVault Wallet Store Credit to ${failed.name}`)}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-500 transition-colors cursor-pointer"
                      >
                        Credit to Wallet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SCREEN CONFIGURATION */}
        {activeTab === 'screens' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Auditorium Screens</h2>
              <button
                onClick={() => setIsScreenModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                + Add New Screen
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {screens.map((scr) => (
                <div key={scr.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-slate-900">{scr.name}</h3>
                    <div className="flex gap-1">
                      {scr.formats.map(f => (
                        <span key={f} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Standard Capacity:</span>
                      <span className="font-bold text-slate-900">{scr.rows * scr.cols} Seats ({scr.rows}x{scr.cols})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VIP Recliner Rows:</span>
                      <span className="font-bold text-amber-600">{scr.vipRows} Rows</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCHEDULE MODAL */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingSchedule ? 'Update Showtime' : 'Schedule New Show'}
                </h3>
                <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveSchedule} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Movie Title</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Screen</label>
                    <select
                      value={scheduleForm.screen}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, screen: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      {screens.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Format</label>
                    <select
                      value={scheduleForm.format}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="IMAX 3D">IMAX 3D</option>
                      <option value="2D Dolby">2D Dolby</option>
                      <option value="4DX">4DX</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Showtime</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:15 PM"
                    value={scheduleForm.showtime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, showtime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                {/* Base & VIP Auto Price Input */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Base Price (Standard)</label>
                    <input
                      type="number"
                      required
                      value={scheduleForm.basePrice}
                      onChange={(e) => handleBasePriceChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-amber-800 block mb-1">VIP Recliner Price (Auto)</label>
                    <input
                      type="number"
                      required
                      value={scheduleForm.vipPrice}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, vipPrice: Number(e.target.value) })}
                      className="w-full bg-white border border-amber-300 text-amber-900 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Showtime Configuration
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SCREEN MODAL */}
        {isScreenModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Add New Screen / Auditorium</h3>
                <button onClick={() => setIsScreenModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateScreen} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Screen Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Screen 4 — Dolby Cinema"
                    value={screenForm.name}
                    onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Rows</label>
                    <input
                      type="number"
                      required
                      value={screenForm.rows}
                      onChange={(e) => setScreenForm({ ...screenForm, rows: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Columns</label>
                    <input
                      type="number"
                      required
                      value={screenForm.cols}
                      onChange={(e) => setScreenForm({ ...screenForm, cols: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">VIP Rows</label>
                    <input
                      type="number"
                      required
                      value={screenForm.vipRows}
                      onChange={(e) => setScreenForm({ ...screenForm, vipRows: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Screen Structure
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}