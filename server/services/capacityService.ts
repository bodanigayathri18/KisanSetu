import { db } from '../repositories/db';
import { ProcurementCentre, TimeWindowSlot } from '../../src/shared/types';

export const STANDARD_TIME_WINDOWS = [
  {
    id: '08:00 AM - 10:00 AM',
    label: 'Early Morning (08:00 AM – 10:00 AM)',
    period: 'Morning' as const,
    timeRange: '08:00 AM - 10:00 AM',
  },
  {
    id: '10:00 AM - 12:00 PM',
    label: 'Late Morning (10:00 AM – 12:00 PM)',
    period: 'Morning' as const,
    timeRange: '10:00 AM - 12:00 PM',
  },
  {
    id: '12:00 PM - 02:00 PM',
    label: 'Early Afternoon (12:00 PM – 02:00 PM)',
    period: 'Afternoon' as const,
    timeRange: '12:00 PM - 02:00 PM',
  },
  {
    id: '02:00 PM - 04:00 PM',
    label: 'Late Afternoon (02:00 PM – 04:00 PM)',
    period: 'Afternoon' as const,
    timeRange: '02:00 PM - 04:00 PM',
  },
  {
    id: '04:00 PM - 06:00 PM',
    label: 'Evening (04:00 PM – 06:00 PM)',
    period: 'Evening' as const,
    timeRange: '04:00 PM - 06:00 PM',
  },
];

export class CapacityService {
  /**
   * Calculates dynamic availability for each 2-hour window on a given date for a centre.
   * Centre window capacity is configurable (e.g. 15 to 30 farmers/window).
   */
  public getCentreSlotsForDate(centreId: string, dateStr: string): TimeWindowSlot[] {
    const centre = db.getCentreById(centreId);
    if (!centre) {
      return [];
    }

    const windowCapacity = centre.windowCapacity || 20; // Default 20 farmers per 2-hour window
    const isCentreClosed =
      centre.operatingStatus === 'CLOSED' || centre.operatingStatus === 'TEMPORARILY_CLOSED';

    // Get all active (non-cancelled) tokens for this centre on this date
    const allTokensForCentre = db.getTokens({ centreId });
    const dayTokens = allTokensForCentre.filter(
      (t) => t.bookingDate === dateStr && t.status !== 'CANCELLED'
    );

    return STANDARD_TIME_WINDOWS.map((win, index) => {
      const bookedInWindow = dayTokens.filter((t) => t.timeSlot === win.id).length;
      const available = isCentreClosed ? 0 : Math.max(0, windowCapacity - bookedInWindow);
      const isFull = isCentreClosed || available <= 0;

      // Waiting time estimation based on yard base wait + slot congestion
      const baseWait = centre.estimatedWaitingTimeMinutes || 30;
      const additionalCongestion = bookedInWindow * 3;
      const estimatedWait = Math.min(180, Math.max(15, baseWait + additionalCongestion));

      return {
        id: win.id,
        label: win.label,
        period: win.period,
        timeRange: win.timeRange,
        capacity: windowCapacity,
        bookedCount: bookedInWindow,
        availableSlots: available,
        estimatedWaitMinutes: estimatedWait,
        isFull,
      };
    });
  }

  /**
   * Checks if a specific slot has availability before booking
   */
  public validateSlotAvailability(
    centreId: string,
    dateStr: string,
    timeSlotId: string
  ): { available: boolean; remaining: number; capacity: number; reason?: string } {
    const centre = db.getCentreById(centreId);
    if (!centre) {
      return { available: false, remaining: 0, capacity: 0, reason: 'Procurement centre not found' };
    }

    if (centre.operatingStatus === 'CLOSED' || centre.operatingStatus === 'TEMPORARILY_CLOSED') {
      return {
        available: false,
        remaining: 0,
        capacity: 0,
        reason: `${centre.name} is currently ${centre.operatingStatus.replace('_', ' ')}. No slots available.`,
      };
    }

    const windowCapacity = centre.windowCapacity || 20;
    const tokens = db
      .getTokens({ centreId })
      .filter((t) => t.bookingDate === dateStr && t.timeSlot === timeSlotId && t.status !== 'CANCELLED');

    const remaining = Math.max(0, windowCapacity - tokens.length);
    if (remaining <= 0) {
      return {
        available: false,
        remaining: 0,
        capacity: windowCapacity,
        reason: `The time window '${timeSlotId}' on ${dateStr} is fully booked (${windowCapacity}/${windowCapacity} farmers). Please choose another window.`,
      };
    }

    return { available: true, remaining, capacity: windowCapacity };
  }
}

export const capacityService = new CapacityService();
