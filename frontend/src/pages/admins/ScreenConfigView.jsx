import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import ScreenModal from './ScreenModal.jsx';
import { deleteScreen, getScreens } from '../../apis/screen.api.js';
import toast from 'react-hot-toast';

export default function ScreenConfigView() {
  const [screens, setScreens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [screenToEdit, setScreenToEdit] = useState(null);

  const fetchScreens = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await getScreens();
      const screenList = response.data?.screens || response.screens || response.data || [];
      setScreens(Array.isArray(screenList) ? screenList : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load auditorium screens.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const handleScreenSaved = () => {
    fetchScreens();
  };

  const handleDeleteScreen = async (id) => {
    if (window.confirm('Delete this screen configuration? Scheduled shows assigned to this screen must be re-assigned.')) {
      try {
        await deleteScreen(id);
        setScreens(screens.filter((s) => (s._id || s.id) !== id));
        toast.success('Screen deleted successfully.');
      } catch (err) {
        toast.error(err.message || 'Failed to delete screen.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900">Auditorium Screen Setup</h2>
          <p className="text-xs text-slate-500">Define seating capacity, VIP recliner rows, and screen formats.</p>
        </div>
        {/* Updated button color to rose-600 / rose-500 */}
        <button
          onClick={() => {
            setScreenToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-rose-600/30 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Screen
        </button>
      </div>

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
      ) : screens.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-700">No Screens Configured</p>
          <p className="text-[11px] text-slate-400">Click "Add New Screen" to set up your first auditorium grid.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {screens.map((scr) => {
            const screenId = scr._id || scr.id;
            const colsCount = scr.columns || scr.cols || 0;
            const vipCount = Array.isArray(scr.vipRows) ? scr.vipRows.length : (scr.vipRows || 0);

            return (
              <div key={screenId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-slate-900">{scr.name}</h3>
                    <div className="flex gap-1 flex-wrap">
                      {scr.formats?.map((f) => (
                        <span key={f} className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-bold text-slate-900">{scr.rows * colsCount} Seats ({scr.rows} Rows × {colsCount} Cols)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VIP Recliner Rows:</span>
                      <span className="font-bold text-amber-600">
                        {vipCount} Rows ({vipCount * colsCount} Seats) {Array.isArray(scr.vipRows) && `[${scr.vipRows.join(', ')}]`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setScreenToEdit(scr);
                      setIsModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Configuration
                  </button>
                  <button
                    onClick={() => handleDeleteScreen(screenId)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScreenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScreenSaved={handleScreenSaved}
        screenToEdit={screenToEdit}
      />
    </div>
  );
}