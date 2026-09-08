import React from 'react';
import { Transaction } from '../../shared/types';
import { FileText, CheckCircle2, Building2, ShoppingBag, ShieldCheck } from 'lucide-react';

interface BuyerOrdersListProps {
  orders: Transaction[];
}

export const BuyerOrdersList: React.FC<BuyerOrdersListProps> = ({ orders }) => {
  return (
    <div id="buyer-orders-list-card" className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
      <div className="pb-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-stone-900">Purchased Lots & Invoices</h3>
          <p className="text-xs text-stone-500">
            Certified digital trade receipts and escrow settlement records for wholesale dispatches
          </p>
        </div>
        <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
          Total Invoices: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-stone-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No purchase transactions recorded yet</p>
          <p className="text-xs text-stone-400 mt-1">Browse available lots in the marketplace and place your first order.</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {orders.map((order) => (
            <div
              key={order.id}
              id={`buyer-order-row-${order.id}`}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    {order.referenceNo}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {order.paymentStatus}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm">{order.cropName}</h4>
                <p className="text-xs text-stone-500 flex items-center gap-2">
                  <span className="text-stone-700 font-medium">📍 {order.procurementCentreName}</span>
                  <span>•</span>
                  <span>UTR: {order.utrNumber || 'ESCROW-AUTO'}</span>
                  <span>•</span>
                  <span>Date: {order.transactionDate}</span>
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className="text-base font-black text-stone-900">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500 font-medium mt-0.5">
                  {order.quantityQuintals} Quintals @ ₹{order.ratePerQuintal}/Qtl
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded mt-1">
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
