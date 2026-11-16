import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, XCircle, Calendar, Monitor, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import ScheduleModal from './ScheduleModal.jsx';
import { getScreens } from '../../apis/screen.api.js';
import { getShows, cancelShow } from '../../apis/show.api.js';
import toast from 'react-hot-toast';

export default function ShowtimesView() {
  const [schedules, setSchedules] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    posterImage: '',
    description: '',
    genre: 'Action, Drama',
    language: 'Hindi',
    rating: '8.5',
    censor: 'UA13+',
    screenId: '',
    format: '2D',
    showtime: '',
    runtime: '150',
    basePrice: '250',
    vipPrice: '400',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [screenRes, showRes] = await Promise.all([
        getScreens(),
        getShows()
      ]);

      const fetchedScreens = screenRes.data?.screens || screenRes.screens || screenRes.data || [];
      setScreensList(Array.isArray(fetchedScreens) ? fetchedScreens : []);

      const fetchedShows = showRes.data?.shows || showRes.shows || showRes.data?.data || showRes || [];
      setSchedules(Array.isArray(fetchedShows) ? fetchedShows : []);

    } catch (err) {
      setErrorMessage(err.message || 'Failed to load scheduling data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setScheduleToEdit(null);
    const defaultScreen = screensList[0];
    setForm({
      title: '',
      posterImage: '',
      description: '',
      genre: 'Action, Drama',
      language: 'Hindi',
      rating: '8.5',
      censor: 'UA13+',
      screenId: defaultScreen?._id || '',
      format: defaultScreen?.formats?.[0] || '2D',
      showtime: '',
      runtime: '150',
      basePrice: '250',
      vipPrice: '400',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setScheduleToEdit(item);
    setIsModalOpen(true);
  };

  const handleShowSaved = () => {
    fetchData();
    setIsModalOpen(false);
  };

  const handleCancelShow = async (id) => {
    if (window.confirm('Are you sure you want to cancel this show? This will initiate automated ticket refund workflows.')) {
      try {
        await cancelShow(id);
        toast.success('Show cancelled successfully.');
        fetchData();
      } catch (err) {
        toast.error(err.message || 'Failed to cancel show.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Showtimes Schedule</h2>
          <p className="text-xs text-slate-500">Configure showtimes, ratings, screens, and pricing tiers.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          disabled={screensList.length === 0}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Schedule New Show
        </button>
      </div>

      {screensList.length === 0 && !isLoading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold">
          ⚠️ Please configure at least one auditorium screen in the <strong>Screen Configurations</strong> tab before scheduling shows.
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-700">No Showtimes Scheduled</p>
          <p className="text-[11px] text-slate-400">Click "Schedule New Show" to publish your first screening.</p>
        </div>
      ) : (
        /* Responsive scrollable container */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Movie & Rating</th>
                  <th className="p-4">Screen & Format</th>
                  <th className="p-4">Showtime</th>
                  <th className="p-4">Pricing (Std / VIP)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {schedules.map((item) => {
                  const showId = item._id || item.id;
                  const screenObjId = typeof item.screenId === 'object' ? item.screenId?._id : item.screenId;
                  const screenName = screensList.find((s) => s._id === screenObjId)?.name || item.screenSnapShot?.name || 'Screen';
                  const formattedTime = item.startTime ? new Date(item.startTime).toLocaleString() : item.showtime;
                  
                  const stdPrice = item.pricing?.standard || item.standardTicketPrice || 250;
                  const vipPrice = item.pricing?.vip || item.vipTicketPrice || 400;
                  const showStatus = item.status || 'Scheduled';

                  return (
                    <tr key={showId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 max-w-[200px]">
                        <span className="font-bold text-slate-900 block truncate">{item.movieTitle || item.title}</span>
                        <span className="text-[10px] text-slate-500">{item.rating} ({item.censor})</span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{screenName}</span> • <span className="text-rose-600">{item.format || '2D'}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{formattedTime}</td>
                      <td className="p-4 whitespace-nowrap">₹{stdPrice} / <span className="text-amber-600 font-bold">₹{vipPrice}</span></td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold inline-block ${
                          showStatus === 'Scheduled' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {showStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Edit
                        </button>
                        {showStatus !== 'CANCELLED' && showStatus !== 'Cancelled' && (
                          <button 
                            onClick={() => handleCancelShow(showId)}
                            className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Creating & Editing Shows */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        onShowSaved={handleShowSaved}
        isEditing={Boolean(scheduleToEdit)}
        screens={screensList}
        showToEdit={scheduleToEdit}
      />
    </div>
  );
}