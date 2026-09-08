import {
  User,
  FarmerProfile,
  OfficialProfile,
  BuyerProfile,
  ProcurementCentre,
  Crop,
  Token,
  ProduceListing,
  Transaction,
  Notification,
  Dispute,
  RecommendationResult,
  TimeWindowSlot,
} from '../shared/types';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ksc_token');
      if (saved && saved !== 'null' && saved !== 'undefined') {
        this.token = saved;
      }
    }
  }

  setToken(token: string | null) {
    if (token && token !== 'null' && token !== 'undefined') {
      this.token = token;
      localStorage.setItem('ksc_token', token);
    } else {
      this.token = null;
      localStorage.removeItem('ksc_token');
    }
  }

  getToken(): string | null {
    if (!this.token || this.token === 'null' || this.token === 'undefined') {
      return null;
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token && this.token !== 'null' && this.token !== 'undefined') {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({ success: false, error: 'Network parsing error' }));

    if (response.status === 401) {
      this.setToken(null);
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.error || `HTTP ${response.status}: Request failed`);
    }

    return data as T;
  }

  // --- Auth ---
  async getDemoAccounts() {
    return this.request<{ success: boolean; accounts: any[] }>('/api/auth/demo-accounts');
  }

  async login(identifier: string, password = '') {
    const res = await this.request<{
      success: boolean;
      token: string;
      user: User;
      farmerProfile?: FarmerProfile;
      officialProfile?: OfficialProfile;
      buyerProfile?: BuyerProfile;
      message: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async switchDemo(userId: string) {
    const res = await this.request<{
      success: boolean;
      token: string;
      user: User;
      farmerProfile?: FarmerProfile;
      officialProfile?: OfficialProfile;
      buyerProfile?: BuyerProfile;
    }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: any) {
    const res = await this.request<{
      success: boolean;
      token: string;
      user: User;
      farmerProfile?: FarmerProfile;
      officialProfile?: OfficialProfile;
      buyerProfile?: BuyerProfile;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request<{
      success: boolean;
      authenticated?: boolean;
      user: User | null;
      farmerProfile?: FarmerProfile | null;
      officialProfile?: OfficialProfile | null;
      buyerProfile?: BuyerProfile | null;
    }>('/api/auth/me');
  }

  async updateSettings(settings: { preferredLanguage?: string; lowLiteracyMode?: boolean }) {
    return this.request<{ success: boolean; user: User }>('/api/auth/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async resetDemoData() {
    return this.request<{ success: boolean; message: string }>('/api/auth/reset-demo', {
      method: 'POST',
    });
  }

  // --- Master ---
  async getCrops() {
    return this.request<{ success: boolean; crops: Crop[] }>('/api/master/crops');
  }

  async getCentres() {
    return this.request<{ success: boolean; centres: ProcurementCentre[] }>('/api/master/centres');
  }

  async getCentre(id: string) {
    return this.request<{ success: boolean; centre: ProcurementCentre }>(`/api/master/centres/${id}`);
  }

  async getCentreSlots(centreId: string, date?: string) {
    const params = date ? `?date=${encodeURIComponent(date)}` : '';
    return this.request<{ success: boolean; centreId: string; date: string; slots: TimeWindowSlot[] }>(
      `/api/master/centres/${centreId}/slots${params}`
    );
  }

  // --- Farmer ---
  async getFarmerDashboard() {
    return this.request<{
      success: boolean;
      farmer: User;
      profile?: FarmerProfile;
      activeToken?: Token;
      recentTokens: Token[];
      totalTokensCount: number;
      totalEarnings: number;
      recentTransactions: Transaction[];
      submittedProduceCount: number;
      recommendation: RecommendationResult;
      preferredCentre: ProcurementCentre;
    }>('/api/farmer/dashboard');
  }

  async getFarmerRecommendation(centreId?: string, cropId?: string) {
    const params = new URLSearchParams();
    if (centreId) params.append('centreId', centreId);
    if (cropId) params.append('cropId', cropId);
    return this.request<{ success: boolean; recommendation: RecommendationResult }>(
      `/api/farmer/recommendation?${params.toString()}`
    );
  }

  async getFarmerTokens() {
    return this.request<{ success: boolean; tokens: Token[]; activeToken?: Token }>('/api/farmer/tokens');
  }

  async bookToken(payload: {
    procurementCentreId: string;
    bookingDate: string;
    timeSlot: string;
    crops: Array<{ cropId: string; quantityQuintals: number; grade?: string }>;
    notes?: string;
  }) {
    return this.request<{ success: boolean; token: Token; message: string }>('/api/farmer/tokens', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async cancelToken(tokenId: string, reason?: string) {
    return this.request<{ success: boolean; token: Token; message: string }>(
      `/api/farmer/tokens/${tokenId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  }

  async getFarmerProduce() {
    return this.request<{ success: boolean; listings: ProduceListing[] }>('/api/farmer/produce');
  }

  async getFarmerTransactions() {
    return this.request<{
      success: boolean;
      transactions: Transaction[];
      stats: { totalEarned: number; pendingPayments: number; count: number };
    }>('/api/farmer/transactions');
  }

  async updateFarmerProfile(profile: Partial<FarmerProfile>) {
    return this.request<{ success: boolean; profile: FarmerProfile }>('/api/farmer/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // --- Official ---
  async getOfficialDashboard() {
    return this.request<{
      success: boolean;
      centre: ProcurementCentre;
      stats: {
        totalTokens: number;
        activeQueueCount: number;
        waitingCount: number;
        calledCount: number;
        processingCount: number;
        completedToday: number;
        capacityUtilizationPercent: number;
      };
      cropSummaries: Array<{ cropName: string; totalQuintals: number; tokenCount: number }>;
      activeQueue: Token[];
    }>('/api/official/dashboard');
  }

  async getOfficialTokens(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<{ success: boolean; tokens: Token[]; centre: ProcurementCentre }>(
      `/api/official/tokens${query}`
    );
  }

  async updateTokenStatus(tokenId: string, status: string, notes?: string) {
    return this.request<{ success: boolean; token: Token; message: string }>(
      `/api/official/tokens/${tokenId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, notes }),
      }
    );
  }

  async updateCentreOperational(updates: Partial<ProcurementCentre>) {
    return this.request<{ success: boolean; centre: ProcurementCentre; message: string }>(
      '/api/official/centre/operational',
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  async sendOfficialBroadcast(title: string, message: string) {
    return this.request<{ success: boolean; recipientsCount: number; message: string }>(
      '/api/official/broadcast',
      {
        method: 'POST',
        body: JSON.stringify({ title, message }),
      }
    );
  }

  async getOfficialStats() {
    return this.request<{
      success: boolean;
      centreName: string;
      totalProcuredQuintals: number;
      totalDisbursedRupees: number;
      transactionsCount: number;
      recentTransactions: Transaction[];
    }>('/api/official/stats');
  }

  // --- Buyer ---
  async getBuyerDashboard() {
    return this.request<{
      success: boolean;
      buyer: User;
      buyerProfile?: BuyerProfile;
      stats: {
        availableLotsCount: number;
        myOrdersCount: number;
        totalPurchasedQuintals: number;
        totalSpend: number;
      };
      cropSummary: Array<{ cropName: string; availableQuintals: number; lotsCount: number }>;
      recentOrders: Transaction[];
      featuredListings: ProduceListing[];
    }>('/api/buyer/dashboard');
  }

  async getBuyerListings(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters);
    return this.request<{ success: boolean; count: number; listings: ProduceListing[] }>(
      `/api/buyer/listings?${params.toString()}`
    );
  }

  async purchaseListing(payload: {
    listingId: string;
    quantityQuintals?: number;
    offerPricePerQuintal?: number;
    deliveryNotes?: string;
  }) {
    return this.request<{ success: boolean; transaction: Transaction; message: string }>(
      '/api/buyer/purchase',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async getBuyerOrders() {
    return this.request<{ success: boolean; count: number; orders: Transaction[] }>('/api/buyer/orders');
  }

  // --- Common ---
  async getNotifications() {
    return this.request<{ success: boolean; notifications: Notification[]; unreadCount: number }>(
      '/api/notifications'
    );
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ success: boolean; markedCount: number }>('/api/notifications/read-all', {
      method: 'POST',
    });
  }

  async getDisputes() {
    return this.request<{ success: boolean; disputes: Dispute[] }>('/api/disputes');
  }

  async fileDispute(title: string, category: string, description: string) {
    return this.request<{ success: boolean; dispute: Dispute; message: string }>('/api/disputes', {
      method: 'POST',
      body: JSON.stringify({ title, category, description }),
    });
  }
}

export const api = new ApiService();
