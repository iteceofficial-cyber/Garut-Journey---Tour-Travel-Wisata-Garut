export type BookingStatus = 'pending_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
export type PaymentStatus = 'pending' | 'settlement' | 'capture' | 'deny' | 'expire' | 'cancel' | 'refund';
export type PaymentTier = 'full' | 'dp';

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
  tripType?: 'private';
  images?: PackageImage[];
}

export interface BookingItem {
  id: string;
  bookingId: string;
  itemType: 'package' | 'addon';
  itemName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
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
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  accessToken: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNotes?: string;
  departureDate: string;
  packageId: string;
  participantsCount: number;
  pickupLocation: string;
  subtotal: number;
  addonTotal: number;
  discountTotal: number;
  totalAmount: number;
  
  paymentTier: PaymentTier;
  dpAmount: number;
  paidAmount: number;
  remainingBalance: number;
  
  appliedPromoCode?: string;
  status: BookingStatus;
  paymentExpiry: string;
  cancelledReason?: string;
  confirmedAt?: string;
  createdAt: string;
  items?: BookingItem[];
  tourPackage?: TourPackage;
  payment?: Payment;
  whatsAppHelpLink?: string;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  isActive?: boolean;
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
  updatedAt?: string;
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

export interface SiteSettings {
  id: string;
  companyName: string;
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
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
  
  // Website SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  robotsTxtContent?: string;

  featuredDestinations: string[];
  infoAndPolicies: { label: string; path: string }[];
}

export interface VisitorStats {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: { path: string; count: number }[];
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  dailyViews: { date: string; count: number }[];
}
