import fs from 'fs';
import path from 'path';
import {
  User,
  FarmerProfile,
  OfficialProfile,
  BuyerProfile,
  ProcurementCentre,
  Crop,
  Token,
  TokenCrop,
  ProduceListing,
  Transaction,
  Notification,
  Dispute,
} from '../../src/shared/types';
import {
  INITIAL_USERS,
  INITIAL_FARMER_PROFILES,
  INITIAL_OFFICIAL_PROFILES,
  INITIAL_BUYER_PROFILES,
  INITIAL_CENTRES,
  INITIAL_CROPS,
  INITIAL_TOKENS,
  INITIAL_PRODUCE_LISTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_DISPUTES,
} from '../data/seedData';

interface DatabaseSchema {
  users: User[];
  farmerProfiles: FarmerProfile[];
  officialProfiles: OfficialProfile[];
  buyerProfiles: BuyerProfile[];
  procurementCentres: ProcurementCentre[];
  crops: Crop[];
  tokens: Token[];
  produceListings: ProduceListing[];
  transactions: Transaction[];
  notifications: Notification[];
  disputes: Dispute[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'kisan_connect_db.json');

class DatabaseManager {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private getInitialData(): DatabaseSchema {
    return {
      users: [...INITIAL_USERS],
      farmerProfiles: [...INITIAL_FARMER_PROFILES],
      officialProfiles: [...INITIAL_OFFICIAL_PROFILES],
      buyerProfiles: [...INITIAL_BUYER_PROFILES],
      procurementCentres: [...INITIAL_CENTRES],
      crops: [...INITIAL_CROPS],
      tokens: [...INITIAL_TOKENS],
      produceListings: [...INITIAL_PRODUCE_LISTINGS],
      transactions: [...INITIAL_TRANSACTIONS],
      notifications: [...INITIAL_NOTIFICATIONS],
      disputes: [...INITIAL_DISPUTES],
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all keys exist
        return {
          users: parsed.users || INITIAL_USERS,
          farmerProfiles: parsed.farmerProfiles || INITIAL_FARMER_PROFILES,
          officialProfiles: parsed.officialProfiles || INITIAL_OFFICIAL_PROFILES,
          buyerProfiles: parsed.buyerProfiles || INITIAL_BUYER_PROFILES,
          procurementCentres: parsed.procurementCentres || INITIAL_CENTRES,
          crops: parsed.crops || INITIAL_CROPS,
          tokens: parsed.tokens || INITIAL_TOKENS,
          produceListings: parsed.produceListings || INITIAL_PRODUCE_LISTINGS,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          disputes: parsed.disputes || INITIAL_DISPUTES,
        };
      }
    } catch (err) {
      console.warn('Could not read existing database file, seeding default:', err);
    }
    const initial = this.getInitialData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persist(this.data);
      this.saveTimeout = null;
    }, 100);
  }

  // --- Users & Profiles ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByPhoneOrEmail(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.email.toLowerCase() === clean || u.phone.toLowerCase() === clean
    );
  }

  addUser(user: User): User {
    this.data.users.push(user);
    this.scheduleSave();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.scheduleSave();
    return this.data.users[idx];
  }

  getFarmerProfile(userId: string): FarmerProfile | undefined {
    return this.data.farmerProfiles.find((p) => p.userId === userId);
  }

  addOrUpdateFarmerProfile(profile: FarmerProfile): FarmerProfile {
    const idx = this.data.farmerProfiles.findIndex((p) => p.userId === profile.userId);
    if (idx >= 0) {
      this.data.farmerProfiles[idx] = { ...this.data.farmerProfiles[idx], ...profile };
    } else {
      this.data.farmerProfiles.push(profile);
    }
    this.scheduleSave();
    return profile;
  }

  getOfficialProfile(userId: string): OfficialProfile | undefined {
    return this.data.officialProfiles.find((p) => p.userId === userId);
  }

  addOrUpdateOfficialProfile(profile: OfficialProfile): OfficialProfile {
    const idx = this.data.officialProfiles.findIndex((p) => p.userId === profile.userId);
    if (idx >= 0) {
      this.data.officialProfiles[idx] = { ...this.data.officialProfiles[idx], ...profile };
    } else {
      this.data.officialProfiles.push(profile);
    }
    this.scheduleSave();
    return profile;
  }

  getBuyerProfile(userId: string): BuyerProfile | undefined {
    return this.data.buyerProfiles.find((p) => p.userId === userId);
  }

  addOrUpdateBuyerProfile(profile: BuyerProfile): BuyerProfile {
    const idx = this.data.buyerProfiles.findIndex((p) => p.userId === profile.userId);
    if (idx >= 0) {
      this.data.buyerProfiles[idx] = { ...this.data.buyerProfiles[idx], ...profile };
    } else {
      this.data.buyerProfiles.push(profile);
    }
    this.scheduleSave();
    return profile;
  }

  // --- Procurement Centres ---
  getCentres(): ProcurementCentre[] {
    return this.data.procurementCentres;
  }

  getCentreById(id: string): ProcurementCentre | undefined {
    return this.data.procurementCentres.find((c) => c.id === id);
  }

  updateCentre(id: string, updates: Partial<ProcurementCentre>): ProcurementCentre | undefined {
    const idx = this.data.procurementCentres.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.procurementCentres[idx] = {
      ...this.data.procurementCentres[idx],
      ...updates,
    };
    this.scheduleSave();
    return this.data.procurementCentres[idx];
  }

  // --- Crops ---
  getCrops(): Crop[] {
    return this.data.crops;
  }

  getCropById(id: string): Crop | undefined {
    const normalizedId = id === 'crop_paddy_a' ? 'crop_paddy' : id;
    return this.data.crops.find((c) => c.id === normalizedId || c.id === id);
  }

  // --- Tokens ---
  getTokens(filters?: { farmerId?: string; centreId?: string; status?: string }): Token[] {
    let result = [...this.data.tokens];
    if (filters?.farmerId) {
      result = result.filter((t) => t.farmerId === filters.farmerId);
    }
    if (filters?.centreId) {
      result = result.filter((t) => t.procurementCentreId === filters.centreId);
    }
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTokenById(id: string): Token | undefined {
    return this.data.tokens.find((t) => t.id === id);
  }

  getActiveTokenForFarmer(farmerId: string): Token | undefined {
    const activeStatuses = ['WAITING', 'CALLED', 'ARRIVED', 'PROCESSING'];
    return this.data.tokens.find((t) => t.farmerId === farmerId && activeStatuses.includes(t.status));
  }

  addToken(token: Token): Token {
    this.data.tokens.unshift(token);

    // Update centre metrics
    const centre = this.getCentreById(token.procurementCentreId);
    if (centre) {
      const waitingCount = this.data.tokens.filter(
        (t) => t.procurementCentreId === centre.id && ['WAITING', 'CALLED', 'ARRIVED'].includes(t.status)
      ).length;
      const currentLoad = this.data.tokens
        .filter((t) => t.procurementCentreId === centre.id && t.status !== 'CANCELLED')
        .reduce((sum, t) => sum + t.totalQuantityQuintals, 0);

      this.updateCentre(centre.id, {
        currentTokensCount: centre.currentTokensCount + 1,
        availableTokenSlots: Math.max(0, centre.availableTokenSlots - 1),
        waitingFarmersCount: waitingCount,
        currentLoadQuintals: Math.min(centre.dailyCapacityQuintals, currentLoad),
      });
    }

    this.scheduleSave();
    return token;
  }

  updateToken(id: string, updates: Partial<Token>): Token | undefined {
    const idx = this.data.tokens.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    const prevStatus = this.data.tokens[idx].status;
    this.data.tokens[idx] = {
      ...this.data.tokens[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If status changed to COMPLETED or CANCELLED, recalculate centre metrics
    const updated = this.data.tokens[idx];
    if (prevStatus !== updated.status) {
      const centre = this.getCentreById(updated.procurementCentreId);
      if (centre) {
        const waitingCount = this.data.tokens.filter(
          (t) => t.procurementCentreId === centre.id && ['WAITING', 'CALLED', 'ARRIVED'].includes(t.status)
        ).length;
        this.updateCentre(centre.id, {
          waitingFarmersCount: waitingCount,
          currentTokenNumber: updated.status === 'CALLED' || updated.status === 'PROCESSING'
            ? updated.tokenNumber
            : centre.currentTokenNumber,
        });
      }
    }

    this.scheduleSave();
    return updated;
  }

  // --- Produce Listings (for Buyers) ---
  getProduceListings(filters?: { cropId?: string; district?: string; centreId?: string; status?: string }): ProduceListing[] {
    let result = [...this.data.produceListings];
    if (filters?.cropId) {
      result = result.filter((p) => p.cropId === filters.cropId);
    }
    if (filters?.district) {
      result = result.filter((p) => p.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.centreId) {
      result = result.filter((p) => p.procurementCentreId === filters.centreId);
    }
    if (filters?.status) {
      result = result.filter((p) => p.status === filters.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getProduceListingById(id: string): ProduceListing | undefined {
    return this.data.produceListings.find((p) => p.id === id);
  }

  addProduceListing(listing: ProduceListing): ProduceListing {
    this.data.produceListings.unshift(listing);
    this.scheduleSave();
    return listing;
  }

  updateProduceListing(id: string, updates: Partial<ProduceListing>): ProduceListing | undefined {
    const idx = this.data.produceListings.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.produceListings[idx] = { ...this.data.produceListings[idx], ...updates };
    this.scheduleSave();
    return this.data.produceListings[idx];
  }

  // --- Transactions ---
  getTransactions(filters?: { farmerId?: string; buyerId?: string; centreId?: string }): Transaction[] {
    let result = [...this.data.transactions];
    if (filters?.farmerId) {
      result = result.filter((t) => t.farmerId === filters.farmerId);
    }
    if (filters?.buyerId) {
      result = result.filter((t) => t.buyerId === filters.buyerId);
    }
    if (filters?.centreId) {
      result = result.filter((t) => t.procurementCentreId === filters.centreId);
    }
    return result.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }

  addTransaction(txn: Transaction): Transaction {
    this.data.transactions.unshift(txn);

    // If farmer transaction, update total earnings on farmer profile
    if (txn.farmerId) {
      const farmerProf = this.getFarmerProfile(txn.farmerId);
      if (farmerProf) {
        this.addOrUpdateFarmerProfile({
          ...farmerProf,
          totalEarnings: (farmerProf.totalEarnings || 0) + txn.totalAmount,
        });
      }
    }

    this.scheduleSave();
    return txn;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.scheduleSave();
    return notif;
  }

  markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      this.scheduleSave();
      return true;
    }
    return false;
  }

  markAllNotificationsAsRead(userId: string): number {
    let count = 0;
    for (const n of this.data.notifications) {
      if (n.userId === userId && !n.read) {
        n.read = true;
        count++;
      }
    }
    if (count > 0) this.scheduleSave();
    return count;
  }

  // --- Disputes / Grievances ---
  getDisputes(userId?: string): Dispute[] {
    if (userId) {
      return this.data.disputes.filter((d) => d.userId === userId);
    }
    return this.data.disputes;
  }

  addDispute(dispute: Dispute): Dispute {
    this.data.disputes.unshift(dispute);
    this.scheduleSave();
    return dispute;
  }

  // Reset demo data method
  resetDemoData() {
    this.data = this.getInitialData();
    this.persist(this.data);
    return true;
  }
}

export const db = new DatabaseManager();
