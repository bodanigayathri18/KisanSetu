import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProcurementCentre, Crop, Token, TimeWindowSlot } from '../../shared/types';
import { CROPS_MASTER, getCropEmoji, getCropDisplayName } from '../../shared/crops';
import { calculateApproxDistanceKm } from '../../shared/locations';
import { voiceService } from '../../services/voiceService';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Building2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  ChevronRight,
  Sparkles,
  Users,
  Timer,
  Check,
  Ticket,
} from 'lucide-react';

interface TokenBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenBooked: (token: Token) => void;
  centres: ProcurementCentre[];
  crops: Crop[];
  initialCentreId?: string;
  hasActiveToken?: boolean;
}

interface SelectedCropItem {
  cropId: string;
  quantityQuintals: number;
  grade: string;
}

type BookingStep = 'SELECT_CENTRE' | 'CONFIGURE_SLOT_AND_CROPS' | 'REVIEW_CONFIRM' | 'SUCCESS';

type CentreSortOption = 'NEAREST' | 'EARLIEST_SLOT' | 'LOWEST_WAIT' | 'HIGHEST_AVAILABILITY' | 'OPEN_NOW';

export const TokenBookingModal: React.FC<TokenBookingModalProps> = ({
  isOpen,
  onClose,
  onTokenBooked,
  centres,
  crops,
  initialCentreId,
  hasActiveToken = false,
}) => {
  const { t, user, farmerProfile, lowLiteracyMode, language } = useAuth();

  // Wizard Step
  const [currentStep, setCurrentStep] = useState<BookingStep>('SELECT_CENTRE');

  // Step 1: Centre Selection State
  const [selectedCentreId, setSelectedCentreId] = useState<string>(initialCentreId || centres[0]?.id || '');
  const [centreSearchQuery, setCentreSearchQuery] = useState('');
  const [centreSortBy, setCentreSortBy] = useState<CentreSortOption>('NEAREST');
  const [cropFilter, setCropFilter] = useState<string>('ALL');

  // Step 2: Slot & Crop Configuration State
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlotId, setSelectedSlotId] = useState<string>('10:00 AM - 12:00 PM');
  const [availableSlots, setAvailableSlots] = useState<TimeWindowSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');

  // Selected crops in this token (Multiple allowed)
  const [selectedCrops, setSelectedCrops] = useState<SelectedCropItem[]>([
    { cropId: 'crop_paddy', quantityQuintals: 25, grade: 'Grade A / FAQ' },
  ]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedToken, setConfirmedToken] = useState<Token | null>(null);

  // Audio playing state
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  useEffect(() => {
    const unsub = voiceService.subscribe((state) => {
      setIsAudioSpeaking(state.isSpeaking);
    });
    return () => unsub();
  }, []);

  // Initialize centre selection from props
  useEffect(() => {
    if (initialCentreId) {
      setSelectedCentreId(initialCentreId);
      setCurrentStep('CONFIGURE_SLOT_AND_CROPS');
    } else if (centres.length > 0 && !selectedCentreId) {
      setSelectedCentreId(centres[0].id);
    }
  }, [initialCentreId, centres]);

  // Fetch dynamic 2-hour capacity slots whenever centre or date changes
  useEffect(() => {
    if (!selectedCentreId || !bookingDate) return;

    let isMounted = true;
    setLoadingSlots(true);

    api
      .getCentreSlots(selectedCentreId, bookingDate)
      .then((res) => {
        if (!isMounted) return;
        setAvailableSlots(res.slots || []);
        // Automatically select the first non-full slot if current slot is full or invalid
        const found = res.slots.find((s) => s.id === selectedSlotId && !s.isFull);
        if (!found) {
          const firstOpen = res.slots.find((s) => !s.isFull);
          if (firstOpen) {
            setSelectedSlotId(firstOpen.id);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load dynamic slots, using fallback:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCentreId, bookingDate]);

  const farmerDistrict = farmerProfile?.district || 'Suryapet';
  const farmerVillage = farmerProfile?.village || 'Suryapet';

  // Compute enriched centre list with approximate road distance and live metrics
  const enrichedCentres = useMemo(() => {
    return centres.map((c) => {
      const distanceKm = calculateApproxDistanceKm(farmerDistrict, farmerVillage, c.district, c.name);
      return {
        ...c,
        calculatedDistanceKm: distanceKm,
      };
    });
  }, [centres, farmerDistrict, farmerVillage]);

  // Filter & Sort centres
  const filteredAndSortedCentres = useMemo(() => {
    let result = enrichedCentres.filter((c) => {
      // Text search
      const matchesText =
        c.name.toLowerCase().includes(centreSearchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(centreSearchQuery.toLowerCase()) ||
        (c.location && c.location.toLowerCase().includes(centreSearchQuery.toLowerCase())) ||
        c.code.toLowerCase().includes(centreSearchQuery.toLowerCase());

      // Crop filter
      const matchesCrop =
        cropFilter === 'ALL' ||
        (c.acceptedCropIds && c.acceptedCropIds.includes(cropFilter)) ||
        cropFilter === 'crop_paddy' ||
        c.name.toLowerCase().includes(cropFilter.replace('crop_', ''));

      return matchesText && matchesCrop;
    });

    // Sorting
    result.sort((a, b) => {
      switch (centreSortBy) {
        case 'NEAREST':
          return a.calculatedDistanceKm - b.calculatedDistanceKm;
        case 'LOWEST_WAIT':
          return (a.estimatedWaitingTimeMinutes || 40) - (b.estimatedWaitingTimeMinutes || 40);
        case 'HIGHEST_AVAILABILITY':
          return b.availableTokenSlots - a.availableTokenSlots;
        case 'OPEN_NOW':
          if (a.operatingStatus === 'OPEN' && b.operatingStatus !== 'OPEN') return -1;
          if (b.operatingStatus === 'OPEN' && a.operatingStatus !== 'OPEN') return 1;
          return a.calculatedDistanceKm - b.calculatedDistanceKm;
        case 'EARLIEST_SLOT':
        default:
          return a.calculatedDistanceKm - b.calculatedDistanceKm;
      }
    });

    return result;
  }, [enrichedCentres, centreSearchQuery, centreSortBy, cropFilter]);

  const selectedCentre = enrichedCentres.find((c) => c.id === selectedCentreId) || enrichedCentres[0];

  // Crop calculation helpers
  const totalQuantityQuintals = selectedCrops.reduce((sum, item) => sum + (Number(item.quantityQuintals) || 0), 0);

  const totalEstimatedMspValue = selectedCrops.reduce((sum, item) => {
    const matchedCrop = crops.find((c) => c.id === item.cropId);
    const msp = matchedCrop?.mspPerQuintal || 2320;
    return sum + (Number(item.quantityQuintals) || 0) * msp;
  }, 0);

  // Toggle crop selection from visual cards
  const handleToggleCropCard = (cropId: string) => {
    const existingIndex = selectedCrops.findIndex((c) => c.cropId === cropId);
    if (existingIndex >= 0) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((_, i) => i !== existingIndex));
      }
    } else {
      setSelectedCrops([
        ...selectedCrops,
        { cropId, quantityQuintals: 15, grade: 'Grade A / FAQ' },
      ]);
    }
  };

  const handleUpdateCropQuantity = (cropId: string, qty: number) => {
    setSelectedCrops((prev) =>
      prev.map((item) =>
        item.cropId === cropId ? { ...item, quantityQuintals: Math.max(1, qty) } : item
      )
    );
  };

  // Submit Final Booking (Step 2 Review -> API)
  const handleConfirmAndBook = async () => {
    setErrorMessage('');

    if (hasActiveToken) {
      setErrorMessage(t.farmer.activeTokenWarning);
      return;
    }

    if (totalQuantityQuintals <= 0) {
      setErrorMessage('Total produce quantity must be at least 1 quintal.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        procurementCentreId: selectedCentreId,
        bookingDate,
        timeSlot: selectedSlotId,
        crops: selectedCrops.map((c) => ({
          cropId: c.cropId,
          quantityQuintals: Number(c.quantityQuintals),
          grade: c.grade,
        })),
        notes,
      };

      const res = await api.bookToken(payload);
      if (res.token) {
        setConfirmedToken(res.token);
        onTokenBooked(res.token);
        setCurrentStep('SUCCESS');

        // Automatically play voice announcement for confirmation safely
        try {
          const announcement = voiceService.getTokenConfirmationAnnouncement(res.token, language);
          voiceService.speak(announcement, language);
        } catch (audioErr) {
          console.warn('Voice announcement failed gracefully:', audioErr);
        }
      }
    } catch (err: any) {
      if (err.activeToken) {
        setConfirmedToken(err.activeToken);
        onTokenBooked(err.activeToken);
        setCurrentStep('SUCCESS');
        setErrorMessage('');
      } else {
        setErrorMessage(err.message || 'Failed to book slot. Please check slot availability and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayAnnouncement = () => {
    if (!confirmedToken) return;
    if (isAudioSpeaking) {
      voiceService.stop();
    } else {
      const announcement = voiceService.getTokenConfirmationAnnouncement(confirmedToken, language);
      voiceService.speak(announcement, language);
    }
  };

  const activeSlotDetails = availableSlots.find((s) => s.id === selectedSlotId);

  if (!isOpen) return null;

  return (
    <div
      id="token-booking-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="token-booking-modal-card"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 sm:my-6 transition-all"
      >
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center shadow-inner">
              <Calendar className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight font-serif">
                  {t.farmer.bookTokenTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30">
                  Telangana MSP Guaranteed
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Rythu Bandhu Fast-Track Mandi Arrival & Weighbridge Slot
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              voiceService.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-700/60 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        {currentStep !== 'SUCCESS' && (
          <div className="bg-stone-100 px-6 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep('SELECT_CENTRE')}
                className={`flex items-center gap-1.5 font-bold transition-colors ${
                  currentStep === 'SELECT_CENTRE' ? 'text-emerald-800' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 'SELECT_CENTRE'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-300 text-stone-700'
                  }`}
                >
                  1
                </span>
                <span>Select Mandi</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

              <button
                type="button"
                onClick={() => selectedCentreId && setCurrentStep('CONFIGURE_SLOT_AND_CROPS')}
                className={`flex items-center gap-1.5 font-bold transition-colors ${
                  currentStep === 'CONFIGURE_SLOT_AND_CROPS'
                    ? 'text-emerald-800'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 'CONFIGURE_SLOT_AND_CROPS'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-300 text-stone-700'
                  }`}
                >
                  2
                </span>
                <span>Slot & Crops</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

              <span
                className={`flex items-center gap-1.5 font-bold ${
                  currentStep === 'REVIEW_CONFIRM' ? 'text-emerald-800' : 'text-stone-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === 'REVIEW_CONFIRM'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-300 text-stone-700'
                  }`}
                >
                  3
                </span>
                <span>Review & Confirm</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-500">
              <MapPin className="w-3 h-3 text-emerald-700" />
              <span>Your Village: {farmerVillage}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Active Token Warning */}
          {hasActiveToken && currentStep !== 'SUCCESS' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Active Mandi Token Already in Progress</p>
                <p className="text-xs text-rose-700 mt-1">
                  To prevent token hoarding and ensure fair mandi access for all farmers, each farmer can only hold 1 active token at a time. Please wait for completion or cancel your existing token.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: PROCUREMENT CENTRE SELECTION */}
          {/* ========================================================================= */}
          {currentStep === 'SELECT_CENTRE' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                  <span>Choose Nearest Procurement Centre / Mandi</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {filteredAndSortedCentres.length} Mandis
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Showing procurement centres with real-time yard capacity and distance calculated from your village ({farmerVillage}, {farmerDistrict}).
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by Mandi name, Mandal or District..."
                    value={centreSearchQuery}
                    onChange={(e) => setCentreSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-500 shrink-0">Sort:</span>
                  <select
                    value={centreSortBy}
                    onChange={(e) => setCentreSortBy(e.target.value as CentreSortOption)}
                    className="w-full py-2.5 px-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="NEAREST">📍 Nearest to Me</option>
                    <option value="LOWEST_WAIT">⏱️ Lowest Wait Time</option>
                    <option value="HIGHEST_AVAILABILITY">🟢 Highest Available Slots</option>
                    <option value="OPEN_NOW">✨ Open Now First</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-500 shrink-0">Crop:</span>
                  <select
                    value={cropFilter}
                    onChange={(e) => setCropFilter(e.target.value)}
                    className="w-full py-2.5 px-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="ALL">All Crops</option>
                    <option value="crop_paddy">🌾 Paddy (వరి)</option>
                    <option value="crop_cotton">🌱 Cotton (ప్రత్తి)</option>
                    <option value="crop_maize">🌽 Maize (మొక్కజొన్న)</option>
                    <option value="crop_redgram">🫘 Red Gram (కందులు)</option>
                    <option value="crop_chilli">🌶️ Red Chilli (మిర్చి)</option>
                  </select>
                </div>
              </div>

              {/* Centre Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {filteredAndSortedCentres.map((centre) => {
                  const isSelected = centre.id === selectedCentreId;
                  const isClosed = centre.operatingStatus === 'CLOSED' || centre.operatingStatus === 'TEMPORARILY_CLOSED';

                  return (
                    <div
                      key={centre.id}
                      onClick={() => !isClosed && setSelectedCentreId(centre.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-600 shadow-sm'
                          : isClosed
                          ? 'border-stone-200 bg-stone-100/60 opacity-70 cursor-not-allowed'
                          : 'border-stone-200 bg-white hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top title and status tag */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-stone-900 text-sm">{centre.name}</h4>
                              {isSelected && (
                                <span className="p-0.5 rounded-full bg-emerald-700 text-white">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                              <span>
                                {centre.location || centre.address || `${centre.district} Mandi`}, {centre.district}
                              </span>
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                              centre.operatingStatus === 'OPEN'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : centre.operatingStatus === 'BUSY'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {centre.operatingStatus === 'OPEN'
                              ? '🟢 Available'
                              : centre.operatingStatus === 'BUSY'
                              ? '🟡 High Queue'
                              : '🔴 Closed'}
                          </span>
                        </div>

                        {/* Distance and Operating Info Badge */}
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600 mb-2.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-emerald-900 font-bold border border-stone-200">
                            📍 {centre.calculatedDistanceKm} km away
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200">
                            🕒 {centre.operatingHours || '08:00 AM - 05:30 PM'}
                          </span>
                        </div>

                        {/* Real-Time Capacity & Wait Metrics */}
                        <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium text-[11px]">Available Slots Today:</span>
                            <span className="font-extrabold text-emerald-800">
                              {centre.availableTokenSlots} / {centre.dailyTokenLimit} Slots
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium text-[11px]">Est. Yard Wait Time:</span>
                            <span className="font-bold text-amber-800">
                              ~{centre.estimatedWaitingTimeMinutes || 35} mins
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500 font-medium text-[11px]">Window Capacity:</span>
                            <span className="font-bold text-stone-700">
                              {centre.windowCapacity || 20} farmers / 2-hr window
                            </span>
                          </div>
                        </div>

                        {/* Accepted Crops with Icons */}
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-stone-400">Accepting:</span>
                          {(centre.acceptedCropIds || ['crop_paddy', 'crop_cotton', 'crop_maize']).map((cid) => (
                            <span
                              key={cid}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-semibold text-stone-700 border border-stone-200"
                            >
                              <span>{getCropEmoji(cid)}</span>
                              <span>{getCropDisplayName(cid, language)}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Select Action */}
                      <div className="pt-3 mt-3 border-t border-stone-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500">Mandi Code: <span className="font-mono font-bold text-stone-700">{centre.code}</span></span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!isClosed) {
                              setSelectedCentreId(centre.id);
                              setCurrentStep('CONFIGURE_SLOT_AND_CROPS');
                            }
                          }}
                          disabled={isClosed}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : isClosed
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900'
                          }`}
                        >
                          {isSelected ? 'Selected ✓' : 'Select Mandi →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAndSortedCentres.length === 0 && (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                  <p className="text-sm font-semibold text-stone-600">No mandis found matching your search.</p>
                  <button
                    onClick={() => {
                      setCentreSearchQuery('');
                      setCropFilter('ALL');
                    }}
                    className="mt-2 text-xs font-bold text-emerald-800 underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-next-to-slots"
                  onClick={() => setCurrentStep('CONFIGURE_SLOT_AND_CROPS')}
                  disabled={!selectedCentreId}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Continue to Slot & Crops</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: CONFIGURE DATE, 2-HOUR SLOTS, AND CROPS */}
          {/* ========================================================================= */}
          {currentStep === 'CONFIGURE_SLOT_AND_CROPS' && (
            <div className="space-y-5">
              {/* Selected Centre Summary Pill */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{selectedCentre.name}</h4>
                    <p className="text-[11px] text-stone-600">
                      📍 {selectedCentre.location || selectedCentre.address}, {selectedCentre.district} • {selectedCentre.operatingHours}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep('SELECT_CENTRE')}
                  className="text-xs font-bold text-emerald-800 hover:underline shrink-0"
                >
                  Change Mandi ↺
                </button>
              </div>

              {/* Date & Dynamic 2-Hour Slot Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Select Arrival Date & 2-Hour Time Window *
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Each 2-hour window supports {selectedCentre.windowCapacity || 20} farmers based on weighbridge capacity.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {loadingSlots ? (
                  <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                    Checking live mandi slot availability...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const isFull = slot.isFull || slot.availableSlots <= 0;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`p-3 rounded-2xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-emerald-700 bg-emerald-50 ring-2 ring-emerald-600 shadow-xs'
                              : isFull
                              ? 'border-stone-200 bg-stone-100/70 opacity-60 cursor-not-allowed'
                              : 'border-stone-200 bg-white hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
                              {slot.period} Window
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isFull
                                  ? 'bg-rose-100 text-rose-800'
                                  : slot.availableSlots <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isFull ? '🔴 Full' : `🟢 ${slot.availableSlots} slots open`}
                            </span>
                          </div>

                          <p className="text-xs font-black text-stone-900">{slot.timeRange}</p>

                          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                            <span className="text-stone-500 flex items-center gap-1">
                              <Users className="w-3 h-3 text-stone-400" />
                              <span>{slot.bookedCount} / {slot.capacity} Booked</span>
                            </span>
                            <span className="text-stone-500 flex items-center gap-1">
                              <Timer className="w-3 h-3 text-amber-600" />
                              <span>~{slot.estimatedWaitMinutes}m wait</span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Crop Selection Section (Visual Cards + Multi-crop) */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Select Crops & Quantities (Multiple Allowed) *
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Tap visual crop cards to add or remove crops from your vehicle load.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800">
                    {selectedCrops.length} Crop(s) Selected
                  </span>
                </div>

                {/* Visual Crop Cards Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {CROPS_MASTER.map((crop) => {
                    const isSelected = selectedCrops.some((c) => c.cropId === crop.id || c.cropId.includes(crop.id.replace('crop_', '')));

                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => handleToggleCropCard(crop.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600 shadow-2xs'
                            : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="text-2xl">{crop.emoji}</span>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{crop.localNames[language] || crop.name}</p>
                          <p className="text-[10px] font-semibold text-emerald-800">MSP ₹{crop.mspPerQuintal}/Qtl</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Crop Quantity Inputs Table */}
                <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-bold text-stone-500 uppercase px-1">
                    <span className="sm:col-span-5">Crop Commodity</span>
                    <span className="sm:col-span-3">Quantity (Quintals)</span>
                    <span className="sm:col-span-3">Est. MSP Payout</span>
                    <span className="sm:col-span-1 text-right">Remove</span>
                  </div>

                  {selectedCrops.map((item, idx) => {
                    const matchedCrop = crops.find((c) => c.id === item.cropId) || crops[0];
                    const msp = matchedCrop?.mspPerQuintal || 2320;
                    const rowValue = (Number(item.quantityQuintals) || 0) * msp;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center shadow-2xs"
                      >
                        <div className="sm:col-span-5 flex items-center gap-2">
                          <span className="text-xl">{getCropEmoji(item.cropId)}</span>
                          <div>
                            <p className="text-xs font-black text-stone-900">{getCropDisplayName(item.cropId, language)}</p>
                            <p className="text-[10px] text-stone-500">Government MSP: ₹{msp.toLocaleString('en-IN')}/Qtl</p>
                          </div>
                        </div>

                        <div className="sm:col-span-3 flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={item.quantityQuintals}
                            onChange={(e) => handleUpdateCropQuantity(item.cropId, Number(e.target.value))}
                            className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-extrabold text-stone-900 focus:bg-white focus:ring-1 focus:ring-emerald-600"
                            required
                          />
                          <span className="text-[11px] font-semibold text-stone-600 shrink-0">Qtl</span>
                        </div>

                        <div className="sm:col-span-3">
                          <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
                            ₹{rowValue.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          {selectedCrops.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSelectedCrops(selectedCrops.filter((_, i) => i !== idx))}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary Footer */}
              <div className="p-4 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                    Total Registered Produce
                  </span>
                  <p className="text-2xl font-black text-white">
                    {totalQuantityQuintals} <span className="text-sm font-normal text-emerald-200">Quintals</span>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                    Estimated Telangana MSP Payout
                  </span>
                  <p className="text-2xl font-black text-amber-300">
                    ₹{totalEstimatedMspValue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep('SELECT_CENTRE')}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Mandis</span>
                </button>

                <button
                  type="button"
                  id="btn-next-to-review"
                  onClick={() => setCurrentStep('REVIEW_CONFIRM')}
                  disabled={totalQuantityQuintals <= 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Review Booking Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DOUBLE CONFIRMATION REVIEW SCREEN */}
          {/* ========================================================================= */}
          {currentStep === 'REVIEW_CONFIRM' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                  <h3 className="font-bold text-sm">Please Verify Your Token Details Carefully</h3>
                </div>
                <p className="text-xs text-amber-800">
                  Once confirmed, your digital entry pass will be generated and synchronized with the mandi gatekeeper and weighbridge queue.
                </p>
              </div>

              {/* Review Card */}
              <div className="p-5 bg-white rounded-2xl border-2 border-stone-200 shadow-sm space-y-4">
                {/* Centre Info */}
                <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Procurement Mandi
                    </span>
                    <h4 className="text-base font-black text-stone-900">{selectedCentre.name}</h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      📍 {selectedCentre.location || selectedCentre.address}, {selectedCentre.district} • Supervisor: {selectedCentre.supervisorName}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-800 font-mono text-xs font-bold">
                    {selectedCentre.code}
                  </span>
                </div>

                {/* Date & Slot Info */}
                <div className="grid grid-cols-2 gap-4 py-2 border-b border-stone-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Arrival Date
                    </span>
                    <p className="text-sm font-black text-stone-900 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      {bookingDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      2-Hour Arrival Window
                    </span>
                    <p className="text-sm font-black text-stone-900 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      {selectedSlotId}
                    </p>
                  </div>
                </div>

                {/* Produce & Crops Breakdown */}
                <div className="py-2 border-b border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                    Registered Crops Breakdown ({selectedCrops.length})
                  </span>
                  <div className="space-y-2">
                    {selectedCrops.map((c, i) => {
                      const matchedCrop = crops.find((item) => item.id === c.cropId) || crops[0];
                      const msp = matchedCrop?.mspPerQuintal || 2320;
                      const val = (Number(c.quantityQuintals) || 0) * msp;

                      return (
                        <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-stone-50">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCropEmoji(c.cropId)}</span>
                            <div>
                              <span className="font-black text-stone-900">{getCropDisplayName(c.cropId, language)}</span>
                              <span className="text-stone-500 text-[11px] block">MSP ₹{msp.toLocaleString('en-IN')}/Qtl</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-stone-900">{c.quantityQuintals} Quintals</span>
                            <span className="text-emerald-800 font-bold block text-[11px]">₹{val.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expected Wait & Queue Load */}
                <div className="flex items-center justify-between text-xs py-2 bg-stone-50 px-3 rounded-xl">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Timer className="w-4 h-4 text-amber-600" />
                    <span>Expected Weighbridge Queue Wait:</span>
                  </div>
                  <span className="font-black text-stone-900">
                    ~{activeSlotDetails?.estimatedWaitMinutes || selectedCentre.estimatedWaitingTimeMinutes || 35} Minutes
                  </span>
                </div>

                {/* Total Grand Value */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500">Total Produce:</span>
                    <p className="text-lg font-black text-stone-900">{totalQuantityQuintals} Quintals</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-stone-500">Total Est. DBT Amount:</span>
                    <p className="text-xl font-black text-emerald-800">₹{totalEstimatedMspValue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Big Double Confirmation Question */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-2">
                <p className="text-sm font-black text-emerald-950">
                  Do you want to confirm this booking? / ఈ బుకింగ్‌ను ఖరారు చేయాలనుకుంటున్నారా?
                </p>
                <p className="text-xs text-emerald-800">
                  By clicking Confirm, an official queue token will be allocated in your name with direct DBT entitlement.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep('CONFIGURE_SLOT_AND_CROPS')}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  id="btn-final-confirm-booking"
                  onClick={handleConfirmAndBook}
                  disabled={submitting || hasActiveToken}
                  className={`px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black shadow-lg transition-all flex items-center gap-2 ${
                    submitting ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Digital Token...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-amber-300" />
                      <span>Confirm & Generate Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SUCCESS CONFIRMATION SCREEN (Requirement 8, 10) */}
          {/* ========================================================================= */}
          {currentStep === 'SUCCESS' && confirmedToken && (
            <div className="py-4 space-y-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-black uppercase tracking-wider border border-emerald-300">
                  ✓ Token Booked Successfully / టోకెన్ విజయవంతంగా బుక్ చేయబడింది
                </span>
                <div className="mt-3">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest block">
                    Digital Queue Pass
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-tight">
                    {confirmedToken.tokenNumber}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Guaranteed arrival entry confirmed at {confirmedToken.procurementCentreName}
                </p>
              </div>

              {/* Token Comprehensive Details Card */}
              <div className="max-w-lg mx-auto p-4 bg-stone-50 rounded-2xl border border-stone-300 text-left text-xs space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">🏪 Procurement Centre:</span>
                  <span className="font-bold text-stone-900 text-right">{confirmedToken.procurementCentreName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">📅 Date:</span>
                  <span className="font-bold text-stone-900">{confirmedToken.bookingDate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">⏰ Time Slot:</span>
                  <span className="font-bold text-stone-900">{confirmedToken.timeSlot}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">👥 Queue Position:</span>
                  <span className="font-black text-emerald-800 text-sm">#{confirmedToken.queuePosition} in Line</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">⏱️ Estimated Wait Time:</span>
                  <span className="font-black text-amber-800">~{confirmedToken.estimatedWaitMinutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500 font-medium">📌 Token Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                    {confirmedToken.status === 'WAITING' ? 'Waiting (వేచి ఉన్నారు)' : confirmedToken.status}
                  </span>
                </div>
                
                {/* Crops details */}
                <div className="py-1">
                  <span className="text-stone-500 font-medium block mb-1.5">🌾 Registered Produce & Quantities:</span>
                  <div className="space-y-1">
                    {confirmedToken.crops && confirmedToken.crops.length > 0 ? (
                      confirmedToken.crops.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-stone-200">
                          <span className="font-bold text-stone-800">{c.cropName}</span>
                          <span className="font-black text-emerald-900">{c.quantityQuintals} Quintals (₹{c.estimatedTotalValue?.toLocaleString('en-IN')})</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between bg-white p-2 rounded-lg border border-stone-200">
                        <span className="font-bold text-stone-800">Total Produce</span>
                        <span className="font-black text-emerald-900">{confirmedToken.totalQuantityQuintals} Quintals</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Explicit Post-Booking Action Buttons */}
              <div className="pt-2 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  id="btn-listen-announcement"
                  onClick={handlePlayAnnouncement}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    isAudioSpeaking
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                >
                  {isAudioSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
                  <span>{isAudioSpeaking ? 'Stop Audio' : '🔊 Listen to Voice Announcement'}</span>
                </button>

                <button
                  type="button"
                  id="btn-view-my-token"
                  onClick={() => {
                    voiceService.stop();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>View My Token</span>
                </button>

                <button
                  type="button"
                  id="btn-go-to-dashboard"
                  onClick={() => {
                    voiceService.stop();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
