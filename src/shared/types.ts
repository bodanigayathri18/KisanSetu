export type UserRole = 'FARMER' | 'PROCUREMENT_OFFICIAL' | 'BUYER';

export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml';

export type TokenStatus =
  | 'WAITING'
  | 'CALLED'
  | 'ARRIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';

export type OperatingStatus = 'OPEN' | 'BUSY' | 'TEMPORARILY_CLOSED' | 'CLOSED';

export type RecommendationStatus = 'GO' | 'WAIT' | 'CENTRE_BUSY' | 'CENTRE_CLOSED';

export type CropCategory = 'CEREALS' | 'PULSES' | 'COMMERCIAL' | 'OILSEEDS';

export type ProduceStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export type TransactionType = 'PROCUREMENT' | 'BUYER_PURCHASE';

export type PaymentStatus = 'PENDING' | 'PROCESSED' | 'PAID';

export type NotificationType =
  | 'TOKEN_CONFIRMATION'
  | 'TOKEN_STATUS'
  | 'CENTRE_ALERT'
  | 'GO_WAIT_ALERT'
  | 'BUYER_REQUEST'
  | 'PAYMENT_RECEIVED'
  | 'SYSTEM';

export type PassbookStatus = 'PROVIDED' | 'SUBMITTED' | 'VERIFIED' | 'MISSING';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  preferredLanguage: LanguageCode;
  lowLiteracyMode: boolean;
  location: string;
  state: string;
  district: string;
  mandal?: string;
  village?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  village: string;
  mandal?: string;
  district: string;
  state: string;
  preferredCentreId: string;
  landAcres: number;
  landSizeAcres?: number;
  pattaPassbookNumber?: string;
  passbookStatus?: PassbookStatus;
  kisanCardNo?: string;
  primaryCrops?: string[];
  totalEarnings?: number;
}

export interface OfficialProfile {
  id: string;
  userId: string;
  procurementCentreId: string;
  designation: string;
  permissions: string[];
}

export interface BuyerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'Wholesaler' | 'Rice Miller' | 'Agro Exporter' | 'Retail Chain' | 'Cooperative';
  location: string;
  gstNumber: string;
  contactEmail: string;
  contactPhone: string;
  creditRating?: string;
}

export interface ProcurementCentre {
  id: string;
  name: string;
  code: string;
  location: string;
  address?: string;
  district: string;
  mandal?: string;
  village?: string;
  state: string;
  operatingStatus: OperatingStatus;
  dailyCapacityQuintals: number;
  currentLoadQuintals: number;
  dailyTokenLimit: number;
  availableTokenSlots: number;
  windowCapacity?: number; // Configurable: 15-30 farmers per 2-hour window
  bookingWindowDurationHours?: number; // default 2
  acceptedCropIds?: string[];
  currentTokensCount: number;
  waitingFarmersCount: number;
  estimatedWaitingTimeMinutes: number;
  currentTokenNumber?: string;
  operatingHours: string;
  contactPhone: string;
  supervisorName: string;
}

export interface TimeWindowSlot {
  id: string; // e.g. '08:00 AM - 10:00 AM'
  label: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  timeRange: string;
  capacity: number;
  bookedCount: number;
  availableSlots: number;
  estimatedWaitMinutes: number;
  isFull: boolean;
}

export interface Crop {
  id: string;
  name: string;
  code: string;
  category: CropCategory;
  localNames: Record<LanguageCode, string>;
  mspPerQuintal: number;
  standardMoistureLimitPercent: number;
  activeStatus: boolean;
  iconName?: string;
}

export interface TokenCrop {
  id: string;
  tokenId: string;
  cropId: string;
  cropName: string;
  quantityQuintals: number;
  unit: string;
  grade?: string;
  mspPerQuintal: number;
  estimatedTotalValue: number;
}

export interface Token {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerVillage: string;
  procurementCentreId: string;
  procurementCentreName: string;
  tokenNumber: string;
  bookingDate: string;
  timeSlot: string;
  status: TokenStatus;
  queuePosition: number;
  estimatedWaitMinutes: number;
  crops: TokenCrop[];
  totalQuantityQuintals: number;
  totalEstimatedValue: number;
  notes?: string;
  arrivalConfirmedAt?: string;
  processingStartedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerMaskedName: string;
  procurementCentreId: string;
  procurementCentreName: string;
  district: string;
  state: string;
  cropId: string;
  cropName: string;
  category: CropCategory;
  quantityQuintals: number;
  unit: string;
  pricePerQuintal: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Fair Average Quality (FAQ)';
  moistureContentPercent: number;
  status: ProduceStatus;
  procuredDate: string;
  expiryDate?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  referenceNo: string;
  type: TransactionType;
  tokenId?: string;
  listingId?: string;
  farmerId: string;
  farmerName: string;
  buyerId?: string;
  buyerBusinessName?: string;
  officialId?: string;
  procurementCentreId: string;
  procurementCentreName: string;
  cropId: string;
  cropName: string;
  quantityQuintals: number;
  unit: string;
  ratePerQuintal: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  utrNumber?: string;
  transactionDate: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Dispute {
  id: string;
  ticketNumber: string;
  userId: string;
  userRole: UserRole;
  title: string;
  category: 'TOKEN_ISSUE' | 'WEIGHMENT' | 'PAYMENT_DELAY' | 'QUALITY_GRADING' | 'OTHER';
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  createdAt: string;
}

export interface RecommendationFactor {
  name: string;
  value: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface RecommendationResult {
  status: RecommendationStatus;
  confidenceScore: number;
  badgeColor: 'green' | 'amber' | 'red' | 'gray';
  headline: string;
  explanation: string;
  suggestedAction: string;
  factors: RecommendationFactor[];
  centreName: string;
  cropName?: string;
  estimatedWaitMinutes: number;
  currentQueueLength: number;
  loadPercentage: number;
  generatedAt: string;
}

export interface AuthState {
  user: User | null;
  farmerProfile?: FarmerProfile | null;
  officialProfile?: OfficialProfile | null;
  buyerProfile?: BuyerProfile | null;
  token?: string;
}
