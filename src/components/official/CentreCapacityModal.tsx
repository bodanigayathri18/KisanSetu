import React, { useState } from 'react';
import { ProcurementCentre, OperatingStatus } from '../../shared/types';
import { api } from '../../services/api';
import { X, Building2, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';

interface CentreCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  centre: ProcurementCentre;
  onUpdated: (updated: ProcurementCentre) => void;
}

export const CentreCapacityModal: React.FC<CentreCapacityModalProps> = ({
  isOpen,
  onClose,
  centre,
  onUpdated,
}) => {
  const [operatingStatus, setOperatingStatus] = useState<OperatingStatus>(centre.operatingStatus);
  const [dailyCapacityQuintals, setDailyCapacityQuintals] = useState<number>(centre.dailyCapacityQuintals);
  const [dailyTokenLimit, setDailyTokenLimit] = useState<number>(centre.dailyTokenLimit);
  const [availableTokenSlots, setAvailableTokenSlots] = useState<number>(centre.availableTokenSlots);
  const [windowCapacity, setWindowCapacity] = useState<number>(centre.windowCapacity || 20);
  const [estimatedWaitingTimeMinutes, setEstimatedWaitingTimeMinutes] = useState<number>(
    centre.estimatedWaitingTimeMinutes || 45
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await api.updateCentreOperational({
        operatingStatus,
        dailyCapacityQuintals: Number(dailyCapacityQuintals),
        dailyTokenLimit: Number(dailyTokenLimit),
        availableTokenSlots: Number(availableTokenSlots),
        windowCapacity: Number(windowCapacity),
        estimatedWaitingTimeMinutes: Number(estimatedWaitingTimeMinutes),
      } as any);
      onUpdated(res.centre);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update operational parameters');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="centre-capacity-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="centre-capacity-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">Yard Operational Settings</h2>
              <p className="text-xs text-blue-200">{centre.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Operating Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Current Operating Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'OPEN', label: '🟢 Open / Normal', color: 'border-emerald-300 peer-checked:bg-emerald-50' },
                { id: 'BUSY', label: '🟡 Busy / Congested', color: 'border-amber-300 peer-checked:bg-amber-50' },
                { id: 'TEMPORARILY_CLOSED', label: '🔴 Closed / Halt', color: 'border-rose-300 peer-checked:bg-rose-50' },
              ].map((st) => (
                <label
                  key={st.id}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer text-center transition-all ${
                    operatingStatus === st.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500'
                      : 'border-stone-200 bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="operatingStatus"
                    value={st.id}
                    checked={operatingStatus === st.id}
                    onChange={() => setOperatingStatus(st.id as OperatingStatus)}
                    className="sr-only"
                  />
                  <span>{st.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Updating this immediately affects farmers' GO / WAIT evaluation for this mandi.
            </p>
          </div>

          {/* Daily Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Daily Capacity (Qtl)
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                value={dailyCapacityQuintals}
                onChange={(e) => setDailyCapacityQuintals(Number(e.target.value))}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Daily Token Limit
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={dailyTokenLimit}
                onChange={(e) => setDailyTokenLimit(Number(e.target.value))}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                required
              />
            </div>
          </div>

          {/* Available Slots & Wait time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Available Slots Today
              </label>
              <input
                type="number"
                min="0"
                max={dailyTokenLimit}
                value={availableTokenSlots}
                onChange={(e) => setAvailableTokenSlots(Number(e.target.value))}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Est. Waiting (Mins)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                value={estimatedWaitingTimeMinutes}
                onChange={(e) => setEstimatedWaitingTimeMinutes(Number(e.target.value))}
                className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
                required
              />
            </div>
          </div>

          {/* 2-Hour Window Slot Capacity */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-950">
                2-Hour Window Capacity (Farmers/Window)
              </label>
              <span className="text-xs font-extrabold text-blue-800">{windowCapacity} Farmers</span>
            </div>
            <p className="text-[11px] text-blue-700 mb-2">
              Configures realistic arrivals: 15 to 30 farmers per 2-hour window. Used to dynamically compute slot availability for farmer bookings.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="10"
                max="40"
                step="1"
                value={windowCapacity}
                onChange={(e) => setWindowCapacity(Number(e.target.value))}
                className="w-full accent-blue-700 h-2 bg-blue-200 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="10"
                max="50"
                value={windowCapacity}
                onChange={(e) => setWindowCapacity(Number(e.target.value))}
                className="w-18 text-center text-xs font-bold bg-white border border-blue-300 rounded-lg p-1 text-blue-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 text-xs font-semibold hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {submitting ? 'Updating...' : 'Save & Publish to Farmers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
