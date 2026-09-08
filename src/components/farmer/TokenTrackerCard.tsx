import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Token } from '../../shared/types';
import { StatusBadge } from '../common/StatusBadge';
import { speakText } from '../../utils/voice';
import {
  Ticket,
  Clock,
  Building2,
  Calendar,
  Volume2,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Truck,
  RotateCw,
  AlertTriangle,
} from 'lucide-react';

interface TokenTrackerCardProps {
  token: Token;
  onCancelToken: (tokenId: string) => Promise<void>;
  onRefresh: () => void;
}

const STEPS = [
  { key: 'WAITING', label: 'In Queue' },
  { key: 'CALLED', label: 'Called to Weighbridge' },
  { key: 'ARRIVED', label: 'Arrived at Yard' },
  { key: 'PROCESSING', label: 'Weighing & Quality' },
  { key: 'COMPLETED', label: 'Procured & Paid' },
];

export const TokenTrackerCard: React.FC<TokenTrackerCardProps> = ({ token, onCancelToken, onRefresh }) => {
  const { language, lowLiteracyMode, t } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Determine current active step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 0;
      case 'CALLED':
        return 1;
      case 'ARRIVED':
        return 2;
      case 'PROCESSING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(token.status);

  const handleSpeak = async () => {
    setSpeaking(true);
    const speech =
      language === 'te'
        ? `టోకెన్ నంబర్ ${token.tokenNumber}. కొనుగోలు కేంద్రం: ${token.procurementCentreName}. ప్రస్తుత స్థితి: ${token.status}. మీ క్యూ స్థానం ${token.queuePosition || 1}. వేచి ఉండే సమయం సుమారు ${token.estimatedWaitMinutes} నిమిషాలు.`
        : `Token number ${token.tokenNumber} for ${token.procurementCentreName}. Status is ${token.status.replace(
            '_',
            ' '
          )}. Your queue position is number ${token.queuePosition || 1}. Estimated wait is ${
            token.estimatedWaitMinutes
          } minutes.`;
    await speakText(speech, language);
    setSpeaking(false);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await onCancelToken(token.id);
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      id={`active-token-card-${token.id}`}
      className={`rounded-2xl border transition-all ${
        token.status === 'CALLED'
          ? 'bg-blue-50/50 border-blue-400 ring-4 ring-blue-500/20 shadow-lg'
          : lowLiteracyMode
          ? 'bg-white border-stone-300 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-stone-200 shadow-sm'
      } p-5`}
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              token.status === 'CALLED'
                ? 'bg-blue-600 text-white animate-bounce'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {token.tokenNumber}
              </span>
              <StatusBadge status={token.status} size="sm" />
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-stone-800">{token.procurementCentreName}</span>
              <span>•</span>
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{token.bookingDate} ({token.timeSlot})</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Speak & Refresh */}
        <div className="flex items-center gap-2">
          <button
            id="btn-speak-active-token"
            onClick={handleSpeak}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'animate-bounce text-amber-500' : ''}`} />
            <span>{speaking ? 'Speaking...' : t.common.listenAudio}</span>
          </button>

          <button
            id="btn-refresh-token"
            onClick={onRefresh}
            title="Refresh queue status"
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="py-6 border-b border-stone-100">
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-2">
          {/* Connecting line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>

          {STEPS.map((step, idx) => {
            const isPassed = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isPassed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200 shadow-sm animate-pulse'
                      : 'bg-white border-2 border-stone-300 text-stone-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-1.5 text-center max-w-[70px] sm:max-w-[90px] leading-tight ${
                    isCurrent ? 'text-blue-900 font-extrabold' : isPassed ? 'text-emerald-800' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Queue Status Callout */}
      <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            {t.farmer.queuePosition}
          </span>
          <p className="text-2xl font-black text-stone-900 mt-0.5">
            #{token.queuePosition || 1}{' '}
            <span className="text-xs font-normal text-stone-500">in live yard line</span>
          </p>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            {t.recommendation.estWait}
          </span>
          <p className="text-2xl font-black text-stone-900 mt-0.5">
            ~{token.estimatedWaitMinutes || 20}{' '}
            <span className="text-xs font-normal text-stone-500">minutes</span>
          </p>
        </div>

        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
            Total Produce in Token
          </span>
          <p className="text-2xl font-black text-emerald-800 mt-0.5">
            {token.crops.reduce((acc, c) => acc + c.quantityQuintals, 0)}{' '}
            <span className="text-xs font-normal text-stone-500">Quintals</span>
          </p>
        </div>
      </div>

      {/* Crops breakdown list */}
      <div className="mt-4 p-3 bg-stone-50/70 rounded-xl border border-stone-200">
        <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
          Registered Commodities ({token.crops.length})
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {token.crops.map((crop, i) => (
            <div
              key={i}
              className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-stone-900">{crop.cropName}</span>
                <span className="text-stone-500 ml-1.5">({crop.grade || 'FAQ'})</span>
              </div>
              <div className="text-right">
                <span className="font-black text-stone-900">{crop.quantityQuintals} Qtl</span>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  MSP ₹{((crop.quantityQuintals || 0) * (crop.mspRate || 2320)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation control */}
      {['WAITING', 'CALLED'].includes(token.status) && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Need to change plans? You can cancel and free up this mandi slot.
          </span>
          {showCancelConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-700 font-medium">Cancel this booking?</span>
              <button
                id="btn-confirm-cancel-token"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-2.5 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-200"
              >
                Keep
              </button>
            </div>
          ) : (
            <button
              id="btn-request-cancel-token"
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium underline"
            >
              {t.farmer.cancelToken}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
