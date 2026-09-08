import React from 'react';
import { TokenStatus, OperatingStatus, RecommendationStatus } from '../../shared/types';
import { Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Play, Check } from 'lucide-react';

interface StatusBadgeProps {
  status: TokenStatus | OperatingStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  }[size];

  switch (status) {
    case 'WAITING':
      return (
        <span
          id={`badge-waiting-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Waiting in Queue
        </span>
      );
    case 'CALLED':
      return (
        <span
          id={`badge-called-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-800 border border-blue-300 animate-pulse ${sizeClasses}`}
        >
          <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          Called to Weighbridge
        </span>
      );
    case 'ARRIVED':
      return (
        <span
          id={`badge-arrived-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses}`}
        >
          <Check className="w-3.5 h-3.5 text-indigo-600" />
          Arrival Confirmed
        </span>
      );
    case 'PROCESSING':
      return (
        <span
          id={`badge-processing-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-800 border border-purple-200 ${sizeClasses}`}
        >
          <Play className="w-3.5 h-3.5 text-purple-600" />
          Weighing & Quality Check
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          id={`badge-completed-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Procurement Completed
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          id={`badge-cancelled-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200 ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5 text-stone-500" />
          Cancelled
        </span>
      );
    // Operating statuses
    case 'OPEN':
      return (
        <span
          id={`badge-open-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Operational / Open
        </span>
      );
    case 'BUSY':
      return (
        <span
          id={`badge-busy-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          High Load / Busy
        </span>
      );
    case 'TEMPORARILY_CLOSED':
    case 'CLOSED':
      return (
        <span
          id={`badge-closed-${status}`}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-300 ${sizeClasses}`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          {status === 'TEMPORARILY_CLOSED' ? 'Temporarily Closed' : 'Closed Today'}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const GoWaitBadge: React.FC<{ status: RecommendationStatus; large?: boolean }> = ({ status, large = false }) => {
  switch (status) {
    case 'GO':
      return (
        <div
          id="gowait-badge-go"
          className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider rounded-xl bg-emerald-600 text-white shadow-sm ${
            large ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <CheckCircle2 className={large ? 'w-6 h-6' : 'w-4 h-4'} />
          <span>GO — Safe to Arrive</span>
        </div>
      );
    case 'WAIT':
      return (
        <div
          id="gowait-badge-wait"
          className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider rounded-xl bg-amber-500 text-white shadow-sm ${
            large ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Clock className={large ? 'w-6 h-6' : 'w-4 h-4'} />
          <span>WAIT — Moderate Queue</span>
        </div>
      );
    case 'CENTRE_BUSY':
      return (
        <div
          id="gowait-badge-busy"
          className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider rounded-xl bg-orange-600 text-white shadow-sm ${
            large ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <AlertTriangle className={large ? 'w-6 h-6' : 'w-4 h-4'} />
          <span>CENTRE BUSY — Delay Travel</span>
        </div>
      );
    case 'CENTRE_CLOSED':
      return (
        <div
          id="gowait-badge-closed"
          className={`inline-flex items-center gap-2 font-bold uppercase tracking-wider rounded-xl bg-rose-600 text-white shadow-sm ${
            large ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <XCircle className={large ? 'w-6 h-6' : 'w-4 h-4'} />
          <span>CENTRE CLOSED — Do Not Travel</span>
        </div>
      );
    default:
      return null;
  }
};
