import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ProduceListing, Crop, Transaction } from '../../shared/types';
import { ProduceMarketplace } from './ProduceMarketplace';
import { PurchaseModal } from './PurchaseModal';
import { BuyerOrdersList } from './BuyerOrdersList';
import {
  ShoppingBag,
  Store,
  FileText,
  RotateCw,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Building,
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { user, buyerProfile, t } = useAuth();

  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'ORDERS' | 'MATCHES'>('MARKETPLACE');
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Purchase modal
  const [selectedListing, setSelectedListing] = useState<ProduceListing | null>(null);

  const loadBuyerData = async () => {
    setLoading(true);
    try {
      const [cropsRes, dashRes, listingsRes, ordersRes] = await Promise.all([
        api.getCrops(),
        api.getBuyerDashboard(),
        api.getBuyerListings(),
        api.getBuyerOrders(),
      ]);

      setCrops(cropsRes.crops);
      setStats(dashRes.stats);
      setListings(listingsRes.listings);
      setOrders(ordersRes.orders);
    } catch (err) {
      console.error('Failed to load buyer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyerData();
  }, [user?.id]);

  const handlePurchaseCompleted = (txn: Transaction) => {
    setOrders((prev) => [txn, ...prev]);
    // Refresh listings
    loadBuyerData();
  };

  return (
    <div id="buyer-module-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Buyer Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white rounded-3xl p-6 shadow-md border border-amber-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                Certified Agricultural Wholesale Buyer
              </span>
              <span className="text-xs text-amber-300 font-mono">GSTIN: {buyerProfile?.gstNumber || '36AABCS1429B1Z8'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight font-serif">
              {buyerProfile?.businessName || `${user?.name} Agro Traders`}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Authorized Representative: <span className="text-white font-semibold">{user?.name}</span> •
              Entity: <span className="text-white font-semibold">{buyerProfile?.businessType || 'Wholesaler / Miller'}</span> •
              Base Hub: <span className="text-white font-semibold">{buyerProfile?.location || 'Warangal / Hyderabad'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-buyer-data"
              onClick={loadBuyerData}
              title="Refresh produce listings"
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 hover:text-white border border-stone-700 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-amber-800/40">
          <div className="bg-stone-800/50 rounded-2xl p-3 border border-stone-700/50">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Available in Mandis
            </span>
            <p className="text-2xl font-black text-white mt-0.5">
              {stats?.availableLotsCount ?? listings.length}{' '}
              <span className="text-xs font-normal text-stone-400">Lots</span>
            </p>
          </div>

          <div className="bg-stone-800/50 rounded-2xl p-3 border border-stone-700/50">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Purchased Volume
            </span>
            <p className="text-2xl font-black text-amber-300 mt-0.5">
              {stats?.totalPurchasedQuintals ?? 0}{' '}
              <span className="text-xs font-normal text-stone-400">Quintals</span>
            </p>
          </div>

          <div className="bg-stone-800/50 rounded-2xl p-3 border border-stone-700/50">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Total Invoiced
            </span>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">
              ₹{(stats?.totalSpend ?? 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-stone-800/50 rounded-2xl p-3 border border-stone-700/50">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Completed Orders
            </span>
            <p className="text-2xl font-black text-white mt-0.5">
              {orders.length} <span className="text-xs font-normal text-stone-400">Invoices</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
        <button
          id="tab-buyer-marketplace"
          onClick={() => setActiveTab('MARKETPLACE')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors ${
            activeTab === 'MARKETPLACE'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{t.buyer.marketplace}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-900/30 text-amber-200 font-bold">
            {listings.length}
          </span>
        </button>

        <button
          id="tab-buyer-orders"
          onClick={() => setActiveTab('ORDERS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors ${
            activeTab === 'ORDERS'
              ? 'bg-amber-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.buyer.myOrders}</span>
          {orders.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-800 font-bold">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'MARKETPLACE' ? (
        <ProduceMarketplace
          listings={listings}
          crops={crops}
          onOpenPurchaseModal={(lot) => setSelectedListing(lot)}
        />
      ) : (
        <BuyerOrdersList orders={orders} />
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        listing={selectedListing}
        onPurchaseCompleted={handlePurchaseCompleted}
      />
    </div>
  );
};
