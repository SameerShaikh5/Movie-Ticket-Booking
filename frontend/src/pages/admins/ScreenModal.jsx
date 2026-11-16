import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { createScreen, updateScreen } from '../../apis/screen.api.js';
import toast from 'react-hot-toast';

const AVAILABLE_FORMATS = ['2D', '3D', 'IMAX3D', '4DX'];

export default function ScreenModal({ isOpen, onClose, onScreenSaved, screenToEdit }) {
  const [name, setName] = useState('');
  const [selectedFormats, setSelectedFormats] = useState(['2D']);
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);
  const [selectedVipRows, setSelectedVipRows] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const allRowLetters = Array.from({ length: Number(rows) || 0 }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  useEffect(() => {
    if (screenToEdit) {
      setName(screenToEdit.name);
      setSelectedFormats(screenToEdit.formats || ['2D']);
      const rCount = screenToEdit.rows || 8;
      setRows(rCount);
      setCols(screenToEdit.columns || screenToEdit.cols || 12);
      setSelectedVipRows(screenToEdit.vipRows || []);
    } else {
      setName('');
      setSelectedFormats(['2D']);
      setRows(8);
      setCols(12);
      setSelectedVipRows(['G', 'H']);
    }
    setErrorMessage('');
  }, [screenToEdit, isOpen]);

  useEffect(() => {
    setSelectedVipRows((prev) => prev.filter((rowLetter) => allRowLetters.includes(rowLetter)));
  }, [rows]);

  if (!isOpen) return null;

  const toggleFormat = (fmt) => {
    if (selectedFormats.includes(fmt)) {
      if (selectedFormats.length === 1) return;
      setSelectedFormats(selectedFormats.filter((f) => f !== fmt));
    } else {
      setSelectedFormats([...selectedFormats, fmt]);
    }
  };

  const toggleVipRow = (rowLetter) => {
    if (selectedVipRows.includes(rowLetter)) {
      setSelectedVipRows(selectedVipRows.filter((r) => r !== rowLetter));
    } else {
      setSelectedVipRows([...selectedVipRows, rowLetter].sort());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const parsedRows = Number(rows);
    const parsedCols = Number(cols);

    const payload = {
      name,
      rows: parsedRows,
      columns: parsedCols,
      formats: selectedFormats,
      vipRows: selectedVipRows,
    };

    try {
      let response;
      if (screenToEdit) {
        const screenId = screenToEdit._id || screenToEdit.id;
        response = await updateScreen(screenId, payload);
        toast.success('Screen configuration updated successfully!');
      } else {
        response = await createScreen(payload);
        toast.success('New screen created successfully!');
      }

      if (onScreenSaved) {
        onScreenSaved(response.data?.screen || response.data);
      }
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      const errorMsg = err.message || 'Operation failed. Please try again.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const standardRowsCount = Math.max(0, Number(rows) - selectedVipRows.length);
  const totalCapacity = Number(rows) * Number(cols);
  const vipCapacity = selectedVipRows.length * Number(cols);
  const standardCapacity = totalCapacity - vipCapacity;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {screenToEdit ? 'Edit Auditorium Screen' : 'Create New Screen'}
            </h3>
            <p className="text-xs text-slate-500">Configure screen dimensions and select VIP seating rows.</p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Screen Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Screen 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          {/* Formats Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Supported Formats</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FORMATS.map((fmt) => {
                const isSelected = selectedFormats.includes(fmt);
                return (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{fmt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seating Grid Dimensions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
            <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">Auditorium Dimensions</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Total Rows (1-26)</label>
                <input
                  type="number"
                  min="1"
                  max="26"
                  required
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Columns per Row</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Interactive VIP Row Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-amber-900">Select VIP Recliner Rows (Click to Toggle)</label>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {selectedVipRows.length} Selected
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allRowLetters.map((letter) => {
                  const isVip = selectedVipRows.includes(letter);
                  return (
                    <button
                      type="button"
                      key={letter}
                      onClick={() => toggleVipRow(letter)}
                      className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center border ${
                        isVip
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200 flex justify-between">
              <span>Standard Capacity: <strong>{standardCapacity} Seats</strong></span>
              <span>VIP Capacity: <strong className="text-amber-700">{vipCapacity} Seats</strong></span>
              <span>Total: <strong className="text-slate-900">{totalCapacity}</strong></span>
            </div>
          </div>

          <div className="pt-2">
            {/* Updated submit button to match rose theme */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{screenToEdit ? 'Save Screen Changes' : 'Create Screen'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}