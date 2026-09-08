import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProcurementCentre, Token, Transaction } from '../../shared/types';
import { QueueManager } from './QueueManager';
import { CentreCapacityModal } from './CentreCapacityModal';
import { BroadcastModal } from './BroadcastModal';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShieldCheck,
  Building2,
  Sliders,
  Megaphone,
  RotateCw,
  Truck,
  Layers,
  IndianRupee,
  CheckCircle2,
  Users,
  Clock,
  Wheat,
} from 'lucide-react';

export const OfficialDashboard: React.FC = () => {
  const { user, officialProfile, t } = useAuth();

  const [loading, setLoading] = useState(true);
  const [centre, setCentre] = useState<ProcurementCentre | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [cropSummaries, setCropSummaries] = useState<any[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);

  // Modals
  const [capacityModalOpen, setCapacityModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  const loadOfficialData = async () => {
    setLoading(true);
    try {
      const [dashRes, tokensRes] = await Promise.all([
        api.getOfficialDashboard(),
        api.getOfficialTokens(),
      ]);

      setCentre(dashRes.centre);
      setStats(dashRes.stats);
      setCropSummaries(dashRes.cropSummaries || []);
      setTokens(tokensRes.tokens);
    } catch (err) {
      console.error('Failed to load official dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfficialData();
  }, [user?.id]);

  return (
    <div id="official-module-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Centre Operational Control Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-blue-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                Telangana Agricultural Marketing Department
              </span>
              {centre && <StatusBadge status={centre.operatingStatus} size="sm" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight font-serif">
              {centre?.name || 'Procurement Centre Control Room'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Location: <span className="text-white font-semibold">{centre?.address}, {centre?.district}</span> •
              Officer in Charge: <span className="text-white font-semibold">{user?.name}</span> ({officialProfile?.designation || 'Mandi Secretary'}) •
              Official ID: <span className="font-mono text-white">{officialProfile?.employeeId || 'TEL-OFF-084'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-open-capacity-modal"
              onClick={() => setCapacityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs border border-blue-600 shadow-sm transition-colors"
            >
              <Sliders className="w-4 h-4 text-blue-300" />
              <span>Adjust Yard Capacity</span>
            </button>

            <button
              id="btn-open-broadcast-modal"
              onClick={() => setBroadcastModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-sm transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>

            <button
              id="btn-refresh-official-data"
              onClick={loadOfficialData}
              title="Refresh live arrivals"
              className="p-2.5 rounded-xl bg-blue-900/80 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-blue-800/50">
          <div className="bg-blue-900/40 rounded-2xl p-3 border border-blue-800/40">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
              Active Queue
            </span>
            <p className="text-2xl font-black text-white mt-0.5">
              {stats?.activeQueueCount ?? 0}{' '}
              <span className="text-xs font-normal text-blue-200">Farmers in Line</span>
            </p>
          </div>

          <div className="bg-blue-900/40 rounded-2xl p-3 border border-blue-800/40">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
              Weighbridge Load
            </span>
            <p className="text-2xl font-black text-amber-300 mt-0.5">
              {stats?.capacityUtilizationPercent ?? 0}%{' '}
              <span className="text-xs font-normal text-blue-200">Capacity</span>
            </p>
          </div>

          <div className="bg-blue-900/40 rounded-2xl p-3 border border-blue-800/40">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
              Procured Today
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">
              {stats?.completedToday ?? 0}{' '}
              <span className="text-xs font-normal text-blue-200">Lots Completed</span>
            </p>
          </div>

          <div className="bg-blue-900/40 rounded-2xl p-3 border border-blue-800/40">
            <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
              Available Slots
            </span>
            <p className="text-2xl font-black text-white mt-0.5">
              {centre?.availableTokenSlots ?? 0} / {centre?.dailyTokenLimit ?? 100}
            </p>
          </div>
        </div>
      </div>

      {/* Crop-wise Incoming Breakdown (Today's Yard Load) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Wheat className="w-5 h-5 text-emerald-700" />
              <span>{t.official.incomingCrops}</span>
            </h3>
            <p className="text-xs text-stone-500">
              Aggregated incoming volume across all booked tokens arriving at this yard today
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            Total Commodities: {cropSummaries.length}
          </span>
        </div>

        {cropSummaries.length === 0 ? (
          <p className="py-6 text-center text-xs text-stone-400">No commodity arrivals booked yet today</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {cropSummaries.map((crop, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors"
              >
                <span className="text-xs font-bold text-stone-700 block truncate">{crop.cropName}</span>
                <p className="text-xl font-black text-stone-900 mt-1">
                  {crop.totalQuintals}{' '}
                  <span className="text-xs font-normal text-stone-500">Qtl</span>
                </p>
                <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                  {crop.tokenCount} {crop.tokenCount === 1 ? 'Token' : 'Tokens'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Queue Manager Component */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-700" />
            <span>{t.official.activeQueue}</span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            Total Tokens: {tokens.length}
          </span>
        </div>

        <QueueManager tokens={tokens} onTokenUpdated={loadOfficialData} />
      </div>

      {/* Modals */}
      {centre && (
        <CentreCapacityModal
          isOpen={capacityModalOpen}
          onClose={() => setCapacityModalOpen(false)}
          centre={centre}
          onUpdated={(updated) => {
            setCentre(updated);
            loadOfficialData();
          }}
        />
      )}

      {centre && (
        <BroadcastModal
          isOpen={broadcastModalOpen}
          onClose={() => setBroadcastModalOpen(false)}
          centreName={centre.name}
        />
      )}
    </div>
  );
};
