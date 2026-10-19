import React, { useState, useEffect } from 'react';
import type { TourPackage } from '../types.js';
import { PackageCard } from '../components/PackageCard.js';
import { updateSEO } from '../utils/seo.js';
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
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  packages: TourPackage[];
  navigate: (path: string) => void;
  onSelectPackage: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ packages, navigate, onSelectPackage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-rotating hero showcase timer
  useEffect(() => {
    if (packages.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % packages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [packages.length, isPaused]);

  const categories = [
    'Semua',
    'Gunung & Alam',
    'Keluarga & Relaksasi',
    'Budaya & Sejarah',
    'Petualangan Alam'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/paket-wisata?q=${encodeURIComponent(searchQuery)}&cat=${encodeURIComponent(selectedCategory)}`);
  };

  const featured = packages.slice(0, 3);
  const activePackage = packages[currentSlide] || packages[0];
  const activeImgUrl = activePackage?.images?.[0]?.imageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg';

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
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A951] font-semibold">
                  <Compass className="w-4 h-4" />
                  <span>Garut Tour & Travel Specialist</span>
                </div>

                <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-100 leading-[1.15] text-balance">
                  Jelajahi Keindahan Garut Bersama Garut Journey
                </h1>

                <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-light">
                  Temukan pengalaman wisata Garut yang berkesan melalui paket perjalanan yang praktis, nyaman, dan mudah dipesan secara online.
                </p>
              </div>

              {/* Integrated Search Bar Module */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 text-stone-900">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Destination Search */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        Cari Objek Wisata / Paket
                      </label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Papandayan, Kamojang, Bagendit..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
                        Kategori Wisata
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Pembayaran Midtrans Terverifikasi • Kuota Resmi</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Temukan Jadwal Trip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A951]" />
                  <span>Pemandu HPI Garut</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A951]" />
                  <span>Garansi Kursi Terjamin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#C8A951]" />
                  <span>Pilihan Pembayaran Lengkap</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Auto-Rotating Hero Visual Showcase */}
            <div
              className="lg:col-span-5"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group aspect-4/3 lg:aspect-auto lg:h-[480px] bg-stone-900">
                <img
                  key={activePackage?.id || currentSlide}
                  src={activeImgUrl}
                  alt={activePackage?.name || 'Paket Wisata Garut'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A261A]/95 via-[#0A261A]/30 to-transparent" />

                {/* Top Badge & Slide Indicators */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[#C8A951] text-[10px] font-semibold tracking-wider border border-white/10">
                    <Sparkles className="w-3 h-3" />
                    <span>100% PRIVATE TRIP</span>
                  </div>

                  {/* Indicator Dots */}
                  {packages.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      {packages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentSlide === idx ? 'w-4 bg-[#C8A951]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow Navigation */}
                {packages.length > 1 && (
                  <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={() => setCurrentSlide(prev => (prev === 0 ? packages.length - 1 : prev - 1))}
                      className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center pointer-events-auto transition-colors cursor-pointer border border-white/10 shadow"
                      aria-label="Paket Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(prev => (prev + 1) % packages.length)}
                      className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center pointer-events-auto transition-colors cursor-pointer border border-white/10 shadow"
                      aria-label="Paket Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Floating caption card matching user reference */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-stone-900/85 backdrop-blur-md border border-white/10 text-white z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#C8A951] font-semibold block">
                      DESTINASI IKONIK GARUT · {activePackage?.destinationArea || 'GARUT'}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {currentSlide + 1} / {packages.length}
                    </span>
                  </div>
                  <h4 className="font-serif-luxury text-base font-bold mt-1 text-stone-100 line-clamp-1">
                    {activePackage?.name || 'Paket Garut Journey'}
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2 font-light">
                    {activePackage?.shortDescription || 'Pengalaman wisata eksklusif di Garut Jawa Barat.'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#C8A951] font-bold">
                      Mulai Rp {(activePackage?.basePrice || 550000).toLocaleString('id-ID')} / pax
                    </span>
                    <button
                      onClick={() => onSelectPackage(activePackage?.slug || '')}
                      className="text-stone-200 hover:text-white font-medium flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded transition-colors"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
              Pilihan Wisata Populer
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Paket Wisata Unggulan Garut
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Dirancang dengan rute optimal, akomodasi berkualitas, dan pemandu lokal berlisensi.
            </p>
          </div>

          <button
            onClick={() => navigate('/paket-wisata')}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#0F3827] hover:text-[#17523A] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Lihat Semua Paket ({packages.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Grid */}
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
              Standar Layanan Kami
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Mengapa Berwisata Bersama Garut Journey?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-2">
              Kami memadukan kemudahan pemesanan digital dengan keramahan khas tatar Pasundan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Pemandu Lokal Berlisensi
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Dipandu oleh pemandu asli Garut bersertifikasi HPI yang menguasai rute, sejarah lokal, dan titik foto terbaik.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Transparansi Biaya
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Harga paket telah mencakup tiket masuk, transportasi, dan makan. Tanpa ada pungutan liar atau biaya siluman di lokasi.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Pembayaran Midtrans Aman
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Transaksi terenkripsi via Midtrans Snap dengan pilihan QRIS, Virtual Account bank, dan konfirmasi otomatis instan.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                Alokasi Kuota Terjamin
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Sistem database mengunci kursi pesanan Anda secara real-time untuk menjamin Anda tidak mengalami overbooking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
            Pengalaman Tamu
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Cerita Perjalanan Bersama Kami
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Kisah nyata dari wisatawan yang telah mempercayakan liburan Garut mereka kepada kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                {/* Quiet unboxed metadata */}
                <div className="text-[11px] font-semibold text-[#C8A951] uppercase tracking-wider">
                  {t.package}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100">
                <div className="font-semibold text-xs text-stone-900">{t.name}</div>
                <div className="text-[11px] text-stone-500">{t.role} · {t.city}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
            Informasi Praktis
          </span>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Pertanyaan yang Sering Diajukan (FAQ)
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
              Siap Menjelajahi Pesona Alam Garut?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Pesan paket perjalanan Anda sekarang dengan jaminan kuota dan pembayaran online resmi.
            </p>
          </div>

          <button
            onClick={() => navigate('/paket-wisata')}
            className="px-6 py-3.5 bg-[#C8A951] hover:bg-[#B89940] text-stone-950 text-xs uppercase tracking-wider font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-md"
          >
            Pilih Paket Sekarang
          </button>
        </div>
      </section>
    </div>
  );
};
