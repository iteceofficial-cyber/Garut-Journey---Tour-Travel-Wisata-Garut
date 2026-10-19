import React, { useState, useEffect } from 'react';
import type { TourPackage, Article, GalleryItem, SiteSettings } from '../types.js';
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
  Image as ImageIcon
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'analytics' | 'bookings' | 'packages' | 'articles' | 'gallery' | 'branding_legality' | 'payments'
  >('overview');

  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [paymentEvents, setPaymentEvents] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [invoiceCustomNote, setInvoiceCustomNote] = useState('');

  // WhatsApp Invoice result state
  const [generatedInvoice, setGeneratedInvoice] = useState<{
    url: string;
    rawText: string;
    phone: string;
  } | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [sendingInvoice, setSendingInvoice] = useState(false);

  // Package activity / itinerary editing
  const [selectedPackageForActivities, setSelectedPackageForActivities] = useState<TourPackage | null>(null);
  const [newActivityDay, setNewActivityDay] = useState(1);
  const [newActivityText, setNewActivityText] = useState('');

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

  const adminToken = localStorage.getItem('gj_admin_token') || 'garut-admin-auth-2026';

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-token': adminToken };

      const [resMetrics, resAnalytics, resBookings, resPackages, resEvents, resArticles, resGallery, resSettings] =
        await Promise.all([
          fetch('/api/admin/metrics', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/analytics', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/bookings', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/packages').then(r => r.json()).catch(() => ({})),
          fetch('/api/admin/payments/events', { headers }).then(r => r.json()).catch(() => ({})),
          fetch('/api/articles').then(r => r.json()).catch(() => ({})),
          fetch('/api/gallery').then(r => r.json()).catch(() => ({})),
          fetch('/api/site-settings').then(r => r.json()).catch(() => ({}))
        ]);

      if (resMetrics.success) setMetrics(resMetrics.data);
      if (resAnalytics.success) setAnalytics(resAnalytics.data);
      if (resBookings.success) setBookings(resBookings.data);
      if (resPackages.success) setPackages(resPackages.data);
      if (resEvents.success) setPaymentEvents(resEvents.data);
      if (resArticles.success) setArticles(resArticles.data);
      if (resGallery.success) setGallery(resGallery.data);
      if (resSettings.success && resSettings.data) {
        setSiteSettings(resSettings.data);
        setLogoUrl(resSettings.data.logoUrl || '');
        setFaviconUrl(resSettings.data.faviconUrl || '');
        setFooterDestinations((resSettings.data.featuredDestinations || []).join('\n'));
        setOfficeAddress(resSettings.data.officeAddress || '');
        setWhatsappNum(resSettings.data.whatsappNumber || '');
        setSupportEmail(resSettings.data.supportEmail || '');
        setServiceHours(resSettings.data.customerServiceHours || '');
        setCompanyName(resSettings.data.companyName || '');
        setNibNumber(resSettings.data.nibNumber || '');
        setLicenseNumber(resSettings.data.licenseNumber || '');
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

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Hapus pesanan ini secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.')) return;
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
      } else {
        alert(json.error || 'Gagal menghapus pesanan.');
      }
    } catch {
      alert('Koneksi server gagal.');
    }
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
  const handleDeleteActivity = async (packageId: string, day: number, activityIndex: number) => {
    if (!confirm('Yakin ingin menghapus aktivitas ini dari jadwal perjalanan?')) return;
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
      }
    } catch {
      alert('Gagal menghapus aktivitas.');
    }
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
          readTimeMinutes: artReadTime
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowNewArticleModal(false);
        setArtTitle('');
        setArtContent('');
        setArtSummary('');
        fetchAllData();
      }
    } catch {
      alert('Gagal membuat artikel.');
    }
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle({ ...art });
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

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Hapus artikel ini secara permanen?')) return;
    try {
      await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      fetchAllData();
    } catch {
      alert('Gagal menghapus artikel.');
    }
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

  const handleDeleteGallery = async (id: string) => {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    try {
      await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      fetchAllData();
    } catch {
      alert('Gagal menghapus foto.');
    }
  };

  // Clear Activity Logs (Audits, Views, Emails)
  const handleClearAllActivities = async () => {
    if (!confirm('Apakah Anda yakin ingin MENGHAPUS SEMUA log aktivitas (audit pembayaran, riwayat pengunjung, dan log email)? Data pesanan tidak akan terhapus.')) return;
    try {
      const res = await fetch('/api/admin/activities/clear', {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const json = await res.json();
      if (json.success) {
        alert('Semua log aktivitas berhasil dibersihkan.');
        fetchAllData();
      } else {
        alert(json.error || 'Gagal membersihkan log.');
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
        b.bookingNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.customerEmail.toLowerCase().includes(q)
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

        {/* Tab Navigation Strip (Notice: Schedules removed, replaced with Visitor Analytics) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto text-xs font-medium border-t border-stone-800/60 py-1">
          {[
            { id: 'overview', label: 'Ringkasan & KPI', icon: TrendingUp },
            { id: 'analytics', label: 'Laporan Pengunjung', icon: BarChart3 },
            { id: 'bookings', label: 'Manajemen Booking', icon: Calendar },
            { id: 'packages', label: 'Paket & Aktivitas', icon: Package },
            { id: 'articles', label: 'Artikel & Blog', icon: BookOpen },
            { id: 'gallery', label: 'Galeri Foto', icon: Camera },
            { id: 'branding_legality', label: 'Logo & Legalitas', icon: Building },
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
                              onClick={() => handleDeleteBooking(b.id)}
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
                          onClick={() => handleDeleteBooking(selectedBooking.id)}
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
            <div>
              <h2 className="font-serif-luxury text-2xl font-bold text-stone-900">
                Manajemen Paket & Aktivitas Perjalanan
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Kelola paket private trip dan hapus aktivitas yang tidak relevan dari susunan rencana perjalanan (itinerary).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map(pkg => (
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

                  <div className="pt-2 border-t flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-medium">
                      {pkg.itinerary?.length || 0} Hari Itinerary
                    </span>
                    <button
                      onClick={() => setSelectedPackageForActivities(pkg)}
                      className="px-3 py-1.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Kelola Aktivitas</span>
                    </button>
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

                  {/* List of activities with delete button */}
                  <div className="space-y-4 text-xs">
                    {selectedPackageForActivities.itinerary.map(dayItem => (
                      <div key={dayItem.day} className="space-y-2 border-b pb-3">
                        <span className="font-bold text-sm text-[#0F3827] block">
                          Hari {dayItem.day}: {dayItem.title}
                        </span>

                        <div className="space-y-1.5">
                          {dayItem.activities.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="flex items-center justify-between p-2 rounded-lg bg-stone-50 hover:bg-stone-100 group transition-colors"
                            >
                              <span className="text-stone-700 flex-1 pr-2">{act}</span>
                              <button
                                onClick={() => handleDeleteActivity(selectedPackageForActivities.id, dayItem.day, actIdx)}
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
                        onClick={() => handleDeleteArticle(art.id)}
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
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewArticleModal(false)}
                        className="px-4 py-2 bg-stone-200 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0F3827] text-white font-bold rounded-lg"
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
                      onClick={() => handleDeleteGallery(item.id)}
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
      </div>
    </div>
  );
};
