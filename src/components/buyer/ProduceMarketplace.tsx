import React, { useState } from 'react';
import { ProduceListing, Crop } from '../../shared/types';
import {
  Search,
  Filter,
  ShoppingBag,
  Building2,
  Droplets,
  ShieldCheck,
  CheckCircle,
  IndianRupee,
  Layers,
} from 'lucide-react';

interface ProduceMarketplaceProps {
  listings: ProduceListing[];
  crops: Crop[];
  onOpenPurchaseModal: (listing: ProduceListing) => void;
}

export const ProduceMarketplace: React.FC<ProduceMarketplaceProps> = ({
  listings,
  crops,
  onOpenPurchaseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  const filtered = listings.filter((l) => {
    if (l.status !== 'AVAILABLE') return false;

    const matchesSearch =
      l.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.procurementCentreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCrop !== 'ALL' && l.cropId !== selectedCrop) return false;
    if (selectedGrade !== 'ALL' && l.qualityGrade !== selectedGrade) return false;
    if (l.pricePerQuintal > maxPrice) return false;

    return true;
  });

  return (
    <div id="produce-marketplace-container" className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="marketplace-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, mandi, lot number..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Commodity filter */}
          <select
            id="marketplace-crop-filter"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
          >
            <option value="ALL">All Commodities</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Grade filter */}
          <select
            id="marketplace-grade-filter"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800"
          >
            <option value="ALL">All Quality Grades</option>
            <option value="Grade A">Grade A (FAQ)</option>
            <option value="Grade B">Grade B</option>
            <option value="Premium Export">Premium Export</option>
          </select>
        </div>
      </div>

      {/* Produce Lots Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
          <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No produce lots match current search criteria</p>
          <p className="text-xs text-stone-400 mt-1">Try resetting the filters or check back after next mandi procurement cycle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lot) => (
            <div
              key={lot.id}
              id={`market-lot-card-${lot.id}`}
              className="bg-white rounded-2xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-stone-400 block uppercase">
                      {lot.lotNumber}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base">{lot.cropName}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {lot.qualityGrade}
                  </span>
                </div>

                <p className="text-xs text-stone-500 flex items-center gap-1 mb-3">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{lot.procurementCentreName}</span>
                </p>

                {/* Specs Box */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Available Volume</span>
                    <span className="font-black text-stone-900 text-sm">{lot.quantityQuintals} Quintals</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">Moisture Tested</span>
                    <span className="font-bold text-blue-700 text-sm flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" /> {lot.moisturePercentage}%
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-stone-200 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">Origin Farmer:</span>
                    <span className="font-medium text-stone-800">{lot.farmerMaskedName || 'Certified Telangana Rythu'}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Wholesale Rate</span>
                  <span className="text-base font-black text-emerald-900">
                    ₹{lot.pricePerQuintal} <span className="text-xs font-normal text-stone-500">/ Qtl</span>
                  </span>
                </div>

                <button
                  id={`btn-purchase-lot-${lot.id}`}
                  onClick={() => onOpenPurchaseModal(lot)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Purchase Lot</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
