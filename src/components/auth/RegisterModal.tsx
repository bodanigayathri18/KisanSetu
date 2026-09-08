import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, LanguageCode } from '../../shared/types';
import { TELANGANA_DISTRICTS, getMandalsForDistrict, getVillagesForMandal } from '../../shared/locations';
import {
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  MapPin,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

type RegisterStep = 'BASIC' | 'LOCATION' | 'ROLE_DETAILS' | 'CONFIRM';

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { registerUser } = useAuth();

  const [step, setStep] = useState<RegisterStep>('BASIC');

  // Step 1: Basic Information
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('te');
  const [role, setRole] = useState<UserRole>('FARMER');

  // Step 2: Location
  const [state] = useState('Telangana');
  const [selectedDistrict, setSelectedDistrict] = useState('Suryapet');
  const [selectedMandal, setSelectedMandal] = useState('Suryapet');
  const [selectedVillage, setSelectedVillage] = useState('Chivvemla Village');

  // Step 3: Role-Specific Details
  // For Farmer
  const [pattaPassbookNumber, setPattaPassbookNumber] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState<number | string>(5.0);
  const [preferredCentreId, setPreferredCentreId] = useState('centre_suryapet');
  // For Buyer
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Wholesaler');
  const [gstNumber, setGstNumber] = useState('');
  // For Official
  const [designation, setDesignation] = useState('Procurement Inspector');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const mandals = getMandalsForDistrict(selectedDistrict);
  const villages = getVillagesForMandal(selectedDistrict, selectedMandal);

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    const newMandals = getMandalsForDistrict(dist);
    const defaultMandal = newMandals[0] || dist;
    setSelectedMandal(defaultMandal);
    const newVillages = getVillagesForMandal(dist, defaultMandal);
    setSelectedVillage(newVillages[0] || `${defaultMandal} Village`);
  };

  const handleMandalChange = (mandal: string) => {
    setSelectedMandal(mandal);
    const newVillages = getVillagesForMandal(selectedDistrict, mandal);
    setSelectedVillage(newVillages[0] || `${mandal} Village`);
  };

  const validateStep1 = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!selectedDistrict || !selectedMandal || !selectedVillage) {
      setError('Please select your District, Mandal, and Village.');
      return false;
    }
    setError('');
    return true;
  };

  const validateStep3 = () => {
    if (role === 'FARMER') {
      if (!pattaPassbookNumber.trim()) {
        setError('Patta passbook number is required for farmer registration.');
        return false;
      }
      const acres = Number(landSizeAcres);
      if (isNaN(acres) || acres <= 0) {
        setError('Land size must be greater than 0 acres. Land size cannot be negative or zero.');
        return false;
      }
    } else if (role === 'BUYER') {
      if (!businessName.trim()) {
        setError('Please enter your company or business name.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 'BASIC') {
      if (validateStep1()) setStep('LOCATION');
    } else if (step === 'LOCATION') {
      if (validateStep2()) setStep('ROLE_DETAILS');
    } else if (step === 'ROLE_DETAILS') {
      if (validateStep3()) setStep('CONFIRM');
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 'CONFIRM') setStep('ROLE_DETAILS');
    else if (step === 'ROLE_DETAILS') setStep('LOCATION');
    else if (step === 'LOCATION') setStep('BASIC');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 'CONFIRM') {
      handleNext();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullLocation = `${selectedVillage}, ${selectedMandal} Mandal, ${selectedDistrict}, Telangana`;
      await registerUser({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.trim()}@kisanconnect.gov.in`,
        preferredLanguage,
        role,
        state,
        district: selectedDistrict,
        mandal: selectedMandal,
        village: selectedVillage,
        location: fullLocation,
        pattaPassbookNumber: pattaPassbookNumber.trim().toUpperCase(),
        landSizeAcres: Number(landSizeAcres) || 0,
        landAcres: Number(landSizeAcres) || 0,
        procurementCentreId: preferredCentreId,
        businessName: businessName.trim() || `${name.trim()} Agri Ventures`,
        businessType,
        gstNumber: gstNumber.trim(),
        designation,
      } as any);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="register-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="register-modal-card"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4 sm:my-6 transition-all"
      >
        {/* Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">KisanConnect Registration</h2>
              <p className="text-[11px] text-emerald-200">Official Telangana Agri Procurement Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-stone-50 px-6 py-3 border-b border-stone-200 flex items-center justify-between text-[11px] font-bold">
          <div
            className={`flex items-center gap-1.5 ${
              step === 'BASIC' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'BASIC' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              1
            </span>
            <span>Basic</span>
          </div>

          <span className="text-stone-300">→</span>

          <div
            className={`flex items-center gap-1.5 ${
              step === 'LOCATION' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'LOCATION' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              2
            </span>
            <span>Location</span>
          </div>

          <span className="text-stone-300">→</span>

          <div
            className={`flex items-center gap-1.5 ${
              step === 'ROLE_DETAILS' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'ROLE_DETAILS' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              3
            </span>
            <span>Role Details</span>
          </div>

          <span className="text-stone-300">→</span>

          <div
            className={`flex items-center gap-1.5 ${
              step === 'CONFIRM' ? 'text-emerald-800 font-extrabold' : 'text-stone-500'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'CONFIRM' ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
              }`}
            >
              4
            </span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: BASIC INFORMATION */}
          {/* ========================================================================= */}
          {step === 'BASIC' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                  Select User Role *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { r: 'FARMER', label: '🌾 Farmer (రైతు)' },
                    { r: 'PROCUREMENT_OFFICIAL', label: '🛡️ Mandi Official' },
                    { r: 'BUYER', label: '🏢 Wholesale Buyer' },
                  ].map((item) => (
                    <button
                      key={item.r}
                      type="button"
                      id={`btn-register-role-${item.r.toLowerCase()}`}
                      onClick={() => setRole(item.r as UserRole)}
                      className={`p-2.5 rounded-2xl border font-bold text-center transition-all ${
                        role === item.r
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500 shadow-xs'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Full Name *
                </label>
                <input
                  id="reg-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Mobile Number *
                  </label>
                  <input
                    id="reg-input-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Preferred Language
                  </label>
                  <select
                    id="reg-select-language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: LOCATION INFORMATION (Telangana Dependent Hierarchy) */}
          {/* ========================================================================= */}
          {step === 'LOCATION' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">State Jurisdiction</span>
                  <span className="font-black text-emerald-950 text-sm">Telangana State (తెలంగాణ)</span>
                </div>
                <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  33 Districts
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    1. Select District (జిల్లా) *
                  </label>
                  <select
                    id="reg-select-district"
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    {TELANGANA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    2. Select Mandal (మండలం) *
                  </label>
                  <select
                    id="reg-select-mandal"
                    value={selectedMandal}
                    onChange={(e) => handleMandalChange(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    {mandals.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    3. Select Village / Revenue Locality (గ్రామం) *
                  </label>
                  <select
                    id="reg-select-village"
                    value={selectedVillage}
                    onChange={(e) => setSelectedVillage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    {villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                <p className="text-[11px] text-stone-600 font-medium">
                  Assigned Revenue Location:{' '}
                  <span className="font-bold text-stone-900">
                    {selectedVillage}, {selectedMandal} Mandal, {selectedDistrict} Dist.
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: ROLE-SPECIFIC DETAILS */}
          {/* ========================================================================= */}
          {step === 'ROLE_DETAILS' && (
            <div className="space-y-4">
              {role === 'FARMER' && (
                <div className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span className="font-black text-emerald-950 text-xs">
                        Rythu Bandhu & Patta Passbook Information
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Under Telangana procurement mandates, Patta Passbook details are mandatory for MSP direct bank
                      transfers.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                      Patta Passbook Number * (Required)
                    </label>
                    <input
                      id="reg-input-passbook"
                      type="text"
                      value={pattaPassbookNumber}
                      onChange={(e) => setPattaPassbookNumber(e.target.value)}
                      placeholder="e.g. TS-SYP-2024-88912"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600 uppercase"
                      required
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Mention the 14-digit or alpha-numeric Pattadar Passbook reference issued by Dharani.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                      Total Landholding Size (in Acres) * (Required, &gt; 0)
                    </label>
                    <input
                      id="reg-input-land"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={landSizeAcres}
                      onChange={(e) => setLandSizeAcres(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Land size must be a positive number greater than 0.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                      Preferred Mandi / Procurement Centre
                    </label>
                    <select
                      id="reg-select-centre"
                      value={preferredCentreId}
                      onChange={(e) => setPreferredCentreId(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="centre_suryapet">Suryapet Agriculture Market Yard (Main)</option>
                      <option value="centre_warangal">Warangal Enamamula Grain Market Yard</option>
                      <option value="centre_khammam">Khammam Cotton & Chilli Procurement Yard</option>
                      <option value="centre_nizamabad">Nizamabad Major Grain & Turmeric Mandi</option>
                      <option value="centre_karimnagar">Karimnagar Rythu Bandhu Centre</option>
                    </select>
                  </div>
                </div>
              )}

              {role === 'BUYER' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                      Business / Company Name *
                    </label>
                    <input
                      id="reg-input-business-name"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Sri Rama Rice & Oil Mills"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                        Business Entity Type
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                      >
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Miller">Rice / Oil Miller</option>
                        <option value="Agri-Processing">Agri-Processing</option>
                        <option value="Exporter">Exporter</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                        GSTIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        placeholder="36AAAAA0000A1Z5"
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                      >
                      </input>
                    </div>
                  </div>
                </div>
              )}

              {role === 'PROCUREMENT_OFFICIAL' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase tracking-wider text-stone-700 block mb-1">
                      Assigned Mandi Yard
                    </label>
                    <select
                      value={preferredCentreId}
                      onChange={(e) => setPreferredCentreId(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="centre_suryapet">Suryapet Agriculture Market Yard</option>
                      <option value="centre_warangal">Warangal Enamamula Grain Market Yard</option>
                      <option value="centre_khammam">Khammam Cotton & Chilli Procurement Yard</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CONFIRMATION & INSTANT LOGIN REVIEW */}
          {/* ========================================================================= */}
          {step === 'CONFIRM' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-black text-stone-400 block mb-1">
                  Registration Review Summary
                </span>

                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Applicant:</span>
                  <span className="font-bold text-stone-900">{name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Phone:</span>
                  <span className="font-bold text-stone-900">{phone}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Role:</span>
                  <span className="font-extrabold text-emerald-800">
                    {role === 'FARMER' ? '🌾 Rythu / Farmer' : role.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-stone-200">
                  <span className="text-stone-500">Location:</span>
                  <span className="font-semibold text-stone-800 text-right">
                    {selectedVillage}, {selectedMandal} Mdl, {selectedDistrict}
                  </span>
                </div>

                {role === 'FARMER' && (
                  <>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Patta Passbook:</span>
                      <span className="font-mono font-bold text-emerald-900">{pattaPassbookNumber}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Total Landholding:</span>
                      <span className="font-bold text-stone-900">{landSizeAcres} Acres</span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <p className="text-xs text-emerald-900 font-medium">
                  Upon finishing, your account will be authenticated automatically and your dashboard will be
                  loaded.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-200">
            {step !== 'BASIC' ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-100 flex items-center gap-1 text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                Already registered? Sign In
              </button>
            )}

            {step !== 'CONFIRM' ? (
              <button
                type="button"
                id="btn-register-next-step"
                onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-register"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Finish Registration & Enter Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
