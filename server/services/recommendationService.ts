import { RecommendationResult, RecommendationStatus, ProcurementCentre, Crop } from '../../src/shared/types';
import { db } from '../repositories/db';

export interface GoWaitRecommendationInput {
  centreId: string;
  cropId?: string;
  farmerId?: string;
  expectedDate?: string;
}

export interface IRecommendationEngine {
  getGoWaitRecommendation(input: GoWaitRecommendationInput): Promise<RecommendationResult>;
}

/**
 * Transparent rule-based recommendation engine for agricultural procurement arrivals.
 * Designed to be modular and cleanly replaceable by Gemini or ML models in future iterations.
 */
export class RuleBasedRecommendationEngine implements IRecommendationEngine {
  async getGoWaitRecommendation(input: GoWaitRecommendationInput): Promise<RecommendationResult> {
    const centre = db.getCentreById(input.centreId);
    if (!centre) {
      return {
        status: 'WAIT',
        confidenceScore: 0.5,
        badgeColor: 'gray',
        headline: 'Procurement Centre Not Found',
        explanation: 'Please select a valid government agricultural procurement centre or mandi.',
        suggestedAction: 'Select another registered mandi from the list.',
        factors: [],
        centreName: 'Unknown Mandi',
        estimatedWaitMinutes: 0,
        currentQueueLength: 0,
        loadPercentage: 0,
        generatedAt: new Date().toISOString(),
      };
    }

    const crop = input.cropId ? db.getCropById(input.cropId) : undefined;
    const capacity = centre.dailyCapacityQuintals || 1000;
    const currentLoad = centre.currentLoadQuintals || 0;
    const loadPercent = Math.min(100, Math.round((currentLoad / capacity) * 100));
    const waitingFarmers = centre.waitingFarmersCount || 0;
    const waitTimeMin = centre.estimatedWaitingTimeMinutes || 0;
    const availableSlots = centre.availableTokenSlots || 0;

    // 1. Check Operating Status
    if (centre.operatingStatus === 'CLOSED' || centre.operatingStatus === 'TEMPORARILY_CLOSED') {
      return {
        status: 'CENTRE_CLOSED',
        confidenceScore: 0.98,
        badgeColor: 'red',
        headline: 'Centre Currently Closed or Under System Maintenance',
        explanation: `${centre.name} is currently closed or undergoing scheduled maintenance/reconciliation. Do not dispatch transport vehicles today.`,
        suggestedAction: 'Wait for official status change notification or check nearby alternate mandis.',
        factors: [
          { name: 'Yard Status', value: centre.operatingStatus.replace('_', ' '), impact: 'negative' },
          { name: 'Available Slots', value: '0 slots', impact: 'negative' },
          { name: 'Next Operational Window', value: 'Tomorrow 08:00 AM', impact: 'neutral' },
        ],
        centreName: centre.name,
        cropName: crop?.name,
        estimatedWaitMinutes: waitTimeMin,
        currentQueueLength: waitingFarmers,
        loadPercentage: loadPercent,
        generatedAt: new Date().toISOString(),
      };
    }

    // 2. Check if Centre is Overloaded or token slots exhausted
    if (loadPercent >= 90 || availableSlots <= 5 || waitTimeMin >= 120) {
      return {
        status: 'CENTRE_BUSY',
        confidenceScore: 0.92,
        badgeColor: 'amber',
        headline: 'High Congestion & Long Waiting Times Reported',
        explanation: `Yard is at ${loadPercent}% capacity with ${waitingFarmers} farmers waiting in line. Estimated weighbridge wait is ${waitTimeMin} minutes.`,
        suggestedAction: 'Delay loading produce by 2 to 3 hours or reserve an afternoon/tomorrow slot to avoid queue demurrage.',
        factors: [
          { name: 'Yard Yard Capacity', value: `${loadPercent}% full`, impact: 'negative' },
          { name: 'Queue Length', value: `${waitingFarmers} tractor/trolleys waiting`, impact: 'negative' },
          { name: 'Est. Weighbridge Wait', value: `${waitTimeMin} mins`, impact: 'negative' },
          { name: 'Token Slots Remaining', value: `${availableSlots} left`, impact: availableSlots < 5 ? 'negative' : 'neutral' },
        ],
        centreName: centre.name,
        cropName: crop?.name,
        estimatedWaitMinutes: waitTimeMin,
        currentQueueLength: waitingFarmers,
        loadPercentage: loadPercent,
        generatedAt: new Date().toISOString(),
      };
    }

    // 3. Check Moderate Load
    if (loadPercent >= 70 || waitTimeMin >= 60 || availableSlots <= 15) {
      return {
        status: 'WAIT',
        confidenceScore: 0.85,
        badgeColor: 'amber',
        headline: 'Moderate Inflow: Prepare Produce But Await Turn',
        explanation: `There are ${waitingFarmers} vehicles in line. Processing speed is steady, but slot availability is narrowing. Book token now and plan arrival within your slot window.`,
        suggestedAction: 'Book your slot now and set off 45 minutes prior to your allocated time.',
        factors: [
          { name: 'Yard Yard Capacity', value: `${loadPercent}% utilized`, impact: 'neutral' },
          { name: 'Queue Length', value: `${waitingFarmers} farmers waiting`, impact: 'neutral' },
          { name: 'Est. Wait Time', value: `${waitTimeMin} mins`, impact: 'neutral' },
          { name: 'Available Slots', value: `${availableSlots} slots available`, impact: 'positive' },
        ],
        centreName: centre.name,
        cropName: crop?.name,
        estimatedWaitMinutes: waitTimeMin,
        currentQueueLength: waitingFarmers,
        loadPercentage: loadPercent,
        generatedAt: new Date().toISOString(),
      };
    }

    // 4. Optimal GO recommendation
    return {
      status: 'GO',
      confidenceScore: 0.95,
      badgeColor: 'green',
      headline: 'Excellent Conditions: Safe & Swift Arrival Recommended',
      explanation: `${centre.name} has smooth vehicle throughput, low weighbridge congestion (approx. ${waitTimeMin} mins), and ample token availability (${availableSlots} slots). Moisture testing is active.`,
      suggestedAction: 'Proceed to mandi with clean, dried produce. Ensure your moisture content meets FAQ standard (under 17% for Paddy).',
      factors: [
        { name: 'Yard Capacity', value: `${loadPercent}% (Plenty of space)`, impact: 'positive' },
        { name: 'Waiting Line', value: `Only ${waitingFarmers} vehicles ahead`, impact: 'positive' },
        { name: 'Est. Turnaround', value: `${waitTimeMin} mins`, impact: 'positive' },
        { name: 'Token Slots', value: `${availableSlots} open slots`, impact: 'positive' },
        ...(crop ? [{ name: 'MSP Guaranteed', value: `₹${crop.mspPerQuintal} / Qtl`, impact: 'positive' as const }] : []),
      ],
      centreName: centre.name,
      cropName: crop?.name,
      estimatedWaitMinutes: waitTimeMin,
      currentQueueLength: waitingFarmers,
      loadPercentage: loadPercent,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const recommendationService: IRecommendationEngine = new RuleBasedRecommendationEngine();
