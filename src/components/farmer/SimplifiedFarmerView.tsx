import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProcurementCentre, Crop, Token, Transaction } from '../../shared/types';
import { CROPS_MASTER, getCropDisplayName } from '../../shared/crops';
import { voiceService } from '../../services/voiceService';
import {
  Volume2,
  VolumeX,
  Ticket,
  PlusCircle,
  Building2,
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Phone,
  Layers,
} from 'lucide-react';

interface SimplifiedFarmerViewProps {
  centres: ProcurementCentre[];
  crops: Crop[];
  activeToken: Token | null;
  totalEarnings: number;
  transactions: Transaction[];
  onOpenBooking: (centreId?: string) => void;
  onSelectCentre: (centreId: string) => void;
  onCancelToken: (tokenId: string) => void;
}

export const SimplifiedFarmerView: React.FC<SimplifiedFarmerViewProps> = ({
  centres,
  crops,
  activeToken,
  totalEarnings,
  transactions,
  onOpenBooking,
  onSelectCentre,
  onCancelToken,
}) => {
  const { user, farmerProfile, language, changeLanguage, toggleLowLiteracyMode, t } = useAuth();
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const nearestCentre = centres[0] || {
    name: 'Suryapet AMC Mandi',
    operatingStatus: 'OPEN',
    availableTokenSlots: 35,
    estimatedWaitingTimeMinutes: 30,
    contactPhone: '08684-220145',
  };

  const isMandiOpen = nearestCentre.operatingStatus === 'OPEN';

  const handleSpeak = (key: string, text: string) => {
    if (speakingText === key) {
      voiceService.stop();
      setSpeakingText(null);
      return;
    }
    setSpeakingText(key);
    voiceService.speak(text, language).finally(() => {
      setSpeakingText(null);
    });
  };

  const getMandiVoiceText = () => {
    if (language === 'te') {
      return `${nearestCentre.name} కొనుగోలు కేంద్రం. ప్రస్తుత స్థితి: ${
        isMandiOpen ? 'తెరిచి ఉంది' : 'రద్దీగా ఉంది'
      }. అందుబాటులో ఉన్న స్లాట్లు ${nearestCentre.availableTokenSlots}. అంచనా వేసిన సమయం ${
        nearestCentre.estimatedWaitingTimeMinutes || 35
      } నిమిషాలు. టోకెన్ బుక్ చేసుకోవడానికి క్రింది పచ్చని బటన్ నొక్కండి.`;
    }
    return `${nearestCentre.name} is currently ${nearestCentre.operatingStatus}. ${nearestCentre.availableTokenSlots} slots available today. Estimated wait time is ${
      nearestCentre.estimatedWaitingTimeMinutes || 35
    } minutes. Tap the green button to book your arrival slot.`;
  };

  const getTokenVoiceText = () => {
    if (!activeToken) {
      return language === 'te'
        ? 'మీకు ప్రస్తుతం యాక్టివ్ టోకెన్ ఏదీ లేదు. కొత్త టోకెన్ కోసం బుక్ స్లాట్ బటన్ నొక్కండి.'
        : 'You do not have any active mandi token right now. Tap book slot to reserve your arrival.';
    }
    return language === 'te'
      ? `మీ టోకెన్ నంబర్ ${activeToken.tokenNumber}. మండి: ${activeToken.procurementCentreName}. మీ క్యూ స్థానం ${activeToken.queuePosition}. వేచి ఉండే సమయం ${activeToken.estimatedWaitMinutes} నిమిషాలు.`
      : `Your active token is ${activeToken.tokenNumber} at ${activeToken.procurementCentreName}. Queue position ${activeToken.queuePosition}. Estimated wait time is ${activeToken.estimatedWaitMinutes} minutes.`;
  };

  const getDbtVoiceText = () => {
    return language === 'te'
      ? `మీ బ్యాంకు ఖాతాలో జమ అయిన మొత్తం రైతు బంధు మద్దతు ధర సొమ్ము: రూపాయలు ${totalEarnings.toLocaleString(
          'en-IN'
        )}. ప్రభుత్వం నుండి నేరుగా డీబీటీ ద్వారా చెల్లించబడింది.`
      : `Total direct bank transfer earnings deposited to your account is rupees ${totalEarnings.toLocaleString(
          'en-IN'
        )} under Telangana government MSP.`;
  };

  return (
    <div id="simplified-farmer-mode-container" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Assistance Bar */}
      <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-lg border-2 border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-2xl shadow-md">
            🌾
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-amber-300 text-xs font-black uppercase tracking-wider">
              {language === 'te' ? 'సరళమైన రైతు వీక్షణ' : 'Simple Farmer View'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-0.5">
              {language === 'te' ? `నమస్కారం, ${user?.name}` : `Namaste, ${user?.name}`}
            </h2>
            <p className="text-xs text-emerald-200">
              {farmerProfile?.village || 'Suryapet'}, {farmerProfile?.district || 'Telangana'}
            </p>
          </div>
        </div>

        {/* Controls: Language toggle & Exit simple mode */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => changeLanguage(language === 'te' ? 'en' : 'te')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black border border-emerald-600 shadow-sm"
          >
            {language === 'te' ? 'English' : 'తెలుగు'} 🌐
          </button>

          <button
            type="button"
            onClick={() => toggleLowLiteracyMode()}
            className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold shadow-sm"
          >
            {language === 'te' ? 'పూర్తి స్క్రీన్' : 'Standard View'}
          </button>
        </div>
      </div>

      {/* BIG VISUAL STATUS CARD: GO / WAIT (Telugu & English) */}
      <div
        className={`p-6 rounded-3xl border-3 shadow-xl transition-all ${
          isMandiOpen
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
            : 'bg-amber-50 border-amber-500 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                isMandiOpen ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {isMandiOpen ? '🟢' : '🟡'}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-stone-600">
                {language === 'te' ? 'మండి ప్రస్తుత స్థితి' : 'Live Mandi Signal'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isMandiOpen
                  ? language === 'te'
                    ? 'మండికి వెళ్లవచ్చు (GO)'
                    : 'GO TO MANDI'
                  : language === 'te'
                  ? 'వేచి ఉండండి (WAIT / BUSY)'
                  : 'WAIT / CONGESTED'}
              </h3>
              <p className="text-sm font-bold text-stone-700 mt-1">
                {nearestCentre.name} • {nearestCentre.availableTokenSlots} {language === 'te' ? 'స్లాట్లు ఖాళీగా ఉన్నాయి' : 'slots open'}
              </p>
            </div>
          </div>

          {/* Large Audio Guidance Button */}
          <button
            type="button"
            onClick={() => handleSpeak('mandi_status', getMandiVoiceText())}
            className={`min-h-[52px] px-5 py-3 rounded-2xl border-2 flex items-center gap-2 text-sm font-black transition-transform active:scale-95 shadow-md ${
              speakingText === 'mandi_status'
                ? 'bg-amber-300 text-amber-950 border-amber-500 animate-pulse'
                : 'bg-white hover:bg-stone-50 text-emerald-900 border-emerald-400'
            }`}
          >
            {speakingText === 'mandi_status' ? <VolumeX className="w-6 h-6 text-rose-600" /> : <Volume2 className="w-6 h-6 text-emerald-700" />}
            <span>{speakingText === 'mandi_status' ? (language === 'te' ? 'ఆపండి' : 'Stop Audio') : (language === 'te' ? 'వినండి' : 'Listen')}</span>
          </button>
        </div>
      </div>

      {/* PRIMARY BIG ACTION BUTTON: BOOK NEW TOKEN / స్లాట్ బుకింగ్ */}
      <button
        type="button"
        id="btn-simple-book-slot"
        onClick={() => onOpenBooking()}
        className="w-full min-h-[68px] p-5 rounded-3xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-xl flex items-center justify-between border-2 border-emerald-500 transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black text-2xl">
            🎫
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'te' ? 'రైతు టోకెన్ బుక్ చేయండి' : 'Book Mandi Arrival Slot'}
            </h4>
            <p className="text-xs sm:text-sm text-emerald-100">
              {language === 'te' ? 'క్యూ లేకుండా నేరుగా బరువు కాటా వద్దకు వెళ్ళండి' : 'Guaranteed 2-hour weighbridge slot'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-3 py-1 bg-emerald-900/60 rounded-xl text-xs font-bold text-amber-300">
            {language === 'te' ? 'ఇప్పుడే ప్రారంభించండి' : 'Tap to Start'}
          </span>
          <ChevronRight className="w-8 h-8 text-amber-300" />
        </div>
      </button>

      {/* ACTIVE TOKEN CARD (IF ACTIVE) */}
      {activeToken && (
        <div className="p-6 rounded-3xl bg-white border-3 border-emerald-600 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {language === 'te' ? 'మీ ప్రస్తుత టోకెన్' : 'Your Active Token'}
                </span>
                <h4 className="text-2xl font-black text-stone-900 font-mono">{activeToken.tokenNumber}</h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSpeak('active_token', getTokenVoiceText())}
              className="p-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-emerald-800"
              title="Listen"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'te' ? 'క్యూ స్థానం' : 'Queue Position'}
              </span>
              <p className="text-2xl font-black text-emerald-800">#{activeToken.queuePosition}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'te' ? 'వేచి ఉండే సమయం' : 'Estimated Wait'}
              </span>
              <p className="text-2xl font-black text-amber-800">~{activeToken.estimatedWaitMinutes}m</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 block">
                {language === 'te' ? 'మండి కేంద్రం' : 'Centre'}
              </span>
              <p className="text-xs font-black text-stone-800 truncate">{activeToken.procurementCentreName}</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onCancelToken(activeToken.id)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 underline"
            >
              {language === 'te' ? 'టోకెన్ రద్దు చేయండి' : 'Cancel Token'}
            </button>
            <span className="text-xs font-bold text-emerald-800">
              {activeToken.timeSlot} • {activeToken.bookingDate}
            </span>
          </div>
        </div>
      )}

      {/* VISUAL CROPS CAROUSEL (Big visual tap cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-stone-900 uppercase tracking-wider">
            {language === 'te' ? 'ప్రభుత్వ మద్దతు ధర (MSP) పంటలు' : 'Telangana MSP Crops & Rates'}
          </h4>
          <span className="text-xs text-stone-500 font-semibold">{CROPS_MASTER.length} {language === 'te' ? 'పంటలు' : 'Crops'}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CROPS_MASTER.map((crop) => (
            <div
              key={crop.id}
              className="p-4 rounded-2xl bg-white border-2 border-stone-200 shadow-xs text-center flex flex-col items-center justify-between gap-2 hover:border-emerald-400 transition-colors"
            >
              <span className="text-4xl">{crop.emoji}</span>
              <div>
                <p className="text-xs font-black text-stone-900">
                  {crop.localNames[language] || crop.name}
                </p>
                <p className="text-[11px] font-extrabold text-emerald-800 mt-0.5">
                  ₹{crop.mspPerQuintal.toLocaleString('en-IN')}/Qtl
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DIRECT BANK DBT EARNINGS CARD */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-stone-900 to-emerald-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl shadow-md">
            💰
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {language === 'te' ? 'రైతు బంధు నేరుగా బ్యాంకు జమ' : 'Direct Bank DBT Earnings'}
            </span>
            <p className="text-3xl font-black text-amber-300 mt-0.5 font-mono">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-emerald-200 mt-1">
              {language === 'te'
                ? 'తెలంగాణ ప్రభుత్వం ద్వారా నేరుగా ఆధార్ లింక్డ్ బ్యాంక్ ఖాతాకు చెల్లింపు'
                : '100% Direct DBT payment into your bank account'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSpeak('dbt_earnings', getDbtVoiceText())}
          className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 border border-emerald-600 shadow-md"
        >
          <Volume2 className="w-5 h-5 text-amber-300" />
          <span>{language === 'te' ? 'సొమ్ము వివరాలు వినండి' : 'Listen to Payout'}</span>
        </button>
      </div>
    </div>
  );
};
