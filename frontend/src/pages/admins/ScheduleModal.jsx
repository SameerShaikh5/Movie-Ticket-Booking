import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { createShow, updateShow } from '../../apis/show.api.js';
import toast from 'react-hot-toast';
import { getScreen, getScreens } from '../../apis/screen.api.js';

export default function ScheduleModal({
  isOpen,
  onClose,
  form,
  setForm,
  onShowSaved,
  isEditing,
  screens: propScreens = [],
  showToEdit,
}) {
  const [screensList, setScreensList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingScreens, setIsFetchingScreens] = useState(false);
  const [isFetchingFormats, setIsFetchingFormats] = useState(false);
  const [availableFormats, setAvailableFormats] = useState(['2D']);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch real screens from backend if not passed via props
  useEffect(() => {
    if (!isOpen) return;

    const loadScreens = async () => {
      if (Array.isArray(propScreens) && propScreens.length > 0) {
        setScreensList(propScreens);
        return;
      }

      try {
        setIsFetchingScreens(true);
        const res = await getScreens();
        const fetched = res.data?.screens || res.screens || res;
        setScreensList(Array.isArray(fetched) ? fetched : []);
      } catch (err) {
        console.error('Failed to load screens:', err);
        setErrorMessage('Could not load auditorium screens from server.');
      } finally {
        setIsFetchingScreens(false);
      }
    };

    loadScreens();
  }, [isOpen, propScreens]);

  // 2. Initialize or pre-fill form values once screensList is ready
  useEffect(() => {
    if (!isOpen || screensList.length === 0) return;

    if (isEditing && showToEdit) {
      const extractedScreenId =
        typeof showToEdit.screenId === 'object'
          ? showToEdit.screenId?._id
          : showToEdit.screenId;

      const matchedScreen =
        screensList.find((s) => s._id === extractedScreenId) || screensList[0];

      setForm({
        title: showToEdit.movieTitle || '',
        posterImage: showToEdit.posterImage || '',
        description: showToEdit.description || '',
        genre: Array.isArray(showToEdit.genre)
          ? showToEdit.genre.join(', ')
          : showToEdit.genre || '',
        language: showToEdit.language || 'Hindi',
        rating: showToEdit.rating !== undefined ? String(showToEdit.rating) : '8.5',
        censor: showToEdit.censor || 'UA13+',
        screenId: matchedScreen?._id || '',
        format: showToEdit.format || matchedScreen?.formats?.[0] || '2D',
        showtime: showToEdit.startTime
          ? new Date(showToEdit.startTime).toISOString().slice(0, 16)
          : '',
        runtime: showToEdit.runtime !== undefined ? String(showToEdit.runtime) : '150',
        basePrice:
          showToEdit.standardTicketPrice !== undefined
            ? String(showToEdit.standardTicketPrice)
            : '250',
        vipPrice:
          showToEdit.vipTicketPrice !== undefined
            ? String(showToEdit.vipTicketPrice)
            : '400',
      });
    } else if (!isEditing) {
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
    }
    setErrorMessage('');
  }, [isOpen, isEditing, showToEdit, screensList]);

  // 3. Dynamically update available formats when screenId changes
  useEffect(() => {
    if (!isOpen || !form.screenId) return;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(form.screenId);
    if (!isValidObjectId) return;

    const updateFormats = async () => {
      const localScreen = screensList.find((s) => s._id === form.screenId);
      if (localScreen?.formats?.length > 0) {
        setAvailableFormats(localScreen.formats);
        if (!localScreen.formats.includes(form.format)) {
          setForm((prev) => ({ ...prev, format: localScreen.formats[0] }));
        }
        return;
      }

      try {
        setIsFetchingFormats(true);
        const res = await getScreen(form.screenId);
        const screenData = res.data?.screen || res.screen || res;
        const formats = screenData?.formats || ['2D'];
        setAvailableFormats(formats);
        if (!formats.includes(form.format)) {
          setForm((prev) => ({ ...prev, format: formats[0] }));
        }
      } catch (err) {
        console.error('Failed to fetch screen formats:', err);
      } finally {
        setIsFetchingFormats(false);
      }
    };

    updateFormats();
  }, [form.screenId, isOpen, screensList]);
  
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!form.screenId || !/^[0-9a-fA-F]{24}$/.test(form.screenId)) {
      setErrorMessage('Invalid Screen selected. Please ensure screens exist in the database.');
      setIsLoading(false);
      return;
    }

    const formattedGenre =
      typeof form.genre === 'string'
        ? form.genre
            .split(',')
            .map((g) => g.trim())
            .filter(Boolean)
        : ['Drama'];

    // Payload explicitly including format and description to satisfy backend validation
    const payload = {
      movieTitle: form.title.trim(),
      posterImage: form.posterImage.trim(),
      description: form.description.trim(),
      genre: formattedGenre.length > 0 ? formattedGenre : ['Drama'],
      language: form.language.trim(),
      rating: Number(form.rating),
      censor: form.censor,
      screenId: form.screenId,
      format: form.format || '2D', // Required by backend schema
      startTime: new Date(form.showtime).toISOString(),
      runtime: Number(form.runtime),
      standardTicketPrice: Number(form.basePrice),
      vipTicketPrice: Number(form.vipPrice),
    };

    try {
      let response;
      const showId = showToEdit?._id || showToEdit?.id;

      if (isEditing && showId) {
        response = await updateShow(showId, payload);
        toast.success('Showtime updated successfully!');
      } else {
        response = await createShow(payload);
        toast.success('Showtime published successfully!');
      }

      if (onShowSaved) {
        onShowSaved(response.data?.show || response.data);
      }
      onClose();
    } catch (err) {
      const errorMsg = err.message || 'Failed to save showtime.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Update Showtime' : 'Schedule New Show'}
            </h3>
            <p className="text-xs text-slate-500">
              Configure movie metadata, auditorium screen, and ticket pricing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Movie Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Movie Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Interstellar"
              value={form.title ?? ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          {/* Poster Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Poster Image URL</label>
            <input
              type="url"
              required
              placeholder="https://example.com/poster.jpg"
              value={form.posterImage ?? ''}
              onChange={(e) => setForm({ ...form, posterImage: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Synopsis / Description</label>
            <textarea
              rows={2}
              required
              placeholder="Brief summary of the movie..."
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white resize-none"
            />
          </div>

          {/* Language & Genre */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <input
                type="text"
                required
                placeholder="e.g. Hindi, English"
                value={form.language ?? ''}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Genre (comma-separated)</label>
              <input
                type="text"
                required
                placeholder="e.g. Sci-Fi, Action"
                value={form.genre ?? ''}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Rating, Censor & Runtime */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Rating (0-10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                placeholder="8.8"
                value={form.rating ?? ''}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Censor</label>
              <select
                value={form.censor || 'UA13+'}
                onChange={(e) => setForm({ ...form, censor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              >
                <option value="U">U</option>
                <option value="UA">UA</option>
                <option value="UA13+">UA 13+</option>
                <option value="UA16+">UA 16+</option>
                <option value="A">A</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Runtime (mins)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="150"
                value={form.runtime ?? ''}
                onChange={(e) => setForm({ ...form, runtime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Screen & Dynamic Format Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Screen</span>
                {isFetchingScreens && <Loader2 className="w-3 h-3 animate-spin text-rose-600" />}
              </label>
              <select
                required
                value={form.screenId || ''}
                onChange={(e) => setForm({ ...form, screenId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              >
                {screensList.length === 0 && (
                  <option value="" disabled>
                    No screens found
                  </option>
                )}
                {screensList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Format</span>
                {isFetchingFormats && <Loader2 className="w-3 h-3 animate-spin text-rose-600" />}
              </label>
              <select
                value={form.format || availableFormats[0]}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              >
                {availableFormats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Showtime Datetime */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Showtime (Date & Time)</label>
            <input
              type="datetime-local"
              required
              value={form.showtime ?? ''}
              onChange={(e) => setForm({ ...form, showtime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          {/* Pricing Box */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Standard Price (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="250"
                value={form.basePrice ?? ''}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-amber-800 block mb-1">
                VIP Recliner Price (₹)
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="400"
                value={form.vipPrice ?? ''}
                onChange={(e) => setForm({ ...form, vipPrice: e.target.value })}
                className="w-full bg-white border border-amber-300 text-amber-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || screensList.length === 0}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Save Showtime Changes' : 'Publish Showtime'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}