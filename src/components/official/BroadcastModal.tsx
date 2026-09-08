import React, { useState } from 'react';
import { api } from '../../services/api';
import { Megaphone, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  centreName: string;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, centreName }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSubmitting(true);
    setError('');
    setSuccessResult(null);

    try {
      const res = await api.sendOfficialBroadcast(title, message);
      setSuccessResult(`Alert dispatched to ${res.recipientsCount} active farmers!`);
      setTimeout(() => {
        onClose();
        setSuccessResult(null);
        setTitle('');
        setMessage('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch broadcast');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (quickTitle: string, quickMsg: string) => {
    setTitle(quickTitle);
    setMessage(quickMsg);
  };

  return (
    <div
      id="broadcast-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="broadcast-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-amber-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-800 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">Broadcast Mandi Announcement</h2>
              <p className="text-xs text-amber-200">{centreName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successResult}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Quick Announcement Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Weighbridge Maintenance Notice',
                    'Weighbridge #2 is undergoing a quick 30-minute calibration. Processing will resume promptly at 11:30 AM.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                ⚙️ Weighbridge Calibration
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Weather Advisory: Rain Covered Sheds Open',
                    'Light showers expected. Please move tractor trollies into Covered Shed B and C immediately.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                🌧️ Rain Protection Alert
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickFill(
                    'Paddy Moisture Relaxation Notice',
                    'Government has approved standard moisture allowance up to 17.5% for today with zero deduction.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                🌾 Moisture Guidelines
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weighbridge 2 Active / Gate Notice"
              className="w-full text-sm font-semibold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Notice Message *
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain instructions to waiting farmers..."
              className="w-full text-sm bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-stone-900"
              required
            />
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-3">
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
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {submitting ? 'Dispatching...' : 'Send Broadcast to Farmers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
