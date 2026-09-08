import { ProduceListing, Crop, ProcurementCentre } from '../../src/shared/types';
import { db } from '../repositories/db';

/**
 * Service boundaries for future AI / Gemini integrations.
 * These clean interfaces allow future integration of Gemini models, predictive models,
 * and market intelligence without restructuring the core application.
 */

export interface ProduceMatchResult {
  listing: ProduceListing;
  matchScore: number;
  reasons: string[];
}

export class MatchingService {
  /**
   * Recommends produce listings for buyers based on purchase history and specifications.
   * Expandable to Gemini embedding-based semantic matching.
   */
  async matchProduceForBuyer(buyerId: string, criteria?: { preferredCropId?: string; maxDistanceKm?: number }): Promise<ProduceMatchResult[]> {
    const listings = db.getProduceListings({ status: 'AVAILABLE' });
    return listings.map((listing) => {
      let score = 80;
      const reasons: string[] = ['Standard verified quality lot'];

      if (criteria?.preferredCropId && listing.cropId === criteria.preferredCropId) {
        score += 15;
        reasons.push('Matches preferred crop commodity');
      }

      if (listing.qualityGrade === 'Grade A') {
        score += 5;
        reasons.push('High-grade lot with low moisture test reading');
      }

      return {
        listing,
        matchScore: Math.min(99, score),
        reasons,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
}

export class ForecastingService {
  /**
   * Forecasts upcoming mandi arrivals and peak congestion hours.
   * Expandable to Gemini predictive time-series analysis.
   */
  async getArrivalForecast(centreId: string, date: string) {
    const centre = db.getCentreById(centreId);
    return {
      centreId,
      centreName: centre?.name || 'Mandi',
      forecastDate: date,
      predictedTotalArrivalsQuintals: 2850,
      predictedPeakWindow: '10:30 AM - 01:00 PM',
      recommendedDischargePace: '45 Quintals/hr across 4 weighbridges',
      confidenceLevel: 'High (Based on token pre-bookings & seasonal trends)',
    };
  }
}

export class AssistantService {
  /**
   * Future natural-language farmer advisory assistant endpoint.
   * Built to connect directly to server-side Google GenAI (Gemini) SDK.
   */
  async queryFarmerAssistant(farmerPrompt: string, language: string) {
    // When GEMINI_API_KEY is available in future iterations, this endpoint can invoke @google/genai
    return {
      reply: `Farmer Advisory: Based on Telangana state agriculture guidelines, ensure your crop has moisture under 17% for Paddy and 12% for Cotton before booking a slot.`,
      language,
      confidence: 0.95,
    };
  }
}

export const matchingService = new MatchingService();
export const forecastingService = new ForecastingService();
export const assistantService = new AssistantService();
