import React from 'react';
import { Transaction } from '../../shared/types';
import { IndianRupee, CheckCircle2, Clock, FileText, ArrowDownLeft } from 'lucide-react';

interface FarmerTransactionsListProps {
  transactions: Transaction[];
}

export const FarmerTransactionsList: React.FC<FarmerTransactionsListProps> = ({ transactions }) => {
  const totalEarned = transactions
    .filter((t) => t.paymentStatus === 'PAID')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div id="farmer-transactions-card" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-bold text-base text-stone-900">Direct Benefit Transfer (DBT) & Payments</h3>
          <p className="text-xs text-stone-500">
            Government procurement bank credits settled directly into farmer's linked Aadhaar bank account
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
            Net Procured Earnings
          </span>
          <span className="text-lg font-black text-emerald-900">
            ₹{totalEarned.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 text-center text-stone-400">
          <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No payment settlements recorded yet</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 pt-2">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              id={`txn-row-${txn.id}`}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{txn.cropName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {txn.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ref: <span className="font-mono text-stone-700 font-medium">{txn.referenceNo}</span> • UTR:{' '}
                    <span className="font-mono text-stone-700">{txn.utrNumber || 'UTR-PENDING'}</span>
                  </p>
                  <p className="text-xs text-stone-600 mt-1">
                    {txn.procurementCentreName} • {txn.quantityQuintals} {txn.unit} @ ₹{txn.ratePerQuintal}/Qtl
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-base font-black text-stone-900">
                  + ₹{txn.totalAmount.toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">{txn.transactionDate}</p>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                  {txn.paymentMethod}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
