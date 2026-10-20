import React, { useState, useEffect, useRef } from 'react';
import type { TourPackage, GalleryItem } from '../types.js';
import { PackageCard } from '../components/PackageCard.js';
import { updateSEO } from '../utils/seo.js';
import { useLanguage } from '../context/LanguageContext.tsx';
import {
  Compass,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  Users,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Camera,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface HomePageProps {
  packages: TourPackage[];
  navigate: (path: string) => void;
  onSelectPackage: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ packages, navigate, onSelectPackage }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showTripDropdown, setShowTripDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close trip dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTripDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch uploaded gallery items for right-side showcase
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGalleryItems(json.data);
        } else {
          // Fallback to initial curated gallery items
          setGalleryItems([
            {
              id: 'gal-default-1',
              title: 'Matahari Terbit di Kawah Gunung Papandayan',
              category: 'Gunung & Alam',
              location: 'TWA Gunung Papandayan, Cisurupan',
              imageUrl: '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
              description: 'Siluet dramatis pepohonan Hutan Mati berlatar fajar keemasan di ketinggian 2.665 mdpl.',
              createdAt: new Date().toISOString()
            },
            {
              id: 'gal-default-2',
              title: 'Keheningan Danau Geothermal Kawah Kamojang',
              category: 'Kawah & Danau',
              location: 'Samarang, Garut',
              imageUrl: '/src/assets/images/tour_kamojang_pine_1792431915131.jpg',
              description: 'Jembatan kayu setapak melintasi danau air hangat berbalut kabut pagi dan hutan pinus asri.',
              createdAt: new Date().toISOString()
            },
            {
              id: 'gal-default-3',
              title: 'Senja di Situ Bagendit Berlatar Gunung Guntur',
              category: 'Kawah & Danau',
              location: 'Banyuresmi, Garut',
              imageUrl: '/src/assets/images/tour_situ_bagendit_1792431916060.jpg',
              description: 'Pantulan langit senja keemasan di atas air tenang danau Situ Bagendit.',
              createdAt: new Date().toISOString()
            },
            {
              id: 'gal-default-4',
              title: 'Kemegahan Air Terjun Kembar Curug Sanghyang Taraje',
              category: 'Air Terjun',
              location: 'Pamulihan, Garut Selatan',
              imageUrl: '/src/assets/images/tour_curug_taraje_1792431915604.jpg',
              description: 'Dua aliran air terjun raksasa setinggi 90 meter membelah dinding tebing karst hijau perawan.',
              createdAt: new Date().toISOString()
            }
          ]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingGallery(false));
  }, []);

  useEffect(() => {
    updateSEO({
      title: 'Garut Journey – Jelajahi Keindahan Wisata Garut',
      description: 'Platform resmi tour & travel Garut Journey. Jelajahi Gunung Papandayan, Kawah Kamojang, Situ Bagendit, dan Curug Sanghyang Taraje dengan private trip eksklusif & pembayaran online aman.',
      keywords: 'Wisata Garut, Tour Garut, Private Trip Garut, Papandayan, Kamojang, Situ Bagendit, Curug Taraje, Travel Garut',
      canonicalPath: '/',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        'name': 'Garut Journey',
        'url': window.location.origin,
        'description': 'Layanan tour & travel resmi spesialis wisata alam Garut Jawa Barat.',
        'areaServed': 'Garut, Jawa Barat, Indonesia'
      }
    });
  }, []);

  // Auto-rotating uploaded gallery showcase timer
  useEffect(() => {
    if (galleryItems.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % galleryItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [galleryItems.length, isPaused]);

  // Clickable popular trip presets as requested by user
  const popularTripPresets = [
    { label: '🏔️ Papandayan', query: 'Papandayan', category: 'Gunung & Alam' },
    { label: '🌋 Kamojang', query: 'Kamojang', category: 'Keluarga & Relaksasi' },
    { label: '🚣 Situ Bagendit', query: 'Situ Bagendit', category: 'Budaya & Sejarah' },
    { label: '🌊 Curug Taraje', query: 'Curug Sanghyang Taraje', category: 'Petualangan Alam' },
    { label: '♨️ Darajat Pass', query: 'Darajat', category: 'Keluarga & Relaksasi' },
    { label: '🏖️ Pantai Santolo', query: 'Santolo', category: 'Petualangan Alam' },
    { label: '⭐ Semua Paket', query: '', category: 'Semua' }
  ];

  const handleSelectPreset = (preset: { query: string; category: string }) => {
    setSearchQuery(preset.query);
    setSelectedCategory(preset.category);
    setShowTripDropdown(false);
    navigate(`/paket-wisata?q=${encodeURIComponent(preset.query)}&cat=${encodeURIComponent(preset.category)}`);
  };

  const handleSelectTripDropdown = (pkgName: string, category: string, slug?: string) => {
    setSearchQuery(pkgName);
    setSelectedCategory(category);
    setShowTripDropdown(false);
    if (slug) {
      onSelectPackage(slug);
    } else {
      navigate(`/paket-wisata?q=${encodeURIComponent(pkgName)}&cat=${encodeURIComponent(category)}`);
    }
  };

  const categories = [
    'Semua',
    'Gunung & Alam',
    'Keluarga & Relaksasi',
    'Budaya & Sejarah',
    'Petualangan Alam'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTripDropdown(false);
    navigate(`/paket-wisata?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(selectedCategory)}`);
  };

  const filteredDropdownPackages = packages.filter(pkg => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      pkg.name.toLowerCase().includes(q) ||
      pkg.destinationArea.toLowerCase().includes(q) ||
      pkg.category.toLowerCase().includes(q) ||
      pkg.shortDescription.toLowerCase().includes(q)
    );
  });

  const [homeCategoryFilter, setHomeCategoryFilter] = useState('Semua');

  const displayedPackages = packages.filter(pkg => {
    if (homeCategoryFilter === 'Semua') return true;
    return pkg.category.toLowerCase().includes(homeCategoryFilter.toLowerCase());
  });

  const featured = displayedPackages.slice(0, 6);
  const activeGalleryItem = galleryItems[currentSlide] || galleryItems[0];
  const activeImgUrl = activeGalleryItem?.imageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg';

  const testimonials = [
    {
      name: 'Rian Pratama',
      role: 'Travel Enthusiast & Fotografer',
      city: 'Jakarta Selatan',
      text: 'Trip Papandayan 2H1M bersama Garut Journey sangat berkesan. Pemandu Kang Asep sangat memahami titik sunrise terbaik di Hutan Mati dan Tegal Alun. Makanan liwet hangat di camp Pondok Saladah luar biasa lezat.',
      package: 'Eksplorasi Gunung Papandayan'
    },
    {
      name: 'Dr. Sarah Nurhaliza',
      role: 'Family Trip Organizer',
      city: 'Bandung',
      text: 'Kami memesan paket Kamojang untuk reuni keluarga termasuk orang tua lansia. Mobil HiAce sangat nyaman, sopir tepat waktu, dan sauna uap alami Kawah Kamojang benar-benar menyegarkan.',
      package: 'Relaksasi Geothermal Kamojang'
    },
    {
      name: 'Michael Tanuwijaya',
      role: 'Content Creator',
      city: 'Surabaya',
      text: 'Booking online sangat praktis dan pembayaran Midtrans aman instan. Dokumentasi drone yang disediakan tim sangat profesional. Garut Journey benar-benar operator lokal terpercaya.',
      package: 'Curug Sanghyang Taraje Trip'
    }
  ];

  const faqs = [
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
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-[#0A261A] text-white overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial from-emerald-900/40 via-transparent to-transparent opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Search Widget */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A951] font-semibold">
                  <Compass className="w-4 h-4" />
                  <span>{t('heroBadge')}</span>
                </div>

                <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-100 leading-[1.15] text-balance">
                  {t('heroMainTitle')}
                </h1>

                <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-light">
                  {t('heroMainSubtitle')}
                </p>
              </div>

              {/* Integrated Search Bar Module with Instant Click Presets & Dropdown */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 text-stone-900">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Destination Search with Clickable Auto-dropdown List */}
                    <div className="sm:col-span-2 relative" ref={dropdownRef}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                          {t('searchTitle')}
                        </label>
                        <span className="text-[10px] text-emerald-800 font-medium hidden sm:inline">
                          ✨ Klik untuk memilih destinasi langsung
                        </span>
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          placeholder={t('heroSearchPlaceholder')}
                          value={searchQuery}
                          onFocus={() => setShowTripDropdown(true)}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowTripDropdown(true);
                          }}
                          className="w-full text-xs pl-9 pr-8 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTripDropdown(!showTripDropdown)}
                          className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                          title="Buka daftar pilihan trip"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${showTripDropdown ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Clickable Dropdown List for Trips & Packages */}
                      {showTripDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100 flex items-center justify-between">
                            <span>Pilihan Objek Wisata & Trip (Tinggal Klik)</span>
                            <span className="text-[9px] text-stone-400">Tidak perlu ketik manual</span>
                          </div>

                          {/* Render filtered Tour Packages */}
                          <div className="divide-y divide-stone-100">
                            {filteredDropdownPackages.length > 0 ? (
                              filteredDropdownPackages.map(pkg => (
                                <button
                                  key={pkg.id}
                                  type="button"
                                  onClick={() => handleSelectTripDropdown(pkg.name, pkg.category, pkg.slug)}
                                  className="w-full p-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-center gap-3 cursor-pointer group"
                                >
                                  <img
                                    src={pkg.images?.[0]?.imageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg'}
                                    alt={pkg.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-stone-900 group-hover:text-[#0F3827] truncate">
                                        {pkg.name}
                                      </span>
                                      <span className="text-[11px] font-mono font-bold text-[#0F3827] shrink-0 ml-2">
                                        Rp {pkg.basePrice.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                                      <span className="text-[#C8A951] font-semibold">{pkg.destinationArea}</span>
                                      <span>·</span>
                                      <span>{pkg.durationDays} Hari</span>
                                      <span>·</span>
                                      <span className="bg-emerald-100 text-emerald-800 px-1 rounded font-medium">100% Private</span>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center space-y-2">
                                <p className="text-xs text-stone-600">Tidak ada paket yang cocok dengan kata kunci &quot;{searchQuery}&quot;.</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery('');
                                    navigate('/paket-wisata');
                                  }}
                                  className="px-3 py-1 bg-[#0F3827] text-white text-[11px] font-semibold rounded-lg cursor-pointer"
                                >
                                  Lihat Seluruh Katalog Paket
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        {t('searchCategory')}
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827] cursor-pointer"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* QUICK-SELECT TRIP PILLS (Permintaan User: Pilihan trip pada gambar masukan di list supaya tinggal klik) */}
                  <div className="pt-1">
                    <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-1.5">
                      {t('searchPopularTrips')}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {popularTripPresets.map(preset => {
                        const isSelected = searchQuery === preset.query;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#0F3827] text-white border-[#0F3827] shadow-xs'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('trustMidtrans')}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>{t('btnFindTrip')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A951]" />
                  <span>{t('trustGuide')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A951]" />
                  <span>{t('trustGuaranteedSeat')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A951]" />
                  <span>{t('trustPaymentOptions')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Replaced with Uploaded Gallery Photos */}
            <div
              className="lg:col-span-5"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group aspect-4/3 lg:aspect-auto lg:h-[500px] bg-stone-900">
                <img
                  key={activeGalleryItem?.id || currentSlide}
                  src={activeImgUrl}
                  alt={activeGalleryItem?.title || 'Galeri Foto Wisata Garut'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A261A]/95 via-[#0A261A]/30 to-transparent" />

                {/* Top Badge & Slide Indicators */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[#C8A951] text-[10px] font-semibold tracking-wider border border-white/10">
                    <Camera className="w-3.5 h-3.5 text-[#C8A951]" />
                    <span className="uppercase">GALERI FOTO RESMI GARUT</span>
                  </div>

                  {/* Indicator Dots */}
                  {galleryItems.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      {galleryItems.slice(0, 6).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentSlide === idx ? 'w-4 bg-[#C8A951]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow Navigation */}
                {galleryItems.length > 1 && (
                  <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={() => setCurrentSlide(prev => (prev === 0 ? galleryItems.length - 1 : prev - 1))}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-sm text-white flex items-center justify-center pointer-events-auto transition-colors cursor-pointer border border-white/15 shadow"
                      aria-label="Foto Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(prev => (prev + 1) % galleryItems.length)}
                      className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-sm text-white flex items-center justify-center pointer-events-auto transition-colors cursor-pointer border border-white/15 shadow"
                      aria-label="Foto Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Floating caption card showing Uploaded Photo details */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-white/15 text-white z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#C8A951] font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activeGalleryItem?.location || 'Garut, Jawa Barat'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      Foto {currentSlide + 1} / {galleryItems.length}
                    </span>
                  </div>

                  <h4 className="font-serif-luxury text-base font-bold text-stone-100 line-clamp-1">
                    {activeGalleryItem?.title || 'Pesona Keindahan Alam Garut'}
                  </h4>

                  <p className="text-xs text-stone-300 line-clamp-2 font-light">
                    {activeGalleryItem?.description || 'Dokumentasi otentik perjalanan wisata alam dan budaya di Garut.'}
                  </p>

                  {/* Thumbnail strip of uploaded gallery photos */}
                  {galleryItems.length > 1 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-white/10 overflow-x-auto py-1">
                      {galleryItems.slice(0, 5).map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentSlide(idx)}
                          className={`w-12 h-9 rounded-md overflow-hidden border transition-all shrink-0 cursor-pointer ${
                            currentSlide === idx ? 'border-[#C8A951] ring-1 ring-[#C8A951] scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </button>
                      ))}

                      <button
                        onClick={() => navigate('/galeri')}
                        className="text-[10px] font-semibold text-[#C8A951] hover:text-amber-200 shrink-0 ml-auto flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded transition-colors"
                      >
                        <span>Semua Galeri</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tour Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
              {t('popularDestinations')}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {t('popularDestinationsSub')}
            </h2>
          </div>

          <button
            onClick={() => navigate('/paket-wisata')}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#0F3827] hover:text-[#17523A] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{t('heroBtnExplore')} ({packages.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Switcher on HomePage */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs no-scrollbar">
          {categories.map(cat => {
            const isActive = homeCategoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setHomeCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-[#0F3827] text-white border-[#0F3827] shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} onSelect={onSelectPackage} />
          ))}
        </div>
      </section>

      {/* Why Choose Garut Journey Section */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
              {t('whyChooseUs')}
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {t('whyChooseUsSub')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                {t('badgeCertifiedGuide')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('descCertifiedGuide')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                {t('badgeTransparentPrice')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('descTransparentPrice')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                {t('badgeEasyBooking')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('descEasyBooking')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                {t('badgePrivateTrip')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t('descPrivateTrip')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
            {t('testimonialsTitle')}
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {t('testimonialsSub')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-[#C8A951] uppercase tracking-wider">
                  {testi.package}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{testi.text}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100">
                <div className="font-semibold text-xs text-stone-900">{testi.name}</div>
                <div className="text-[11px] text-stone-500">{testi.role} · {testi.city}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
            {t('faqTitle')}
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {t('faqSub')}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
              <h3 className="font-serif-luxury text-base font-bold text-stone-900 flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#0F3827] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-stone-600 mt-2.5 pl-7.5 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F3827] rounded-2xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-100">
              {t('heroMainTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              {t('heroMainSubtitle')}
            </p>
          </div>

          <button
            onClick={() => navigate('/paket-wisata')}
            className="px-6 py-3.5 bg-[#C8A951] hover:bg-[#B89940] text-stone-950 text-xs uppercase tracking-wider font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-md"
          >
            {t('heroBtnExplore')}
          </button>
        </div>
      </section>
    </div>
  );
};
