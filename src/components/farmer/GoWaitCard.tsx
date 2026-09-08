import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProcurementCentre, Crop, RecommendationResult } from '../../shared/types';
import { GoWaitBadge } from '../common/StatusBadge';
import { speakText } from '../../utils/voice';
import {
  Sparkles,
  Volume2,
  Clock,
  Truck,
  Building2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Calendar,
} from 'lucide-react';

interface GoWaitCardProps {
  onBookTokenForMandi?: (centreId: string) => void;
  centres: ProcurementCentre[];
  crops: Crop[];
  selectedCentreId: string;
  onSelectCentreId: (id: string) => void;
}

export const GoWaitCard: React.FC<GoWaitCardProps> = ({
  onBookTokenForMandi,
  centres,
  crops,
  selectedCentreId,
  onSelectCentreId,
}) => {
  const { language, lowLiteracyMode, t } = useAuth();
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fetch recommendation whenever centre or crop changes
  useEffect(() => {
    if (!selectedCentreId) return;
    let isMounted = true;

    async function fetchRec() {
      setLoading(true);
      try {
        const res = await api.getFarmerRecommendation(selectedCentreId, selectedCropId || undefined);
        if (isMounted) {
          setRecommendation(res.recommendation);
        }
      } catch (err) {
        console.error('Error fetching recommendation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRec();
    return () => {
      isMounted = false;
    };
  }, [selectedCentreId, selectedCropId]);

  const handleSpeak = async () => {
    if (!recommendation) return;
    setIsSpeaking(true);
    const textToSpeak = `${recommendation.headline}. ${recommendation.explanation}. Suggested action: ${recommendation.suggestedAction}`;
    await speakText(textToSpeak, language);
    setIsSpeaking(false);
  };

  const selectedCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];

  return (
    <div
      id="farmer-go-wait-card"
      className={`rounded-2xl border transition-all ${
        lowLiteracyMode
          ? 'p-6 bg-white border-stone-300 shadow-md ring-2 ring-emerald-500/20'
          : 'p-5 bg-white border-stone-200 shadow-sm'
      }`}
    >
      {/* Header & Mandi Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 className={`font-bold text-stone-900 ${lowLiteracyMode ? 'text-xl' : 'text-base'}`}>
              {t.recommendation.checkRecommendation}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent live arrival guidance powered by yard load & weighbridge traffic
          </p>
        </div>

        {/* Mandi & Crop Pickers */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="select-rec-centre"
            value={selectedCentreId}
            onChange={(e) => onSelectCentreId(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {centres.map((centre) => (
              <option key={centre.id} value={centre.id}>
                {centre.name} ({centre.district})
              </option>
            ))}
          </select>

          <select
            id="select-rec-crop"
            value={selectedCropId}
            onChange={(e) => setSelectedCropId(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Commodities / పంట ఎంచుకోండి</option>
            {crops.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name} {crop.localNames[language] ? `(${crop.localNames[language]})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main recommendation result */}
      {loading ? (
        <div className="py-12 text-center text-stone-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Evaluating mandi congestion & token capacity...</p>
        </div>
      ) : recommendation ? (
        <div className="pt-5 space-y-4">
          {/* Status & Headline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-4">
              <GoWaitBadge status={recommendation.status} large={lowLiteracyMode} />
              <div>
                <h3 className={`font-bold text-stone-900 ${lowLiteracyMode ? 'text-lg' : 'text-base'}`}>
                  {recommendation.headline}
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                  {recommendation.explanation}
                </p>
              </div>
            </div>

            {/* Audio announcement button */}
            <button
              id="btn-listen-recommendation"
              onClick={handleSpeak}
              className={`inline-flex items-center justify-center gap-2 rounded-xl transition-all ${
                lowLiteracyMode
                  ? 'px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm'
                  : 'px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{isSpeaking ? 'Announcing...' : t.common.listenAudio}</span>
            </button>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.recommendation.capacityUsed}</span>
              </div>
              <p className="text-lg font-extrabold text-stone-900">{recommendation.loadPercentage}%</p>
              <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    recommendation.loadPercentage > 85
                      ? 'bg-rose-500'
                      : recommendation.loadPercentage > 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${recommendation.loadPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium mb-1">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.recommendation.queueLength}</span>
              </div>
              <p className="text-lg font-extrabold text-stone-900">
                {recommendation.currentQueueLength}{' '}
                <span className="text-xs font-normal text-stone-500">vehicles</span>
              </p>
              <p className="text-[11px] text-stone-400 mt-1">At weighbridge line</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.recommendation.estWait}</span>
              </div>
              <p className="text-lg font-extrabold text-stone-900">
                ~{recommendation.estimatedWaitMinutes}{' '}
                <span className="text-xs font-normal text-stone-500">mins</span>
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Average throughput</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                <span>Available Slots</span>
              </div>
              <p className="text-lg font-extrabold text-stone-900">
                {selectedCentre.availableTokenSlots}{' '}
                <span className="text-xs font-normal text-stone-500">left today</span>
              </p>
              <p className="text-[11px] text-stone-400 mt-1">Daily cap: {selectedCentre.dailyTokenLimit}</p>
            </div>
          </div>

          {/* Factors evaluation & Suggested action */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2 text-xs text-stone-700">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950">Action Guidance: </span>
                <span>{recommendation.suggestedAction}</span>
              </div>
            </div>

            {onBookTokenForMandi && (
              <button
                id="btn-book-from-rec"
                onClick={() => onBookTokenForMandi(selectedCentre.id)}
                className={`whitespace-nowrap rounded-xl font-bold transition-all ${
                  lowLiteracyMode
                    ? 'px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-sm'
                    : 'px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs shadow-xs'
                }`}
              >
                {t.farmer.bookToken} →
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
