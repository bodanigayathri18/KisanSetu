import React, { useState, useMemo } from 'react';
import { ProcurementCentre } from '../../shared/types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { getCropEmoji, getCropDisplayName } from '../../shared/crops';
import { calculateApproxDistanceKm } from '../../shared/locations';
import { voiceService } from '../../services/voiceService';
import { Building2, MapPin, Phone, Clock, ArrowRight, CheckCircle2, Search, Filter, Volume2, VolumeX, Users, Timer } from 'lucide-react';

interface FarmerCentresListProps {
  centres: ProcurementCentre[];
  onSelectCentreForRec: (centreId: string) => void;
  onBookTokenForCentre: (centreId: string) => void;
}

export const FarmerCentresList: React.FC<FarmerCentresListProps> = ({
  centres,
  onSelectCentreForRec,
  onBookTokenForCentre,
}) => {
  const { farmerProfile, language } = useAuth();
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'NEAREST' | 'AVAILABILITY' | 'LOWEST_WAIT'>('NEAREST');
  const [playingCentreId, setPlayingCentreId] = useState<string | null>(null);

  const farmerDistrict = farmerProfile?.district || 'Suryapet';
  const farmerVillage = farmerProfile?.village || 'Suryapet';

  const districts = ['ALL', ...Array.from(new Set(centres.map((c) => c.district)))];

  const enrichedCentres = useMemo(() => {
    return centres.map((c) => ({
      ...c,
      calculatedDistanceKm: calculateApproxDistanceKm(farmerDistrict, farmerVillage, c.district, c.name),
    }));
  }, [centres, farmerDistrict, farmerVillage]);

  const filteredAndSorted = useMemo(() => {
    let list = enrichedCentres.filter((c) => {
      const matchDistrict = districtFilter === 'ALL' || c.district === districtFilter;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDistrict && matchSearch;
    });

    list.sort((a, b) => {
      if (sortBy === 'NEAREST') return a.calculatedDistanceKm - b.calculatedDistanceKm;
      if (sortBy === 'AVAILABILITY') return b.availableTokenSlots - a.availableTokenSlots;
      if (sortBy === 'LOWEST_WAIT') return (a.estimatedWaitingTimeMinutes || 40) - (b.estimatedWaitingTimeMinutes || 40);
      return 0;
    });

    return list;
  }, [enrichedCentres, districtFilter, searchQuery, sortBy]);

  const handleSpeakCentre = (centre: (typeof enrichedCentres)[0]) => {
    if (playingCentreId === centre.id) {
      voiceService.stop();
      setPlayingCentreId(null);
      return;
    }

    setPlayingCentreId(centre.id);
    const text =
      language === 'te'
        ? `${centre.name} కొనుగోలు కేంద్రం, ${centre.district} జిల్లా. స్థితి: ${centre.operatingStatus}. ప్రస్తుతం అందుబాటులో ఉన్న స్లాట్లు ${centre.availableTokenSlots}. అంచనా వేసిన వేచి ఉండే సమయం ${centre.estimatedWaitingTimeMinutes || 35} నిమిషాలు. దూరం సుమారు ${centre.calculatedDistanceKm} కిలోమీటర్లు.`
        : `${centre.name} in ${centre.district}. Operating status is ${centre.operatingStatus}. ${centre.availableTokenSlots} slots available today with estimated waiting time of ${centre.estimatedWaitingTimeMinutes || 35} minutes. Distance is approximately ${centre.calculatedDistanceKm} km from your village.`;

    voiceService.speak(text, language).finally(() => {
      setPlayingCentreId(null);
    });
  };

  return (
    <div id="farmer-centres-list-card" className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <h3 className="font-black text-lg text-stone-900 font-serif">Telangana Procurement Centres & Mandis</h3>
          <p className="text-xs text-stone-500">
            Official civil supplies and MARKFED mandi yards with live weighbridge availability
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* District filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-stone-500">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="font-semibold bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-800 focus:bg-white"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-stone-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="font-semibold bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-stone-800 focus:bg-white"
            >
              <option value="NEAREST">📍 Nearest First</option>
              <option value="AVAILABILITY">🟢 Most Slots</option>
              <option value="LOWEST_WAIT">⏱️ Lowest Wait</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Mandi name, village, or district..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-2xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {/* Grid of Centred Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSorted.map((centre) => {
          const isClosed = centre.operatingStatus === 'CLOSED' || centre.operatingStatus === 'TEMPORARILY_CLOSED';
          const isSpeaking = playingCentreId === centre.id;

          return (
            <div
              key={centre.id}
              id={`mandi-card-${centre.id}`}
              className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-black text-stone-900 text-base">{centre.name}</h4>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{centre.location || centre.address || centre.district}, {centre.district}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSpeakCentre(centre)}
                      className={`p-1.5 rounded-lg border text-stone-600 transition-colors ${
                        isSpeaking ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                      }`}
                      title="Listen in Telugu/English"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-800" />}
                    </button>
                    <StatusBadge status={centre.operatingStatus} size="sm" />
                  </div>
                </div>

                {/* Distance & Hours Tag */}
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 flex-wrap mb-3">
                  <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
                    📍 {centre.calculatedDistanceKm} km from your village
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 border border-stone-200">
                    🕒 {centre.operatingHours || '08:00 AM - 05:30 PM'}
                  </span>
                </div>

                {/* Capacity & Queue Meter */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Daily Token Capacity</span>
                    <span className="font-black text-emerald-900">
                      {centre.availableTokenSlots} / {centre.dailyTokenLimit} Open
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, ((centre.dailyTokenLimit - centre.availableTokenSlots) / centre.dailyTokenLimit) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-400" />
                      <span>{centre.windowCapacity || 20} farmers / 2-hr window</span>
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-800">
                      <Timer className="w-3 h-3" />
                      <span>~{centre.estimatedWaitingTimeMinutes || 35} mins wait</span>
                    </span>
                  </div>
                </div>

                {/* Accepted Crops with Visual Badges */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-stone-400">Accepted Commodities:</span>
                  {(centre.acceptedCropIds || ['crop_paddy_a', 'crop_cotton', 'crop_maize']).map((cid) => (
                    <span
                      key={cid}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-semibold text-stone-700 border border-stone-200"
                    >
                      <span>{getCropEmoji(cid)}</span>
                      <span>{getCropDisplayName(cid, language)}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                <button
                  id={`btn-check-mandi-${centre.id}`}
                  onClick={() => onSelectCentreForRec(centre.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors text-center"
                >
                  Live GO / WAIT
                </button>
                <button
                  id={`btn-book-mandi-${centre.id}`}
                  disabled={isClosed}
                  onClick={() => onBookTokenForCentre(centre.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors text-center ${
                    isClosed
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                  }`}
                >
                  {isClosed ? 'Centre Closed' : 'Book Token →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="py-12 text-center text-stone-400">
          <p className="text-sm font-semibold">No procurement mandis match your filters.</p>
        </div>
      )}
    </div>
  );
};
