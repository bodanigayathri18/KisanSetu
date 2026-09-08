import React from 'react';
import { ProduceListing } from '../../shared/types';
import { Package, ShieldCheck, Droplets, CheckCircle, Clock } from 'lucide-react';

interface FarmerProduceListProps {
  listings: ProduceListing[];
}

export const FarmerProduceList: React.FC<FarmerProduceListProps> = ({ listings }) => {
  return (
    <div id="farmer-produce-list-card" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="pb-4 border-b border-stone-100">
        <h3 className="font-bold text-base text-stone-900">Submitted Produce Lots</h3>
        <p className="text-xs text-stone-500">
          Status of produce deposited at procurement centres, quality test results, and buyer allocations
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="py-12 text-center text-stone-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No produce lots recorded yet</p>
          <p className="text-xs text-stone-400 mt-1">Once your token is completed at the mandi, verified lots appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
          {listings.map((lot) => (
            <div
              key={lot.id}
              id={`produce-lot-${lot.id}`}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 font-bold uppercase">{lot.lotNumber}</span>
                  <h4 className="font-bold text-stone-900 text-base">{lot.cropName}</h4>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    lot.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : lot.status === 'SOLD'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {lot.status}
                </span>
              </div>

              <p className="text-xs text-stone-600 mb-3">📍 {lot.procurementCentreName}</p>

              <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-stone-200 text-center mb-3">
                <div>
                  <span className="text-[10px] text-stone-400 font-medium block">Quantity</span>
                  <span className="font-bold text-stone-900 text-xs">{lot.quantityQuintals} Qtl</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-medium block">Grade</span>
                  <span className="font-bold text-emerald-700 text-xs">{lot.qualityGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 font-medium block">Moisture</span>
                  <span className="font-bold text-blue-700 text-xs flex items-center justify-center gap-0.5">
                    <Droplets className="w-3 h-3" /> {lot.moisturePercentage}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500">Procured Rate</span>
                <span className="font-bold text-stone-900">₹{lot.pricePerQuintal}/Qtl</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pt-1">
                <span>Total Lot Realization</span>
                <span className="text-sm font-extrabold">
                  ₹{(lot.quantityQuintals * lot.pricePerQuintal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
