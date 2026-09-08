import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProcurementCentre, Crop, Token, ProduceListing, Transaction } from '../../shared/types';
import { GoWaitCard } from './GoWaitCard';
import { TokenTrackerCard } from './TokenTrackerCard';
import { TokenBookingModal } from './TokenBookingModal';
import { FarmerTokensList } from './FarmerTokensList';
import { FarmerCentresList } from './FarmerCentresList';
import { FarmerProduceList } from './FarmerProduceList';
import { FarmerTransactionsList } from './FarmerTransactionsList';
import { SimplifiedFarmerView } from './SimplifiedFarmerView';
import {
  LayoutDashboard,
  Wheat,
  Ticket,
  Clock,
  Building2,
  Wallet,
  User,
  PlusCircle,
  Eye,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  AlertCircle,
  Info,
} from 'lucide-react';

type FarmerNavTab = 'OVERVIEW' | 'PRODUCE' | 'TOKENS' | 'ACTIVE_TOKEN' | 'MANDIS' | 'EARNINGS' | 'PROFILE';

export const FarmerDashboard: React.FC = () => {
  const { user, farmerProfile, lowLiteracyMode, toggleLowLiteracyMode, t } = useAuth();

  const [activeTab, setActiveTab] = useState<FarmerNavTab>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [centres, setCentres] = useState<ProcurementCentre[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [activeToken, setActiveToken] = useState<Token | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [produceListings, setProduceListings] = useState<ProduceListing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Selected centre for Go/Wait card
  const [selectedCentreId, setSelectedCentreId] = useState<string>('centre_suryapet');

  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingCentreTarget, setBookingCentreTarget] = useState<string | undefined>(undefined);

  const loadAllFarmerData = async () => {
    setLoading(true);
    try {
      const [cropsRes, centresRes, dashRes, tokensRes, produceRes, txnsRes] = await Promise.all([
        api.getCrops(),
        api.getCentres(),
        api.getFarmerDashboard(),
        api.getFarmerTokens(),
        api.getFarmerProduce(),
        api.getFarmerTransactions(),
      ]);

      setCrops(cropsRes.crops);
      setCentres(centresRes.centres);
      setActiveToken(tokensRes.activeToken || null);
      setTokens(tokensRes.tokens);
      setProduceListings(produceRes.listings);
      setTransactions(txnsRes.transactions);
      setTotalEarnings(dashRes.totalEarnings || txnsRes.stats.totalEarned || 0);

      if (dashRes.preferredCentre?.id) {
        setSelectedCentreId(dashRes.preferredCentre.id);
      } else if (centresRes.centres.length > 0) {
        setSelectedCentreId(centresRes.centres[0].id);
      }
    } catch (err) {
      console.error('Failed to load farmer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllFarmerData();
  }, [user?.id]);

  const handleCancelToken = async (tokenId: string) => {
    try {
      await api.cancelToken(tokenId, 'Cancelled by farmer');
      await loadAllFarmerData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel token');
    }
  };

  const handleTokenBooked = (newToken: Token) => {
    setActiveToken(newToken);
    setTokens((prev) => [newToken, ...prev]);
    setActiveTab('OVERVIEW');
  };

  const handleOpenBooking = (centreId?: string) => {
    setBookingCentreTarget(centreId || selectedCentreId);
    setBookingModalOpen(true);
  };

  // If Low Literacy Mode is Active: Render Dedicated Simplified Farmer View
  if (lowLiteracyMode) {
    return (
      <div id="farmer-simplified-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping"></span>
            <h1 className="text-xl font-black text-emerald-950">🌾 సరళమైన మోడ్ (Simplified Farmer View)</h1>
          </div>
          <button
            onClick={() => toggleLowLiteracyMode()}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-4 h-4" />
            <span>Standard View</span>
          </button>
        </div>

        <SimplifiedFarmerView
          centres={centres}
          crops={crops}
          activeToken={activeToken}
          totalEarnings={totalEarnings}
          transactions={transactions}
          onOpenBooking={handleOpenBooking}
          onSelectCentre={(cId) => setSelectedCentreId(cId)}
          onCancelToken={handleCancelToken}
        />

        <TokenBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onTokenBooked={handleTokenBooked}
          centres={centres}
          crops={crops}
          initialCentreId={bookingCentreTarget}
          hasActiveToken={Boolean(activeToken)}
        />
      </div>
    );
  }

  return (
    <div id="farmer-module-container" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      {/* Top-aligned master wrapper */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* ========================================================================= */}
        {/* LEFT-SIDE VERTICAL NAVIGATION (Requirement 6: Desktop/Laptop Sidebar) */}
        {/* ========================================================================= */}
        <aside
          id="farmer-left-sidebar"
          className="w-full lg:w-64 shrink-0 bg-white rounded-3xl border border-stone-200/80 shadow-xs p-3.5 space-y-4 lg:sticky lg:top-20"
        >
          {/* Rythu Identification Summary Card */}
          <div className="p-3 bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl border border-emerald-700/60 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center border border-emerald-400/40">
                {user?.name?.charAt(0) || 'R'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black truncate">{user?.name || 'Rythu'}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span className="truncate">{farmerProfile?.pattaPassbookNumber || 'Passbook Verified'}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-emerald-800/80 flex items-center justify-between text-[11px] text-emerald-100">
              <span>{farmerProfile?.mandal || 'Suryapet'} Mdl</span>
              <span className="font-bold text-amber-300">
                {farmerProfile?.landSizeAcres || 5.2} Acres
              </span>
            </div>
          </div>

          {/* Direct Action: Book Token Primary CTA */}
          <button
            id="sidebar-btn-book-token"
            onClick={() => handleOpenBooking()}
            className="w-full py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-900" />
            <span>{t.farmer.bookToken}</span>
          </button>

          {/* Navigation Items (Vertical List) */}
          <nav className="space-y-1 text-xs font-semibold" aria-label="Farmer Navigation">
            <button
              id="sidebar-nav-overview"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'OVERVIEW'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{t.farmer.dashboard}</span>
              </div>
            </button>

            <button
              id="sidebar-nav-active-token"
              onClick={() => setActiveTab('ACTIVE_TOKEN')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'ACTIVE_TOKEN'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4" />
                <span>Token Tracker</span>
              </div>
              {activeToken ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="text-[10px] text-stone-400 font-normal">None</span>
              )}
            </button>

            <button
              id="sidebar-nav-produce"
              onClick={() => setActiveTab('PRODUCE')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'PRODUCE'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wheat className="w-4 h-4" />
                <span>{t.farmer.produceStatus}</span>
              </div>
              {produceListings.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600 font-bold">
                  {produceListings.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-nav-mandis"
              onClick={() => setActiveTab('MANDIS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'MANDIS'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>{t.farmer.mandis} & MSP</span>
              </div>
            </button>

            <button
              id="sidebar-nav-tokens"
              onClick={() => setActiveTab('TOKENS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'TOKENS'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4" />
                <span>{t.farmer.myTokens}</span>
              </div>
              {tokens.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-600 font-bold">
                  {tokens.length}
                </span>
              )}
            </button>

            <button
              id="sidebar-nav-earnings"
              onClick={() => setActiveTab('EARNINGS')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'EARNINGS'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wallet className="w-4 h-4" />
                <span>{t.farmer.earnings} & DBT</span>
              </div>
            </button>

            <button
              id="sidebar-nav-profile"
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'PROFILE'
                  ? 'bg-emerald-800 text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>Farmer Profile</span>
              </div>
            </button>
          </nav>

          {/* Quick Utility Toggles in Sidebar */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <button
              id="btn-sidebar-toggle-simplified"
              onClick={() => toggleLowLiteracyMode()}
              className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-2xl text-[11px] font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-700" />
                <span>Simplified Mode</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 uppercase">
                సరళమైన
              </span>
            </button>

            <div className="p-2.5 bg-stone-50 rounded-2xl text-[10px] text-stone-500 flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-stone-700 block">Kisan Mandi Helpline</span>
                <span>1800-425-3536 (Toll-Free)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN TOP-LEFT ALIGNED CONTENT AREA */}
        {/* ========================================================================= */}
        <main id="farmer-main-content" className="flex-1 w-full space-y-5 min-w-0">
          {/* Header Banner: Clean Authentic Agri Branding with Quick Metrics */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                    🏛️ Telangana Rythu Bandhu Portal
                  </span>
                  {farmerProfile?.pattaPassbookNumber && (
                    <span className="text-[11px] text-emerald-200 font-mono">
                      Passbook: {farmerProfile.pattaPassbookNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black mt-1 font-serif tracking-tight">
                  Namaste, {user?.name || 'Farmer'}
                </h1>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  <span className="font-semibold text-white">{farmerProfile?.village || user?.village || 'Chivvemla'}</span>,{' '}
                  <span className="font-semibold text-white">{farmerProfile?.mandal || user?.mandal || 'Suryapet'} Mandal</span>,{' '}
                  <span className="font-semibold text-white">{farmerProfile?.district || user?.district || 'Suryapet'}</span> •{' '}
                  <span className="font-bold text-amber-300">{farmerProfile?.landSizeAcres || 5.2} Acres</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenBooking()}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.farmer.bookToken}</span>
                </button>
              </div>
            </div>

            {/* Metric Tiles (Requirement 10: Icon-first, color-coded, high visual clarity) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-emerald-700/60">
              <div className="bg-emerald-800/50 rounded-2xl p-3 border border-emerald-700/50">
                <div className="flex items-center justify-between text-[11px] text-emerald-200 font-bold">
                  <span>Active Token</span>
                  <Ticket className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <p className="text-lg font-black text-white mt-1">
                  {activeToken ? activeToken.tokenNumber : 'None'}
                </p>
              </div>

              <div className="bg-emerald-800/50 rounded-2xl p-3 border border-emerald-700/50">
                <div className="flex items-center justify-between text-[11px] text-emerald-200 font-bold">
                  <span>Direct DBT</span>
                  <Wallet className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <p className="text-lg font-black text-amber-300 mt-1">
                  ₹{totalEarnings.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-emerald-800/50 rounded-2xl p-3 border border-emerald-700/50">
                <div className="flex items-center justify-between text-[11px] text-emerald-200 font-bold">
                  <span>My Crops</span>
                  <Wheat className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <p className="text-lg font-black text-white mt-1">
                  {produceListings.length} <span className="text-xs font-normal text-emerald-200">Lots</span>
                </p>
              </div>

              <div className="bg-emerald-800/50 rounded-2xl p-3 border border-emerald-700/50">
                <div className="flex items-center justify-between text-[11px] text-emerald-200 font-bold">
                  <span>Procured</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <p className="text-lg font-black text-white mt-1">
                  {tokens.filter((t) => t.status === 'COMPLETED').length}{' '}
                  <span className="text-xs font-normal text-emerald-200">Completed</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content Rendering */}
          {loading ? (
            <div className="py-20 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-emerald-700" />
              <p className="text-sm font-semibold">{t.common.loading}</p>
            </div>
          ) : activeTab === 'OVERVIEW' ? (
            <div className="space-y-6">
              {/* Active Token Callout if present */}
              {activeToken ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-emerald-700" />
                      <span>{t.farmer.activeToken}</span>
                    </h2>
                    <span className="text-xs text-stone-500">Live Yard Synchronization</span>
                  </div>
                  <TokenTrackerCard
                    token={activeToken}
                    onCancelToken={handleCancelToken}
                    onRefresh={loadAllFarmerData}
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-950 text-sm">{t.farmer.noActiveToken}</h3>
                      <p className="text-xs text-amber-800 mt-0.5">{t.farmer.simpleTip}</p>
                    </div>
                  </div>
                  <button
                    id="btn-book-token-empty-state"
                    onClick={() => handleOpenBooking()}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
                  >
                    + {t.farmer.bookToken}
                  </button>
                </div>
              )}

              {/* GO / WAIT Live Recommendation Card */}
              <GoWaitCard
                centres={centres}
                crops={crops}
                selectedCentreId={selectedCentreId}
                onSelectCentreId={setSelectedCentreId}
                onBookTokenForMandi={handleOpenBooking}
              />

              {/* Bottom Split Grid: Recent Tokens & Recent Payments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="font-bold text-sm text-stone-900">Recent Mandi Tokens</h3>
                    <button
                      onClick={() => setActiveTab('TOKENS')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      View All ({tokens.length}) →
                    </button>
                  </div>
                  <div className="divide-y divide-stone-100 pt-2">
                    {tokens.slice(0, 3).map((tok) => (
                      <div key={tok.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-stone-900">{tok.tokenNumber}</span>
                          <p className="text-stone-500">{tok.procurementCentreName} • {tok.bookingDate}</p>
                        </div>
                        <span className="font-bold text-stone-800">
                          {tok.crops.reduce((acc, c) => acc + c.quantityQuintals, 0)} Qtl
                        </span>
                      </div>
                    ))}
                    {tokens.length === 0 && (
                      <p className="py-4 text-center text-xs text-stone-400">No booking history yet.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="font-bold text-sm text-stone-900">Recent DBT Bank Credits</h3>
                    <button
                      onClick={() => setActiveTab('EARNINGS')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      View All ({transactions.length}) →
                    </button>
                  </div>
                  <div className="divide-y divide-stone-100 pt-2">
                    {transactions.slice(0, 3).map((txn) => (
                      <div key={txn.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-900">{txn.cropName}</span>
                          <p className="text-stone-500 font-mono">{txn.referenceNo} • {txn.transactionDate}</p>
                        </div>
                        <span className="font-bold text-emerald-800">
                          + ₹{txn.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="py-4 text-center text-xs text-stone-400">No DBT payouts yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'ACTIVE_TOKEN' ? (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Active Mandi Token Tracker</span>
              </h2>
              {activeToken ? (
                <TokenTrackerCard
                  token={activeToken}
                  onCancelToken={handleCancelToken}
                  onRefresh={loadAllFarmerData}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm">No Active Token Booked</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    You currently do not have any pending or active mandi delivery token. Click below to book an entry
                    slot.
                  </p>
                  <button
                    onClick={() => handleOpenBooking()}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
                  >
                    Book Mandi Token Now
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'TOKENS' ? (
            <FarmerTokensList tokens={tokens} />
          ) : activeTab === 'MANDIS' ? (
            <FarmerCentresList
              centres={centres}
              onSelectCentreForRec={(cId) => {
                setSelectedCentreId(cId);
                setActiveTab('OVERVIEW');
              }}
              onBookTokenForCentre={(cId) => handleOpenBooking(cId)}
            />
          ) : activeTab === 'PRODUCE' ? (
            <FarmerProduceList listings={produceListings} />
          ) : activeTab === 'EARNINGS' ? (
            <FarmerTransactionsList transactions={transactions} />
          ) : activeTab === 'PROFILE' ? (
            /* FARMER PROFILE & PASSBOOK TAB (Requirement 6 & 7) */
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-xl flex items-center justify-center">
                    {user?.name?.charAt(0) || 'R'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-900">{user?.name}</h2>
                    <p className="text-xs text-stone-500">{user?.phone} • Verified Telangana Rythu</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1 border border-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  {farmerProfile?.passbookStatus || 'VERIFIED'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Revenue Jurisdiction (Dharani)
                  </span>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500">State:</span>
                    <span className="font-bold text-stone-900">Telangana</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500">District:</span>
                    <span className="font-bold text-stone-900">{farmerProfile?.district || user?.district || 'Suryapet'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-200">
                    <span className="text-stone-500">Mandal:</span>
                    <span className="font-bold text-stone-900">{farmerProfile?.mandal || user?.mandal || 'Suryapet'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Village:</span>
                    <span className="font-bold text-stone-900">{farmerProfile?.village || user?.village || 'Chivvemla'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                    Pattadar Passbook & Landholding
                  </span>
                  <div className="flex justify-between py-1 border-b border-emerald-200">
                    <span className="text-emerald-950">Passbook Number:</span>
                    <span className="font-mono font-bold text-emerald-900">
                      {farmerProfile?.pattaPassbookNumber || user?.pattaPassbookNumber || 'TS-SYP-2024-88912'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200">
                    <span className="text-emerald-950">Total Landholding:</span>
                    <span className="font-black text-stone-900">
                      {farmerProfile?.landSizeAcres || farmerProfile?.landAcres || user?.landSizeAcres || 5.2} Acres
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-emerald-200">
                    <span className="text-emerald-950">Verification Status:</span>
                    <span className="font-bold text-emerald-700">Govt. Verified (Active)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-emerald-950">DBT Bank Account:</span>
                    <span className="font-mono font-bold text-stone-900">Linked (Rythu Bandhu Direct)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-amber-950">Telangana Procurement & MSP Entitlement</h4>
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    Your landholding of {farmerProfile?.landSizeAcres || 5.2} acres qualifies you for direct procurement
                    quotas across all Telangana PACS, IKP and Agricultural Market Committees.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Requirement 6 & 16: For screens < 768px) */}
      {/* ========================================================================= */}
      <div
        id="farmer-mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-30 px-2 py-1.5 flex items-center justify-around shadow-lg text-[10px] font-bold"
      >
        <button
          id="mob-nav-overview"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${
            activeTab === 'OVERVIEW' ? 'text-emerald-800' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          id="mob-nav-produce"
          onClick={() => setActiveTab('PRODUCE')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${
            activeTab === 'PRODUCE' ? 'text-emerald-800' : 'text-stone-500'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>Crops</span>
        </button>

        {/* Elevated Center Book Button */}
        <button
          id="mob-nav-book"
          onClick={() => handleOpenBooking()}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-amber-400 text-emerald-950 shadow-lg border-2 border-white active:scale-95 transition-transform"
          aria-label="Book Token"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          id="mob-nav-mandis"
          onClick={() => setActiveTab('MANDIS')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${
            activeTab === 'MANDIS' ? 'text-emerald-800' : 'text-stone-500'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Mandis</span>
        </button>

        <button
          id="mob-nav-profile"
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl ${
            activeTab === 'PROFILE' ? 'text-emerald-800' : 'text-stone-500'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
      </div>

      {/* Booking Modal */}
      <TokenBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onTokenBooked={handleTokenBooked}
        centres={centres}
        crops={crops}
        initialCentreId={bookingCentreTarget}
        hasActiveToken={Boolean(activeToken)}
      />
    </div>
  );
};
