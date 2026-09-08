import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'MOISTURE' | 'WEIGHBRIDGE' | 'PAYMENT' | 'TOKEN_QUEUE' | 'OTHER'>('MOISTURE');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const res = await api.fileDispute(title, category, description);
      setTicketResult(res.dispute.ticketNumber);
      setTimeout(() => {
        setTicketResult(null);
        setTitle('');
        setDescription('');
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="dispute-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="dispute-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Lodge Procurement Grievance</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {ticketResult ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <p className="font-bold text-sm">Grievance Ticket #{ticketResult} Registered</p>
              <p className="text-xs text-stone-600 mt-1">
                The District Agricultural Marketing Officer will review within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Grievance Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                >
                  <option value="MOISTURE">Moisture Reading Dispute</option>
                  <option value="WEIGHBRIDGE">Weighbridge Scale Discrepancy</option>
                  <option value="PAYMENT">DBT Payment Delay</option>
                  <option value="TOKEN_QUEUE">Yard Token Jumping / Queue Delay</option>
                  <option value="OTHER">Other Operational Issue</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Brief Issue Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Moisture reading measured higher than field test"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide token number, yard gate, and description..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
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
                  className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {submitting ? 'Submitting...' : 'Submit Grievance Ticket'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
