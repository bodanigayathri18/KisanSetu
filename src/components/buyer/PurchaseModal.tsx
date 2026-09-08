import React, { useState, useEffect } from 'react';
import { ProduceListing, Transaction } from '../../shared/types';
import { api } from '../../services/api';
import { X, ShoppingBag, CheckCircle2, AlertCircle, Building2, ShieldCheck } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProduceListing | null;
  onPurchaseCompleted: (txn: Transaction) => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  listing,
  onPurchaseCompleted,
}) => {
  const [quantityQuintals, setQuantityQuintals] = useState<number>(listing?.quantityQuintals || 0);
  const [offerRate, setOfferRate] = useState<number>(listing?.pricePerQuintal || 0);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (listing) {
      setQuantityQuintals(listing.quantityQuintals);
      setOfferRate(listing.pricePerQuintal);
    }
  }, [listing]);

  if (!isOpen || !listing) return null;

  const totalCost = (Number(quantityQuintals) || 0) * (Number(offerRate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantityQuintals <= 0 || quantityQuintals > listing.quantityQuintals) {
      setError(`Quantity must be between 1 and ${listing.quantityQuintals} Quintals.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.purchaseListing({
        listingId: listing.id,
        quantityQuintals: Number(quantityQuintals),
        offerPricePerQuintal: Number(offerRate),
        deliveryNotes,
      });
      onPurchaseCompleted(res.transaction);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete produce purchase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="purchase-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
    >
      <div
        id="purchase-modal-card"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-amber-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">Purchase Agricultural Lot</h2>
              <p className="text-xs text-amber-200">{listing.cropName} • {listing.lotNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-amber-800">
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

          {/* Lot origin info */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Mandi Origin:</span>
              <span className="font-bold text-stone-900">{listing.procurementCentreName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Quality Grade:</span>
              <span className="font-bold text-emerald-800">{listing.qualityGrade}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Tested Moisture:</span>
              <span className="font-bold text-blue-800">{listing.moisturePercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 font-medium">Available Lot Volume:</span>
              <span className="font-bold text-stone-900">{listing.quantityQuintals} Quintals</span>
            </div>
          </div>

          {/* Purchase quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Purchase Qty (Qtl) *
              </label>
              <input
                type="number"
                min="1"
                max={listing.quantityQuintals}
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Number(e.target.value))}
                className="w-full p-2.5 text-sm font-bold bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Rate (₹ / Quintal)
              </label>
              <input
                type="number"
                min="500"
                value={offerRate}
                onChange={(e) => setOfferRate(Number(e.target.value))}
                className="w-full p-2.5 text-sm font-bold bg-stone-50 border border-stone-300 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Dispatch & Logistics Notes (Optional)
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Yard gate loading pickup on Tuesday"
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl"
            />
          </div>

          {/* Price Calculation */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-600 block">Total Settlement Amount</span>
              <span className="text-xl font-black text-emerald-950">
                ₹{totalCost.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Escrow Protected
              </span>
            </div>
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
              {submitting ? 'Generating Invoice...' : 'Confirm & Purchase Lot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
