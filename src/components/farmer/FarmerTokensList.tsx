import React, { useState } from 'react';
import { Token } from '../../shared/types';
import { StatusBadge } from '../common/StatusBadge';
import { Ticket, Calendar, Building2, ChevronRight, Filter } from 'lucide-react';

interface FarmerTokensListProps {
  tokens: Token[];
  onSelectToken?: (token: Token) => void;
}

export const FarmerTokensList: React.FC<FarmerTokensListProps> = ({ tokens, onSelectToken }) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filtered = tokens.filter((t) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return ['WAITING', 'CALLED', 'ARRIVED', 'PROCESSING'].includes(t.status);
    return t.status === statusFilter;
  });

  return (
    <div id="farmer-tokens-list-container" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-bold text-base text-stone-900">Procurement Tokens History</h3>
          <p className="text-xs text-stone-500">Record of all current and historical mandi arrival bookings</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1 text-xs">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              id={`btn-filter-token-${f.toLowerCase()}`}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                statusFilter === f
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-stone-400">
          <Ticket className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No tokens found in this category</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {filtered.map((token) => (
            <div
              key={token.id}
              id={`token-row-${token.id}`}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/70 rounded-xl px-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-600 font-mono font-bold shrink-0 mt-0.5">
                  <Ticket className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm font-mono">{token.tokenNumber}</span>
                    <StatusBadge status={token.status} size="sm" />
                  </div>
                  <p className="text-xs text-stone-600 flex items-center gap-2 mt-1">
                    <span className="font-semibold text-stone-800">{token.procurementCentreName}</span>
                    <span>•</span>
                    <span className="text-stone-400">{token.bookingDate} ({token.timeSlot})</span>
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Commodities: {token.crops.map((c) => `${c.cropName} (${c.quantityQuintals} Qtl)`).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                <span className="text-sm font-black text-stone-900">
                  {token.crops.reduce((acc, c) => acc + c.quantityQuintals, 0)} Quintals
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  MSP ₹
                  {token.crops
                    .reduce((acc, c) => acc + (c.quantityQuintals || 0) * (c.mspRate || 2320), 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
