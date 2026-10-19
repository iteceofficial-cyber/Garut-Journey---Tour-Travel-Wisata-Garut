export type UserRole = 'customer' | 'guide' | 'admin' | 'super_admin';
export type BookingStatus = 'pending_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'settlement' | 'capture' | 'deny' | 'expire' | 'cancel' | 'refund';
export type DiscountType = 'percentage' | 'fixed';
export type PaymentTier = 'full' | 'dp'; // Lunas atau Baru DP

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
}

export interface PackageImage {
  id: string;
  packageId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ItineraryItem {
  id?: string;
  day: number;
  title: string;
  activities: string[];
}

export interface TourPackage {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  minParticipants: number;
  maxParticipants: number;
  destinationArea: string;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryItem[];
  pickupPoints: string[];
  termsAndConditions: string;
  isPublished: boolean;
  featuredOrder: number;
  tripType: 'private'; // 100% Private Trip
  createdAt: string;
  updatedAt: string;
  images?: PackageImage[];
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minSpend: number;
  maxUsageLimit: number;
  currentUsageCount: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  itemType: 'package' | 'addon';
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  metadata?: Record<string, any>;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  accessToken: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes?: string;
  departureDate: string; // YYYY-MM-DD langsung ditentukan konsumen
  packageId: string;
  participantsCount: number;
  pickupLocation: string;
  subtotal: number;
  addonTotal: number;
  discountTotal: number;
  totalAmount: number;
  
  // DP vs Lunas
  paymentTier: PaymentTier; // 'full' (Lunas) | 'dp' (Baru DP)
  dpAmount: number;
  paidAmount: number;
  remainingBalance: number;
  
  appliedPromoCode?: string;
  status: BookingStatus;
  paymentExpiry: string;
  cancelledReason?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: BookingItem[];
  tourPackage?: TourPackage;
  payment?: Payment;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: 'midtrans';
  transactionId?: string;
  orderId: string;
  paymentType?: string;
  grossAmount: number;
  status: PaymentStatus;
  snapToken?: string;
  snapRedirectUrl?: string;
  settlementTime?: string;
  expiryTime?: string;
  rawResponse?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEvent {
  id: string;
  paymentId?: string;
  orderId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
  isProcessed: boolean;
  processedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  author: string;
  category: string;
  summary: string;
  content: string;
  imageUrl: string;
  readTimeMinutes: number;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PageViewEvent {
  id: string;
  path: string;
  userAgent?: string;
  ip?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timestamp: string;
}

export interface SiteSettings {
  id: string;
  companyName: string;
  brandName: string;
  logoUrl?: string;       // Custom website logo URL
  faviconUrl?: string;    // Custom browser tab icon URL
  nibNumber: string;
  licenseNumber: string;
  officeAddress: string;
  whatsappNumber: string;
  supportEmail: string;
  customerServiceHours: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  paymentTimeoutMinutes: number;
  
  // Editable footer lists
  featuredDestinations: string[];
  infoAndPolicies: { label: string; path: string }[];
}

export interface CreateBookingRequest {
  packageSlug: string;
  departureDate: string; // Tanggal ditentukan langsung oleh konsumen
  participantsCount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes?: string;
  pickupLocation: string;
  paymentTier?: PaymentTier;
  selectedAddons?: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  promoCode?: string;
}
