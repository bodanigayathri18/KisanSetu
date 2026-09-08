import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LanguageCode } from '../../shared/types';
import {
  Wheat,
  Globe,
  Bell,
  Eye,
  UserCheck,
  ShieldCheck,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Volume2,
} from 'lucide-react';

interface NavbarProps {
  onOpenDemoSwitcher: () => void;
  onOpenNotifications: () => void;
  onOpenLogin: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

const LANGUAGES: Array<{ code: LanguageCode; label: string; native: string }> = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDemoSwitcher,
  onOpenNotifications,
  onOpenLogin,
  activeTab,
  onSelectTab,
}) => {
  const {
    user,
    role,
    farmerProfile,
    language,
    lowLiteracyMode,
    changeLanguage,
    toggleLowLiteracyMode,
    unreadCount,
    logout,
    t,
  } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
      {/* Top micro-bar for state agency identity */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] px-4 py-1 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{t.common.telanganaState} — Government of Telangana e-Procurement</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-emerald-200">
          <span>Kisan Helpline: 1800-425-3536</span>
          <span>•</span>
          <span>e-NAM Integrated</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-stone-900 font-serif">
                  {t.appName}
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Govt. Verified
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-none hidden sm:block">
                Unified Farmer, Mandi & Buyer Network
              </p>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Show Demo Switcher ONLY when user is NOT logged in (Requirement 5) */}
            {!user && (
              <button
                id="btn-nav-demo-switcher"
                onClick={onOpenDemoSwitcher}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Try Demo Accounts</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-lang-selector"
                onClick={() => {
                  setLangMenuOpen(!langMenuOpen);
                  setProfileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 text-xs font-medium transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">
                  {LANGUAGES.find((l) => l.code === language)?.native || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>

              {langMenuOpen && (
                <div
                  id="lang-dropdown-menu"
                  className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-xs"
                >
                  <div className="px-3 py-1 font-semibold text-stone-400 uppercase text-[10px]">
                    Select Language / భాషను ఎంచుకోండి
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      id={`btn-select-lang-${l.code}`}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                        language === l.code ? 'bg-emerald-50 font-bold text-emerald-800' : 'text-stone-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-stone-400 text-[11px]">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <button
              id="btn-nav-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* FARMER / USER PROFILE AVATAR (Requirement 7) */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-farmer-profile-menu"
                  onClick={() => {
                    setProfileMenuOpen(!profileMenuOpen);
                    setLangMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <p className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-emerald-800 font-semibold leading-none">
                      {role === 'FARMER' ? '🌾 Rythu' : role?.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Profile Popup Card */}
                {profileMenuOpen && (
                  <div
                    id="farmer-profile-popup"
                    className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {/* Header Details */}
                    <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-inner">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-stone-900 truncate">{user.name}</h4>
                        <p className="text-stone-500 font-medium">{user.phone}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {role === 'FARMER' ? 'Verified Rythu / Farmer' : role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Location Hierarchy */}
                    <div className="p-2.5 bg-stone-50 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">
                        Location / గ్రామం & మండలం
                      </span>
                      <p className="font-semibold text-stone-800">
                        {user.village || farmerProfile?.village || 'Chivvemla'},{' '}
                        {user.mandal || farmerProfile?.mandal || 'Suryapet'} Mandal
                      </p>
                      <p className="text-stone-500 text-[11px]">
                        District: <span className="font-medium text-stone-700">{user.district || 'Suryapet'}</span>, Telangana
                      </p>
                    </div>

                    {/* Farmer Passbook & Land Details */}
                    {role === 'FARMER' && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-emerald-900">
                            Patta Passbook
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-950 font-black text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-emerald-800" />
                            {farmerProfile?.passbookStatus || 'VERIFIED'}
                          </span>
                        </div>
                        <p className="font-mono font-bold text-stone-900 text-xs">
                          {farmerProfile?.pattaPassbookNumber || user.pattaPassbookNumber || 'TS-SYP-2024-88912'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200/60">
                          <span className="text-emerald-900">Total Landholding:</span>
                          <span className="font-black text-stone-900">
                            {farmerProfile?.landSizeAcres || farmerProfile?.landAcres || user.landSizeAcres || 5.2} Acres
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quick Mode & Language Toggles */}
                    <div className="space-y-2 pt-1 border-t border-stone-100">
                      <button
                        id="btn-profile-toggle-simplified"
                        onClick={() => {
                          toggleLowLiteracyMode();
                          setProfileMenuOpen(false);
                        }}
                        className={`w-full p-2 rounded-xl flex items-center justify-between border text-left font-bold transition-all ${
                          lowLiteracyMode
                            ? 'bg-amber-100 border-amber-300 text-amber-950'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-amber-700" />
                          <span>Simplified / Low-Literacy Mode</span>
                        </div>
                        <span className="text-[10px] font-black uppercase">
                          {lowLiteracyMode ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-2 border-t border-stone-100">
                      <button
                        id="btn-profile-logout"
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / లాగ్ అవుట్</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 rounded-lg hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu collapse */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 py-3 space-y-2">
            {user && (
              <div className="px-3 py-2.5 bg-stone-50 rounded-xl mb-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-stone-900">{user.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {user.phone} • {role?.replace('_', ' ')}
                  </p>
                  {farmerProfile?.pattaPassbookNumber && (
                    <p className="text-[10px] text-emerald-800 font-mono mt-0.5">
                      Passbook: {farmerProfile.pattaPassbookNumber}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-600 px-2.5 py-1 bg-rose-50 rounded-lg border border-rose-200"
                >
                  Logout
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => toggleLowLiteracyMode()}
                className="flex-1 py-2 px-3 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-amber-700" />
                <span>{lowLiteracyMode ? 'Standard Mode' : 'Simplified Mode'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
