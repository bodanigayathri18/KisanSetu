import React, { useState } from 'react';
import { Token, TokenStatus } from '../../shared/types';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../services/api';
import {
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCw,
  Phone,
  Truck,
  Check,
  XCircle,
  Clock,
  Sparkles,
  FileCheck,
} from 'lucide-react';

interface QueueManagerProps {
  tokens: Token[];
  onTokenUpdated: () => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({ tokens, onTokenUpdated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Completion modal state
  const [completingToken, setCompletingToken] = useState<Token | null>(null);
  const [actualMoisture, setActualMoisture] = useState<number>(14.5);
  const [actualGrade, setActualGrade] = useState<string>('Grade A');

  // Filter tokens
  const filteredTokens = tokens.filter((t) => {
    const matchesSearch =
      t.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.farmerPhone && t.farmerPhone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return ['WAITING', 'CALLED', 'ARRIVED', 'PROCESSING'].includes(t.status);
    return t.status === filterStatus;
  });

  const handleUpdateStatus = async (tokenId: string, nextStatus: TokenStatus, notes?: string) => {
    setActionLoadingId(tokenId);
    try {
      await api.updateTokenStatus(tokenId, nextStatus, notes);
      onTokenUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update token status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenCompleteModal = (token: Token) => {
    setCompletingToken(token);
    setActualMoisture(14.5);
    setActualGrade('Grade A');
  };

  const handleConfirmComplete = async () => {
    if (!completingToken) return;
    setActionLoadingId(completingToken.id);
    try {
      const notes = `Verified at Yard Weighbridge. Moisture: ${actualMoisture}%, Quality: ${actualGrade}. Procurement approved for Direct Benefit Transfer.`;
      await api.updateTokenStatus(completingToken.id, 'COMPLETED', notes);
      setCompletingToken(null);
      onTokenUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to complete procurement');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div id="official-queue-manager" className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Search and Filters Header */}
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="queue-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search token #, farmer name, phone..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          {['ACTIVE', 'WAITING', 'CALLED', 'ARRIVED', 'PROCESSING', 'COMPLETED', 'ALL'].map((st) => (
            <button
              key={st}
              id={`btn-queue-filter-${st.toLowerCase()}`}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filterStatus === st ? 'bg-blue-800 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue items */}
      {filteredTokens.length === 0 ? (
        <div className="py-16 text-center text-stone-400">
          <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No tokens match current filters</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {filteredTokens.map((token) => {
            const isLoading = actionLoadingId === token.id;
            const totalQuintals = token.crops.reduce((sum, c) => sum + c.quantityQuintals, 0);

            return (
              <div
                key={token.id}
                id={`queue-row-${token.id}`}
                className="p-5 hover:bg-stone-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Farmer & Token Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-black text-blue-950 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {token.tokenNumber}
                    </span>
                    <StatusBadge status={token.status} size="sm" />
                    {token.queuePosition && token.status === 'WAITING' && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Queue #{token.queuePosition}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    <span className="font-bold text-stone-900 text-sm">{token.farmerName}</span>
                    <span className="flex items-center gap-1 font-mono text-stone-500">
                      <Phone className="w-3 h-3" /> {token.farmerPhone}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" /> {token.bookingDate} ({token.timeSlot})
                    </span>
                  </div>

                  {/* Registered Crops in token */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {token.crops.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-xs bg-white border border-stone-200 px-2.5 py-1 rounded-md text-stone-800"
                      >
                        <span className="font-semibold">{c.cropName}</span>
                        <span className="font-black text-emerald-800 ml-1.5">{c.quantityQuintals} Qtl</span>
                      </span>
                    ))}
                    <span className="text-xs font-bold text-stone-500 ml-1">Total: {totalQuintals} Quintals</span>
                  </div>
                </div>

                {/* Workflow Operational Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {token.status === 'WAITING' && (
                    <button
                      id={`btn-call-token-${token.id}`}
                      onClick={() => handleUpdateStatus(token.id, 'CALLED')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Calling...' : 'Call to Weighbridge'}</span>
                    </button>
                  )}

                  {token.status === 'CALLED' && (
                    <button
                      id={`btn-arrive-token-${token.id}`}
                      onClick={() => handleUpdateStatus(token.id, 'ARRIVED')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Updating...' : 'Confirm Arrived at Yard'}</span>
                    </button>
                  )}

                  {token.status === 'ARRIVED' && (
                    <button
                      id={`btn-process-token-${token.id}`}
                      onClick={() => handleUpdateStatus(token.id, 'PROCESSING')}
                      disabled={isLoading}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Starting...' : 'Start Weighing & Quality'}</span>
                    </button>
                  )}

                  {token.status === 'PROCESSING' && (
                    <button
                      id={`btn-complete-token-${token.id}`}
                      onClick={() => handleOpenCompleteModal(token)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Procurement</span>
                    </button>
                  )}

                  {['WAITING', 'CALLED', 'ARRIVED'].includes(token.status) && (
                    <button
                      id={`btn-cancel-token-official-${token.id}`}
                      onClick={() => {
                        const reason = prompt('Reason for rejecting or cancelling token (e.g., Farmer no-show, vehicle issue):');
                        if (reason) handleUpdateStatus(token.id, 'CANCELLED', reason);
                      }}
                      disabled={isLoading}
                      className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Reject / Cancel token"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  {token.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <FileCheck className="w-4 h-4" /> Procured & DBT Issued
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Modal */}
      {completingToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900">Complete & Certify Procurement</h3>
                <p className="text-xs text-stone-500">Token: {completingToken.tokenNumber} ({completingToken.farmerName})</p>
              </div>
              <button onClick={() => setCompletingToken(null)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Moisture Reading (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="8"
                  max="25"
                  value={actualMoisture}
                  onChange={(e) => setActualMoisture(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                />
                <p className="text-[11px] text-stone-500 mt-0.5">Govt. standard permissible threshold: 17.0%</p>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Quality Grade</label>
                <select
                  value={actualGrade}
                  onChange={(e) => setActualGrade(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                >
                  <option value="Grade A">Grade A (FAQ - Fair Average Quality)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Premium Export">Premium Export Lot</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-stone-700">
                <p className="font-bold text-emerald-950">Automated Next Steps upon Completion:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-emerald-800">
                  <li>Direct Benefit Transfer (DBT) payment voucher created</li>
                  <li>Lot registered in State Produce Discovery Marketplace for wholesale buyers</li>
                  <li>SMS & App notification sent to {completingToken.farmerName}</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCompletingToken(null)}
                className="px-4 py-2 text-stone-600 text-xs font-semibold hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Certify & Release Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
