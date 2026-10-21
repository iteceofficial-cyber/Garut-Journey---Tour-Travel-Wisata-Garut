import React, { useState, useEffect } from 'react';
import type { TourPackage, Article, GalleryItem, SiteSettings, AddonOption, PriceTier, Testimonial, PopularTripPreset, WhyChooseFeature, FAQItem } from '../types.js';
import {
  ShieldCheck,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Package,
  Layers,
  Settings,
  Mail,
  Search,
  Filter,
  LogOut,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Trash2,
  MessageSquare,
  BookOpen,
  Camera,
  Check,
  Building,
  Edit3,
  Copy,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Printer,
  FileText,
  Eye,
  Compass,
  ArrowRight,
  ChevronRight,
  Upload,
  Tag,
  Palette,
  Star
} from 'lucide-react';
import { analyzeArticleSEO, autoOptimizeArticleSEO, type ArticleSEOAnalysis } from '../utils/seo.js';
import { downloadBookingPdf, PRESET_THEMES, applyThemeColors } from '../utils/theme.js';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'homepage_editor' | 'analytics' | 'bookings' | 'packages' | 'addons' | 'testimonials' | 'articles' | 'gallery' | 'theme_colors' | 'branding_legality' | 'seo' | 'payments'
  >('overview');

  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [addons, setAddons] = useState<AddonOption[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [invoiceCustomNote, setInvoiceCustomNote] = useState('');
  const [adminDownloadingPdf, setAdminDownloadingPdf] = useState(false);

  // WhatsApp Invoice result state
  const [generatedInvoice, setGeneratedInvoice] = useState<{
    url: string;
    rawText: string;
    phone: string;
  } | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);

  // Package activity / itinerary editing, package editing & search
  const [selectedPackageForActivities, setSelectedPackageForActivities] = useState<TourPackage | null>(null);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [packageSaving, setPackageSaving] = useState(false);
  const [newActivityDay, setNewActivityDay] = useState(1);
  const [newActivityText, setNewActivityText] = useState('');
  const [newDayNum, setNewDayNum] = useState<number>(2);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [adminPackageSearch, setAdminPackageSearch] = useState('');
  const [adminPackageCategory, setAdminPackageCategory] = useState('Semua');

  // New Package Creation state
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgCategory, setNewPkgCategory] = useState('Gunung & Alam');
  const [newPkgDestArea, setNewPkgDestArea] = useState('Garut, Jawa Barat');
  const [newPkgBasePrice, setNewPkgBasePrice] = useState<number>(550000);
  const [newPkgDays, setNewPkgDays] = useState<number>(1);
  const [newPkgNights, setNewPkgNights] = useState<number>(0);
  const [newPkgShortDesc, setNewPkgShortDesc] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgImageUrl, setNewPkgImageUrl] = useState('/src/assets/images/hero_garut_papandayan_1792431914366.jpg');
  const [newPkgInclusions, setNewPkgInclusions] = useState('Transportasi lokal Garut PP\nTiket masuk resmi & Simaksi\nPemandu lokal bersertifikat HPI\nMakan & air mineral');
  const [newPkgExclusions, setNewPkgExclusions] = useState('Transportasi dari kota asal ke Garut\nPengeluaran pribadi & belanja oleh-oleh\nTips sukarela untuk pemandu');
  const [newPkgPickupPoints, setNewPkgPickupPoints] = useState('Stasiun Garut\nTerminal Guntur\nHotel Santika / Favehotel / Area Cipanas');
  const [packageCreating, setPackageCreating] = useState(false);

  // Homepage Editor States
  const [heroBadge, setHeroBadge] = useState('');
  const [heroMainTitle, setHeroMainTitle] = useState('');
  const [heroMainSubtitle, setHeroMainSubtitle] = useState('');
  const [heroSearchPlaceholder, setHeroSearchPlaceholder] = useState('');
  const [heroShowcaseBadge, setHeroShowcaseBadge] = useState('');
  const [heroPopularTrips, setHeroPopularTrips] = useState<PopularTripPreset[]>([]);
  const [trustIndicators, setTrustIndicators] = useState<{ title: string }[]>([]);
  const [packagesSectionBadge, setPackagesSectionBadge] = useState('');
  const [packagesSectionTitle, setPackagesSectionTitle] = useState('');
  const [packagesSectionBtnText, setPackagesSectionBtnText] = useState('');
  const [whyChooseBadge, setWhyChooseBadge] = useState('');
  const [whyChooseTitle, setWhyChooseTitle] = useState('');
  const [whyChooseFeatures, setWhyChooseFeatures] = useState<WhyChooseFeature[]>([]);
  const [testimonialsSectionBadge, setTestimonialsSectionBadge] = useState('');
  const [testimonialsSectionTitle, setTestimonialsSectionTitle] = useState('');
  const [faqSectionBadge, setFaqSectionBadge] = useState('');
  const [faqSectionTitle, setFaqSectionTitle] = useState('');
  const [homepageFaqs, setHomepageFaqs] = useState<FAQItem[]>([]);
  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaSubtitle, setCtaSubtitle] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('');
  const [ctaButtonLink, setCtaButtonLink] = useState('');
  const [homepageSaving, setHomepageSaving] = useState(false);
  const [homepageSavedMsg, setHomepageSavedMsg] = useState(false);

  // Homepage Editor Local Add Form States
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [newPresetQuery, setNewPresetQuery] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState('Gunung & Alam');
  const [newTrustTitle, setNewTrustTitle] = useState('');
  const [newFeatTitle, setNewFeatTitle] = useState('');
  const [newFeatDesc, setNewFeatDesc] = useState('');
  const [newFeatIcon, setNewFeatIcon] = useState('Users');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Testimonials (Cerita Tamu) state
  const [showNewTestimonialModal, setShowNewTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testiName, setTestiName] = useState('');
  const [testiRole, setTestiRole] = useState('Wisatawan');
  const [testiCity, setTestiCity] = useState('Jakarta');
  const [testiPackage, setTestiPackage] = useState('Eksplorasi Gunung Papandayan');
  const [testiRating, setTestiRating] = useState(5);
  const [testiText, setTestiText] = useState('');
  const [testiAvatar, setTestiAvatar] = useState('');
  const [testiSaving, setTestiSaving] = useState(false);

  // Website Theme Colors state
  const [primaryColor, setPrimaryColor] = useState('#0F3827');
  const [primaryDarkColor, setPrimaryDarkColor] = useState('#0A261A');
  const [primaryHoverColor, setPrimaryHoverColor] = useState('#17523A');
  const [accentColor, setAccentColor] = useState('#C8A951');
  const [accentHoverColor, setAccentHoverColor] = useState('#B89940');
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSuccessMsg, setThemeSuccessMsg] = useState('');

  // WhatsApp Message Templates state
  const [waTemplateBooking, setWaTemplateBooking] = useState('');
  const [waTemplateInvoice, setWaTemplateInvoice] = useState('');
  const [waTemplateHelp, setWaTemplateHelp] = useState('');
  const [waTemplateGeneral, setWaTemplateGeneral] = useState('');
  const [waSaving, setWaSaving] = useState(false);
  const [waSuccessMsg, setWaSuccessMsg] = useState('');

  // File Upload Helper State
  const [uploadingImage, setUploadingImage] = useState(false);

  // Article inline image insertion & preview state
  const [showInlineImageModal, setShowInlineImageModal] = useState(false);
  const [inlineImgUrl, setInlineImgUrl] = useState('');
  const [inlineImgCaption, setInlineImgCaption] = useState('');
  const [targetArticleForInline, setTargetArticleForInline] = useState<'new' | 'edit'>('new');
  const [articlePreviewMode, setArticlePreviewMode] = useState(false);

  // Layanan Tambahan (Add-ons) state
  const [showNewAddonModal, setShowNewAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddonOption | null>(null);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState<number>(100000);
  const [addonUnit, setAddonUnit] = useState('per trip');
  const [addonDesc, setAddonDesc] = useState('');
  const [addonIsActive, setAddonIsActive] = useState(true);
  const [addonSaving, setAddonSaving] = useState(false);

  // Website Global SEO state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');
  const [seoSavedMessage, setSeoSavedMessage] = useState(false);
  const [seoDevicePreview, setSeoDevicePreview] = useState<'desktop' | 'mobile'>('desktop');

  // Article creation and edit state
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('Tips & Panduan');
  const [artAuthor, setArtAuthor] = useState('Admin Garut Journey');
  const [artSummary, setArtSummary] = useState('');
  const [artContent, setArtContent] = useState('');
  const [artImage, setArtImage] = useState('/src/assets/images/hero_garut_papandayan_1792431914366.jpg');
  const [artReadTime, setArtReadTime] = useState(4);
  const [artFocusKeyword, setArtFocusKeyword] = useState('');
  const [artMetaTitle, setArtMetaTitle] = useState('');
  const [artMetaDesc, setArtMetaDesc] = useState('');
  const [artKeywords, setArtKeywords] = useState('');
  const [editArtFocusKeyword, setEditArtFocusKeyword] = useState('');

  // Gallery creation and edit state
  const [showNewGalleryModal, setShowNewGalleryModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState('Gunung');
  const [galLocation, setGalLocation] = useState('Garut, Jawa Barat');
  const [galImage, setGalImage] = useState('/src/assets/images/hero_garut_papandayan_1792431914366.jpg');
  const [galDesc, setGalDesc] = useState('');

  // Branding, Logo & Settings state
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [footerDestinations, setFooterDestinations] = useState<string>('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [whatsappNum, setWhatsappNum] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [serviceHours, setServiceHours] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [nibNumber, setNibNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Custom In-App Delete Confirmation Modal State (replaces blocked window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => Promise<void> | void;
    isDeleting?: boolean;
  } | null>(null);

  // Custom In-App Notification Toast State (replaces blocked window.alert)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const adminToken = localStorage.getItem('gj_admin_token') || 'garut-admin-auth-2026';

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-token': adminToken };

      const [resMetrics, resAnalytics, resBookings, resPackages, resAddons, resEvents, resArticles, resGallery, resTestimonials, resSettings] =
        await Promise.all([
          fetch('/api/admin/metrics', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/analytics', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/bookings', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/packages').then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/addons', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/payments/events', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/articles').then(r => r.json()).catch(() => ({})),
          fetch('/api/gallery').then(r => r.json()).catch(() => ({})),
          fetch('/api/testimonials').then(r => r.json()).catch(() => ({})),
          fetch('/api/site-settings').then(r => r.json()).catch(() => ({}))
        ]);

      if (resMetrics.success) setMetrics(resMetrics.data);
      if (resAnalytics.success) setAnalytics(resAnalytics.data);
      if (resBookings.success) setBookings(resBookings.data);
      if (resPackages.success) setPackages(resPackages.data);
      if (resAddons.success && Array.isArray(resAddons.data)) setAddons(resAddons.data);
      if (resEvents.success) setPaymentEvents(resEvents.data);
      if (resArticles.success) setArticles(resArticles.data);
      if (resGallery.success) setGallery(resGallery.data);
      if (resTestimonials.success && Array.isArray(resTestimonials.data)) setTestimonials(resTestimonials.data);
      if (resSettings.success && resSettings.data) {
        const s = resSettings.data;
        setSiteSettings(s);
        setLogoUrl(s.logoUrl || '');
        setFaviconUrl(s.faviconUrl || '');
        setFooterDestinations((s.featuredDestinations || []).join('\n'));
        setOfficeAddress(s.officeAddress || '');
        setWhatsappNum(s.whatsappNumber || '');
        setSupportEmail(s.supportEmail || '');
        setServiceHours(s.customerServiceHours || '');
        setCompanyName(s.companyName || '');
        setNibNumber(s.nibNumber || '');
        setLicenseNumber(s.licenseNumber || '');

        // Populate Homepage Editor fields
        setHeroBadge(s.heroBadge || 'TOUR OPERATOR RESMI GARUT • 100% PRIVATE TRIP');
        setHeroMainTitle(s.heroMainTitle || 'Jelajahi Pesona Alam Garut yang Menakjubkan');
        setHeroMainSubtitle(s.heroMainSubtitle || 'Rasakan kemegahan kawah Papandayan, keheningan Kawah Kamojang, dan keindahan Situ Bagendit bersama pemandu profesional dan fasilitas perjalanan terpercaya.');
        setHeroSearchPlaceholder(s.heroSearchPlaceholder || 'Cari Papandayan, Kamojang, Bagendit, Curug...');
        setHeroShowcaseBadge(s.heroShowcaseBadge || 'GALERI FOTO RESMI GARUT');
        setHeroPopularTrips(s.heroPopularTrips || [
          { label: '🏔️ Papandayan', query: 'Papandayan', category: 'Gunung & Alam' },
          { label: '🌋 Kamojang', query: 'Kamojang', category: 'Keluarga & Relaksasi' },
          { label: '🚣 Situ Bagendit', query: 'Situ Bagendit', category: 'Budaya & Sejarah' },
          { label: '🌊 Curug Taraje', query: 'Curug Sanghyang Taraje', category: 'Petualangan Alam' },
          { label: '♨️ Darajat Pass', query: 'Darajat', category: 'Keluarga & Relaksasi' },
          { label: '🏖️ Pantai Santolo', query: 'Santolo', category: 'Petualangan Alam' },
          { label: '⭐ Semua Paket', query: '', category: 'Semua' }
        ]);
        setTrustIndicators(s.trustIndicators || [
          { title: 'Pemandu Lokal Berlisensi HPI' },
          { title: 'Jaminan Pasti Berangkat' },
          { title: 'Metode Bayar Midtrans Aman' }
        ]);
        setPackagesSectionBadge(s.packagesSectionBadge || 'Destinasi Paling Populer');
        setPackagesSectionTitle(s.packagesSectionTitle || 'Pilihan Paket Wisata Unggulan Garut');
        setPackagesSectionBtnText(s.packagesSectionBtnText || 'Jelajahi Seluruh Paket');
        setWhyChooseBadge(s.whyChooseBadge || 'Mengapa Garut Journey?');
        setWhyChooseTitle(s.whyChooseTitle || 'Standar Layanan Wisata Terbaik & Terpercaya');
        setWhyChooseFeatures(s.whyChooseFeatures || [
          {
            id: 'feat-1',
            title: 'Pemandu Lokal Bersertifikasi',
            description: 'Didampingi oleh pemandu lokal berlisensi HPI yang memahami setiap sudut rute alam, sejarah, dan titik fotografi terbaik di Garut.',
            icon: 'Users'
          },
          {
            id: 'feat-2',
            title: 'Harga Transparan Tanpa Biaya Tersembunyi',
            description: 'Biaya paket sudah mencakup tiket simaksi resmi, armada transportasi AC, makan, dan fasilitas tanpa pungutan liar di lokasi.',
            icon: 'Award'
          },
          {
            id: 'feat-3',
            title: 'Booking Instan & Terverifikasi',
            description: 'Sistem pemesanan online terintegrasi langsung dengan gateway pembayaran Midtrans dengan konfirmasi instan dan E-Ticket resmi.',
            icon: 'ShieldCheck'
          },
          {
            id: 'feat-4',
            title: '100% Private Trip Fleksibel',
            description: 'Perjalanan privat eksklusif untuk Anda dan rombongan tanpa digabung peserta lain, dengan tanggal dan penjemputan bebas Anda tentukan.',
            icon: 'Calendar'
          }
        ]);
        setTestimonialsSectionBadge(s.testimonialsSectionBadge || 'Cerita Pengalaman Tamu');
        setTestimonialsSectionTitle(s.testimonialsSectionTitle || 'Ulasan Nyata dari Wisatawan Garut Journey');
        setFaqSectionBadge(s.faqSectionBadge || 'Pertanyaan Umum');
        setFaqSectionTitle(s.faqSectionTitle || 'Informasi Penting Sebelum Memulai Perjalanan');
        setHomepageFaqs(s.faqs || [
          {
            q: 'Bagaimana alur pemesanan dan pembayaran di Garut Journey?',
            a: 'Pilih paket dan tanggal keberangkatan yang diinginkan, tentukan jumlah peserta, isi data diri, lalu lanjutkan ke pembayaran resmi via Midtrans Snap. Sistem akan mengunci kapasitas Anda secara otomatis dan mengirimkan E-Ticket ke email Anda.'
          },
          {
            q: 'Apakah harga sudah termasuk tiket masuk seluruh objek wisata?',
            a: 'Ya, seluruh harga paket Garut Journey bersifat transparan dan telah mencakup tiket masuk resmi destinasi (Simaksi Papandayan, Situ Bagendit, Cangkuang, Kawah Kamojang), armada transportasi lokal, pemandu wisata bersertifikat, dan konsumsi sesuai rincian itinerary.'
          },
          {
            q: 'Apakah pemula atau anak-anak aman mendaki Gunung Papandayan?',
            a: 'Sangat aman. Gunung Papandayan dikenal memiliki kontur jalur pendakian yang landai dan teratur. Tim pemandu kami berpengalaman mendampingi pendaki pemula, keluarga, serta menyediakan perlengkapan keselamatan P3K.'
          },
          {
            q: 'Bagaimana jika saya perlu menjadwal ulang atau membatalkan pesanan?',
            a: 'Penjadwalan ulang dapat dilakukan selambat-lambatnya H-5 sebelum tanggal trip tanpa biaya tambahan, tergantung ketersediaan kuota. Kebijakan pembatalan dan refund tertera lengkap pada halaman Kebijakan Pembatalan.'
          }
        ]);
        setCtaTitle(s.ctaTitle || 'Siap Berpetualang di Garut?');
        setCtaSubtitle(s.ctaSubtitle || 'Konsultasikan rencana perjalanan Anda atau pilih paket wisata favorit sekarang bersama pemandu lokal terpercaya.');
        setCtaButtonText(s.ctaButtonText || 'Jelajahi Paket Wisata');
        setCtaButtonLink(s.ctaButtonLink || '/paket-wisata');

        // Populate Theme Colors
        setPrimaryColor(s.primaryColor || '#0F3827');
        setPrimaryDarkColor(s.primaryDarkColor || '#0A261A');
        setPrimaryHoverColor(s.primaryHoverColor || '#17523A');
        setAccentColor(s.accentColor || '#C8A951');
        setAccentHoverColor(s.accentHoverColor || '#B89940');

        // Populate WhatsApp Templates
        setWaTemplateBooking(s.whatsappTemplateBooking || 'Halo Tim Garut Journey, saya baru saja membuat pesanan #{bookingNumber} untuk paket {packageName}. Mohon informasi tindak lanjutnya. Terima kasih!');
        setWaTemplateInvoice(s.whatsappTemplateInvoice || '*INVOICE & E-TICKET RESMI GARUT JOURNEY*\nNomor Pesanan: #{bookingNumber}\nNama Tamu: {customerName}\nPaket: {packageName}\nTanggal Trip: {departureDate}\nPeserta: {participantsCount} Orang\nStatus Pembayaran: {status}\nTotal Biaya: Rp {totalAmount}\nSudah Dibayar: Rp {paidAmount}\nSisa Pelunasan: Rp {remainingBalance}\n\nE-Ticket Digital: {ticketUrl}\n\n{customNote}\nTerima kasih telah mempercayakan liburan Garut Anda bersama kami!');
        setWaTemplateHelp(s.whatsappTemplateHelp || 'Halo Admin Garut Journey, saya ingin konfirmasi pesanan wisata:\n- No. Booking: {bookingNumber}\n- Atas Nama: {customerName}\n- Paket: {packageName}\nMohon informasi persiapan perjalanannya. Terima kasih!');
        setWaTemplateGeneral(s.whatsappTemplateGeneral || 'Halo Tim Garut Journey, saya ingin konsultasi paket wisata Garut.');
        
        // Populate SEO fields
        setMetaTitle(s.metaTitle || 'Garut Journey – Jelajahi Keindahan Wisata Garut');
        setMetaDescription(s.metaDescription || 'Temukan pengalaman wisata Garut yang berkesan melalui paket perjalanan praktis, nyaman, dan mudah dipesan secara online. Papandayan, Kamojang, Bagendit.');
        setMetaKeywords(s.metaKeywords || 'Wisata Garut, Paket Wisata Garut, Tour Garut, Garut City Tour, Private Trip Garut');
        setCanonicalUrl(s.canonicalUrl || 'https://garutjourney.id');
        setOgImageUrl(s.ogImageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg');
        setRobotsTxt(s.robotsTxtContent || 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /booking/\nDisallow: /pembayaran/\nDisallow: /api/\n\nSitemap: https://garutjourney.id/sitemap.xml');
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId: string, operationalStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ operationalStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking({ ...selectedBooking, status: operationalStatus });
        }
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  const handleDeleteBooking = (bookingId: string, bookingCode?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Pesanan Booking',
      message: 'Apakah Anda yakin ingin menghapus pesanan ini secara permanen dari sistem? Seluruh riwayat transaksi akan dihapus.',
      itemName: bookingCode ? `Kode Booking: ${bookingCode}` : `ID: ${bookingId}`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            setSelectedBooking(null);
            setGeneratedInvoice(null);
            fetchAllData();
            showToast('Pesanan booking berhasil dihapus.', 'success');
          } else {
            showToast(json.error || 'Gagal menghapus pesanan.', 'error');
          }
        } catch {
          showToast('Koneksi server gagal.', 'error');
        }
      }
    });
  };

  // WhatsApp Invoice Generator & Link Handler (FIXED)
  const handleSendWhatsAppInvoice = async (bookingId: string) => {
    setSendingInvoice(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/whatsapp-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ customNote: invoiceCustomNote })
      });
      const json = await res.json();
      if (json.success) {
        const rawUrl = typeof json.whatsAppInvoiceUrl === 'string'
          ? json.whatsAppInvoiceUrl
          : json.whatsAppInvoiceUrl?.url;
        
        const invoiceData = {
          url: rawUrl,
          rawText: json.rawText || '',
          phone: json.phone || ''
        };
        setGeneratedInvoice(invoiceData);

        // Try direct window open
        if (rawUrl) {
          try {
            window.open(rawUrl, '_blank', 'noopener,noreferrer');
          } catch {
            // Popup blocker might block, but invoiceData is displayed right on screen
          }
        }
      } else {
        alert(json.error || 'Gagal membuat invoice WhatsApp.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setSendingInvoice(false);
    }
  };

  // Activity Itinerary Management
  const handleDeleteActivity = (packageId: string, day: number, activityIndex: number, text?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Aktivitas Jadwal',
      message: `Hapus aktivitas ini dari jadwal perjalanan Hari ke-${day}?`,
      itemName: text || `Aktivitas Urutan #${activityIndex + 1}`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/packages/${packageId}/activities`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': adminToken
            },
            body: JSON.stringify({ day, activityIndex })
          });
          const json = await res.json();
          if (json.success) {
            fetchAllData();
            if (selectedPackageForActivities) {
              const updatedItin = [...selectedPackageForActivities.itinerary];
              const dItem = updatedItin.find(it => it.day === day);
              if (dItem) {
                dItem.activities.splice(activityIndex, 1);
                setSelectedPackageForActivities({ ...selectedPackageForActivities, itinerary: updatedItin });
              }
            }
            showToast('Aktivitas berhasil dihapus.', 'success');
          } else {
            showToast(json.error || 'Gagal menghapus aktivitas.', 'error');
          }
        } catch {
          showToast('Gagal menghapus aktivitas.', 'error');
        }
      }
    });
  };

  const handleAddActivity = async (packageId: string) => {
    if (!newActivityText.trim()) return;
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ day: newActivityDay, activityText: newActivityText })
      });
      const json = await res.json();
      if (json.success) {
        setNewActivityText('');
        fetchAllData();
        if (selectedPackageForActivities) {
          const updatedItin = [...selectedPackageForActivities.itinerary];
          let dItem = updatedItin.find(it => it.day === newActivityDay);
          if (!dItem) {
            dItem = { day: newActivityDay, title: `Hari ke-${newActivityDay}`, activities: [] };
            updatedItin.push(dItem);
          }
          dItem.activities.push(newActivityText.trim());
          setSelectedPackageForActivities({ ...selectedPackageForActivities, itinerary: updatedItin });
        }
      }
    } catch {
      alert('Gagal menambahkan aktivitas.');
    }
  };

  // Homepage Editor Presets, Trust, Features & FAQs Handlers
  const handleAddPopularPreset = () => {
    if (!newPresetLabel.trim() || !newPresetQuery.trim()) {
      alert('Label tombol dan kata kunci pencarian wajib diisi.');
      return;
    }
    setHeroPopularTrips(prev => [
      ...prev,
      { label: newPresetLabel.trim(), query: newPresetQuery.trim(), category: newPresetCategory }
    ]);
    setNewPresetLabel('');
    setNewPresetQuery('');
  };

  const handleRemovePopularPreset = (index: number) => {
    setHeroPopularTrips(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddTrustIndicator = () => {
    if (!newTrustTitle.trim()) return;
    setTrustIndicators(prev => [...prev, { title: newTrustTitle.trim() }]);
    setNewTrustTitle('');
  };

  const handleRemoveTrustIndicator = (index: number) => {
    setTrustIndicators(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddWhyChooseFeature = () => {
    if (!newFeatTitle.trim() || !newFeatDesc.trim()) {
      alert('Judul dan deskripsi keunggulan wajib diisi.');
      return;
    }
    setWhyChooseFeatures(prev => [
      ...prev,
      {
        id: 'feat-' + Date.now(),
        title: newFeatTitle.trim(),
        description: newFeatDesc.trim(),
        icon: newFeatIcon
      }
    ]);
    setNewFeatTitle('');
    setNewFeatDesc('');
  };

  const handleRemoveWhyChooseFeature = (id: string) => {
    setWhyChooseFeatures(prev => prev.filter(f => f.id !== id));
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) {
      alert('Pertanyaan dan jawaban FAQ wajib diisi.');
      return;
    }
    setHomepageFaqs(prev => [...prev, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (index: number) => {
    setHomepageFaqs(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddDayToItinerary = async (packageId: string) => {
    if (!selectedPackageForActivities) return;
    const nextDayNum = (selectedPackageForActivities.itinerary?.length || 0) + 1;
    const dayTitle = newDayTitle.trim() || `Hari ke-${nextDayNum}: Eksplorasi Lanjutan`;
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken },
        body: JSON.stringify({ day: nextDayNum, title: dayTitle })
      });
      const json = await res.json();
      if (json.success) {
        setNewDayTitle('');
        fetchAllData();
        const updatedItin = [
          ...selectedPackageForActivities.itinerary,
          { day: nextDayNum, title: dayTitle, activities: [] }
        ];
        setSelectedPackageForActivities({
          ...selectedPackageForActivities,
          durationDays: Math.max(selectedPackageForActivities.durationDays, nextDayNum),
          itinerary: updatedItin
        });
      } else {
        alert(json.error || 'Gagal menambahkan hari itinerary.');
      }
    } catch {
      alert('Koneksi server gagal.');
    }
  };

  const handleDeleteDayFromItinerary = (packageId: string, day: number) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Rencana Hari',
      message: `Hapus seluruh rencana Hari ke-${day} beserta semua aktivitas di dalamnya?`,
      itemName: `Hari ke-${day}`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/packages/${packageId}/days/${day}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            fetchAllData();
            if (selectedPackageForActivities) {
              const updatedItin = selectedPackageForActivities.itinerary.filter(it => it.day !== day);
              setSelectedPackageForActivities({ ...selectedPackageForActivities, itinerary: updatedItin });
            }
            showToast(`Hari ke-${day} berhasil dihapus dari itinerary.`, 'success');
          } else {
            showToast(json.error || 'Gagal menghapus hari.', 'error');
          }
        } catch {
          showToast('Koneksi server gagal.', 'error');
        }
      }
    });
  };

  // Article Actions (Create, Edit, Delete)
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          title: artTitle,
          category: artCategory,
          author: artAuthor,
          summary: artSummary || artContent.slice(0, 150),
          content: artContent,
          imageUrl: artImage,
          readTimeMinutes: artReadTime,
          metaTitle: artMetaTitle || `${artTitle} | Garut Journey`,
          metaDescription: artMetaDesc || artSummary || artContent.slice(0, 150),
          keywords: artKeywords || artFocusKeyword
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowNewArticleModal(false);
        setArtTitle('');
        setArtContent('');
        setArtSummary('');
        setArtFocusKeyword('');
        setArtMetaTitle('');
        setArtMetaDesc('');
        setArtKeywords('');
        fetchAllData();
      }
    } catch {
      alert('Gagal membuat artikel.');
    }
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle({ ...art });
    setEditArtFocusKeyword(art.keywords?.split(',')[0]?.trim() || '');
  };

  // Reusable File Upload to Server Disk (/api/upload -> /uploads/...)
  const uploadFileToServer = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          image: base64Data,
          filename: file.name
        })
      });

      const json = await res.json();
      if (json.success && json.url) {
        return json.url;
      } else {
        alert(json.error || 'Gagal mengupload gambar.');
        return null;
      }
    } catch (err: any) {
      alert('Gagal menghubungi server upload: ' + err.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Package Tier Editing Handlers
  const handleOpenEditPackage = (pkg: TourPackage) => {
    const defaultTiers: PriceTier[] = [
      { minParticipants: 1, maxParticipants: 1, pricePerPerson: Math.round((pkg.basePrice * 1.95) / 5000) * 5000, label: '1 Orang (Solo Private)' },
      { minParticipants: 2, maxParticipants: 2, pricePerPerson: Math.round((pkg.basePrice * 1.35) / 5000) * 5000, label: '2 Orang (Duo / Berdua)' },
      { minParticipants: 3, maxParticipants: 3, pricePerPerson: Math.round((pkg.basePrice * 1.12) / 5000) * 5000, label: '3 Orang (Trio / Bertiga)' },
      { minParticipants: 4, maxParticipants: 5, pricePerPerson: pkg.basePrice, label: '4–5 Orang (Rombongan Kecil)' },
      { minParticipants: 6, maxParticipants: 10, pricePerPerson: Math.round((pkg.basePrice * 0.86) / 5000) * 5000, label: '6–10 Orang (Hemat Rombongan)' },
      { minParticipants: 11, maxParticipants: 20, pricePerPerson: Math.round((pkg.basePrice * 0.75) / 5000) * 5000, label: '11–20 Orang (Grup Besar)' }
    ];
    setEditingPackage({
      ...pkg,
      priceTiers: pkg.priceTiers && pkg.priceTiers.length > 0 ? JSON.parse(JSON.stringify(pkg.priceTiers)) : defaultTiers
    });
  };

  const handleAutoCalculatePackageTiers = () => {
    if (!editingPackage) return;
    const bp = Number(editingPackage.basePrice) || 300000;
    const computedTiers: PriceTier[] = [
      { minParticipants: 1, maxParticipants: 1, pricePerPerson: Math.round((bp * 1.95) / 5000) * 5000, label: '1 Orang (Solo Private)' },
      { minParticipants: 2, maxParticipants: 2, pricePerPerson: Math.round((bp * 1.35) / 5000) * 5000, label: '2 Orang (Duo / Berdua)' },
      { minParticipants: 3, maxParticipants: 3, pricePerPerson: Math.round((bp * 1.12) / 5000) * 5000, label: '3 Orang (Trio / Bertiga)' },
      { minParticipants: 4, maxParticipants: 5, pricePerPerson: bp, label: '4–5 Orang (Rombongan Kecil)' },
      { minParticipants: 6, maxParticipants: 10, pricePerPerson: Math.round((bp * 0.86) / 5000) * 5000, label: '6–10 Orang (Hemat Rombongan)' },
      { minParticipants: 11, maxParticipants: 20, pricePerPerson: Math.round((bp * 0.75) / 5000) * 5000, label: '11–20 Orang (Grup Besar)' }
    ];
    setEditingPackage({
      ...editingPackage,
      priceTiers: computedTiers
    });
  };

  const handleSaveEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    setPackageSaving(true);
    try {
      const res = await fetch(`/api/admin/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(editingPackage)
      });
      const json = await res.json();
      if (json.success) {
        setEditingPackage(null);
        fetchAllData();
        alert('Data paket wisata & pilihan harga bertingkat berhasil disimpan secara permanen!');
      } else {
        alert(json.error || 'Gagal menyimpan paket.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setPackageSaving(false);
    }
  };

  // Create New Package
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) {
      alert('Nama paket wisata wajib diisi.');
      return;
    }
    setPackageCreating(true);
    try {
      const incList = newPkgInclusions.split('\n').map(s => s.trim()).filter(Boolean);
      const excList = newPkgExclusions.split('\n').map(s => s.trim()).filter(Boolean);
      const pickupList = newPkgPickupPoints.split('\n').map(s => s.trim()).filter(Boolean);

      const payload = {
        name: newPkgName.trim(),
        category: newPkgCategory,
        destinationArea: newPkgDestArea.trim(),
        basePrice: Number(newPkgBasePrice) || 350000,
        durationDays: Number(newPkgDays) || 1,
        durationNights: Number(newPkgNights) || 0,
        shortDescription: newPkgShortDesc.trim() || newPkgName,
        description: newPkgDesc.trim() || newPkgShortDesc || newPkgName,
        imageUrl: newPkgImageUrl.trim(),
        inclusions: incList,
        exclusions: excList,
        pickupPoints: pickupList,
        isPublished: true,
        itinerary: [
          {
            day: 1,
            title: `Hari 1: Eksplorasi ${newPkgName}`,
            activities: [
              '08.00 - Penjemputan di lokasi meeting point Garut',
              '09.30 - Perjalanan dan briefing keselamatan bersama pemandu lokal',
              '12.00 - Makan siang khas Sunda dan waktu istirahat',
              '16.00 - Menikmati pesona destinasi dan foto bersama',
              '17.30 - Pengantaran kembali ke titik awal. Tour selesai.'
            ]
          }
        ]
      };

      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setShowNewPackageModal(false);
        setNewPkgName('');
        setNewPkgShortDesc('');
        setNewPkgDesc('');
        fetchAllData();
        alert('Paket wisata baru berhasil ditambahkan!');
      } else {
        alert(json.error || 'Gagal menambahkan paket wisata.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setPackageCreating(false);
    }
  };

  // Delete Package
  const handleDeletePackage = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Paket Wisata',
      message: `Hapus paket wisata "${name}" secara permanen dari sistem? Seluruh pengaturan, pilihan harga bertingkat, dan itinerary paket ini akan dihapus.`,
      itemName: name,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/packages/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            setEditingPackage(null);
            fetchAllData();
            showToast(`Paket wisata "${name}" berhasil dihapus.`, 'success');
          } else {
            showToast(json.error || 'Gagal menghapus paket wisata.', 'error');
          }
        } catch {
          showToast('Koneksi server gagal.', 'error');
        }
      }
    });
  };

  // Homepage Settings Save Handler
  const handleSaveHomepageSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setHomepageSaving(true);
    try {
      const payload = {
        heroBadge,
        heroMainTitle,
        heroMainSubtitle,
        heroSearchPlaceholder,
        heroShowcaseBadge,
        heroPopularTrips,
        trustIndicators,
        packagesSectionBadge,
        packagesSectionTitle,
        packagesSectionBtnText,
        whyChooseBadge,
        whyChooseTitle,
        whyChooseFeatures,
        testimonialsSectionBadge,
        testimonialsSectionTitle,
        faqSectionBadge,
        faqSectionTitle,
        faqs: homepageFaqs,
        ctaTitle,
        ctaSubtitle,
        ctaButtonText,
        ctaButtonLink
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setHomepageSavedMsg(true);
        setTimeout(() => setHomepageSavedMsg(false), 3500);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal menyimpan pengaturan beranda.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setHomepageSaving(false);
    }
  };

  // Testimonials CRUD Handlers
  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiName.trim() || !testiText.trim()) {
      alert('Nama dan isi testimoni ulasan wajib diisi.');
      return;
    }
    setTestiSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          name: testiName.trim(),
          role: testiRole.trim(),
          city: testiCity.trim(),
          package: testiPackage.trim(),
          rating: Number(testiRating) || 5,
          text: testiText.trim(),
          avatarUrl: testiAvatar.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowNewTestimonialModal(false);
        setTestiName('');
        setTestiText('');
        setTestiAvatar('');
        fetchAllData();
      } else {
        alert(json.error || 'Gagal menambahkan testimoni.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setTestiSaving(false);
    }
  };

  const handleOpenEditTestimonial = (item: Testimonial) => {
    setEditingTestimonial({ ...item });
  };

  const handleSaveEditTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    setTestiSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${editingTestimonial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(editingTestimonial)
      });
      const json = await res.json();
      if (json.success) {
        setEditingTestimonial(null);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal memperbarui testimoni.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setTestiSaving(false);
    }
  };

  const handleDeleteTestimonial = (id: string, author?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Cerita Pengalaman Tamu',
      message: 'Hapus cerita pengalaman tamu ini dari daftar ulasan website?',
      itemName: author ? `Ulasan dari ${author}` : undefined,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/testimonials/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            fetchAllData();
            showToast('Testimoni berhasil dihapus.', 'success');
          } else {
            showToast(json.error || 'Gagal menghapus testimoni.', 'error');
          }
        } catch {
          showToast('Koneksi server gagal.', 'error');
        }
      }
    });
  };

  // Theme & WhatsApp Templates Save Handler
  const handleSaveThemeAndWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setThemeSaving(true);
    try {
      const payload = {
        primaryColor,
        primaryDarkColor,
        primaryHoverColor,
        accentColor,
        accentHoverColor,
        whatsappTemplateBooking: waTemplateBooking,
        whatsappTemplateInvoice: waTemplateInvoice,
        whatsappTemplateHelp: waTemplateHelp,
        whatsappTemplateGeneral: waTemplateGeneral
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setThemeSuccessMsg('Pengaturan tema warna & template pesan WhatsApp berhasil disimpan!');
        setTimeout(() => setThemeSuccessMsg(''), 3500);
        applyThemeColors(payload);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal menyimpan tema.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setThemeSaving(false);
    }
  };

  // Insert Inline Image into Article Content (Markdown format: ![caption](url))
  const handleInsertInlineImage = (url: string, caption: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    const cleanCaption = (caption || 'Pemandangan Garut').trim();
    const markdownImg = `\n\n![${cleanCaption}](${cleanUrl})\n\n`;

    if (targetArticleForInline === 'new') {
      setArtContent(prev => prev + markdownImg);
    } else if (editingArticle) {
      setEditingArticle({
        ...editingArticle,
        content: editingArticle.content + markdownImg
      });
    }
    setShowInlineImageModal(false);
    setInlineImgUrl('');
    setInlineImgCaption('');
  };

  // SEO Optimization with 100% Green Guarantee
  const handleAutoOptimizeNewArticle = () => {
    if (!artTitle.trim() && !artContent.trim()) {
      alert('Isi judul atau konten artikel terlebih dahulu sebelum koreksi SEO.');
      return;
    }
    const result = autoOptimizeArticleSEO({
      title: artTitle,
      content: artContent,
      category: artCategory,
      focusKeyword: artFocusKeyword
    });
    setArtFocusKeyword(result.optimizedFocusKeyword);
    setArtTitle(result.optimizedTitle);
    setArtMetaTitle(result.optimizedTitle);
    setArtMetaDesc(result.optimizedDescription);
    setArtKeywords(result.suggestedKeywords);
    setArtContent(result.optimizedContent);
    setArtReadTime(result.readTimeMinutes);
  };

  const handleAutoOptimizeEditArticle = () => {
    if (!editingArticle) return;
    const result = autoOptimizeArticleSEO({
      title: editingArticle.title,
      content: editingArticle.content,
      category: editingArticle.category,
      focusKeyword: editArtFocusKeyword
    });
    setEditArtFocusKeyword(result.optimizedFocusKeyword);
    setEditingArticle({
      ...editingArticle,
      title: result.optimizedTitle,
      metaTitle: result.optimizedTitle,
      metaDescription: result.optimizedDescription,
      content: result.optimizedContent,
      keywords: result.suggestedKeywords,
      readTimeMinutes: result.readTimeMinutes
    });
  };

  const handleSaveEditArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    try {
      const res = await fetch(`/api/admin/articles/${editingArticle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(editingArticle)
      });
      const json = await res.json();
      if (json.success) {
        setEditingArticle(null);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal memperbarui artikel.');
      }
    } catch {
      alert('Koneksi server gagal.');
    }
  };

  const handleDeleteArticle = (id: string, title?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Artikel Wisata',
      message: 'Hapus artikel ini secara permanen dari blog & panduan wisata website?',
      itemName: title,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/articles/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            fetchAllData();
            showToast('Artikel berhasil dihapus.', 'success');
          } else {
            showToast(json.error || 'Gagal menghapus artikel.', 'error');
          }
        } catch {
          showToast('Gagal menghapus artikel.', 'error');
        }
      }
    });
  };

  // Gallery Actions (Create, Edit, Delete)
  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          title: galTitle,
          category: galCategory,
          location: galLocation,
          imageUrl: galImage,
          description: galDesc
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowNewGalleryModal(false);
        setGalTitle('');
        setGalDesc('');
        fetchAllData();
      }
    } catch {
      alert('Gagal menambah foto galeri.');
    }
  };

  const handleOpenEditGallery = (item: GalleryItem) => {
    setEditingGallery({ ...item });
  };

  const handleSaveEditGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    try {
      const res = await fetch(`/api/admin/gallery/${editingGallery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(editingGallery)
      });
      const json = await res.json();
      if (json.success) {
        setEditingGallery(null);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal memperbarui foto.');
      }
    } catch {
      alert('Koneksi server gagal.');
    }
  };

  const handleDeleteGallery = (id: string, title?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Foto Galeri',
      message: 'Hapus foto dokumentasi ini dari galeri website?',
      itemName: title,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/gallery/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            fetchAllData();
            showToast('Foto galeri berhasil dihapus.', 'success');
          } else {
            showToast(json.error || 'Gagal menghapus foto.', 'error');
          }
        } catch {
          showToast('Gagal menghapus foto.', 'error');
        }
      }
    });
  };

  // Clear Activity Logs (Audits, Views, Emails)
  const handleClearAllActivities = () => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Bersihkan Semua Log Aktivitas',
      message: 'Apakah Anda yakin ingin MENGHAPUS SEMUA log aktivitas (audit transaksi Midtrans, riwayat pengunjung, dan log email)? Data pesanan tidak akan terhapus.',
      itemName: 'Log Pengunjung & Audit Aktivitas',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/activities/clear', {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            showToast('Semua log aktivitas berhasil dibersihkan.', 'success');
            fetchAllData();
          } else {
            showToast(json.error || 'Gagal membersihkan log.', 'error');
          }
        } catch {
          showToast('Koneksi server gagal.', 'error');
        }
      }
    });
  };

  // Addons (Layanan Tambahan) CRUD Handlers
  const handleCreateAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddonSaving(true);
    try {
      const res = await fetch('/api/admin/addons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          name: addonName,
          price: addonPrice,
          unit: addonUnit,
          description: addonDesc,
          isActive: addonIsActive
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowNewAddonModal(false);
        setAddonName('');
        setAddonPrice(100000);
        setAddonDesc('');
        setAddonUnit('per trip');
        fetchAllData();
      } else {
        alert(json.error || 'Gagal menambahkan layanan tambahan.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setAddonSaving(false);
    }
  };

  const handleOpenEditAddon = (item: AddonOption) => {
    setEditingAddon({ ...item });
  };

  const handleSaveEditAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon) return;
    setAddonSaving(true);
    try {
      const res = await fetch(`/api/admin/addons/${editingAddon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          name: editingAddon.name,
          price: editingAddon.price,
          unit: editingAddon.unit,
          description: editingAddon.description,
          isActive: editingAddon.isActive
        })
      });
      const json = await res.json();
      if (json.success) {
        setEditingAddon(null);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal memperbarui layanan tambahan.');
      }
    } catch {
      alert('Koneksi server gagal.');
    } finally {
      setAddonSaving(false);
    }
  };

  const handleToggleAddonActive = async (addon: AddonOption) => {
    try {
      const res = await fetch(`/api/admin/addons/${addon.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ isActive: !addon.isActive })
      });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      } else {
        alert(json.error || 'Gagal memperbarui status layanan.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    }
  };

  const handleDeleteAddon = (id: string, name?: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: 'Hapus Layanan Tambahan (Add-on)',
      message: 'Hapus layanan tambahan ini dari sistem penawaran wisata?',
      itemName: name,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/addons/${id}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': adminToken }
          });
          const json = await res.json();
          if (json.success) {
            fetchAllData();
            showToast('Layanan tambahan berhasil dihapus.', 'success');
          } else {
            showToast(json.error || 'Gagal menghapus layanan tambahan.', 'error');
          }
        } catch {
          showToast('Koneksi server gagal.', 'error');
        }
      }
    });
  };

  // SEO Save Handler
  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogImageUrl,
        robotsTxtContent: robotsTxt
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSeoSavedMessage(true);
        setTimeout(() => setSeoSavedMessage(false), 3000);
        fetchAllData();
      } else {
        alert(json.error || 'Gagal menyimpan pengaturan SEO.');
      }
    } catch {
      alert('Koneksi server gagal.');
    }
  };

  // Save Settings, Logo, and Favicon
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const destList = footerDestinations
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        logoUrl,
        faviconUrl,
        officeAddress,
        whatsappNumber: whatsappNum.replace(/[^0-9]/g, ''),
        supportEmail,
        customerServiceHours: serviceHours,
        companyName,
        nibNumber,
        licenseNumber,
        featuredDestinations: destList
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSettingsSavedMessage(true);
        setTimeout(() => setSettingsSavedMessage(false), 3000);
        fetchAllData();
        // Dynamically update favicon if provided
        if (faviconUrl) {
          let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
          if (link) link.href = faviconUrl;
        }
      }
    } catch {
      alert('Gagal menyimpan pengaturan.');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase().trim();
      return (
        (b.bookingNumber ? b.bookingNumber.toLowerCase().includes(q) : false) ||
        (b.customerName ? b.customerName.toLowerCase().includes(q) : false) ||
        (b.customerPhone ? b.customerPhone.includes(q) : false) ||
        (b.customerEmail ? b.customerEmail.toLowerCase().includes(q) : false)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      {/* Admin Top Header */}
      <div className="bg-[#0A261A] text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#17523A] flex items-center justify-center text-[#C8A951]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-base text-stone-100">
                Garut Journey Portal Admin
              </span>
              <span className="text-[10px] text-[#C8A951] uppercase tracking-widest block font-medium">
                Sistem Operasional, Kwitansi WhatsApp & CMS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-stone-400 hidden sm:inline">admin@garutjourney.id</span>
            <button
              onClick={fetchAllData}
              title="Perbarui Data"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-medium border-t border-stone-800/60 py-1">
          {[
            { id: 'overview', label: 'Ringkasan & KPI', icon: TrendingUp },
            { id: 'homepage_editor', label: 'Edit Dashboard Beranda', icon: Compass },
            { id: 'bookings', label: 'Manajemen Booking', icon: Calendar },
            { id: 'packages', label: 'Paket & Aktivitas', icon: Package },
            { id: 'addons', label: 'Layanan Tambahan', icon: Layers },
            { id: 'testimonials', label: 'Cerita & Ulasan Tamu', icon: MessageSquare },
            { id: 'articles', label: 'Artikel & Blog', icon: BookOpen },
            { id: 'gallery', label: 'Galeri Foto', icon: Camera },
            { id: 'theme_colors', label: 'Warna Tema & WhatsApp', icon: Palette },
            { id: 'branding_legality', label: 'Logo & Legalitas', icon: Building },
            { id: 'seo', label: 'Pengaturan SEO', icon: Globe },
            { id: 'analytics', label: 'Laporan Pengunjung', icon: BarChart3 },
            { id: 'payments', label: 'Audit & Log Sistem', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Pendapatan Terverifikasi
                </span>
                <div className="text-2xl font-bold font-mono text-[#0F3827] tabular-nums">
                  Rp {(metrics?.verifiedRevenue || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Transaksi lunas & DP Midtrans</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Pembayaran Berhasil
                </span>
                <div className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                  {metrics?.paymentsSuccessful || 0}
                </div>
                <p className="text-[11px] text-stone-500 pt-1">Settlement tervalidasi</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Holding Kuota Pending
                </span>
                <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
                  {metrics?.paymentsPending || 0}
                </div>
                <p className="text-[11px] text-stone-500 pt-1">Menunggu bayar</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Total Pengunjung Website
                </span>
                <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                  {analytics?.totalPageViews || 0}
                </div>
                <p className="text-[11px] text-stone-500 pt-1">
                  {analytics?.todayViews || 0} kunjungan hari ini
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings Summary */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                  Pesanan Terbaru (Private Trip)
                </h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-[#0F3827] font-semibold hover:underline"
                >
                  Lihat Semua Pesanan →
                </button>
              </div>

              {bookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">Belum ada pesanan masuk.</div>
              ) : (
                <div className="divide-y divide-stone-100 text-xs">
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-stone-900 mr-2">{b.bookingNumber}</span>
                        <span className="text-stone-700 font-medium">{b.customerName}</span>
                        <span className="text-stone-400 mx-2">·</span>
                        <span className="text-stone-500 font-mono">Trip: {b.departureDate || '-'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-[#0F3827]">Rp {b.totalAmount.toLocaleString('id-ID')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.paymentTier === 'full' || b.remainingBalance <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.paymentTier === 'full' || b.remainingBalance <= 0 ? 'LUNAS' : 'BARU DP'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Curated Tour Packages & Attractions Widget on Overview */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-stone-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C8A951]" />
                    <span>Pilihan Objek Wisata & Paket ({packages.length} Paket Tersedia)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Katalog objek wisata Garut yang aktif dan siap dipesan wisatawan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('packages')}
                  className="text-xs font-bold text-[#0F3827] hover:underline self-start sm:self-auto cursor-pointer flex items-center gap-1"
                >
                  <span>Kelola Semua Paket & Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Search on Overview */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari objek wisata / paket di dashboard..."
                    value={adminPackageSearch}
                    onChange={(e) => setAdminPackageSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-7 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                  {adminPackageSearch && (
                    <button
                      type="button"
                      onClick={() => setAdminPackageSearch('')}
                      className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Quick Chips */}
                {[
                  { label: 'Semua', val: '' },
                  { label: 'Papandayan', val: 'Papandayan' },
                  { label: 'Kamojang', val: 'Kamojang' },
                  { label: 'Situ Bagendit', val: 'Bagendit' },
                  { label: 'Curug Taraje', val: 'Taraje' },
                  { label: 'Darajat Pass', val: 'Darajat' },
                  { label: 'Santolo', val: 'Santolo' },
                  { label: 'City Tour', val: 'City Tour' }
                ].map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setAdminPackageSearch(chip.val)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                      adminPackageSearch === chip.val
                        ? 'bg-[#0F3827] text-white border-[#0F3827]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Package Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {packages
                  .filter(p => {
                    if (!adminPackageSearch.trim()) return true;
                    const q = adminPackageSearch.toLowerCase().trim();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      p.destinationArea.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      p.shortDescription.toLowerCase().includes(q)
                    );
                  })
                  .map(pkg => (
                    <div key={pkg.id} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 hover:border-emerald-300 transition-colors space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#C8A951]">{pkg.category}</span>
                          <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{pkg.name}</h4>
                          <span className="text-[10px] text-stone-500">{pkg.destinationArea} • {pkg.durationDays} Hari</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#0F3827] shrink-0">
                          Rp {pkg.basePrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2">{pkg.shortDescription}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-[10px]">
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">100% Private Trip</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('packages');
                            setSelectedPackageForActivities(pkg);
                          }}
                          className="text-[#0F3827] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Kelola Itinerary</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EDITOR DASHBOARD AWAL (HALAMAN BERANDA LENGKAP TANPA TERKECUALI) */}
        {activeTab === 'homepage_editor' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#0F3827] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#C8A951]" />
                  <span>Editor Dashboard Awal & Beranda</span>
                </span>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">
                  Kustomisasi Seluruh Tampilan Beranda
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Semua elemen beranda mulai dari hero banner, teks promosi, kolom pencarian, pilihan trip, keunggulan, ulasan, hingga FAQ dapat Anda edit secara langsung tanpa terkecuali.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {homepageSavedMsg && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Perubahan Berhasil Disimpan!</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveHomepageSettings()}
                  disabled={homepageSaving}
                  className="px-5 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${homepageSaving ? 'animate-spin' : ''}`} />
                  <span>{homepageSaving ? 'Menyimpan...' : 'Simpan Perubahan Beranda'}</span>
                </button>
              </div>
            </div>

            {/* SEKSI 1: HERO BANNER UTAMA */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8A951]"></span>
                    <span>1. Bagian Hero Banner (Header Utama Atas)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Teks utama yang dilihat wisatawan saat pertama kali membuka website Garut Journey.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Badge / Label Kecil di Atas Judul
                  </label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={(e) => setHeroBadge(e.target.value)}
                    placeholder="Contoh: TOUR OPERATOR RESMI GARUT • 100% PRIVATE TRIP"
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Judul Utama Hero (Headline Utama)
                  </label>
                  <input
                    type="text"
                    value={heroMainTitle}
                    onChange={(e) => setHeroMainTitle(e.target.value)}
                    placeholder="Contoh: Jelajahi Pesona Alam Garut yang Menakjubkan"
                    className="w-full text-sm font-semibold px-3.5 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Subjudul / Deskripsi Pendukung Hero
                  </label>
                  <textarea
                    rows={3}
                    value={heroMainSubtitle}
                    onChange={(e) => setHeroMainSubtitle(e.target.value)}
                    placeholder="Deskripsi daya tarik wisata Garut yang ramah dan meyakinkan..."
                    className="w-full text-xs p-3 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Placeholder Kotak Pencarian
                  </label>
                  <input
                    type="text"
                    value={heroSearchPlaceholder}
                    onChange={(e) => setHeroSearchPlaceholder(e.target.value)}
                    placeholder="Cari Papandayan, Kamojang, Bagendit, Curug..."
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    Badge Galeri Foto Showcase
                  </label>
                  <input
                    type="text"
                    value={heroShowcaseBadge}
                    onChange={(e) => setHeroShowcaseBadge(e.target.value)}
                    placeholder="GALERI FOTO RESMI GARUT"
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>
              </div>

              {/* Sub-item: Pilihan Cepat Trip (Pills) */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Tombol Pilihan Cepat Destinasi Populer (Pills di Bawah Search)
                    </h4>
                    <p className="text-[11px] text-stone-500">Pilihan sekali klik yang memudahkan pengunjung menemukan trip tanpa mengetik.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {heroPopularTrips.map((preset, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-stone-100 border border-stone-200 text-stone-800 font-medium group"
                    >
                      <span>{preset.label}</span>
                      <span className="text-[10px] text-stone-400">({preset.query || 'Semua'})</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePopularPreset(idx)}
                        className="text-stone-400 hover:text-rose-600 ml-1 cursor-pointer font-bold"
                        title="Hapus pilihan ini"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new preset form */}
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex flex-wrap items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Label Tombol (cth: 🏕️ Papandayan Camp)"
                    value={newPresetLabel}
                    onChange={(e) => setNewPresetLabel(e.target.value)}
                    className="flex-1 min-w-[180px] px-3 py-2 bg-white rounded-lg border border-stone-200"
                  />
                  <input
                    type="text"
                    placeholder="Kata Kunci Cari (cth: Papandayan)"
                    value={newPresetQuery}
                    onChange={(e) => setNewPresetQuery(e.target.value)}
                    className="flex-1 min-w-[150px] px-3 py-2 bg-white rounded-lg border border-stone-200"
                  />
                  <select
                    value={newPresetCategory}
                    onChange={(e) => setNewPresetCategory(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg border border-stone-200"
                  >
                    <option value="Semua">Semua</option>
                    <option value="Gunung & Alam">Gunung & Alam</option>
                    <option value="Keluarga & Relaksasi">Keluarga & Relaksasi</option>
                    <option value="Budaya & Sejarah">Budaya & Sejarah</option>
                    <option value="Petualangan Alam">Petualangan Alam</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddPopularPreset}
                    className="px-4 py-2 bg-[#0F3827] text-white font-semibold rounded-lg hover:bg-[#17523A] transition-colors cursor-pointer"
                  >
                    + Tambah Pilihan Trip
                  </button>
                </div>
              </div>

              {/* Sub-item: Indikator Kepercayaan (Trust Indicators) */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Indikator Kepercayaan di Bawah Formulir Hero
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {trustIndicators.map((ti, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                      <CheckCircle2 className="w-4 h-4 text-[#C8A951] shrink-0" />
                      <input
                        type="text"
                        value={ti.title}
                        onChange={(e) => {
                          const updated = [...trustIndicators];
                          updated[idx] = { title: e.target.value };
                          setTrustIndicators(updated);
                        }}
                        className="flex-1 bg-transparent text-xs text-stone-800 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTrustIndicator(idx)}
                        className="text-stone-400 hover:text-rose-600 text-xs px-1 cursor-pointer"
                        title="Hapus indikator"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tambah indikator kepercayaan baru (cth: Layanan Pelanggan 24/7)..."
                    value={newTrustTitle}
                    onChange={(e) => setNewTrustTitle(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-stone-50 rounded-lg border border-stone-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddTrustIndicator}
                    className="px-4 py-2 bg-stone-800 text-white text-xs font-semibold rounded-lg hover:bg-stone-900 cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* SEKSI 2: PAKET WISATA UNGGULAN */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0F3827]"></span>
                    <span>2. Seksi Paket Wisata Paling Populer</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Teks pengantar untuk 6 kartu paket wisata teratas di halaman muka.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Badge Seksi</label>
                  <input
                    type="text"
                    value={packagesSectionBadge}
                    onChange={(e) => setPackagesSectionBadge(e.target.value)}
                    placeholder="Destinasi Paling Populer"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Judul Seksi</label>
                  <input
                    type="text"
                    value={packagesSectionTitle}
                    onChange={(e) => setPackagesSectionTitle(e.target.value)}
                    placeholder="Pilihan Paket Wisata Unggulan Garut"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Teks Tombol Lihat Semua</label>
                  <input
                    type="text"
                    value={packagesSectionBtnText}
                    onChange={(e) => setPackagesSectionBtnText(e.target.value)}
                    placeholder="Jelajahi Seluruh Paket"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 3: MENGAPA GARUT JOURNEY (WHY CHOOSE US) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8A951]"></span>
                    <span>3. Seksi &quot;Mengapa Garut Journey?&quot; (Fasilitas & Keunggulan)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Empat kartu keunggulan kompetitif yang meyakinkan wisatawan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Badge Seksi</label>
                  <input
                    type="text"
                    value={whyChooseBadge}
                    onChange={(e) => setWhyChooseBadge(e.target.value)}
                    placeholder="Mengapa Garut Journey?"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Judul Seksi</label>
                  <input
                    type="text"
                    value={whyChooseTitle}
                    onChange={(e) => setWhyChooseTitle(e.target.value)}
                    placeholder="Standar Layanan Wisata Terbaik & Terpercaya"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              {/* Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whyChooseFeatures.map((feat, idx) => (
                  <div key={feat.id || idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#0F3827] bg-[#E6F0EB] px-2 py-0.5 rounded">
                          Kartu {idx + 1}
                        </span>
                        <select
                          value={feat.icon || 'Users'}
                          onChange={(e) => {
                            const updated = [...whyChooseFeatures];
                            updated[idx] = { ...feat, icon: e.target.value };
                            setWhyChooseFeatures(updated);
                          }}
                          className="text-xs px-2 py-1 bg-white border border-stone-200 rounded"
                        >
                          <option value="Users">Ikon: Tim/Pemandu (Users)</option>
                          <option value="Award">Ikon: Penghargaan (Award)</option>
                          <option value="ShieldCheck">Ikon: Keamanan (ShieldCheck)</option>
                          <option value="Calendar">Ikon: Jadwal (Calendar)</option>
                          <option value="Sparkles">Ikon: Spesial (Sparkles)</option>
                          <option value="Star">Ikon: Bintang (Star)</option>
                          <option value="Clock">Ikon: Waktu (Clock)</option>
                          <option value="Heart">Ikon: Favorit (Heart)</option>
                          <option value="Compass">Ikon: Petualangan (Compass)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveWhyChooseFeature(feat.id)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                        title="Hapus kartu ini"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600 block">Judul Keunggulan</label>
                      <input
                        type="text"
                        value={feat.title}
                        onChange={(e) => {
                          const updated = [...whyChooseFeatures];
                          updated[idx] = { ...feat, title: e.target.value };
                          setWhyChooseFeatures(updated);
                        }}
                        className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-200 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600 block">Deskripsi Penjelasan</label>
                      <textarea
                        rows={2}
                        value={feat.description}
                        onChange={(e) => {
                          const updated = [...whyChooseFeatures];
                          updated[idx] = { ...feat, description: e.target.value };
                          setWhyChooseFeatures(updated);
                        }}
                        className="w-full text-xs p-2.5 bg-white rounded-lg border border-stone-200"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Feature Card Form */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 block">+ Tambah Kartu Keunggulan Baru:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Judul Keunggulan (cth: Asuransi Perjalanan Lengkap)"
                    value={newFeatTitle}
                    onChange={(e) => setNewFeatTitle(e.target.value)}
                    className="sm:col-span-2 text-xs px-3 py-2 bg-white rounded-lg border border-stone-200"
                  />
                  <select
                    value={newFeatIcon}
                    onChange={(e) => setNewFeatIcon(e.target.value)}
                    className="text-xs px-3 py-2 bg-white rounded-lg border border-stone-200"
                  >
                    <option value="Users">Ikon: Users</option>
                    <option value="Award">Ikon: Award</option>
                    <option value="ShieldCheck">Ikon: ShieldCheck</option>
                    <option value="Calendar">Ikon: Calendar</option>
                    <option value="Sparkles">Ikon: Sparkles</option>
                    <option value="Star">Ikon: Star</option>
                    <option value="Compass">Ikon: Compass</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Deskripsi keunggulan yang didapatkan peserta trip..."
                  value={newFeatDesc}
                  onChange={(e) => setNewFeatDesc(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-lg border border-stone-200"
                />
                <button
                  type="button"
                  onClick={handleAddWhyChooseFeature}
                  className="px-4 py-2 bg-[#0F3827] text-white text-xs font-semibold rounded-lg hover:bg-[#17523A] cursor-pointer"
                >
                  + Tambahkan ke Daftar Keunggulan
                </button>
              </div>
            </div>

            {/* SEKSI 4: TESTIMONI & ULASAN TAMU */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0F3827]"></span>
                    <span>4. Seksi Cerita & Ulasan Pengalaman Tamu</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Kelola judul seksi ulasan atau buka tab Cerita Tamu untuk menambah/mengedit ulasan nyata.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('testimonials')}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  <span>Kelola Ulasan Tamu ({testimonials.length})</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Badge Seksi Ulasan</label>
                  <input
                    type="text"
                    value={testimonialsSectionBadge}
                    onChange={(e) => setTestimonialsSectionBadge(e.target.value)}
                    placeholder="Cerita Pengalaman Tamu"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Judul Seksi Ulasan</label>
                  <input
                    type="text"
                    value={testimonialsSectionTitle}
                    onChange={(e) => setTestimonialsSectionTitle(e.target.value)}
                    placeholder="Ulasan Nyata dari Wisatawan Garut Journey"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>
              </div>
            </div>

            {/* SEKSI 5: PERTANYAAN UMUM (FAQ) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8A951]"></span>
                    <span>5. Seksi Pertanyaan Umum (FAQ)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Jawaban atas pertanyaan yang paling sering diajukan calon wisatawan sebelum memesan.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Badge Seksi FAQ</label>
                  <input
                    type="text"
                    value={faqSectionBadge}
                    onChange={(e) => setFaqSectionBadge(e.target.value)}
                    placeholder="Pertanyaan Umum"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Judul Seksi FAQ</label>
                  <input
                    type="text"
                    value={faqSectionTitle}
                    onChange={(e) => setFaqSectionTitle(e.target.value)}
                    placeholder="Informasi Penting Sebelum Memulai Perjalanan"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>
              </div>

              {/* FAQ Items List */}
              <div className="space-y-3">
                {homepageFaqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#0F3827] bg-white px-2 py-0.5 rounded border border-stone-200">
                        Pertanyaan #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                        title="Hapus pertanyaan ini"
                      >
                        Hapus FAQ
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600 block">Pertanyaan (Tanya)</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const updated = [...homepageFaqs];
                          updated[idx] = { ...faq, q: e.target.value };
                          setHomepageFaqs(updated);
                        }}
                        className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-200 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-600 block">Jawaban Penjelasan</label>
                      <textarea
                        rows={2}
                        value={faq.a}
                        onChange={(e) => {
                          const updated = [...homepageFaqs];
                          updated[idx] = { ...faq, a: e.target.value };
                          setHomepageFaqs(updated);
                        }}
                        className="w-full text-xs p-2.5 bg-white rounded-lg border border-stone-200"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New FAQ Form */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2.5">
                <span className="text-xs font-bold text-stone-800 block">+ Tambah Pertanyaan FAQ Baru:</span>
                <input
                  type="text"
                  placeholder="Contoh: Apakah bisa request penjemputan dari luar kota Bandung/Jakarta?"
                  value={newFaqQ}
                  onChange={(e) => setNewFaqQ(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-stone-200"
                />
                <textarea
                  rows={2}
                  placeholder="Jawaban penjelasan yang ramah dan informatif..."
                  value={newFaqA}
                  onChange={(e) => setNewFaqA(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-lg border border-stone-200"
                />
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-2 bg-[#0F3827] text-white text-xs font-semibold rounded-lg hover:bg-[#17523A] cursor-pointer"
                >
                  + Tambahkan ke Daftar FAQ
                </button>
              </div>
            </div>

            {/* SEKSI 6: BANNER AJAKAN BERTINDAK (CTA STRIP BAWAH) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0F3827]"></span>
                    <span>6. Banner Ajakan Bertindak (CTA Bawah Beranda)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">Banner hijau gelap di bagian paling bawah halaman sebelum footer.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Judul Ajakan CTA</label>
                  <input
                    type="text"
                    value={ctaTitle}
                    onChange={(e) => setCtaTitle(e.target.value)}
                    placeholder="Siap Berpetualang di Garut?"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700 block">Teks Tombol Aksi</label>
                  <input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    placeholder="Jelajahi Paket Wisata"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block">Subjudul Penjelas CTA</label>
                  <input
                    type="text"
                    value={ctaSubtitle}
                    onChange={(e) => setCtaSubtitle(e.target.value)}
                    placeholder="Konsultasikan rencana perjalanan Anda atau pilih paket wisata favorit sekarang..."
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 block">Tautan Tujuan Tombol (URL/Path)</label>
                  <input
                    type="text"
                    value={ctaButtonLink}
                    onChange={(e) => setCtaButtonLink(e.target.value)}
                    placeholder="/paket-wisata"
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Save Bar Bottom */}
            <div className="sticky bottom-4 z-30 bg-stone-900/95 backdrop-blur-md p-4 rounded-2xl border border-stone-800 shadow-2xl flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#C8A951]" />
                <span className="text-xs text-stone-300 font-medium">
                  Pastikan menekan tombol simpan setelah merubah teks atau susunan beranda.
                </span>
              </div>

              <div className="flex items-center gap-3">
                {homepageSavedMsg && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tersimpan!</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveHomepageSettings()}
                  disabled={homepageSaving}
                  className="px-6 py-2.5 bg-[#C8A951] hover:bg-[#B89940] text-stone-950 text-xs uppercase tracking-wider font-bold rounded-xl transition-colors shadow cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${homepageSaving ? 'animate-spin' : ''}`} />
                  <span>{homepageSaving ? 'Menyimpan...' : 'Simpan Seluruh Perubahan Beranda'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAPORAN PENGUNJUNG WEBSITE */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Laporan Pengunjung & Analitik Website
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Statistik real-time kunjungan wisatawan, halaman paket terpopuler, dan sebaran perangkat.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAllData}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Laporan</span>
                </button>
                <button
                  onClick={handleClearAllActivities}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Log Pengunjung</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Total Pageviews
                </span>
                <div className="text-3xl font-bold font-mono text-[#0F3827]">
                  {analytics?.totalPageViews || 0}
                </div>
                <p className="text-[11px] text-stone-500">Akumulasi kunjungan halaman</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Pengunjung Unik
                </span>
                <div className="text-3xl font-bold font-mono text-emerald-700">
                  {analytics?.uniqueVisitors || 0}
                </div>
                <p className="text-[11px] text-stone-500">Berdasarkan IP & browser</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Kunjungan Hari Ini
                </span>
                <div className="text-3xl font-bold font-mono text-amber-600">
                  {analytics?.todayViews || 0}
                </div>
                <p className="text-[11px] text-stone-500">Trafik hari ini ({new Date().toISOString().split('T')[0]})</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Sebaran Perangkat
                </span>
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-700">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Mobile: <strong>{analytics?.deviceCounts?.mobile || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-700">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span>Desktop: <strong>{analytics?.deviceCounts?.desktop || 0}</strong></span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 pt-0.5">Mobile-first user behavior</p>
              </div>
            </div>

            {/* 7-Days Trend Bar Graph */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Tren Kunjungan 7 Hari Terakhir
              </h3>
              <div className="grid grid-cols-7 gap-2 pt-4 items-end h-40 border-b border-stone-100 pb-2">
                {(analytics?.dailyViews || []).map((day: any) => {
                  const maxCount = Math.max(...(analytics?.dailyViews || []).map((d: any) => d.count), 10);
                  const heightPercent = Math.max(8, Math.round((day.count / maxCount) * 100));
                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-mono text-stone-600 font-bold">{day.count}</span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[36px] bg-[#0F3827] hover:bg-[#C8A951] rounded-t-md transition-all duration-300"
                        title={`${day.date}: ${day.count} kunjungan`}
                      />
                      <span className="text-[10px] text-stone-500 font-medium truncate w-full text-center">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Visited Pages & Recent Log Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Pages */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                  Halaman & Paket Paling Banyak Dilihat
                </h3>
                <div className="divide-y divide-stone-100 text-xs">
                  {(analytics?.topPages || []).map((p: any, idx: number) => (
                    <div key={p.path} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-stone-800 truncate">{p.path}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold shrink-0">
                        {p.count} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Visitor Stream */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                  Log Kunjungan Terbaru
                </h3>
                <div className="divide-y divide-stone-100 text-xs max-h-80 overflow-y-auto">
                  {(analytics?.recentViews || []).map((v: any) => (
                    <div key={v.id} className="py-2 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="font-mono text-stone-800 block truncate">{v.path}</span>
                        <span className="text-[10px] text-stone-400">IP: {v.ip} • {v.deviceType}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {new Date(v.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Manajemen Reservasi Private Trip
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Seluruh pemesanan private trip dengan tanggal pilihan langsung oleh konsumen.
                </p>
              </div>

              <a
                href="/api/admin/reports/csv"
                download="laporan-booking-garut-journey.csv"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#C8A951]" />
                <span>Unduh Laporan CSV</span>
              </a>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-stone-200">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kode booking, nama, telepon WhatsApp, atau email..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 rounded-lg border border-stone-200"
                />
              </div>

              <div>
                <select
                  value={bookingFilterStatus}
                  onChange={(e) => setBookingFilterStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-stone-50 rounded-lg border border-stone-200"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending_payment">Menunggu Pembayaran</option>
                  <option value="confirmed">Terkonfirmasi (Lunas / DP)</option>
                  <option value="in_progress">Sedang Berlangsung</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">No. Booking</th>
                      <th className="p-3.5">Tanggal Trip</th>
                      <th className="p-3.5">Pemesan</th>
                      <th className="p-3.5">Paket</th>
                      <th className="p-3.5">Skema & Total</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredBookings.map(b => {
                      const isLunas = b.paymentTier === 'full' || b.remainingBalance <= 0;
                      return (
                        <tr key={b.id} className="hover:bg-stone-50/50">
                          <td className="p-3.5 font-mono font-bold text-stone-900">{b.bookingNumber}</td>
                          <td className="p-3.5 font-mono text-stone-700">{b.departureDate || '-'}</td>
                          <td className="p-3.5">
                            <span className="font-semibold text-stone-800 block">{b.customerName}</span>
                            <span className="text-[11px] text-stone-500 font-mono">{b.customerPhone}</span>
                          </td>
                          <td className="p-3.5 text-stone-700 max-w-xs truncate">{b.tourPackage?.name}</td>
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-[#0F3827]">
                              Rp {b.totalAmount.toLocaleString('id-ID')}
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isLunas ? 'LUNAS (100%)' : `BARU DP (Sisa: Rp ${b.remainingBalance.toLocaleString('id-ID')})`}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              b.status === 'pending_payment' ? 'bg-amber-100 text-amber-800' :
                              'bg-stone-100 text-stone-600'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3.5 flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                setGeneratedInvoice(null);
                              }}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-medium cursor-pointer"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(b);
                                handleSendWhatsAppInvoice(b.id);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1 cursor-pointer"
                              title="Kirim Invoice WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Invoice WA</span>
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(b.id, b.bookingCode)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                              title="Hapus Pesanan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Detail Booking & WhatsApp Invoice */}
            {selectedBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold block uppercase">
                        Reservasi #{selectedBooking.bookingNumber}
                      </span>
                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                        {selectedBooking.customerName}
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBooking(null);
                        setGeneratedInvoice(null);
                      }}
                      className="text-stone-400 hover:text-stone-700 font-bold p-1 rounded hover:bg-stone-100"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Status Pembayaran:</span>
                        <strong className={selectedBooking.paymentTier === 'dp' && selectedBooking.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                          {selectedBooking.paymentTier === 'dp' && selectedBooking.remainingBalance > 0 ? 'BARU DP (30%)' : 'LUNAS (100%)'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Tanggal Keberangkatan:</span>
                        <span className="font-mono font-bold text-stone-800">{selectedBooking.departureDate || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Total Biaya:</span>
                        <span className="font-mono font-bold">Rp {selectedBooking.totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                      {selectedBooking.remainingBalance > 0 && (
                        <div className="flex justify-between text-rose-700 font-semibold">
                          <span>Sisa Pelunasan Saat Penjemputan:</span>
                          <span className="font-mono">Rp {selectedBooking.remainingBalance.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-stone-200 text-stone-600">
                        <span>Nomor WhatsApp:</span>
                        <span className="font-mono font-bold text-emerald-800">{selectedBooking.customerPhone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Pesan Catatan Tambahan Pada Invoice WhatsApp:
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Titik kumpul di Stasiun Garut pukul 07.30 WIB..."
                        value={invoiceCustomNote}
                        onChange={(e) => setInvoiceCustomNote(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>

                    {/* WhatsApp Action Button */}
                    <button
                      onClick={() => handleSendWhatsAppInvoice(selectedBooking.id)}
                      disabled={sendingInvoice}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{sendingInvoice ? 'Menyiapkan Invoice...' : 'Kirim Invoice / Kwitansi ke WhatsApp Pelanggan'}</span>
                    </button>

                    {/* Generated Invoice Box with Direct Link and Copy Button */}
                    {generatedInvoice && (
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Invoice WhatsApp Siap!</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">+{generatedInvoice.phone}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={generatedInvoice.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-center font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka WhatsApp Langsung</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedInvoice.rawText);
                              setCopiedInvoice(true);
                              setTimeout(() => setCopiedInvoice(false), 2000);
                            }}
                            className="py-2 px-3 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedInvoice ? 'Disalin!' : 'Salin Pesan'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PDF E-Ticket & Cetak Kwitansi Actions for Admin */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`/api/bookings/${selectedBooking.bookingNumber}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        title="Unduh E-Ticket PDF Resmi (Bisa Dibagikan Tanpa Login)"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C8A951]" />
                        <span>Unduh E-Ticket (PDF)</span>
                      </a>

                      <a
                        href={`/api/bookings/${selectedBooking.bookingNumber}/print`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Buka Pratinjau & Cetak Kwitansi Resmi"
                      >
                        <Printer className="w-3.5 h-3.5 text-stone-600" />
                        <span>Cetak Kwitansi</span>
                      </a>
                    </div>

                    <div className="pt-2 border-t space-y-2">
                      <label className="block text-stone-700 font-semibold mb-1">
                        Ubah Status Operasional Tur:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['confirmed', 'in_progress', 'completed', 'cancelled'].map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleUpdateBookingStatus(selectedBooking.id, st)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border cursor-pointer ${
                              selectedBooking.status === st
                                ? 'bg-[#0F3827] text-white border-[#0F3827]'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="pt-3 border-t flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(selectedBooking.id, selectedBooking.bookingCode)}
                          className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Pesanan Ini Secara Permanen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PACKAGES & ACTIVITY MANAGEMENT */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Manajemen Paket & Aktivitas Perjalanan
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kelola paket private trip, harga bertingkat peserta, foto galeri, dan susunan rencana perjalanan (itinerary).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPackageModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Paket Wisata Baru</span>
              </button>
            </div>

            {/* Search and Category Filter for Packages */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari objek wisata atau nama paket (Papandayan, Kamojang, Bagendit, Taraje, Darajat, Santolo, City Tour)..."
                    value={adminPackageSearch}
                    onChange={(e) => setAdminPackageSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-8 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                  {adminPackageSearch && (
                    <button
                      type="button"
                      onClick={() => setAdminPackageSearch('')}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="sm:w-52">
                  <select
                    value={adminPackageCategory}
                    onChange={(e) => setAdminPackageCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827] cursor-pointer"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Gunung & Alam">Gunung & Alam</option>
                    <option value="Keluarga & Relaksasi">Keluarga & Relaksasi</option>
                    <option value="Budaya & Sejarah">Budaya & Sejarah</option>
                    <option value="Petualangan Alam">Petualangan Alam</option>
                  </select>
                </div>
              </div>

              {/* Quick Destination Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Filter Objek:</span>
                {[
                  { label: 'Semua', val: '' },
                  { label: 'Papandayan', val: 'Papandayan' },
                  { label: 'Kamojang', val: 'Kamojang' },
                  { label: 'Situ Bagendit', val: 'Bagendit' },
                  { label: 'Curug Taraje', val: 'Taraje' },
                  { label: 'Darajat Pass', val: 'Darajat' },
                  { label: 'Santolo', val: 'Santolo' },
                  { label: 'City Tour', val: 'City Tour' }
                ].map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setAdminPackageSearch(chip.val)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
                      adminPackageSearch === chip.val
                        ? 'bg-[#0F3827] text-white border-[#0F3827]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages
                .filter(pkg => {
                  if (adminPackageCategory !== 'Semua' && !pkg.category.toLowerCase().includes(adminPackageCategory.toLowerCase())) {
                    return false;
                  }
                  if (adminPackageSearch.trim()) {
                    const q = adminPackageSearch.toLowerCase().trim();
                    return (
                      pkg.name.toLowerCase().includes(q) ||
                      pkg.destinationArea.toLowerCase().includes(q) ||
                      pkg.category.toLowerCase().includes(q) ||
                      pkg.shortDescription.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map(pkg => (
                <div key={pkg.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#C8A951] font-bold uppercase">{pkg.category}</span>
                      <h3 className="font-serif-luxury font-bold text-stone-900 text-lg mt-0.5">{pkg.name}</h3>
                      <p className="text-xs text-stone-500">{pkg.destinationArea} • {pkg.durationDays} Hari</p>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#0F3827]">
                      Rp {pkg.basePrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">{pkg.shortDescription}</p>

                  {/* Tiered pricing preview */}
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-stone-700">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#0F3827]" />
                        <span>Pilihan Harga Pax:</span>
                      </span>
                      <span className="text-[#0F3827] text-[10px] font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                        {pkg.priceTiers?.length || 6} Pilihan
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px] text-stone-600 font-mono">
                      {(pkg.priceTiers && pkg.priceTiers.length > 0
                        ? pkg.priceTiers
                        : [
                            { label: '1 Org', pricePerPerson: Math.round(pkg.basePrice * 1.95) },
                            { label: '2 Org', pricePerPerson: Math.round(pkg.basePrice * 1.35) },
                            { label: '3 Org', pricePerPerson: Math.round(pkg.basePrice * 1.12) },
                            { label: '4-5 Org', pricePerPerson: pkg.basePrice }
                          ]
                      ).slice(0, 4).map((pt, pIdx) => (
                        <span key={pIdx} className="bg-white px-1.5 py-0.5 rounded border border-stone-200">
                          {pt.label.split(' ')[0]}: Rp {Math.round(pt.pricePerPerson / 1000)}k
                        </span>
                      ))}
                      {(pkg.priceTiers?.length || 0) > 4 && (
                        <span className="text-stone-400 self-center text-[9px]">+{(pkg.priceTiers?.length || 0) - 4} lainnya</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between gap-2">
                    <span className="text-xs text-stone-500 font-medium">
                      {pkg.itinerary?.length || 0} Hari Itinerary
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditPackage(pkg)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Edit Paket & Pilihan Harga Bertingkat"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Edit Harga & Paket</span>
                      </button>
                      <button
                        onClick={() => setSelectedPackageForActivities(pkg)}
                        className="px-2.5 py-1.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Aktivitas</span>
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        title="Hapus Paket Wisata"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only sm:not-sr-only">Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Kelola Aktivitas */}
            {selectedPackageForActivities && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-start justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Kelola Aktivitas Rencana Perjalanan</span>
                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                        {selectedPackageForActivities.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelectedPackageForActivities(null)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Form Tambah Aktivitas */}
                  <div className="p-3 bg-stone-50 rounded-xl space-y-2 border">
                    <span className="text-xs font-bold text-stone-800 block">Tambah Aktivitas Baru:</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={newActivityDay}
                        onChange={(e) => setNewActivityDay(Number(e.target.value))}
                        className="px-2 py-1.5 border rounded-lg bg-white text-xs"
                      >
                        {Array.from({ length: selectedPackageForActivities.durationDays || 2 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Hari ke-{i + 1}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Contoh: 14.00 - Sesi foto drone di padang Edelweiss..."
                        value={newActivityText}
                        onChange={(e) => setNewActivityText(e.target.value)}
                        className="flex-1 px-3 py-1.5 border rounded-lg bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddActivity(selectedPackageForActivities.id)}
                        className="px-3 py-1.5 bg-[#0F3827] text-white font-bold rounded-lg cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  {/* Form Tambah Hari Baru ke Itinerary */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl space-y-2 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-950 block">+ Tambah Hari Rencana Perjalanan Baru:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Judul Hari (cth: Hari ${(selectedPackageForActivities.itinerary?.length || 0) + 1}: Eksplorasi Kawah & Hutan)`}
                        value={newDayTitle}
                        onChange={(e) => setNewDayTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddDayToItinerary(selectedPackageForActivities.id)}
                        className="px-3.5 py-1.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        + Tambah Hari
                      </button>
                    </div>
                  </div>

                  {/* List of activities with delete button */}
                  <div className="space-y-4 text-xs">
                    {selectedPackageForActivities.itinerary.map(dayItem => (
                      <div key={dayItem.day} className="space-y-2 border-b pb-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#0F3827] block">
                            Hari {dayItem.day}: {dayItem.title}
                          </span>
                          {selectedPackageForActivities.itinerary.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDayFromItinerary(selectedPackageForActivities.id, dayItem.day)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                            >
                              Hapus Hari Ini
                            </button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          {dayItem.activities.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="flex items-center justify-between p-2 rounded-lg bg-stone-50 hover:bg-stone-100 group transition-colors"
                            >
                              <span className="text-stone-700 flex-1 pr-2">{act}</span>
                              <button
                                onClick={() => handleDeleteActivity(selectedPackageForActivities.id, dayItem.day, actIdx, act)}
                                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus aktivitas ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setSelectedPackageForActivities(null)}
                      className="px-4 py-2 bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Tambah Paket Wisata Baru */}
            {showNewPackageModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#0F3827]">Paket Wisata Baru</span>
                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                        Tambah Paket Wisata Garut
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowNewPackageModal(false)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreatePackage} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Nama Paket Wisata</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Eksplorasi Gunung Papandayan & Sunrise Hutan Mati"
                          value={newPkgName}
                          onChange={(e) => setNewPkgName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Kategori</label>
                        <select
                          value={newPkgCategory}
                          onChange={(e) => setNewPkgCategory(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        >
                          <option value="Gunung & Alam">Gunung & Alam</option>
                          <option value="Keluarga & Relaksasi">Keluarga & Relaksasi</option>
                          <option value="Budaya & Sejarah">Budaya & Sejarah</option>
                          <option value="Petualangan Alam">Petualangan Alam</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Area / Destinasi</label>
                        <input
                          type="text"
                          value={newPkgDestArea}
                          onChange={(e) => setNewPkgDestArea(e.target.value)}
                          placeholder="Garut, Jawa Barat"
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Harga Dasar per Orang (Rp)</label>
                        <input
                          type="number"
                          required
                          min={50000}
                          step={10000}
                          value={newPkgBasePrice}
                          onChange={(e) => setNewPkgBasePrice(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700 block">Durasi Hari</label>
                          <input
                            type="number"
                            min={1}
                            value={newPkgDays}
                            onChange={(e) => setNewPkgDays(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700 block">Durasi Malam</label>
                          <input
                            type="number"
                            min={0}
                            value={newPkgNights}
                            onChange={(e) => setNewPkgNights(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Foto Utama Paket</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newPkgImageUrl}
                            onChange={(e) => setNewPkgImageUrl(e.target.value)}
                            placeholder="URL Gambar atau unggah file foto..."
                            className="flex-1 px-3 py-2 border rounded-lg bg-stone-50"
                          />
                          <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border rounded-lg cursor-pointer flex items-center gap-1 font-semibold text-stone-700 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingImage ? 'Mengunggah...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const url = await uploadFileToServer(f);
                                  if (url) setNewPkgImageUrl(url);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Ringkasan Singkat (Short Description)</label>
                        <input
                          type="text"
                          required
                          value={newPkgShortDesc}
                          onChange={(e) => setNewPkgShortDesc(e.target.value)}
                          placeholder="Penjelasan ringkas 1-2 kalimat untuk kartu paket..."
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Deskripsi Lengkap</label>
                        <textarea
                          rows={3}
                          value={newPkgDesc}
                          onChange={(e) => setNewPkgDesc(e.target.value)}
                          placeholder="Deskripsi daya tarik, pengalaman, dan suasana wisata yang akan didapatkan..."
                          className="w-full p-2.5 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Fasilitas Termasuk (1 per baris)</label>
                        <textarea
                          rows={3}
                          value={newPkgInclusions}
                          onChange={(e) => setNewPkgInclusions(e.target.value)}
                          className="w-full p-2.5 border rounded-lg bg-stone-50 font-mono text-[11px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Tidak Termasuk (1 per baris)</label>
                        <textarea
                          rows={3}
                          value={newPkgExclusions}
                          onChange={(e) => setNewPkgExclusions(e.target.value)}
                          className="w-full p-2.5 border rounded-lg bg-stone-50 font-mono text-[11px]"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Titik Penjemputan / Meeting Point (1 per baris)</label>
                        <textarea
                          rows={2}
                          value={newPkgPickupPoints}
                          onChange={(e) => setNewPkgPickupPoints(e.target.value)}
                          className="w-full p-2.5 border rounded-lg bg-stone-50 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setShowNewPackageModal(false)}
                        className="px-4 py-2 border rounded-lg text-stone-600 font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={packageCreating}
                        className="px-5 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg cursor-pointer"
                      >
                        {packageCreating ? 'Menyimpan...' : 'Tambahkan Paket Wisata'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Edit Paket Wisata & Pilihan Harga Bertingkat */}
            {editingPackage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#C8A951]">Edit Paket Wisata</span>
                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                        {editingPackage.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingPackage(null)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditPackage} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Nama Paket Wisata</label>
                        <input
                          type="text"
                          required
                          value={editingPackage.name}
                          onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50 font-bold text-stone-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Kategori</label>
                        <select
                          value={editingPackage.category}
                          onChange={(e) => setEditingPackage({ ...editingPackage, category: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        >
                          <option value="Gunung & Alam">Gunung & Alam</option>
                          <option value="Keluarga & Relaksasi">Keluarga & Relaksasi</option>
                          <option value="Budaya & Sejarah">Budaya & Sejarah</option>
                          <option value="Petualangan Alam">Petualangan Alam</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Area / Destinasi</label>
                        <input
                          type="text"
                          value={editingPackage.destinationArea}
                          onChange={(e) => setEditingPackage({ ...editingPackage, destinationArea: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Harga Dasar (Rp)</label>
                        <input
                          type="number"
                          value={editingPackage.basePrice}
                          onChange={(e) => setEditingPackage({ ...editingPackage, basePrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700 block">Durasi Hari</label>
                          <input
                            type="number"
                            min={1}
                            value={editingPackage.durationDays}
                            onChange={(e) => setEditingPackage({ ...editingPackage, durationDays: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-stone-700 block">Durasi Malam</label>
                          <input
                            type="number"
                            min={0}
                            value={editingPackage.durationNights}
                            onChange={(e) => setEditingPackage({ ...editingPackage, durationNights: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Foto Utama</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingPackage.images?.[0]?.imageUrl || ''}
                            onChange={(e) => {
                              const newImgs = [...(editingPackage.images || [])];
                              if (newImgs.length > 0) {
                                newImgs[0] = { ...newImgs[0], imageUrl: e.target.value };
                              } else {
                                newImgs.push({
                                  id: 'img-' + Date.now(),
                                  packageId: editingPackage.id,
                                  imageUrl: e.target.value,
                                  altText: editingPackage.name,
                                  sortOrder: 1,
                                  isPrimary: true
                                });
                              }
                              setEditingPackage({ ...editingPackage, images: newImgs });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg bg-stone-50"
                          />
                          <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border rounded-lg cursor-pointer flex items-center gap-1 font-semibold text-stone-700 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingImage ? '...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const url = await uploadFileToServer(f);
                                  if (url) {
                                    const newImgs = [...(editingPackage.images || [])];
                                    if (newImgs.length > 0) {
                                      newImgs[0] = { ...newImgs[0], imageUrl: url };
                                    } else {
                                      newImgs.push({
                                        id: 'img-' + Date.now(),
                                        packageId: editingPackage.id,
                                        imageUrl: url,
                                        altText: editingPackage.name,
                                        sortOrder: 1,
                                        isPrimary: true
                                      });
                                    }
                                    setEditingPackage({ ...editingPackage, images: newImgs });
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Ringkasan Singkat</label>
                        <input
                          type="text"
                          value={editingPackage.shortDescription}
                          onChange={(e) => setEditingPackage({ ...editingPackage, shortDescription: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="font-semibold text-stone-700 block">Deskripsi Detail</label>
                        <textarea
                          rows={3}
                          value={editingPackage.description}
                          onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                          className="w-full p-2.5 border rounded-lg bg-stone-50"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Fasilitas Termasuk (1 per baris)</label>
                        <textarea
                          rows={3}
                          value={(editingPackage.inclusions || []).join('\n')}
                          onChange={(e) => setEditingPackage({
                            ...editingPackage,
                            inclusions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                          })}
                          className="w-full p-2.5 border rounded-lg bg-stone-50 font-mono text-[11px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Tidak Termasuk (1 per baris)</label>
                        <textarea
                          rows={3}
                          value={(editingPackage.exclusions || []).join('\n')}
                          onChange={(e) => setEditingPackage({
                            ...editingPackage,
                            exclusions: e.target.value.split('\n').map(s => s.trim()).filter(Boolean)
                          })}
                          className="w-full p-2.5 border rounded-lg bg-stone-50 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Tiered Pricing Section */}
                    <div className="p-4 bg-stone-50 rounded-xl border space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-stone-900 block">Pilihan Harga Bertingkat Jumlah Peserta (Tiered Pricing)</span>
                          <span className="text-[11px] text-stone-500">Harga per orang otomatis disesuaikan sesuai jumlah rombongan yang dipesan.</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoCalculatePackageTiers}
                          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          ⚡ Hitung Otomatis dari Harga Dasar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {(editingPackage.priceTiers || []).map((tier, tIdx) => (
                          <div key={tIdx} className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700">
                              <span>{tier.label}</span>
                              <span className="text-stone-400 font-mono text-[10px]">{tier.minParticipants}–{tier.maxParticipants} org</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-stone-400 font-mono text-[10px]">Rp</span>
                              <input
                                type="number"
                                step={5000}
                                value={tier.pricePerPerson}
                                onChange={(e) => {
                                  const updatedTiers = [...(editingPackage.priceTiers || [])];
                                  updatedTiers[tIdx] = { ...tier, pricePerPerson: Number(e.target.value) };
                                  setEditingPackage({ ...editingPackage, priceTiers: updatedTiers });
                                }}
                                className="w-full px-2 py-1 bg-stone-50 border rounded text-xs font-mono font-bold text-[#0F3827]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPackage.isPublished !== false}
                          onChange={(e) => setEditingPackage({ ...editingPackage, isPublished: e.target.checked })}
                          className="w-4 h-4 rounded text-[#0F3827]"
                        />
                        <span className="font-semibold text-stone-800">Tayangkan Paket di Website (Published)</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePackage(editingPackage.id, editingPackage.name)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                          title="Hapus Paket Wisata Secara Permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Paket Ini</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPackage(null)}
                          className="px-4 py-2 border rounded-lg text-stone-600 font-semibold cursor-pointer text-xs"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={packageSaving}
                          className="px-5 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg cursor-pointer text-xs"
                        >
                          {packageSaving ? 'Menyimpan...' : 'Simpan Perubahan Paket'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: LAYANAN TAMBAHAN (ADD-ONS) MANAGEMENT (EDITABLE) */}
        {activeTab === 'addons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Manajemen Layanan Tambahan (Add-ons)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kelola fasilitas opsional seperti dokumentasi drone, porter gunung, antar-jemput bandara/stasiun, dan souvenir khas Garut yang dapat dipilih konsumen saat booking.
                </p>
              </div>

              <button
                onClick={() => {
                  setAddonName('');
                  setAddonPrice(150000);
                  setAddonUnit('per trip');
                  setAddonDesc('');
                  setAddonIsActive(true);
                  setShowNewAddonModal(true);
                }}
                className="px-4 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Layanan Baru</span>
              </button>
            </div>

            {/* Addons Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {addons.map(addon => (
                <div
                  key={addon.id}
                  className={`bg-white p-5 rounded-2xl border shadow-2xs space-y-4 flex flex-col justify-between transition-all ${
                    addon.isActive ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        addon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {addon.isActive ? 'Aktif di Form Booking' : 'Nonaktif (Disembunyikan)'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-stone-500">
                        /{addon.unit}
                      </span>
                    </div>

                    <h3 className="font-serif-luxury font-bold text-stone-900 text-base leading-snug">
                      {addon.name}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-3">
                      {addon.description || 'Fasilitas opsional untuk melengkapi kenyamanan perjalanan Anda.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-medium">Harga Layanan:</span>
                      <span className="text-sm font-mono font-bold text-[#0F3827]">
                        Rp {addon.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Toggle status button */}
                      <button
                        onClick={() => handleToggleAddonActive(addon)}
                        className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                          addon.isActive ? 'text-amber-700 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={addon.isActive ? 'Nonaktifkan layanan ini' : 'Aktifkan layanan ini'}
                      >
                        {addon.isActive ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleOpenEditAddon(addon)}
                        className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
                        title="Edit Layanan Tambahan"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#0F3827]" />
                        <span>Edit</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteAddon(addon.id, addon.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                        title="Hapus Layanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Tambah Layanan Tambahan Baru */}
            {showNewAddonModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Tambah Layanan Tambahan Baru
                    </h3>
                    <button
                      onClick={() => setShowNewAddonModal(false)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateAddon} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Nama Layanan Tambahan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Dokumentasi Drone 4K & Cinematic Reel"
                        value={addonName}
                        onChange={(e) => setAddonName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Harga / Tarif (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step={5000}
                          value={addonPrice}
                          onChange={(e) => setAddonPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Satuan Tarif
                        </label>
                        <select
                          value={addonUnit}
                          onChange={(e) => setAddonUnit(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                          <option value="per trip">per trip</option>
                          <option value="per hari">per hari</option>
                          <option value="per pax">per pax</option>
                          <option value="per rombongan">per rombongan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Deskripsi Layanan & Rincian Fasilitas
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Jelaskan detail apa saja yang didapat wisatawan..."
                        value={addonDesc}
                        onChange={(e) => setAddonDesc(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="addonIsActiveNew"
                        checked={addonIsActive}
                        onChange={(e) => setAddonIsActive(e.target.checked)}
                        className="rounded border-stone-300 text-[#0F3827] focus:ring-[#0F3827]"
                      />
                      <label htmlFor="addonIsActiveNew" className="text-stone-700 font-medium">
                        Aktifkan dan tampilkan langsung di formulir pemesanan wisata
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setShowNewAddonModal(false)}
                        className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={addonSaving}
                        className="px-4 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                      >
                        {addonSaving ? 'Menyimpan...' : 'Simpan Layanan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Edit Layanan Tambahan (Permintaan User: Layanan tambahan buat bisa di edit admin) */}
            {editingAddon && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Edit Layanan Tambahan</span>
                      <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                        {editingAddon.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => setEditingAddon(null)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditAddon} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Nama Layanan Tambahan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAddon.name}
                        onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Harga / Tarif (Rp) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          step={5000}
                          value={editingAddon.price}
                          onChange={(e) => setEditingAddon({ ...editingAddon, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-stone-700 font-semibold mb-1">
                          Satuan Tarif
                        </label>
                        <select
                          value={editingAddon.unit}
                          onChange={(e) => setEditingAddon({ ...editingAddon, unit: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-white"
                        >
                          <option value="per trip">per trip</option>
                          <option value="per hari">per hari</option>
                          <option value="per pax">per pax</option>
                          <option value="per rombongan">per rombongan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Deskripsi Layanan & Rincian Fasilitas
                      </label>
                      <textarea
                        rows={3}
                        value={editingAddon.description}
                        onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="addonIsActiveEdit"
                        checked={editingAddon.isActive}
                        onChange={(e) => setEditingAddon({ ...editingAddon, isActive: e.target.checked })}
                        className="rounded border-stone-300 text-[#0F3827] focus:ring-[#0F3827]"
                      />
                      <label htmlFor="addonIsActiveEdit" className="text-stone-700 font-medium">
                        Layanan aktif (dapat dipilih wisatawan di form booking)
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setEditingAddon(null)}
                        className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={addonSaving}
                        className="px-4 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                      >
                        {addonSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MANAJEMEN CERITA & ULASAN PENGALAMAN TAMU (TESTIMONIALS) */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#0F3827] flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#C8A951]" />
                  <span>Ulasan Wisatawan & Cerita Pengalaman</span>
                </span>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">
                  Manajemen Cerita & Ulasan Tamu
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kelola ulasan nyata dari pelanggan yang telah berwisata bersama Garut Journey untuk membangun kepercayaan publik.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewTestimonialModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ulasan Baru</span>
              </button>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map(item => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F3827] bg-[#E6F0EB] px-2 py-0.5 rounded">
                        {item.package || 'Trip Garut'}
                      </span>
                      <div className="flex text-amber-400 text-xs">
                        {Array.from({ length: item.rating || 5 }).map((_, sIdx) => (
                          <span key={sIdx}>★</span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed italic">
                      &quot;{item.text}&quot;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#0F3827] text-white flex items-center justify-center font-bold text-xs uppercase">
                          {item.name.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">{item.name}</span>
                        <span className="text-[10px] text-stone-500">{item.role} · {item.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditTestimonial(item)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit ulasan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(item.id, item.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus ulasan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {testimonials.length === 0 && (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-stone-300 space-y-3">
                <MessageSquare className="w-8 h-8 text-stone-400 mx-auto" />
                <h4 className="font-bold text-stone-800 text-sm">Belum Ada Cerita Ulasan Tamu</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Tambahkan ulasan atau testimoni pertama wisatawan untuk ditampilkan di halaman beranda.
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewTestimonialModal(true)}
                  className="px-4 py-2 bg-[#0F3827] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  + Tambah Ulasan Sekarang
                </button>
              </div>
            )}

            {/* Modal Tambah Testimoni Baru */}
            {showNewTestimonialModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Tambah Cerita & Ulasan Tamu
                    </h3>
                    <button
                      onClick={() => setShowNewTestimonialModal(false)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreateTestimonial} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700 block">Nama Lengkap Tamu</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Rian Pratama"
                        value={testiName}
                        onChange={(e) => setTestiName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Profesi / Peran</label>
                        <input
                          type="text"
                          placeholder="Fotografer / Keluarga"
                          value={testiRole}
                          onChange={(e) => setTestiRole(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Kota Asal</label>
                        <input
                          type="text"
                          placeholder="Jakarta Selatan"
                          value={testiCity}
                          onChange={(e) => setTestiCity(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Paket yang Diambil</label>
                        <input
                          type="text"
                          placeholder="Eksplorasi Gunung Papandayan"
                          value={testiPackage}
                          onChange={(e) => setTestiPackage(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Rating Bintang</label>
                        <select
                          value={testiRating}
                          onChange={(e) => setTestiRating(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                          <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700 block">Foto Profil / Avatar</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="URL Foto atau unggah avatar..."
                          value={testiAvatar}
                          onChange={(e) => setTestiAvatar(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg bg-stone-50"
                        />
                        <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border rounded-lg cursor-pointer flex items-center gap-1 font-semibold text-stone-700 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? '...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const url = await uploadFileToServer(f);
                                if (url) setTestiAvatar(url);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700 block">Isi Ulasan & Testimoni</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tuliskan pengalaman menyenangkan, kepuasan pemandu, atau fasilitas perjalanan..."
                        value={testiText}
                        onChange={(e) => setTestiText(e.target.value)}
                        className="w-full p-2.5 border rounded-lg bg-stone-50"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setShowNewTestimonialModal(false)}
                        className="px-4 py-2 border rounded-lg text-stone-600 font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={testiSaving}
                        className="px-5 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg cursor-pointer"
                      >
                        {testiSaving ? 'Menyimpan...' : 'Tambahkan Ulasan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Edit Testimoni */}
            {editingTestimonial && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Edit Ulasan: {editingTestimonial.name}
                    </h3>
                    <button
                      onClick={() => setEditingTestimonial(null)}
                      className="text-stone-400 hover:text-stone-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditTestimonial} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700 block">Nama Lengkap Tamu</label>
                      <input
                        type="text"
                        required
                        value={editingTestimonial.name}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Profesi / Peran</label>
                        <input
                          type="text"
                          value={editingTestimonial.role}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Kota Asal</label>
                        <input
                          type="text"
                          value={editingTestimonial.city}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, city: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Paket yang Diambil</label>
                        <input
                          type="text"
                          value={editingTestimonial.package}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, package: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-stone-700 block">Rating Bintang</label>
                        <select
                          value={editingTestimonial.rating || 5}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg bg-stone-50"
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                          <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                          <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700 block">Foto Profil / Avatar</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTestimonial.avatarUrl || ''}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatarUrl: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-lg bg-stone-50"
                        />
                        <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border rounded-lg cursor-pointer flex items-center gap-1 font-semibold text-stone-700 shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? '...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                const url = await uploadFileToServer(f);
                                if (url) setEditingTestimonial({ ...editingTestimonial, avatarUrl: url });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-stone-700 block">Isi Ulasan & Testimoni</label>
                      <textarea
                        rows={3}
                        required
                        value={editingTestimonial.text}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                        className="w-full p-2.5 border rounded-lg bg-stone-50"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setEditingTestimonial(null)}
                        className="px-4 py-2 border rounded-lg text-stone-600 font-semibold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={testiSaving}
                        className="px-5 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg cursor-pointer"
                      >
                        {testiSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ARTICLES MANAGEMENT (EDITABLE) */}
        {activeTab === 'articles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Manajemen Artikel Wisata Garut
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Publikasikan dan edit artikel blog, tips pendakian, dan rekomendasi kuliner.
                </p>
              </div>

              <button
                onClick={() => setShowNewArticleModal(true)}
                className="px-4 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tulis Artikel Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(art => (
                <div key={art.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#C8A951] font-bold uppercase">{art.category}</span>
                    <h3 className="font-serif-luxury font-bold text-stone-900 text-base mt-1">{art.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1">{art.summary}</p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between text-xs">
                    <span className="text-stone-400 font-mono text-[10px]">{art.author}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditArticle(art)}
                        className="text-stone-700 hover:text-[#0F3827] flex items-center gap-1 cursor-pointer font-medium px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded"
                        title="Edit artikel"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer font-medium px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded"
                        title="Hapus artikel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Tambah Artikel */}
            {showNewArticleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    Tambah Artikel Wisata Baru
                  </h3>
                  <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Judul Artikel</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Tips Mendaki Gunung Papandayan Saat Musim Hujan"
                        value={artTitle}
                        onChange={(e) => setArtTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Kategori</label>
                      <select
                        value={artCategory}
                        onChange={(e) => setArtCategory(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      >
                        <option>Tips & Panduan</option>
                        <option>Eksplorasi Alam</option>
                        <option>Kuliner & Budaya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Penulis</label>
                      <input
                        type="text"
                        required
                        value={artAuthor}
                        onChange={(e) => setArtAuthor(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Ringkasan Singkat</label>
                      <input
                        type="text"
                        placeholder="Ringkasan 1-2 kalimat untuk preview..."
                        value={artSummary}
                        onChange={(e) => setArtSummary(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Konten Lengkap</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="Tulis isi artikel di sini..."
                        value={artContent}
                        onChange={(e) => setArtContent(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">URL Gambar Utama</label>
                      <input
                        type="text"
                        value={artImage}
                        onChange={(e) => setArtImage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    {/* Panel Koreksi & Optimasi SEO Real-Time */}
                    {(() => {
                      const seoAnalysis = analyzeArticleSEO({
                        title: artTitle,
                        content: artContent,
                        metaTitle: artMetaTitle,
                        metaDescription: artMetaDesc,
                        focusKeyword: artFocusKeyword
                      });

                      return (
                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F3827] flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-4 h-4 text-[#C8A951]" />
                              <span>Asisten Koreksi & Audit SEO Artikel</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                              seoAnalysis.score >= 80 ? 'bg-emerald-100 text-emerald-800' : seoAnalysis.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Skor SEO: {seoAnalysis.score}/100 • {seoAnalysis.statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <label className="block text-stone-700 font-semibold mb-0.5">Kata Kunci Fokus:</label>
                              <input
                                type="text"
                                placeholder="Cth: Wisata Garut, Gunung Papandayan..."
                                value={artFocusKeyword}
                                onChange={(e) => setArtFocusKeyword(e.target.value)}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={handleAutoOptimizeNewArticle}
                                className="w-full py-1.5 px-3 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shadow-xs"
                              >
                                <Zap className="w-3.5 h-3.5 text-[#C8A951]" />
                                <span>⚡ Auto Koreksi & Optimasi SEO</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                            <div>
                              <div className="flex justify-between text-[11px] mb-0.5">
                                <label className="text-stone-700 font-medium">Meta Title SEO (Hasil Pencarian):</label>
                                <span className={`font-mono text-[10px] ${artMetaTitle.length >= 35 && artMetaTitle.length <= 65 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {artMetaTitle.length} / 60 kar
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Judul optimasi untuk Google..."
                                value={artMetaTitle}
                                onChange={(e) => setArtMetaTitle(e.target.value)}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-[11px] mb-0.5">
                                <label className="text-stone-700 font-medium">Meta Description SEO:</label>
                                <span className={`font-mono text-[10px] ${artMetaDesc.length >= 110 && artMetaDesc.length <= 165 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {artMetaDesc.length} / 160 kar
                                </span>
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Deskripsi meta snippet..."
                                value={artMetaDesc}
                                onChange={(e) => setArtMetaDesc(e.target.value)}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-stone-700 font-medium text-[11px] mb-0.5">Kata Kunci Terkait (Keywords):</label>
                              <input
                                type="text"
                                placeholder="Kata kunci dipisahkan koma..."
                                value={artKeywords}
                                onChange={(e) => setArtKeywords(e.target.value)}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                              />
                            </div>
                          </div>

                          {/* Checklist Hasil Koreksi SEO */}
                          <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-[11px]">
                            <span className="font-bold text-stone-800 block text-[10px] uppercase">Audit Parameter SEO:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {seoAnalysis.checks.map(c => (
                                <div key={c.id} className="flex items-center gap-1.5">
                                  {c.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  )}
                                  <span className={c.passed ? 'text-stone-700' : 'text-amber-800 font-medium'}>
                                    {c.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewArticleModal(false)}
                        className="px-4 py-2 bg-stone-200 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0F3827] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                      >
                        Terbitkan Artikel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Edit Artikel */}
            {editingArticle && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Edit Artikel Wisata
                    </h3>
                    <button
                      onClick={() => setEditingArticle(null)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSaveEditArticle} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Judul Artikel</label>
                      <input
                        type="text"
                        required
                        value={editingArticle.title}
                        onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Kategori</label>
                      <select
                        value={editingArticle.category}
                        onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      >
                        <option>Tips & Panduan</option>
                        <option>Eksplorasi Alam</option>
                        <option>Kuliner & Budaya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Penulis</label>
                      <input
                        type="text"
                        required
                        value={editingArticle.author}
                        onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Ringkasan</label>
                      <textarea
                        rows={2}
                        value={editingArticle.summary}
                        onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Konten Lengkap</label>
                      <textarea
                        rows={6}
                        required
                        value={editingArticle.content}
                        onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">URL Gambar</label>
                      <input
                        type="text"
                        value={editingArticle.imageUrl}
                        onChange={(e) => setEditingArticle({ ...editingArticle, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    {/* Panel Koreksi & Optimasi SEO Real-Time untuk Edit Artikel */}
                    {(() => {
                      const seoAnalysis = analyzeArticleSEO({
                        title: editingArticle.title,
                        content: editingArticle.content,
                        metaTitle: editingArticle.metaTitle,
                        metaDescription: editingArticle.metaDescription,
                        focusKeyword: editArtFocusKeyword
                      });

                      return (
                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0F3827] flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-4 h-4 text-[#C8A951]" />
                              <span>Asisten Koreksi & Audit SEO Artikel</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                              seoAnalysis.score >= 80 ? 'bg-emerald-100 text-emerald-800' : seoAnalysis.score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              Skor SEO: {seoAnalysis.score}/100 • {seoAnalysis.statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <label className="block text-stone-700 font-semibold mb-0.5">Kata Kunci Fokus:</label>
                              <input
                                type="text"
                                placeholder="Cth: Wisata Garut, Gunung Papandayan..."
                                value={editArtFocusKeyword}
                                onChange={(e) => setEditArtFocusKeyword(e.target.value)}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                              />
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={handleAutoOptimizeEditArticle}
                                className="w-full py-1.5 px-3 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shadow-xs"
                              >
                                <Zap className="w-3.5 h-3.5 text-[#C8A951]" />
                                <span>⚡ Auto Koreksi & Optimasi SEO</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                            <div>
                              <div className="flex justify-between text-[11px] mb-0.5">
                                <label className="text-stone-700 font-medium">Meta Title SEO (Hasil Pencarian):</label>
                                <span className={`font-mono text-[10px] ${editingArticle.metaTitle && editingArticle.metaTitle.length >= 35 && editingArticle.metaTitle.length <= 65 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {editingArticle.metaTitle?.length || 0} / 60 kar
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Judul optimasi untuk Google..."
                                value={editingArticle.metaTitle || ''}
                                onChange={(e) => setEditingArticle({ ...editingArticle, metaTitle: e.target.value })}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between text-[11px] mb-0.5">
                                <label className="text-stone-700 font-medium">Meta Description SEO:</label>
                                <span className={`font-mono text-[10px] ${editingArticle.metaDescription && editingArticle.metaDescription.length >= 110 && editingArticle.metaDescription.length <= 165 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                  {editingArticle.metaDescription?.length || 0} / 160 kar
                                </span>
                              </div>
                              <textarea
                                rows={2}
                                placeholder="Deskripsi meta snippet..."
                                value={editingArticle.metaDescription || ''}
                                onChange={(e) => setEditingArticle({ ...editingArticle, metaDescription: e.target.value })}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-stone-700 font-medium text-[11px] mb-0.5">Kata Kunci Terkait (Keywords):</label>
                              <input
                                type="text"
                                placeholder="Kata kunci dipisahkan koma..."
                                value={editingArticle.keywords || ''}
                                onChange={(e) => setEditingArticle({ ...editingArticle, keywords: e.target.value })}
                                className="w-full px-2.5 py-1.5 border rounded-lg bg-white text-xs"
                              />
                            </div>
                          </div>

                          {/* Checklist Hasil Koreksi SEO */}
                          <div className="pt-2 border-t border-emerald-200/60 space-y-1 text-[11px]">
                            <span className="font-bold text-stone-800 block text-[10px] uppercase">Audit Parameter SEO:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {seoAnalysis.checks.map(c => (
                                <div key={c.id} className="flex items-center gap-1.5">
                                  {c.passed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  )}
                                  <span className={c.passed ? 'text-stone-700' : 'text-amber-800 font-medium'}>
                                    {c.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingArticle(null)}
                        className="px-4 py-2 bg-stone-200 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0F3827] text-white font-bold rounded-lg cursor-pointer"
                      >
                        Simpan Perubahan Artikel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: GALLERY MANAGEMENT (EDITABLE) */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Manajemen Galeri Foto Wisata
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Tambahkan, edit, atau hapus foto panorama keindahan alam Garut.
                </p>
              </div>

              <button
                onClick={() => setShowNewGalleryModal(true)}
                className="px-4 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Foto Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="aspect-16/10 bg-stone-100 overflow-hidden relative">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] text-stone-400 font-medium">{item.location}</span>
                      <h4 className="font-serif-luxury font-bold text-stone-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-end gap-2 border-t pt-3">
                    <button
                      onClick={() => handleOpenEditGallery(item)}
                      className="text-stone-700 hover:text-[#0F3827] text-xs flex items-center gap-1 cursor-pointer font-medium px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded"
                      title="Edit foto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGallery(item.id, item.title)}
                      className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1 cursor-pointer font-medium px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Tambah Galeri */}
            {showNewGalleryModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    Tambah Foto Galeri Baru
                  </h3>
                  <form onSubmit={handleCreateGallery} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Judul Foto</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Sunset di Situ Bagendit"
                        value={galTitle}
                        onChange={(e) => setGalTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Kategori</label>
                      <select
                        value={galCategory}
                        onChange={(e) => setGalCategory(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      >
                        <option>Gunung</option>
                        <option>Kawah & Danau</option>
                        <option>Air Terjun</option>
                        <option>Budaya & Kuliner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Lokasi di Garut</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Banyuresmi, Garut"
                        value={galLocation}
                        onChange={(e) => setGalLocation(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">URL Gambar</label>
                      <input
                        type="text"
                        value={galImage}
                        onChange={(e) => setGalImage(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Deskripsi Singkat</label>
                      <input
                        type="text"
                        placeholder="Deskripsi pemandangan..."
                        value={galDesc}
                        onChange={(e) => setGalDesc(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewGalleryModal(false)}
                        className="px-4 py-2 bg-stone-200 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0F3827] text-white font-bold rounded-lg cursor-pointer"
                      >
                        Simpan Foto
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Edit Galeri */}
            {editingGallery && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                      Edit Item Galeri
                    </h3>
                    <button
                      onClick={() => setEditingGallery(null)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSaveEditGallery} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Judul Foto</label>
                      <input
                        type="text"
                        required
                        value={editingGallery.title}
                        onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Kategori</label>
                      <select
                        value={editingGallery.category}
                        onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      >
                        <option>Gunung</option>
                        <option>Kawah & Danau</option>
                        <option>Air Terjun</option>
                        <option>Budaya & Kuliner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Lokasi</label>
                      <input
                        type="text"
                        required
                        value={editingGallery.location}
                        onChange={(e) => setEditingGallery({ ...editingGallery, location: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">URL Gambar</label>
                      <input
                        type="text"
                        value={editingGallery.imageUrl}
                        onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Deskripsi Singkat</label>
                      <input
                        type="text"
                        value={editingGallery.description}
                        onChange={(e) => setEditingGallery({ ...editingGallery, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingGallery(null)}
                        className="px-4 py-2 bg-stone-200 rounded-lg cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0F3827] text-white font-bold rounded-lg cursor-pointer"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: WARNA TEMA WEBSITE & TEMPLAT PESAN WHATSAPP */}
        {activeTab === 'theme_colors' && (
          <div className="max-w-4xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div>
              <span className="text-[10px] text-[#C8A951] uppercase font-bold tracking-wider block">
                Visual Branding & Integrasi Notifikasi
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">
                Kustomisasi Warna Tema & Templat Pesan WhatsApp
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Sesuaikan skema warna utama website dan format teks pesan WhatsApp otomatis yang dikirimkan kepada calon wisatawan.
              </p>
            </div>

            {themeSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{themeSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveThemeAndWhatsApp} className="space-y-6 text-xs">
              {/* Preset Palettes */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-800 block">Pilihan Palet Warna Siap Pakai (Preset Themes):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {PRESET_THEMES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(t.primaryColor);
                        setPrimaryDarkColor(t.primaryDarkColor);
                        setPrimaryHoverColor(t.primaryHoverColor);
                        setAccentColor(t.accentColor);
                        setAccentHoverColor(t.accentHoverColor);
                      }}
                      className="p-3 rounded-xl border border-stone-200 bg-white hover:border-[#0F3827] text-left space-y-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span className="font-bold text-stone-800 block text-xs">{t.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.primaryColor }}></span>
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.accentColor }}></span>
                        <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.primaryDarkColor }}></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 rounded-xl border border-stone-200">
                  <label className="font-semibold text-stone-700 block">Warna Utama (Primary Green)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg bg-stone-50 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl border border-stone-200">
                  <label className="font-semibold text-stone-700 block">Warna Aksen Emas (Accent Gold)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg bg-stone-50 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl border border-stone-200">
                  <label className="font-semibold text-stone-700 block">Warna Gelap Footer (Primary Dark)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryDarkColor}
                      onChange={(e) => setPrimaryDarkColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={primaryDarkColor}
                      onChange={(e) => setPrimaryDarkColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg bg-stone-50 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl border border-stone-200">
                  <label className="font-semibold text-stone-700 block">Warna Hover Tombol (Primary Hover)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg bg-stone-50 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Templates */}
              <div className="pt-4 border-t space-y-4">
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                    Templat Pesan WhatsApp Otomatis
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Gunakan placeholder otomatis seperti {'{bookingNumber}'}, {'{customerName}'}, {'{packageName}'}, {'{totalAmount}'}, {'{ticketUrl}'}.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 block">
                    1. Pesan Konfirmasi Booking Baru
                  </label>
                  <textarea
                    rows={2}
                    value={waTemplateBooking}
                    onChange={(e) => setWaTemplateBooking(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 block">
                    2. Pesan Tagihan Invoice & Link E-Ticket Resmi
                  </label>
                  <textarea
                    rows={4}
                    value={waTemplateInvoice}
                    onChange={(e) => setWaTemplateInvoice(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-stone-700 block">
                    3. Pesan Konsultasi Umum WhatsApp Floating Button
                  </label>
                  <textarea
                    rows={2}
                    value={waTemplateGeneral}
                    onChange={(e) => setWaTemplateGeneral(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <button
                  type="submit"
                  disabled={themeSaving}
                  className="px-6 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${themeSaving ? 'animate-spin' : ''}`} />
                  <span>{themeSaving ? 'Menyimpan...' : 'Simpan Tema & Templat WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 7: BRANDING, LOGO, LEGALITAS & FOOTER */}
        {activeTab === 'branding_legality' && (
          <div className="max-w-4xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div>
              <span className="text-[10px] text-[#C8A951] uppercase font-bold tracking-wider block">
                Editor Logo, Tampilan Browser & Legalitas Perusahaan
              </span>
              <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mt-1">
                Kustomisasi Logo Website, Favicon & Elemen Footer
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Ganti logo website, logo favicon tab browser, teks legalitas NIB, dan kontak resmi yang langsung tersimpan secara permanen.
              </p>
            </div>

            {settingsSavedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan logo, favicon, dan legalitas berhasil disimpan secara permanen!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* BAGIAN 1: LOGO WEBSITE & FAVICON TAB BROWSER */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-bold text-sm text-[#0F3827] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C8A951]" />
                  <span>1. Logo Website & Logo Tampilan Browser (Favicon Tab)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Logo Website */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-800">
                      URL Logo Website (Tampil di Navbar & Footer):
                    </label>
                    <input
                      type="text"
                      placeholder="https://... atau /logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-[11px]"
                    />
                    <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center gap-3">
                      <div className="w-12 h-12 bg-stone-100 rounded flex items-center justify-center overflow-hidden border">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Preview Logo" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-stone-400">Default</span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {logoUrl ? 'Preview Logo Kustom' : 'Menggunakan logo bawaan Garut Journey'}
                      </div>
                    </div>
                  </div>

                  {/* Favicon Browser Tab */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-800">
                      URL Favicon / Icon Tab Browser:
                    </label>
                    <input
                      type="text"
                      placeholder="https://... atau /favicon.ico"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-[11px]"
                    />
                    <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded flex items-center justify-center overflow-hidden border">
                        {faviconUrl ? (
                          <img src={faviconUrl} alt="Preview Favicon" className="w-full h-full object-contain" />
                        ) : (
                          <Globe className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {faviconUrl ? 'Preview Icon Tab Browser' : 'Icon tab browser aktif'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN 2: DESTINASI UNGGULAN FOOTER */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <h3 className="font-bold text-sm text-[#0F3827]">
                  2. Kolom "DESTINASI UNGGULAN" Footer (1 baris per destinasi):
                </h3>
                <textarea
                  rows={4}
                  value={footerDestinations}
                  onChange={(e) => setFooterDestinations(e.target.value)}
                  className="w-full p-3 bg-white border border-stone-300 rounded-xl font-mono text-xs text-stone-800"
                />
              </div>

              {/* BAGIAN 3: KANTOR OPERASIONAL & KONTAK */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-bold text-sm text-[#0F3827]">
                  3. Kolom "KANTOR OPERASIONAL" & Kontak Resmi:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Alamat Kantor Garut:</label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Nomor WhatsApp Resmi:</label>
                    <input
                      type="text"
                      value={whatsappNum}
                      onChange={(e) => setWhatsappNum(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Email Dukungan Pelanggan:</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Jam Layanan Pelanggan:</label>
                    <input
                      type="text"
                      value={serviceHours}
                      onChange={(e) => setServiceHours(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* BAGIAN 4: LEGALITAS PERUSAHAAN */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="font-bold text-sm text-[#0F3827]">
                  4. Dokumen Legalitas & Perizinan Berusaha:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Nama Perusahaan PT:</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Nomor Induk Berusaha (NIB):</label>
                    <input
                      type="text"
                      value={nibNumber}
                      onChange={(e) => setNibNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-semibold">Izin Pariwisata (SIUP/TDUP):</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Semua Pengaturan & Logo
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: WEBSITE GLOBAL SEO SETTINGS (Permintaan User: Buat website memiliki SEO sendiri) */}
        {activeTab === 'seo' && (
          <div className="max-w-4xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] text-[#C8A951] uppercase font-bold tracking-wider block">
                  Search Engine Optimization (SEO) & Google Indexing
                </span>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 mt-0.5">
                  Pengaturan SEO Website & Live Google Snippet
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kelola meta tag judul, deskripsi pencarian, canonical URL, robots.txt, dan pratinjau live tampilan di Google.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-stone-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#0F3827]" />
                  <span>Lihat Sitemap XML</span>
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-stone-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#0F3827]" />
                  <span>Lihat Robots.txt</span>
                </a>
              </div>
            </div>

            {seoSavedMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan SEO website berhasil disimpan dan aktif langsung di mesin pencari!</span>
              </div>
            )}

            {/* LIVE GOOGLE SEARCH RESULT SNIPPET PREVIEW */}
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F3827] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#C8A951]" />
                  <span>Pratinjau Hasil Pencarian Google (Live SERP Preview)</span>
                </span>

                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSeoDevicePreview('desktop')}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-medium cursor-pointer ${
                      seoDevicePreview === 'desktop' ? 'bg-[#0F3827] text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoDevicePreview('mobile')}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-medium cursor-pointer ${
                      seoDevicePreview === 'mobile' ? 'bg-[#0F3827] text-white' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Realistic Google Search Card */}
              <div className={`p-4 bg-white rounded-xl border border-stone-200 shadow-xs space-y-1 ${seoDevicePreview === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <div className="flex items-center gap-2 text-[12px] text-stone-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-800 flex items-center justify-center text-[9px] text-white font-bold">G</div>
                  <div className="flex flex-col leading-none">
                    <span className="font-medium text-stone-800 text-[11px]">Garut Journey</span>
                    <span className="text-[10px] text-stone-500 font-mono truncate">{canonicalUrl || 'https://garutjourney.id'}</span>
                  </div>
                </div>

                <h4 className="text-blue-800 hover:underline cursor-pointer font-medium text-base line-clamp-1 pt-1 leading-snug">
                  {metaTitle || 'Garut Journey – Jelajahi Keindahan Wisata Garut'}
                </h4>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                  {metaDescription || 'Temukan pengalaman wisata Garut yang berkesan melalui paket perjalanan praktis, nyaman, dan mudah dipesan secara online. Papandayan, Kamojang, Bagendit.'}
                </p>
              </div>

              {/* Character length indicator bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-stone-500">Panjang Judul SEO:</span>
                  <span className={`font-mono font-bold ${metaTitle.length >= 40 && metaTitle.length <= 65 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {metaTitle.length} / 60 karakter ({metaTitle.length >= 40 && metaTitle.length <= 65 ? 'Optimal' : 'Perlu disesuaikan'})
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200">
                  <span className="text-stone-500">Panjang Deskripsi:</span>
                  <span className={`font-mono font-bold ${metaDescription.length >= 120 && metaDescription.length <= 165 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {metaDescription.length} / 160 karakter ({metaDescription.length >= 120 && metaDescription.length <= 165 ? 'Optimal' : 'Perlu disesuaikan'})
                  </span>
                </div>
              </div>
            </div>

            {/* SEO FORM */}
            <form onSubmit={handleSaveSEO} className="space-y-5 text-xs">
              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  Meta Title Website Utama (Muncul di Tab Browser & Google):
                </label>
                <input
                  type="text"
                  required
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Contoh: Garut Journey – Jelajahi Keindahan Wisata Garut"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-medium text-stone-900 focus:bg-white"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Rekomendasi: 40–60 karakter yang memuat kata kunci utama (Wisata Garut, Tour Garut, Private Trip).
                </span>
              </div>

              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  Meta Description Website (Ringkasan Google Snippet):
                </label>
                <textarea
                  rows={3}
                  required
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat tentang paket wisata Garut..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white"
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Rekomendasi: 120–160 karakter memuat ajakan bertindak (CTA) dan destinasi utama.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-800 font-semibold mb-1">
                    Meta Keywords (Kata Kunci Pencarian):
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="Wisata Garut, Tour Garut, Private Trip, Papandayan..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-semibold mb-1">
                    Canonical URL Resmi Website:
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://garutjourney.id"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-[11px] text-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  OpenGraph Social Share Card Image (Gambar Saat Link Dibagikan di WA/FB/Twitter):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="https://... atau /src/assets/images/hero_garut_papandayan_1792431914366.jpg"
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-[11px]"
                  />
                  {ogImageUrl && (
                    <div className="w-12 h-10 rounded border overflow-hidden shrink-0 bg-stone-100">
                      <img src={ogImageUrl} alt="OG Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  Konfigurasi Aturan Perayapan Bot Mesin Pencari (robots.txt):
                </label>
                <textarea
                  rows={6}
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  className="w-full p-3 bg-stone-900 text-emerald-400 font-mono text-xs rounded-xl"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Konfigurasi SEO Website
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 8: AUDIT & LOG GATEWAY PEMBAYARAN */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Audit Log Pembayaran & Webhook Midtrans
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Audit trail transaksi idempotent untuk verifikasi rekonsiliasi keuangan.
                </p>
              </div>

              <button
                onClick={handleClearAllActivities}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua Log Aktivitas Website</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Waktu Kejadian</th>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Tipe Event</th>
                      <th className="p-3.5">Status Proses</th>
                      <th className="p-3.5">Payload Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {paymentEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-stone-500">
                          Belum ada event audit transaksi yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      paymentEvents.map(ev => (
                        <tr key={ev.id} className="hover:bg-stone-50/50">
                          <td className="p-3.5 font-mono text-stone-500">{new Date(ev.createdAt).toLocaleString('id-ID')}</td>
                          <td className="p-3.5 font-mono font-bold text-stone-900">{ev.orderId}</td>
                          <td className="p-3.5">
                            <span className="font-mono text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                              {ev.eventType}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Idempotent Processed
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[10px] text-stone-500 max-w-xs truncate">
                            {JSON.stringify(ev.payload)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL */}
        {deleteConfirm && deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
                    {deleteConfirm.title}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tindakan ini permanen dan tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 text-xs text-stone-700 space-y-2">
                <p>{deleteConfirm.message}</p>
                {deleteConfirm.itemName && (
                  <div className="font-semibold text-rose-900 bg-white px-2.5 py-1.5 rounded-lg border border-rose-200 text-xs truncate">
                    {deleteConfirm.itemName}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  disabled={deleteConfirm.isDeleting}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deleteConfirm.isDeleting}
                  onClick={async () => {
                    setDeleteConfirm(prev => prev ? { ...prev, isDeleting: true } : null);
                    try {
                      await deleteConfirm.onConfirm();
                    } finally {
                      setDeleteConfirm(null);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
                >
                  {deleteConfirm.isDeleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Ya, Hapus Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM IN-APP TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-bottom duration-200 bg-stone-900 text-white border-stone-800">
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {toastMessage.type === 'info' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span className="max-w-xs">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-stone-400 hover:text-white p-0.5"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
