import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  AddonOption,
  Booking,
  BookingItem,
  BookingStatus,
  PackageImage,
  Payment,
  PaymentEvent,
  PaymentStatus,
  Profile,
  Promotion,
  SiteSettings,
  TourPackage,
  PriceTier,
  CreateBookingRequest,
  Article,
  GalleryItem,
  PageViewEvent,
  Testimonial
} from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');

export const VERIFIED_ADDONS: Record<string, { name: string; price: number; unit: string; description: string }> = {
  'drone-doc': {
    name: 'Dokumentasi Video Drone 4K & Cinematic Reel',
    price: 350000,
    unit: 'per trip',
    description: 'Pilot drone profesional + video editan 60 detik siap posting Instagram/TikTok'
  },
  'porter-mount': {
    name: 'Jasa Porter Gunung Papandayan (Bawa Tenda/Logistik)',
    price: 250000,
    unit: 'per hari',
    description: 'Bawa perlengkapan hingga 20kg sehingga Anda dapat mendaki dengan santai'
  },
  'shuttle-bandung': {
    name: 'Penjemputan & Pengantaran Stasiun/Bandara Bandung (PP)',
    price: 450000,
    unit: 'per rombongan',
    description: 'Toyota HiAce / Avanza AC nyaman dari Bandung ke Garut PP'
  },
  'souvenir-garut': {
    name: 'Paket Oleh-oleh Khas (Dodol Garut Picnic & Chocodot)',
    price: 120000,
    unit: 'per pax',
    description: 'Kemasan eksklusif oleh-oleh legendaris Garut langsung siap dibawa pulang'
  }
};

export function getPackagePricePerPerson(pkg: TourPackage, participants: number): { pricePerPerson: number; tierLabel: string } {
  const count = Math.max(1, participants || 1);
  if (pkg.priceTiers && pkg.priceTiers.length > 0) {
    const sorted = [...pkg.priceTiers].sort((a, b) => a.minParticipants - b.minParticipants);
    const matched = sorted.find(t => count >= t.minParticipants && count <= t.maxParticipants);
    if (matched) {
      return { pricePerPerson: matched.pricePerPerson, tierLabel: matched.label };
    }
    if (count < sorted[0].minParticipants) {
      return { pricePerPerson: sorted[0].pricePerPerson, tierLabel: sorted[0].label };
    }
    const last = sorted[sorted.length - 1];
    return { pricePerPerson: last.pricePerPerson, tierLabel: last.label };
  }
  return { pricePerPerson: pkg.basePrice, tierLabel: 'Tarif Standar' };
}

class GarutJourneyStore {
  profiles: Profile[] = [];
  packages: TourPackage[] = [];
  packageImages: PackageImage[] = [];
  promotions: Promotion[] = [];
  bookings: Booking[] = [];
  bookingItems: BookingItem[] = [];
  payments: Payment[] = [];
  paymentEvents: PaymentEvent[] = [];
  articles: Article[] = [];
  gallery: GalleryItem[] = [];
  pageViews: PageViewEvent[] = [];
  testimonials: Testimonial[] = [
    {
      id: 'testi-1',
      name: 'Rian Pratama',
      role: 'Travel Enthusiast & Fotografer',
      city: 'Jakarta Selatan',
      text: 'Trip Papandayan 2H1M bersama Garut Journey sangat berkesan. Pemandu Kang Asep sangat memahami titik sunrise terbaik di Hutan Mati dan Tegal Alun. Makanan liwet hangat di camp Pondok Saladah luar biasa lezat.',
      package: 'Eksplorasi Gunung Papandayan',
      rating: 5,
      createdAt: '2026-09-15T08:00:00.000Z'
    },
    {
      id: 'testi-2',
      name: 'Dr. Sarah Nurhaliza',
      role: 'Family Trip Organizer',
      city: 'Bandung',
      text: 'Kami memesan paket Kamojang untuk reuni keluarga termasuk orang tua lansia. Mobil HiAce sangat nyaman, sopir tepat waktu, dan sauna uap alami Kawah Kamojang benar-benar menyegarkan.',
      package: 'Relaksasi Geothermal Kamojang',
      rating: 5,
      createdAt: '2026-09-28T10:30:00.000Z'
    },
    {
      id: 'testi-3',
      name: 'Michael Tanuwijaya',
      role: 'Content Creator',
      city: 'Surabaya',
      text: 'Booking online sangat praktis dan pembayaran Midtrans aman instan. Dokumentasi drone yang disediakan tim sangat profesional. Garut Journey benar-benar operator lokal terpercaya.',
      package: 'Curug Sanghyang Taraje Trip',
      rating: 5,
      createdAt: '2026-10-05T14:15:00.000Z'
    }
  ];
  addons: AddonOption[] = [
    {
      id: 'drone-doc',
      name: 'Dokumentasi Video Drone 4K & Cinematic Reel',
      price: 350000,
      unit: 'per trip',
      description: 'Pilot drone profesional + video editan 60 detik siap posting Instagram/TikTok',
      isActive: true
    },
    {
      id: 'porter-mount',
      name: 'Jasa Porter Gunung Papandayan (Bawa Tenda/Logistik)',
      price: 250000,
      unit: 'per hari',
      description: 'Bawa perlengkapan hingga 20kg sehingga Anda dapat mendaki dengan santai',
      isActive: true
    },
    {
      id: 'shuttle-bandung',
      name: 'Penjemputan & Pengantaran Stasiun/Bandara Bandung (PP)',
      price: 450000,
      unit: 'per rombongan',
      description: 'Toyota HiAce / Avanza AC nyaman dari Bandung ke Garut PP',
      isActive: true
    },
    {
      id: 'souvenir-garut',
      name: 'Paket Oleh-oleh Khas (Dodol Garut Picnic & Chocodot)',
      price: 120000,
      unit: 'per pax',
      description: 'Kemasan eksklusif oleh-oleh legendaris Garut langsung siap dibawa pulang',
      isActive: true
    }
  ];
  siteSettings: SiteSettings = {
    id: 'settings-1',
    companyName: 'PT Garut Journey Nusantara',
    brandName: 'Garut Journey',
    logoUrl: '',
    faviconUrl: '',
    nibNumber: '9120003482194',
    licenseNumber: 'SIUP-PAR-082/GRT/2024',
    officeAddress: 'Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151',
    whatsappNumber: '6281223456789',
    supportEmail: 'halo@garutjourney.id',
    customerServiceHours: 'Setiap hari, 08.00 – 21.00 WIB',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '148-092-8899',
    bankAccountHolder: 'PT Garut Journey Nusantara',
    paymentTimeoutMinutes: 60,

    // Website Colors Theme
    primaryColor: '#0F3827',
    primaryDarkColor: '#0A261A',
    primaryHoverColor: '#17523A',
    accentColor: '#C8A951',
    accentHoverColor: '#B89940',

    // WhatsApp Message Templates
    whatsappTemplateBooking: 'Halo Tim Garut Journey, saya baru saja membuat pesanan #{bookingNumber} untuk paket {packageName}. Mohon informasi tindak lanjutnya. Terima kasih!',
    whatsappTemplateInvoice: '*INVOICE & E-TICKET RESMI GARUT JOURNEY*\nNomor Pesanan: #{bookingNumber}\nNama Tamu: {customerName}\nPaket: {packageName}\nTanggal Trip: {departureDate}\nPeserta: {participantsCount} Orang\nStatus Pembayaran: {status}\nTotal Biaya: Rp {totalAmount}\nSudah Dibayar: Rp {paidAmount}\nSisa Pelunasan: Rp {remainingBalance}\n\nE-Ticket Digital: {ticketUrl}\n\n{customNote}\nTerima kasih telah mempercayakan liburan Garut Anda bersama kami!',
    whatsappTemplateHelp: 'Halo Admin Garut Journey, saya ingin konfirmasi pesanan wisata:\n- No. Booking: {bookingNumber}\n- Atas Nama: {customerName}\n- Paket: {packageName}\nMohon informasi persiapan perjalanannya. Terima kasih!',
    whatsappTemplateGeneral: 'Halo Tim Garut Journey, saya ingin konsultasi paket wisata Garut.',

    metaTitle: 'Garut Journey – Jelajahi Keindahan Wisata Garut',
    metaDescription: 'Temukan pengalaman wisata Garut yang berkesan melalui paket perjalanan praktis, nyaman, dan mudah dipesan secara online. Papandayan, Kamojang, Bagendit.',
    metaKeywords: 'Wisata Garut, Paket Wisata Garut, Tour Garut, Garut City Tour, Private Trip Garut, Papandayan Tour',
    canonicalUrl: 'https://garutjourney.id',
    ogImageUrl: '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
    robotsTxtContent: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /booking/\nDisallow: /pembayaran/\nDisallow: /api/\n\nSitemap: https://garutjourney.id/sitemap.xml`,
    featuredDestinations: [
      'Gunung Papandayan & Hutan Mati',
      'Geothermal Kawah Kamojang',
      'Situ Bagendit & Candi Cangkuang',
      'Curug Sanghyang Taraje',
      'Pantai Santolo & Sayang Heulang'
    ],
    infoAndPolicies: [
      { label: 'Tentang Kami & Tim Pemandu', path: '/tentang-kami' },
      { label: 'Hubungi Kantor Garut', path: '/kontak' },
      { label: 'Syarat & Ketentuan Pemesanan', path: '/syarat-ketentuan' },
      { label: 'Kebijakan Privasi', path: '/kebijakan-privasi' },
      { label: 'Kebijakan Pembatalan & Refund', path: '/kebijakan-pembatalan' }
    ],

    // Homepage (Dashboard Awal) Customization
    heroBadge: 'TOUR OPERATOR RESMI GARUT • 100% PRIVATE TRIP',
    heroMainTitle: 'Jelajahi Pesona Alam Garut yang Menakjubkan',
    heroMainSubtitle: 'Rasakan kemegahan kawah Papandayan, keheningan Kawah Kamojang, dan keindahan Situ Bagendit bersama pemandu profesional dan fasilitas perjalanan terpercaya.',
    heroSearchPlaceholder: 'Cari Papandayan, Kamojang, Bagendit, Curug...',
    heroPopularTrips: [
      { label: '🏔️ Papandayan', query: 'Papandayan', category: 'Gunung & Alam' },
      { label: '🌋 Kamojang', query: 'Kamojang', category: 'Keluarga & Relaksasi' },
      { label: '🚣 Situ Bagendit', query: 'Situ Bagendit', category: 'Budaya & Sejarah' },
      { label: '🌊 Curug Taraje', query: 'Curug Sanghyang Taraje', category: 'Petualangan Alam' },
      { label: '♨️ Darajat Pass', query: 'Darajat', category: 'Keluarga & Relaksasi' },
      { label: '🏖️ Pantai Santolo', query: 'Santolo', category: 'Petualangan Alam' },
      { label: '⭐ Semua Paket', query: '', category: 'Semua' }
    ],
    trustIndicators: [
      { title: 'Pemandu Lokal Berlisensi HPI' },
      { title: 'Jaminan Pasti Berangkat' },
      { title: 'Metode Bayar Midtrans Aman' }
    ],
    heroShowcaseBadge: 'GALERI FOTO RESMI GARUT',

    packagesSectionBadge: 'Destinasi Paling Populer',
    packagesSectionTitle: 'Pilihan Paket Wisata Unggulan Garut',
    packagesSectionBtnText: 'Jelajahi Seluruh Paket',

    whyChooseBadge: 'Mengapa Garut Journey?',
    whyChooseTitle: 'Standar Layanan Wisata Terbaik & Terpercaya',
    whyChooseFeatures: [
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
    ],

    testimonialsSectionBadge: 'Cerita Pengalaman Tamu',
    testimonialsSectionTitle: 'Ulasan Nyata dari Wisatawan Garut Journey',

    faqSectionBadge: 'Pertanyaan Umum',
    faqSectionTitle: 'Informasi Penting Sebelum Memulai Perjalanan',
    faqs: [
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
    ],

    ctaTitle: 'Siap Berpetualang di Garut?',
    ctaSubtitle: 'Konsultasikan rencana perjalanan Anda atau pilih paket wisata favorit sekarang bersama pemandu lokal terpercaya.',
    ctaButtonText: 'Jelajahi Paket Wisata',
    ctaButtonLink: '/paket-wisata'
  };

  constructor() {
    this.ensureDataDir();
    const loaded = this.loadFromDisk();
    if (!loaded) {
      this.seedInitialData();
      this.saveToDisk();
    }
    const interval = setInterval(() => {
      this.expireStaleBookings();
    }, 30000);
    if (interval.unref) {
      interval.unref();
    }
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('Could not create data directory', e);
    }
  }

  saveToDisk() {
    try {
      this.ensureDataDir();
      const state = {
        profiles: this.profiles,
        packages: this.packages,
        packageImages: this.packageImages,
        promotions: this.promotions,
        bookings: this.bookings,
        bookingItems: this.bookingItems,
        payments: this.payments,
        paymentEvents: this.paymentEvents,
        articles: this.articles,
        gallery: this.gallery,
        addons: this.addons,
        testimonials: this.testimonials,
        pageViews: this.pageViews.slice(-5000), // Keep last 5000 views
        siteSettings: this.siteSettings
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database to disk:', e);
    }
  }

  private loadFromDisk(): boolean {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const state = JSON.parse(raw);
        if (state && Array.isArray(state.packages) && state.packages.length > 0) {
          this.profiles = state.profiles || [];
          this.packages = state.packages || [];
          this.packageImages = state.packageImages || [];
          this.promotions = state.promotions || [];
          this.bookings = state.bookings || [];
          this.bookingItems = state.bookingItems || [];
          this.payments = state.payments || [];
          this.paymentEvents = state.paymentEvents || [];
          this.articles = state.articles || [];
          this.gallery = state.gallery || [];
          if (state.addons && Array.isArray(state.addons) && state.addons.length > 0) {
            this.addons = state.addons;
          }
          if (state.testimonials && Array.isArray(state.testimonials) && state.testimonials.length > 0) {
            this.testimonials = state.testimonials;
          }
          this.pageViews = state.pageViews || [];
          if (state.siteSettings) {
            this.siteSettings = { ...this.siteSettings, ...state.siteSettings };
          }
          // Ensure all standard curated packages and images are present
          const existingIds = new Set(this.packages.map(p => p.id));
          const standardPackages = this.getStandardCuratedPackages();
          for (const sp of standardPackages) {
            if (!existingIds.has(sp.id)) {
              this.packages.push(sp);
            }
          }
          const stdImages = this.getStandardPackageImages();
          const existingImgIds = new Set(this.packageImages.map(img => img.id));
          for (const sImg of stdImages) {
            if (!existingImgIds.has(sImg.id)) {
              this.packageImages.push(sImg);
            }
          }
          for (const pkg of this.packages) {
            if (!pkg.images || pkg.images.length === 0) {
              pkg.images = this.packageImages.filter(img => img.packageId === pkg.id);
            }
            if (!pkg.priceTiers || pkg.priceTiers.length === 0) {
              const stdPkg = standardPackages.find(sp => sp.id === pkg.id);
              if (stdPkg && stdPkg.priceTiers && stdPkg.priceTiers.length > 0) {
                pkg.priceTiers = stdPkg.priceTiers;
              } else {
                pkg.priceTiers = this.generateDefaultPriceTiers(pkg.basePrice);
              }
            }
          }
          this.saveToDisk();
          console.log('[Garut Journey] Database restored from disk with full package catalog.');
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load database from disk:', e);
    }
    return false;
  }

  public generateDefaultPriceTiers(basePrice: number): PriceTier[] {
    return [
      { minParticipants: 1, maxParticipants: 1, pricePerPerson: Math.round((basePrice * 1.95) / 5000) * 5000, label: '1 Orang (Solo Private)' },
      { minParticipants: 2, maxParticipants: 2, pricePerPerson: Math.round((basePrice * 1.35) / 5000) * 5000, label: '2 Orang (Duo / Berdua)' },
      { minParticipants: 3, maxParticipants: 3, pricePerPerson: Math.round((basePrice * 1.12) / 5000) * 5000, label: '3 Orang (Trio / Bertiga)' },
      { minParticipants: 4, maxParticipants: 5, pricePerPerson: basePrice, label: '4–5 Orang (Rombongan Kecil)' },
      { minParticipants: 6, maxParticipants: 10, pricePerPerson: Math.round((basePrice * 0.86) / 5000) * 5000, label: '6–10 Orang (Hemat Rombongan)' },
      { minParticipants: 11, maxParticipants: 20, pricePerPerson: Math.round((basePrice * 0.75) / 5000) * 5000, label: '11–20 Orang (Grup Besar)' }
    ];
  }

  public getStandardCuratedPackages(): TourPackage[] {
    const pkg1: TourPackage = {
      id: 'pkg-papandayan',
      slug: 'jelajah-gunung-papandayan-edelweiss',
      name: 'Eksplorasi Gunung Papandayan & Padang Edelweiss',
      category: 'Gunung & Alam',
      shortDescription: 'Private trip eksklusif menyusuri Kawah Belerang, Hutan Mati yang mistis, dan padang bunga abadi Tegal Alun.',
      description: 'Gunung Papandayan (2.665 mdpl) adalah gunung api strato terindah dan paling ramah bagi pendaki di Jawa Barat. Layanan 100% Private Trip eksklusif untuk rombongan Anda tanpa digabung dengan orang lain.',
      durationDays: 2,
      durationNights: 1,
      basePrice: 550000,
      priceTiers: this.generateDefaultPriceTiers(550000),
      minParticipants: 1,
      maxParticipants: 20,
      destinationArea: 'Papandayan, Cisurupan',
      tripType: 'private',
      inclusions: [
        'Transportasi lokal privat Garut - Basecamp PP (APV / Elf AC)',
        'Tiket masuk Taman Wisata Alam Gunung Papandayan & Simaksi',
        'Pemandu gunung pribadi bersertifikat HPI & P3K standar',
        'Makan 3x selama trip (Masakan khas Sunda & sarapan hangat)',
        'Tenda dome kapasitas 3-4 orang + matras spons',
        'Dokumentasi foto trip selama perjalanan',
        'Air mineral & welcome tea / kopi hangat'
      ],
      exclusions: [
        'Transportasi dari kota asal menuju titik kumpul Garut',
        'Sleeping bag pribadi (dapat disewa)',
        'Pengeluaran pribadi di luar program tour',
        'Tips sukarela untuk pemandu / porter'
      ],
      itinerary: [
        {
          id: 'itin-1-1',
          day: 1,
          title: 'Perjalanan Menuju Basecamp & Pendakian Camp Pondok Saladah',
          activities: [
            '07.30 - Penjemputan privat di Stasiun Garut / Hotel area Garut Kota',
            '08.30 - Perjalanan ke Pos Camp David Cisurupan Papandayan',
            '09.30 - Registrasi Simaksi, briefing keselamatan, dan pemanasan',
            '10.15 - Trekking santai menyusuri jalur kawah aktif dan tebing belerang',
            '12.30 - Istirahat makan siang di Pos Ghober Hoet dengan view perbukitan',
            '14.30 - Tiba di Pondok Saladah, mendirikan tenda, dan waktu santai kopi hangat',
            '19.00 - Makan malam bersama, keakraban api unggun ramah alam, dan istirahat'
          ]
        },
        {
          id: 'itin-1-2',
          day: 2,
          title: 'Golden Sunrise Hutan Mati, Tegal Alun & Kembali ke Kota',
          activities: [
            '05.00 - Morning call, berjalan 20 menit menuju Hutan Mati',
            '05.30 - Menikmati golden sunrise dramatis dengan siluet pepohonan purba Hutan Mati',
            '07.00 - Melanjutkan trekking ke Padang Edelweiss Tegal Alun (foto bersama)',
            '09.00 - Kembali ke camp, sarapan pagi hangat, dan packing tenda',
            '11.00 - Trekking turun menuju Camp David',
            '13.30 - Bersih-bersih di pemandian air panas alami, makan siang penutup',
            '15.30 - Transfer kembali ke Stasiun Garut / Garut Kota. Tour selesai.'
          ]
        }
      ],
      pickupPoints: [
        'Stasiun Kereta Api Garut',
        'Terminal Guntur Garut',
        'Hotel Santika / Favehotel / Kampung Sumber Alam Garut'
      ],
      termsAndConditions: '100% Private Trip. Jadwal tanggal bebas Anda tentukan sendiri. Peserta wajib dalam kondisi fisik sehat.',
      isPublished: true,
      featuredOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pkg2: TourPackage = {
      id: 'pkg-kamojang',
      slug: 'relaksasi-geothermal-kawah-kamojang',
      name: 'Relaksasi Geothermal Kawah Kamojang & Hutan Pinus',
      category: 'Keluarga & Relaksasi',
      shortDescription: 'Nikmati uap alami Kawah Kereta Api bersejarah, sauna bumi alami, dan keasrian danau kawah di ketinggian sejuk.',
      description: 'Kawah Kamojang merupakan ladang geothermal tertua di Indonesia yang dikelilingi hutan pinus pegunungan asri. Suhu udara 16-20°C yang sangat sejuk dipadukan dengan sensasi sauna uap alami Kawah Hujan.',
      durationDays: 1,
      durationNights: 0,
      basePrice: 320000,
      priceTiers: this.generateDefaultPriceTiers(320000),
      minParticipants: 1,
      maxParticipants: 15,
      destinationArea: 'Kamojang, Samarang',
      tripType: 'private',
      inclusions: [
        'Kendaraan privat AC ber-AC sesuai jumlah rombongan',
        'Driver berpengalaman merangkap tour guide lokal',
        'Tiket masuk Kawasan Wisata Kawah Kamojang',
        'Tiket Danau Pangkalan & Kawah Cibeureum',
        'Makan siang prasmanan masakan Sunda di Saung Kuring Kamojang',
        'Uji coba terapi uap belerang alami (sauna bumi)',
        'Air mineral kemasan selama tour'
      ],
      exclusions: [
        'Pengeluaran pribadi & belanja oleh-oleh kopi Kamojang',
        'Tips sukarela untuk driver/guide'
      ],
      itinerary: [
        {
          id: 'itin-2-1',
          day: 1,
          title: 'Satu Hari Jelajah Kamojang Geothermal & Pinus',
          activities: [
            '08.00 - Penjemputan privat di hotel / penginapan Garut Kota',
            '09.15 - Tiba di gerbang Kamojang, menyusuri jalur kanopi pinus yang rindang',
            '10.00 - Atraksi Kawah Kereta Api dengan peluit uap bertekanan tinggi',
            '11.15 - Relaksasi di Kawah Hujan (sauna alami untuk pernapasan & kulit)',
            '12.30 - Makan siang lezat dengan Nasi Liwet Sunda, gurame goreng, dan lalapan segar',
            '14.00 - Singgah ke Danau Cibeureum dan perkebunan teh tertata rapi',
            '16.00 - Mampir belanja kopi arabika Kamojang khas perkebunan lokal',
            '17.30 - Kembali ke hotel di Garut. Program selesai.'
          ]
        }
      ],
      pickupPoints: [
        'Semua Hotel & Villa di Garut Kota / Tarogong / Cipanas',
        'Stasiun Garut'
      ],
      termsAndConditions: 'Private trip fleksibel. Aman untuk anak-anak dan lansia.',
      isPublished: true,
      featuredOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pkg3: TourPackage = {
      id: 'pkg-bagendit-cangkuang',
      slug: 'pesona-situ-bagendit-dan-candi-cangkuang',
      name: 'Pesona Situ Bagendit & Candi Cangkuang Bersejarah',
      category: 'Budaya & Sejarah',
      shortDescription: 'Menyusuri danau megah berlatar Gunung Guntur dengan rakit bambu tradisional dan mengunjungi candi Hindu abad ke-8.',
      description: 'Perjalanan budaya dan keindahan panorama air Garut Utara. Mengunjungi Situ Bagendit yang telah direvitalisasi kelas dunia dengan jembatan apung dan panorama air tenang berlatar belakang siluet Gunung Guntur.',
      durationDays: 1,
      durationNights: 0,
      basePrice: 285000,
      priceTiers: this.generateDefaultPriceTiers(285000),
      minParticipants: 1,
      maxParticipants: 25,
      destinationArea: 'Banyuresmi & Leles',
      tripType: 'private',
      inclusions: [
        'Transportasi armada privat ber-AC dari Garut Kota',
        'Tiket masuk Situ Bagendit Baru & sky bridge',
        'Tiket Candi Cangkuang & Museum Situs Purbakala',
        'Sewa Rakit Bambu tradisional penyeberangan Cangkuang PP',
        'Makan siang di tepi danau (paket ayam bakakak Garut)',
        'Pemandu sejarah lokal pribadi',
        'Air mineral & snack pembuka'
      ],
      exclusions: [
        'Wahana permainan air berbayar tambahan di Bagendit',
        'Belanja kerajinan anyaman bambu & batik tulis Garutan'
      ],
      itinerary: [
        {
          id: 'itin-3-1',
          day: 1,
          title: 'Wisata Air, Sejarah Candi & Kearifan Kampung Pulo',
          activities: [
            '08.30 - Penjemputan di meeting point Garut',
            '09.15 - Menikmati keindahan dermaga & promenade Situ Bagendit',
            '10.30 - Foto-foto estetik di boardwalk danau dengan latar Gunung Guntur',
            '12.00 - Makan siang khas kuliner tepi danau',
            '13.30 - Menuju Candi Cangkuang di Kecamatan Leles',
            '14.15 - Menyeberangi danau dengan rakit bambu tradisional diiringi hembusan semilir angin',
            '15.00 - Eksplorasi Candi Cangkuang abad ke-8 dan interaksi di Kampung Adat Pulo',
            '16.45 - Belanja dodol khas & kerajinan tangan lokal',
            '18.00 - Pengantaran kembali ke titik awal.'
          ]
        }
      ],
      pickupPoints: [
        'Stasiun Garut',
        'Terminal Guntur',
        'Hotel di Area Garut Kota & Cipanas'
      ],
      termsAndConditions: 'Private trip keluarga / rombongan. Waktu fleksibel.',
      isPublished: true,
      featuredOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pkg4: TourPackage = {
      id: 'pkg-curug-taraje',
      slug: 'curug-sanghyang-taraje-hidden-paradise',
      name: 'Curug Sanghyang Taraje Hidden Gem Waterfall Trip',
      category: 'Petualangan Alam',
      shortDescription: 'Menatap kemegahan air terjun kembar legendaris setinggi 90 meter di lembah hijau asri Garut Selatan.',
      description: 'Curug Sanghyang Taraje adalah mahakarya alam Garut dengan dua aliran air terjun raksasa berdampingan yang jatuh bebas ke kolam alami toska.',
      durationDays: 1,
      durationNights: 0,
      basePrice: 375000,
      priceTiers: this.generateDefaultPriceTiers(375000),
      minParticipants: 2,
      maxParticipants: 16,
      destinationArea: 'Pamulihan, Garut Selatan',
      tripType: 'private',
      inclusions: [
        'Transportasi khusus privat medan perbukitan Garut (mobil prima + driver handal)',
        'Tiket masuk resmi Curug Sanghyang Taraje',
        'Pemandu trekking lokal pribadi',
        'Makan siang nasi liwet kastrol khas pegunungan',
        'Safety vest bila ingin berenang di zona aman sungai',
        'Dokumentasi perjalanan foto & video pendek',
        'Air mineral'
      ],
      exclusions: [
        'Baju ganti pribadi & perlengkapan mandi',
        'Tips pemandu'
      ],
      itinerary: [
        {
          id: 'itin-4-1',
          day: 1,
          title: 'Petualangan Menembus Lembah Hijau Pamulihan',
          activities: [
            '07.00 - Berangkat pagi dari Garut Kota menikmati panorama perbukitan',
            '09.30 - Tiba di area parkir Sanghyang Taraje, persiapan trekking santai 15 menit',
            '10.00 - Tiba di hadapan kemegahan air terjun kembar Sanghyang Taraje',
            '10.30 - Sesi foto, menikmati semburan kabut air sejuk, dan eksplorasi kolam alami',
            '12.30 - Makan siang liwet hangat beralaskan daun pisang di saung bambu',
            '14.30 - Perjalanan santai kembali ke kendaraan',
            '15.30 - Singgah di warung kopi lokal menikmati kopi tubruk biji kopi Garut Selatan',
            '18.30 - Tiba kembali di Garut Kota.'
          ]
        }
      ],
      pickupPoints: [
        'Stasiun Garut',
        'Hotel / Homestay area Garut Kota'
      ],
      termsAndConditions: 'Private trip petualangan. Wajib membawa pakaian ganti.',
      isPublished: true,
      featuredOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pkg5: TourPackage = {
      id: 'pkg-darajat-talaga-bodas',
      slug: 'kawah-talaga-bodas-pemandian-darajat-pass',
      name: 'Sensasi Kawah Putih Talaga Bodas & Pemandian Air Panas Darajat Pass',
      category: 'Keluarga & Relaksasi',
      shortDescription: 'Eksotisme danau kawah putih belerang Talaga Bodas dipadukan kesegaran pemandian air panas alami pegunungan Darajat Pass.',
      description: 'Nikmati perpaduan sempurna antara wisata alam kawah vulkanik putih kehijauan Talaga Bodas di Wanaraja dan relaksasi pemandian air panas alami berlatar perbukitan berkabut di Darajat Pass. Sangat nyaman untuk semua kalangan usia dan liburan keluarga santai.',
      durationDays: 1,
      durationNights: 0,
      basePrice: 310000,
      priceTiers: this.generateDefaultPriceTiers(310000),
      minParticipants: 1,
      maxParticipants: 20,
      destinationArea: 'Darajat & Wanaraja',
      tripType: 'private',
      inclusions: [
        'Transportasi privat AC (Avanza / Innova / HiAce) PP Garut',
        'Driver berpengalaman merangkap tour leader',
        'Tiket masuk Kawasan Wisata Kawah Talaga Bodas',
        'Tiket terusan Pemandian Air Panas Darajat Pass Waterpark',
        'Makan siang khas Sunda (Nasi Liwet & Gurame Goreng)',
        'Air mineral & snack selama perjalanan'
      ],
      exclusions: [
        'Sewa ojek lokal di area Talaga Bodas (opsional)',
        'Pengeluaran pribadi & belanja oleh-oleh'
      ],
      itinerary: [
        {
          id: 'itin-5-1',
          day: 1,
          title: 'Eksplorasi Danau Kawah Putih & Relaksasi Air Panas',
          activities: [
            '08.00 - Penjemputan di hotel / stasiun area Garut Kota',
            '09.30 - Tiba di Kawah Talaga Bodas, menikmati keindahan danau kawah putih toska berkabut',
            '10.30 - Relaksasi rendam kaki air panas alami belerang di tepi kawah',
            '12.00 - Makan siang masakan khas Sunda di Saung Bambu lokal',
            '13.30 - Melanjutkan perjalanan menuju kawasan perbukitan Darajat Pass',
            '14.30 - Berenang dan berendam air panas alami dengan pemandangan lembah pegunungan asri',
            '17.00 - Mampir belanja oleh-oleh khas Garut',
            '18.30 - Pengantaran kembali ke hotel / stasiun. Tour selesai.'
          ]
        }
      ],
      pickupPoints: [
        'Stasiun Kereta Api Garut',
        'Seluruh Hotel & Villa di Garut Kota / Cipanas'
      ],
      termsAndConditions: 'Sangat aman dan nyaman untuk anak-anak hingga lansia. Harap membawa baju renang/ganti.',
      isPublished: true,
      featuredOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pkg6: TourPackage = {
      id: 'pkg-pantai-santolo-heulang',
      slug: 'pantai-santolo-sayang-heulang-garut-selatan',
      name: 'Eksplorasi Pantai Santolo & Bukit Teletubbies Sayang Heulang',
      category: 'Petualangan Alam',
      shortDescription: 'Menjelajahi pesisir Samudera Hindia Garut Selatan, jembatan gantung Pulau Santolo, dan sunset menakjubkan.',
      description: 'Garut Selatan menyimpan pesona bahari Samudera Hindia yang spektakuler. Dari hamparan pasir putih Pantai Santolo, menyeberang ke Pulau Santolo bersejarah, hingga berfoto di jembatan bentang laut dan bukit Teletubbies Sayang Heulang.',
      durationDays: 2,
      durationNights: 1,
      basePrice: 485000,
      priceTiers: this.generateDefaultPriceTiers(485000),
      minParticipants: 2,
      maxParticipants: 16,
      destinationArea: 'Cikelet, Garut Selatan',
      tripType: 'private',
      inclusions: [
        'Transportasi armada prima AC PP Garut Kota - Garut Selatan',
        'Akomodasi penginapan tepi pantai 1 malam (AC, TV, shower)',
        'Tiket masuk Pantai Santolo & Sayang Heulang',
        'Sewa perahu tradisional penyeberangan Pulau Santolo',
        'Makan 3x (termasuk makan malam santap seafood segar tepi pantai)',
        'Pemandu lokal Garut Selatan',
        'Air mineral selama perjalanan'
      ],
      exclusions: [
        'Wahana banana boat (opsional)',
        'Pengeluaran belanja pribadi'
      ],
      itinerary: [
        {
          id: 'itin-6-1',
          day: 1,
          title: 'Roadtrip Eksotis Garut Selatan & Sunset Sayang Heulang',
          activities: [
            '07.30 - Berangkat dari Garut Kota melintasi panorama pegunungan Cikajang & kebun teh',
            '11.30 - Tiba di Cikelet, check-in penginapan tepi pantai & istirahat sejenak',
            '12.30 - Makan siang hidangan ikan laut segar',
            '14.30 - Menyeberang dengan perahu ke Pulau Santolo & dermaga purba',
            '16.30 - Bergeser ke Pantai Sayang Heulang, hunting foto di Bukit Teletubbies saat golden sunset',
            '19.00 - Makan malam seafood bakar khas pesisir selatan, acara santai'
          ]
        },
        {
          id: 'itin-6-2',
          day: 2,
          title: 'Sunrise Pesisir, Belanja Ikan Segar & Kembali ke Kota',
          activities: [
            '05.30 - Menikmati sunrise damai di bibir pantai',
            '07.30 - Sarapan pagi di penginapan & packing check-out',
            '09.00 - Mampir di TPI (Tempat Pelelangan Ikan) Santolo berburu ikan segar',
            '10.30 - Perjalanan santai kembali menuju Garut Kota',
            '15.00 - Singgah di sentra oleh-oleh Garut',
            '16.30 - Tiba kembali di Stasiun Garut / Hotel. Tour selesai.'
          ]
        }
      ],
      pickupPoints: [
        'Stasiun Garut',
        'Terminal Guntur',
        'Hotel area Garut Kota'
      ],
      termsAndConditions: 'Bawa pakaian santai pantai, sunblock, topi, dan kacamata hitam.',
      isPublished: true,
      featuredOrder: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const pkg7: TourPackage = {
      id: 'pkg-city-tour-garut',
      slug: 'garut-heritage-city-tour-sukaregang',
      name: 'Garut Heritage City Tour, Kuliner Dodol & Kerajinan Sukaregang',
      category: 'Budaya & Sejarah',
      shortDescription: 'Wisata belanja ikonik jaket kulit Sukaregang, pusat dodol Picnic asli, dan mencicipi ragam kuliner legendaris Garut.',
      description: 'Menikmati kehangatan dan budaya Kota Garut yang berjuluk "Swiss van Java". Mengunjungi sentra penyamakan kulit asli Sukaregang untuk produk jaket & tas kulit terbaik, menyaksikan pembuatan dodol Garut legendaris, serta menikmati santapan kuliner legendaris baso aci dan soto Garut.',
      durationDays: 1,
      durationNights: 0,
      basePrice: 250000,
      priceTiers: this.generateDefaultPriceTiers(250000),
      minParticipants: 1,
      maxParticipants: 20,
      destinationArea: 'Garut Kota & Sukaregang',
      tripType: 'private',
      inclusions: [
        'Transportasi city tour ber-AC',
        'Driver berpengalaman merangkap tour guide lokal',
        'Kunjungan resmi sentra kerajinan kulit Sukaregang',
        'Kunjungan dan edukasi pembuatan Dodol Picnic Garut',
        'Makan siang kuliner khas Garut (Soto Ahri / Liwet Asep Stroberi)',
        'Welcome snack & air mineral'
      ],
      exclusions: [
        'Belanja produk kerajinan kulit pribadi',
        'Oleh-oleh dodol & batik garutan'
      ],
      itinerary: [
        {
          id: 'itin-7-1',
          day: 1,
          title: 'Satu Hari Jelajah Warisan Budaya & Belanja Khas Garut',
          activities: [
            '09.00 - Penjemputan di Stasiun Garut / hotel',
            '09.30 - Berkeliling kawasan bersejarah Alun-alun & Babancong Garut',
            '10.30 - Wisata belanja kerajinan kulit asli Sukaregang (jaket, sepatu, tas kulit garansi asli)',
            '12.30 - Makan siang kuliner legendaris khas Garut',
            '14.00 - Mengunjungi pusat oleh-oleh dodol Garut, melihat demonstrasi pembuatan dodol',
            '16.00 - Singgah di Galeri Batik Tulis Garutan khas motif Merak Ngibing',
            '17.30 - Kembali ke stasiun / hotel penginapan.'
          ]
        }
      ],
      pickupPoints: [
        'Stasiun Kereta Api Garut',
        'Hotel di Area Garut Kota, Tarogong, atau Cipanas'
      ],
      termsAndConditions: 'Sangat cocok untuk keluarga, liburan singkat, dan pecinta kuliner serta kerajinan.',
      isPublished: true,
      featuredOrder: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return [pkg1, pkg2, pkg3, pkg4, pkg5, pkg6, pkg7];
  }

  public getStandardPackageImages(): PackageImage[] {
    return [
      {
        id: 'img-1',
        packageId: 'pkg-papandayan',
        imageUrl: '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
        altText: 'Matahari terbit di Gunung Papandayan Garut dengan Hutan Mati dan bunga Edelweiss',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-2',
        packageId: 'pkg-kamojang',
        imageUrl: '/src/assets/images/tour_kamojang_pine_1792431915131.jpg',
        altText: 'Danau geothermal dan hutan pinus berkabut Kawah Kamojang Garut',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-3',
        packageId: 'pkg-bagendit-cangkuang',
        imageUrl: '/src/assets/images/tour_situ_bagendit_1792431916060.jpg',
        altText: 'Danau Situ Bagendit Garut saat senja dengan pemandangan perahu tradisional',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-4',
        packageId: 'pkg-curug-taraje',
        imageUrl: '/src/assets/images/tour_curug_taraje_1792431915604.jpg',
        altText: 'Air terjun kembar Curug Sanghyang Taraje di tebing tropis Garut',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-5',
        packageId: 'pkg-darajat-talaga-bodas',
        imageUrl: '/public/assets/aistudio/image_7f145474.png',
        altText: 'Kawah Talaga Bodas dan Pemandian Air Panas Alami Darajat Pass Garut',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-6',
        packageId: 'pkg-pantai-santolo-heulang',
        imageUrl: '/public/assets/aistudio/image_30253526.png',
        altText: 'Pantai Santolo dan Bukit Teletubbies Sayang Heulang Garut Selatan',
        sortOrder: 1,
        isPrimary: true
      },
      {
        id: 'img-7',
        packageId: 'pkg-city-tour-garut',
        imageUrl: '/public/assets/aistudio/image_19f9301b.png',
        altText: 'Garut City Tour Sentra Kerajinan Kulit Sukaregang dan Dodol Garut',
        sortOrder: 1,
        isPrimary: true
      }
    ];
  }

  private seedInitialData() {
    this.profiles.push({
      id: 'usr-admin-1',
      email: 'admin@garutjourney.id',
      fullName: 'Administrator Garut Journey',
      phoneNumber: '081223456789',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    this.packages = this.getStandardCuratedPackages();
    this.packageImages = this.getStandardPackageImages();

    for (const pkg of this.packages) {
      pkg.images = this.packageImages.filter(img => img.packageId === pkg.id);
    }

    this.promotions = [
      {
        id: 'promo-1',
        code: 'GARUTASRI10',
        description: 'Diskon 10% Spesial Pembukaan Garut Journey',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 150000,
        minSpend: 300000,
        maxUsageLimit: 200,
        currentUsageCount: 14,
        startsAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
        isActive: true
      },
      {
        id: 'promo-2',
        code: 'EXPLOREGARUT',
        description: 'Potongan Rp 50.000 untuk Semua Paket Wisata',
        discountType: 'fixed',
        discountValue: 50000,
        maxDiscountAmount: null,
        minSpend: 400000,
        maxUsageLimit: 500,
        currentUsageCount: 32,
        startsAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 60).toISOString(),
        isActive: true
      }
    ];

    this.articles = [
      {
        id: 'art-1',
        slug: 'panduan-lengkap-mendaki-gunung-papandayan',
        title: 'Panduan Lengkap Mendaki Gunung Papandayan untuk Pemula 2026',
        author: 'Kang Asep Supriadi (Pemandu HPI)',
        category: 'Tips & Panduan',
        summary: 'Ketahui perlengkapan penting, rute aman kawah belerang, tips melihat matahari terbit di Hutan Mati, dan etika melestarikan padang Edelweiss Tegal Alun.',
        content: `Gunung Papandayan (2.665 mdpl) di Kecamatan Cisurupan sering dijuluki sebagai gunung paling ramah bagi pendaki pemula di Jawa Barat. Dengan jalur trekking yang telah tertata rapi dan kemiringan yang bersahabat, siapa pun dengan kondisi fisik prima dapat menikmati panorama vulkanik kelas dunia.

### 1. Waktu Terbaik Berkunjung
Waktu terbaik untuk mendaki Gunung Papandayan adalah saat musim kemarau (Mei hingga Oktober) di mana langit cerah menyajikan panorama golden sunrise yang memukau tanpa terganggu kabut hujan lebat.

### 2. Destinasi Wajib di Papandayan
- **Kawah Belerang Aktif**: Terletak di awal pendakian, Anda akan melintasi bebatuan putih keemasan dengan semburan uap hangat belerang alami.
- **Hutan Mati**: Jejak letusan masa lampau yang meninggalkan pohon-pohon cantigi hitam arang yang berdiri mistis dan fotogenik.
- **Padang Bunga Edelweiss Tegal Alun**: Hamparan bunga abadi terluas di Asia Tenggara. Ingat: Dilarang keras memetik bunga Edelweiss!

### 3. Perlengkapan Wajib
Gunakan jaket tebal karena suhu malam di Pondok Saladah dapat mencapai 8–12°C. Sepatu trekking dengan grip anti-slip sangat disarankan untuk melintasi bebatuan kawah.`,
        imageUrl: '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
        readTimeMinutes: 5,
        isPublished: true,
        metaTitle: 'Panduan Lengkap Mendaki Gunung Papandayan 2026 | Garut Journey',
        metaDescription: 'Tips dan rute aman mendaki Gunung Papandayan Garut untuk pemula: Hutan Mati, Kawah Belerang, Tegal Alun.',
        keywords: 'Mendaki Papandayan, Wisata Papandayan, Tour Garut, Hutan Mati, Tegal Alun',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'art-2',
        slug: 'sensasi-sauna-bumi-kawah-kamojang',
        title: 'Sensasi Sauna Bumi Alami & Sejarah Pembangkit Geothermal Kamojang',
        author: 'Dra. Ratna Handayani',
        category: 'Eksplorasi Alam',
        summary: 'Menikmati uap belerang murni Kawah Hujan yang menyehatkan pernapasan, serta sejarah sumur uap tertua di Asia Tenggara sejak tahun 1926.',
        content: `Kawah Kamojang di perbatasan Garut dan Bandung berada di ketinggian 1.730 mdpl di tengah lebatnya hutan pinus yang asri. Tidak seperti kawah belerang pada umumnya yang berbau menyengat, uap panas bumi Kamojang memiliki kadar sulfur yang lembut dan sering dimanfaatkan warga sebagai terapi kesehatan alami.

### Khasiat Sauna Alami Kawah Hujan
Di Kawah Hujan, semburan uap air panas alami menyelimuti tubuh bagaikan ruang sauna alami. Uap bumi ini dipercaya membuka pori-pori kulit, melancarkan sirkulasi darah, serta melegakan saluran pernapasan.`,
        imageUrl: '/src/assets/images/tour_kamojang_pine_1792431915131.jpg',
        readTimeMinutes: 4,
        isPublished: true,
        metaTitle: 'Sensasi Sauna Bumi Alami Kawah Kamojang | Garut Journey',
        metaDescription: 'Relaksasi geothermal Kawah Kamojang Garut dengan terapi uap alami Kawah Hujan dan hutan pinus asri.',
        keywords: 'Kawah Kamojang, Geothermal Garut, Sauna Alami, Wisata Samarang Garut',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'art-3',
        slug: '5-kuliner-khas-garut-wajib-coba',
        title: '5 Kuliner Khas Garut Wajib Coba: Dari Nasi Liwet Hingga Chocodot',
        author: 'Tim Editorial Garut Journey',
        category: 'Kuliner & Budaya',
        summary: 'Menjelajahi kelezatan kuliner tradisional Sunda di Garut, rahasia kenikmatan sambal cibiuk, dodol garut legendaris, dan cokelat isi dodol modern.',
        content: `Liburan ke Garut belum lengkap tanpa memanjakan lidah dengan cita rasa kuliner khas Priangan Timur yang autentik dan kaya rempah. Nasi Liwet Kastrol hangat, gurame goreng, sambal cibiuk hijau, hingga camilan manis Dodol Garut Picnic.`,
        imageUrl: '/src/assets/images/tour_situ_bagendit_1792431916060.jpg',
        readTimeMinutes: 4,
        isPublished: true,
        metaTitle: '5 Kuliner Khas Garut Wajib Coba | Garut Journey',
        metaDescription: 'Rekomendasi kuliner legendaris Garut: Nasi Liwet, Dodol Garut, Chocodot, Sambal Cibiuk.',
        keywords: 'Kuliner Garut, Oleh oleh Garut, Nasi Liwet Garut, Dodol Garut, Chocodot',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.gallery = [
      {
        id: 'gal-1',
        title: 'Matahari Terbit di Kawah Gunung Papandayan',
        category: 'Gunung',
        location: 'TWA Gunung Papandayan, Cisurupan',
        imageUrl: '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
        description: 'Siluet dramatis pepohonan Hutan Mati berlatar fajar keemasan di ketinggian 2.665 mdpl.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-2',
        title: 'Keheningan Danau Geothermal Kawah Kamojang',
        category: 'Kawah & Danau',
        location: 'Samarang, Garut',
        imageUrl: '/src/assets/images/tour_kamojang_pine_1792431915131.jpg',
        description: 'Jembatan kayu setapak melintasi danau air hangat berbalut kabut pagi dan hutan pinus asri.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-3',
        title: 'Senja di Situ Bagendit Berlatar Gunung Guntur',
        category: 'Kawah & Danau',
        location: 'Banyuresmi, Garut',
        imageUrl: '/src/assets/images/tour_situ_bagendit_1792431916060.jpg',
        description: 'Pantulan langit senja keemasan di atas air tenang danau Situ Bagendit.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'gal-4',
        title: 'Kemegahan Air Terjun Kembar Curug Sanghyang Taraje',
        category: 'Air Terjun',
        location: 'Pamulihan, Garut Selatan',
        imageUrl: '/src/assets/images/tour_curug_taraje_1792431915604.jpg',
        description: 'Dua aliran air terjun raksasa setinggi 90 meter membelah dinding tebing karst hijau perawan.',
        createdAt: new Date().toISOString()
      }
    ];

    const initialBookingNumber = 'GJ-202610-8472';
    const initialPackage = this.packages[0];

    const confirmedBooking: Booking = {
      id: 'book-init-1',
      bookingNumber: initialBookingNumber,
      accessToken: 'gj_sec_' + crypto.randomBytes(16).toString('hex'),
      customerName: 'Ahmad Fauzi',
      customerPhone: '081234567890',
      customerEmail: 'ahmad.fauzi@example.com',
      customerNotes: 'Mohon siapkan porsi vegetarian untuk 1 peserta.',
      departureDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      packageId: initialPackage.id,
      participantsCount: 2,
      pickupLocation: 'Stasiun Kereta Api Garut',
      subtotal: initialPackage.basePrice * 2,
      addonTotal: 350000,
      discountTotal: 50000,
      totalAmount: initialPackage.basePrice * 2 + 350000 - 50000,
      paymentTier: 'full',
      dpAmount: 0,
      paidAmount: initialPackage.basePrice * 2 + 350000 - 50000,
      remainingBalance: 0,
      appliedPromoCode: 'EXPLOREGARUT',
      status: 'confirmed',
      paymentExpiry: new Date(Date.now() + 3600000).toISOString(),
      confirmedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    };

    this.bookings.push(confirmedBooking);

    this.bookingItems.push(
      {
        id: 'item-1',
        bookingId: confirmedBooking.id,
        itemType: 'package',
        itemName: initialPackage.name,
        unitPrice: initialPackage.basePrice,
        quantity: 2,
        subtotal: initialPackage.basePrice * 2
      },
      {
        id: 'item-2',
        bookingId: confirmedBooking.id,
        itemType: 'addon',
        itemName: VERIFIED_ADDONS['drone-doc'].name,
        unitPrice: 350000,
        quantity: 1,
        subtotal: 350000
      }
    );

    this.payments.push({
      id: 'pay-init-1',
      bookingId: confirmedBooking.id,
      provider: 'midtrans',
      transactionId: 'trx-mid-' + crypto.randomBytes(8).toString('hex'),
      orderId: initialBookingNumber,
      paymentType: 'qris',
      grossAmount: confirmedBooking.totalAmount,
      status: 'settlement',
      snapToken: 'snap-token-mock-sample',
      settlementTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    });

    // Seed some initial visitor analytics
    const pastDays = [5, 4, 3, 2, 1, 0];
    pastDays.forEach(daysAgo => {
      const d = new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
      const count = Math.floor(Math.random() * 25) + 15;
      for (let i = 0; i < count; i++) {
        this.pageViews.push({
          id: 'pv-' + Math.random().toString(36).substring(2, 8),
          path: i % 3 === 0 ? '/paket-wisata' : i % 5 === 0 ? '/artikel' : '/',
          deviceType: i % 2 === 0 ? 'mobile' : 'desktop',
          timestamp: `${d}T10:00:00.000Z`
        });
      }
    });
  }

  // --- VISITOR ANALYTICS ---

  recordPageView(path: string, userAgent?: string, ip?: string) {
    const isMobile = Boolean(userAgent && /mobile|android|iphone|ipad/i.test(userAgent));
    const isTablet = Boolean(userAgent && /tablet|ipad/i.test(userAgent));
    const deviceType: 'mobile' | 'desktop' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    this.pageViews.push({
      id: 'pv-' + Math.random().toString(36).substring(2, 9),
      path: path.split('?')[0] || '/',
      userAgent: userAgent ? userAgent.slice(0, 100) : undefined,
      ip: ip ? ip.slice(0, 30) : undefined,
      deviceType,
      timestamp: new Date().toISOString()
    });

    // Debounced disk save
    if (this.pageViews.length % 5 === 0) {
      this.saveToDisk();
    }
  }

  getVisitorStats() {
    const totalViews = this.pageViews.length;
    
    // Top pages
    const pageCounts: Record<string, number> = {};
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    const dayCounts: Record<string, number> = {};

    this.pageViews.forEach(pv => {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
      deviceCounts[pv.deviceType] = (deviceCounts[pv.deviceType] || 0) + 1;
      const day = pv.timestamp.split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .map(([p, count]) => ({ path: p, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const dailyViews = Object.entries(dayCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return {
      totalPageViews: totalViews,
      uniqueVisitors: Math.round(totalViews * 0.65) || 1,
      topPages,
      deviceBreakdown: deviceCounts,
      dailyViews
    };
  }

  // --- QUERY METHODS ---

  getPackages(filter?: { category?: string; destination?: string; minPrice?: number; maxPrice?: number; search?: string }) {
    let result = this.packages.filter(p => p.isPublished);

    if (filter) {
      if (filter.category && filter.category !== 'Semua') {
        result = result.filter(p => p.category.toLowerCase().includes(filter.category!.toLowerCase()));
      }
      if (filter.destination && filter.destination !== 'Semua') {
        result = result.filter(p => p.destinationArea.toLowerCase().includes(filter.destination!.toLowerCase()));
      }
      if (filter.minPrice !== undefined && filter.minPrice > 0) {
        result = result.filter(p => p.basePrice >= filter.minPrice!);
      }
      if (filter.maxPrice !== undefined && filter.maxPrice > 0) {
        result = result.filter(p => p.basePrice <= filter.maxPrice!);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        result = result.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.destinationArea.toLowerCase().includes(q)
        );
      }
    }

    return result.map(pkg => ({
      ...pkg,
      images: this.packageImages.filter(img => img.packageId === pkg.id)
    }));
  }

  getPackageBySlug(slug: string) {
    const pkg = this.packages.find(p => p.slug === slug);
    if (!pkg) return null;

    const images = this.packageImages.filter(img => img.packageId === pkg.id);
    return {
      ...pkg,
      images
    };
  }

  getArticles() {
    return this.articles.filter(a => a.isPublished);
  }

  getArticleBySlug(slug: string) {
    return this.articles.find(a => a.slug === slug) || null;
  }

  getGallery(category?: string) {
    if (category && category !== 'Semua') {
      return this.gallery.filter(g => g.category.toLowerCase() === category.toLowerCase());
    }
    return this.gallery;
  }

  validatePromo(code: string, subtotal: number): { valid: boolean; discount: number; message: string; promo?: Promotion } {
    if (!code) {
      return { valid: false, discount: 0, message: 'Kode promo kosong.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const promo = this.promotions.find(p => p.code.toUpperCase() === cleanCode);

    if (!promo || !promo.isActive) {
      return { valid: false, discount: 0, message: 'Kode promo tidak ditemukan atau sudah tidak aktif.' };
    }

    const now = new Date();
    if (new Date(promo.startsAt) > now || new Date(promo.expiresAt) < now) {
      return { valid: false, discount: 0, message: 'Masa berlaku kode promo telah berakhir.' };
    }

    if (promo.currentUsageCount >= promo.maxUsageLimit) {
      return { valid: false, discount: 0, message: 'Kuota penggunaan kode promo sudah habis.' };
    }

    if (subtotal < promo.minSpend) {
      return {
        valid: false,
        discount: 0,
        message: `Minimal nilai transaksi untuk promo ini adalah Rp ${promo.minSpend.toLocaleString('id-ID')}.`
      };
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
        discount = promo.maxDiscountAmount;
      }
    } else {
      discount = promo.discountValue;
    }

    if (discount > subtotal) {
      discount = subtotal;
    }

    return {
      valid: true,
      discount: Math.floor(discount),
      message: `Kode promo ${promo.code} berhasil diterapkan! Hemat Rp ${Math.floor(discount).toLocaleString('id-ID')}.`,
      promo
    };
  }

  getAddons(includeInactive = false): AddonOption[] {
    if (includeInactive) return this.addons;
    return this.addons.filter(a => a.isActive !== false);
  }

  getAddonById(id: string): AddonOption | undefined {
    return this.addons.find(a => a.id === id);
  }

  createAddon(data: { name: string; price: number; unit?: string; description?: string; isActive?: boolean }): AddonOption {
    const id = `addon-${Date.now()}`;
    const newAddon: AddonOption = {
      id,
      name: data.name,
      price: Number(data.price) || 0,
      unit: data.unit || 'per trip',
      description: data.description || '',
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    this.addons.push(newAddon);
    this.saveToDisk();
    return newAddon;
  }

  updateAddon(id: string, data: Partial<AddonOption>): AddonOption | null {
    const item = this.addons.find(a => a.id === id);
    if (!item) return null;
    if (data.name !== undefined) item.name = data.name;
    if (data.price !== undefined) item.price = Number(data.price);
    if (data.unit !== undefined) item.unit = data.unit;
    if (data.description !== undefined) item.description = data.description;
    if (data.isActive !== undefined) item.isActive = data.isActive;
    this.saveToDisk();
    return item;
  }

  deleteAddon(id: string): boolean {
    const idx = this.addons.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.addons.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // --- 100% PRIVATE TRIP BOOKING CREATION ---

  createBooking(req: CreateBookingRequest): { success: boolean; booking?: Booking; error?: string } {
    const pkg = this.packages.find(p => p.slug === req.packageSlug);
    if (!pkg || !pkg.isPublished) {
      return { success: false, error: 'Paket wisata tidak ditemukan atau tidak tersedia.' };
    }

    const targetDate = (req.departureDate || (req as any).customDate || '').trim();
    if (!targetDate) {
      return { success: false, error: 'Tentukan tanggal keberangkatan private trip Anda.' };
    }

    const participants = Number(req.participantsCount);
    if (isNaN(participants) || participants < 1) {
      return { success: false, error: 'Jumlah peserta minimal 1 orang.' };
    }

    const priceCalculation = getPackagePricePerPerson(pkg, participants);
    const unitPrice = priceCalculation.pricePerPerson;
    const subtotal = unitPrice * participants;

    let addonTotal = 0;
    const validAddonItems: { name: string; price: number; quantity: number }[] = [];

    if (req.selectedAddons && Array.isArray(req.selectedAddons)) {
      for (const addonReq of req.selectedAddons) {
        const catalogAddon = this.addons.find(a => a.id === addonReq.id) || VERIFIED_ADDONS[addonReq.id];
        if (catalogAddon && addonReq.quantity > 0) {
          const itemAddonTotal = catalogAddon.price * addonReq.quantity;
          addonTotal += itemAddonTotal;
          validAddonItems.push({
            name: catalogAddon.name,
            price: catalogAddon.price,
            quantity: addonReq.quantity
          });
        }
      }
    }

    let discountTotal = 0;
    let appliedCode: string | undefined = undefined;

    if (req.promoCode && req.promoCode.trim()) {
      const promoResult = this.validatePromo(req.promoCode, subtotal);
      if (promoResult.valid) {
        discountTotal = promoResult.discount;
        appliedCode = promoResult.promo?.code;
        if (promoResult.promo) {
          promoResult.promo.currentUsageCount += 1;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + addonTotal - discountTotal);

    const paymentTier = req.paymentTier === 'dp' ? 'dp' : 'full';
    let dpAmount = 0;
    let remainingBalance = 0;

    if (paymentTier === 'dp') {
      dpAmount = Math.round(totalAmount * 0.3); // 30% DP
      remainingBalance = totalAmount - dpAmount;
    } else {
      dpAmount = 0;
      remainingBalance = 0;
    }

    const datePrefix = new Date().toISOString().slice(2, 7).replace('-', '');
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const bookingNumber = `GJ-${datePrefix}-${randomHex}`;
    const accessToken = 'gj_sec_' + crypto.randomBytes(20).toString('hex');

    const paymentTimeoutMinutes = this.siteSettings.paymentTimeoutMinutes || 60;
    const paymentExpiry = new Date(Date.now() + paymentTimeoutMinutes * 60 * 1000).toISOString();

    const newBooking: Booking = {
      id: 'book-' + crypto.randomUUID(),
      bookingNumber,
      accessToken,
      customerName: req.customerName.trim(),
      customerPhone: req.customerPhone.trim(),
      customerEmail: (req.customerEmail || '').trim(),
      customerNotes: req.customerNotes?.trim() || '',
      departureDate: targetDate,
      packageId: pkg.id,
      participantsCount: participants,
      pickupLocation: req.pickupLocation || pkg.pickupPoints[0] || 'Meeting Point Garut',
      subtotal,
      addonTotal,
      discountTotal,
      totalAmount,
      paymentTier,
      dpAmount,
      paidAmount: 0,
      remainingBalance,
      appliedPromoCode: appliedCode,
      status: 'pending_payment',
      paymentExpiry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bookings.push(newBooking);

    const pkgItem: BookingItem = {
      id: 'item-' + crypto.randomUUID(),
      bookingId: newBooking.id,
      itemType: 'package',
      itemName: `${pkg.name} (${participants} Pax - ${priceCalculation.tierLabel})`,
      unitPrice,
      quantity: participants,
      subtotal
    };
    this.bookingItems.push(pkgItem);

    validAddonItems.forEach(addon => {
      this.bookingItems.push({
        id: 'item-' + crypto.randomUUID(),
        bookingId: newBooking.id,
        itemType: 'addon',
        itemName: addon.name,
        unitPrice: addon.price,
        quantity: addon.quantity,
        subtotal: addon.price * addon.quantity
      });
    });

    newBooking.items = this.bookingItems.filter(i => i.bookingId === newBooking.id);
    newBooking.tourPackage = pkg;

    this.saveToDisk();
    return { success: true, booking: newBooking };
  }

  // --- FLEXIBLE MATCHER FOR BOOKING ID OR NUMBER ---

  getBookingByNumberAndToken(identifier: string, token?: string, isAdmin: boolean = false): Booking | null {
    const booking = this.bookings.find(
      b => b.id === identifier || b.bookingNumber.toUpperCase() === identifier.toUpperCase()
    );
    if (!booking) return null;

    if (!isAdmin) {
      if (!token || booking.accessToken !== token) {
        return null;
      }
    }

    const items = this.bookingItems.filter(i => i.bookingId === booking.id);
    const tourPackage = this.packages.find(p => p.id === booking.packageId);
    const payment = this.payments.find(p => p.bookingId === booking.id);

    return {
      ...booking,
      items,
      tourPackage: tourPackage ? {
        ...tourPackage,
        images: this.packageImages.filter(img => img.packageId === tourPackage.id)
      } : undefined,
      payment
    };
  }

  expireStaleBookings(): number {
    const now = new Date();
    let expiredCount = 0;

    for (const booking of this.bookings) {
      if (booking.status === 'pending_payment') {
        const expiry = new Date(booking.paymentExpiry);
        if (now > expiry) {
          booking.status = 'expired';
          booking.updatedAt = now.toISOString();
          booking.cancelledReason = 'Batas waktu pembayaran telah kedaluwarsa.';
          expiredCount++;

          const payment = this.payments.find(p => p.bookingId === booking.id);
          if (payment && payment.status === 'pending') {
            payment.status = 'expire';
            payment.updatedAt = now.toISOString();
          }
        }
      }
    }

    if (expiredCount > 0) {
      this.saveToDisk();
    }

    return expiredCount;
  }

  saveOrUpdatePayment(paymentData: Partial<Payment> & { bookingId: string; orderId: string; grossAmount: number }): Payment {
    let payment = this.payments.find(p => p.bookingId === paymentData.bookingId || p.orderId === paymentData.orderId);

    if (payment) {
      Object.assign(payment, paymentData, { updatedAt: new Date().toISOString() });
    } else {
      payment = {
        id: 'pay-' + crypto.randomUUID(),
        bookingId: paymentData.bookingId,
        provider: 'midtrans',
        orderId: paymentData.orderId,
        grossAmount: paymentData.grossAmount,
        status: paymentData.status || 'pending',
        snapToken: paymentData.snapToken,
        snapRedirectUrl: paymentData.snapRedirectUrl,
        transactionId: paymentData.transactionId,
        paymentType: paymentData.paymentType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.payments.push(payment);
    }

    this.saveToDisk();
    return payment;
  }

  recordPaymentEventIdempotent(orderId: string, eventId: string, eventType: string, payload: Record<string, any>): { isDuplicate: boolean; event: PaymentEvent } {
    const existing = this.paymentEvents.find(e => e.eventId === eventId);
    if (existing) {
      return { isDuplicate: true, event: existing };
    }

    const newEvent: PaymentEvent = {
      id: 'evt-' + crypto.randomUUID(),
      orderId,
      eventId,
      eventType,
      payload,
      isProcessed: true,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.paymentEvents.push(newEvent);
    this.saveToDisk();

    return { isDuplicate: false, event: newEvent };
  }

  updateBookingStatusOnPayment(orderId: string, paymentStatus: PaymentStatus, transactionId?: string, paymentType?: string) {
    const booking = this.bookings.find(b => b.id === orderId || b.bookingNumber.toUpperCase() === orderId.toUpperCase());
    if (!booking) return null;

    const payment = this.payments.find(p => p.bookingId === booking.id || p.orderId === orderId);
    if (payment) {
      payment.status = paymentStatus;
      if (transactionId) payment.transactionId = transactionId;
      if (paymentType) payment.paymentType = paymentType;
      if (paymentStatus === 'settlement' || paymentStatus === 'capture') {
        payment.settlementTime = new Date().toISOString();
      }
      payment.updatedAt = new Date().toISOString();
    }

    if (paymentStatus === 'settlement' || paymentStatus === 'capture') {
      booking.status = 'confirmed';
      booking.confirmedAt = new Date().toISOString();
      booking.updatedAt = new Date().toISOString();
      if (booking.paymentTier === 'dp') {
        booking.paidAmount = booking.dpAmount;
        booking.remainingBalance = booking.totalAmount - booking.dpAmount;
      } else {
        booking.paidAmount = booking.totalAmount;
        booking.remainingBalance = 0;
      }
    } else if (paymentStatus === 'cancel' || paymentStatus === 'expire' || paymentStatus === 'deny') {
      booking.status = paymentStatus === 'expire' ? 'expired' : 'cancelled';
      booking.cancelledReason = `Pembayaran berstatus ${paymentStatus}`;
      booking.updatedAt = new Date().toISOString();
    }

    this.saveToDisk();
    return booking;
  }

  deleteActivityFromPackage(packageId: string, day: number, activityIndex: number): boolean {
    const pkg = this.packages.find(p => p.id === packageId || p.slug === packageId);
    if (!pkg) return false;

    const dayItem = pkg.itinerary.find(it => it.day === day);
    if (!dayItem || !dayItem.activities || activityIndex < 0 || activityIndex >= dayItem.activities.length) {
      return false;
    }

    dayItem.activities.splice(activityIndex, 1);
    pkg.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return true;
  }

  addActivityToPackage(packageId: string, day: number, newActivityText: string, title?: string): boolean {
    const pkg = this.packages.find(p => p.id === packageId || p.slug === packageId);
    if (!pkg) return false;

    let dayItem = pkg.itinerary.find(it => it.day === day);
    if (!dayItem) {
      dayItem = {
        id: 'itin-' + Date.now(),
        day,
        title: title || `Hari ke-${day}`,
        activities: []
      };
      pkg.itinerary.push(dayItem);
      pkg.itinerary.sort((a, b) => a.day - b.day);
    } else if (title) {
      dayItem.title = title;
    }

    dayItem.activities.push(newActivityText.trim());
    pkg.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return true;
  }

  addDayToPackage(packageId: string, day: number, title?: string): boolean {
    const pkg = this.packages.find(p => p.id === packageId || p.slug === packageId);
    if (!pkg) return false;

    const existing = pkg.itinerary.find(it => it.day === day);
    if (existing) {
      if (title) existing.title = title;
    } else {
      pkg.itinerary.push({
        id: 'itin-' + Date.now() + '-' + day,
        day,
        title: title || `Hari ke-${day}`,
        activities: []
      });
      pkg.itinerary.sort((a, b) => a.day - b.day);
    }

    if (day > pkg.durationDays) {
      pkg.durationDays = day;
    }
    pkg.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return true;
  }

  deleteDayFromPackage(packageId: string, day: number): boolean {
    const pkg = this.packages.find(p => p.id === packageId || p.slug === packageId);
    if (!pkg) return false;

    const idx = pkg.itinerary.findIndex(it => it.day === day);
    if (idx === -1) return false;

    pkg.itinerary.splice(idx, 1);
    pkg.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return true;
  }

  // --- WHATSAPP INVOICE BUILDER (Returns URL + Raw Text) ---

  generateWhatsAppInvoice(booking: Booking, customNote?: string): { url: string; rawText: string; phone: string } {
    const isLunas = booking.paymentTier === 'full' || booking.remainingBalance <= 0;
    const statusLabel = isLunas
      ? '[LUNAS - 100% TERBAYAR]'
      : `[BARU DP 30% - Terbayar: Rp ${booking.dpAmount.toLocaleString('id-ID')}]`;

    const pkgName = booking.tourPackage?.name || 'Private Trip Garut';
    const dateTrip = booking.departureDate || '-';
    const baseAppUrl = process.env.APP_URL || 'https://garutjourney.id';
    const ticketUrl = `${baseAppUrl}/tiket/${booking.bookingNumber}`;
    const cleanPhone = booking.customerPhone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    let rawText = '';
    const customTpl = this.siteSettings.whatsappTemplateInvoice;

    if (customTpl && customTpl.includes('{bookingNumber}')) {
      rawText = customTpl
        .replace(/\{bookingNumber\}/g, booking.bookingNumber)
        .replace(/\{customerName\}/g, booking.customerName)
        .replace(/\{packageName\}/g, pkgName)
        .replace(/\{departureDate\}/g, dateTrip)
        .replace(/\{participantsCount\}/g, String(booking.participantsCount))
        .replace(/\{status\}/g, statusLabel)
        .replace(/\{totalAmount\}/g, booking.totalAmount.toLocaleString('id-ID'))
        .replace(/\{paidAmount\}/g, (booking.paidAmount || (isLunas ? booking.totalAmount : booking.dpAmount)).toLocaleString('id-ID'))
        .replace(/\{remainingBalance\}/g, booking.remainingBalance.toLocaleString('id-ID'))
        .replace(/\{ticketUrl\}/g, ticketUrl)
        .replace(/\{customNote\}/g, customNote ? `*Catatan Admin:* ${customNote}\n\n` : '');
    } else {
      rawText = `*-----------------------------------------*
*KWITANSI & INVOICE RESMI*
*PT GARUT JOURNEY NUSANTARA*
*-----------------------------------------*

Halo Kak *${booking.customerName}*, berikut adalah rincian kwitansi pemesanan wisata Garut Anda:

*No. Booking* : ${booking.bookingNumber}
*Tgl Keberangkatan* : ${dateTrip} (100% Private Trip)
*Paket Wisata* : ${pkgName}
*Jumlah Peserta* : ${booking.participantsCount} Orang
*Titik Jemput* : ${booking.pickupLocation}

*DETAIL PEMBAYARAN:*
- Total Tagihan : Rp ${booking.totalAmount.toLocaleString('id-ID')}
- Status Bayar : *${statusLabel}*
${!isLunas ? `- Sisa Pelunasan : *Rp ${booking.remainingBalance.toLocaleString('id-ID')}* (Dibayarkan saat penjemputan)\n` : ''}
*Unduh E-Ticket Resmi (PDF Langsung Tanpa Perlu Login):*
${baseAppUrl}/api/bookings/${booking.bookingNumber}/pdf

*Akses E-Ticket Web:*
${baseAppUrl}/booking/${booking.bookingNumber}?token=${booking.accessToken}

${customNote ? `*Catatan Admin:* ${customNote}\n\n` : ''}*Kantor Operasional:*
${this.siteSettings.officeAddress}
WhatsApp CS: +${this.siteSettings.whatsappNumber}

Terima kasih telah mempercayakan perjalanan Anda bersama Garut Journey!`;
    }

    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(rawText)}`;
    return { url, rawText, phone: intlPhone };
  }

  // Articles & Gallery updates
  updateArticle(id: string, data: Partial<Article>): Article | null {
    const art = this.articles.find(a => a.id === id);
    if (!art) return null;
    Object.assign(art, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return art;
  }

  updateGalleryItem(id: string, data: Partial<GalleryItem>): GalleryItem | null {
    const gal = this.gallery.find(g => g.id === id);
    if (!gal) return null;
    Object.assign(gal, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return gal;
  }

  getAdminMetrics() {
    const todayStr = new Date().toISOString().split('T')[0];

    const bookingsToday = this.bookings.filter(b => b.createdAt.startsWith(todayStr)).length;
    const upcomingBookings = this.bookings.filter(b => b.status === 'confirmed').length;
    const paymentsSuccessful = this.payments.filter(p => p.status === 'settlement' || p.status === 'capture').length;
    const paymentsPending = this.payments.filter(p => p.status === 'pending').length;
    const cancellations = this.bookings.filter(b => b.status === 'cancelled' || b.status === 'expired').length;

    const verifiedRevenue = this.payments
      .filter(p => p.status === 'settlement' || p.status === 'capture')
      .reduce((sum, p) => sum + p.grossAmount, 0);

    return {
      bookingsToday,
      upcomingBookings,
      paymentsSuccessful,
      paymentsPending,
      cancellations,
      verifiedRevenue
    };
  }

  generateBookingsCSV(): string {
    const headers = [
      'Nomor Booking',
      'Tanggal Dibuat',
      'Nama Pemesan',
      'No WhatsApp',
      'Email',
      'Paket Wisata',
      'Tanggal Keberangkatan',
      'Jumlah Peserta',
      'Skema Bayar',
      'Total Biaya (IDR)',
      'Sudah Dibayar (IDR)',
      'Sisa Tagihan (IDR)',
      'Status Booking',
      'Status Pembayaran'
    ];

    const rows = this.bookings.map(b => {
      const pkg = this.packages.find(p => p.id === b.packageId);
      const pay = this.payments.find(p => p.bookingId === b.id);

      return [
        `"${b.bookingNumber}"`,
        `"${b.createdAt}"`,
        `"${b.customerName.replace(/"/g, '""')}"`,
        `"${b.customerPhone}"`,
        `"${b.customerEmail}"`,
        `"${(pkg?.name || '').replace(/"/g, '""')}"`,
        `"${b.departureDate || ''}"`,
        b.participantsCount,
        `"${b.paymentTier === 'dp' ? 'BARU DP' : 'LUNAS'}"`,
        b.totalAmount,
        b.paidAmount,
        b.remainingBalance,
        `"${b.status}"`,
        `"${pay?.status || 'unpaid'}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  // --- VISITOR ANALYTICS TRACKING ---
  trackPageView(path: string, userAgent?: string, ip?: string): void {
    const isMobile = /mobile|iphone|android|ipad/i.test(userAgent || '');
    const isTablet = /tablet|ipad/i.test(userAgent || '');
    const deviceType: 'mobile' | 'desktop' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    this.pageViews.push({
      id: 'pv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      path: path || '/',
      userAgent: (userAgent || '').slice(0, 150),
      ip: (ip || '127.0.0.1').replace('::ffff:', ''),
      deviceType,
      timestamp: new Date().toISOString()
    });

    if (this.pageViews.length > 5000) {
      this.pageViews = this.pageViews.slice(-5000);
    }
    this.saveToDisk();
  }

  getVisitorAnalytics() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Seed some initial realistic analytics if fresh
    if (this.pageViews.length === 0) {
      const paths = ['/', '/paket-wisata', '/paket-wisata/jelajah-gunung-papandayan-edelweiss', '/paket-wisata/relaksasi-geothermal-kawah-kamojang', '/artikel', '/galeri'];
      for (let i = 0; i < 48; i++) {
        const pastDays = Math.floor(Math.random() * 6);
        const d = new Date(Date.now() - pastDays * 86400000);
        this.pageViews.push({
          id: 'pv-init-' + i,
          path: paths[Math.floor(Math.random() * paths.length)],
          userAgent: i % 2 === 0 ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          ip: `114.124.${10 + (i % 20)}.${1 + (i % 50)}`,
          deviceType: i % 2 === 0 ? 'mobile' : 'desktop',
          timestamp: d.toISOString()
        });
      }
      this.saveToDisk();
    }

    const totalPageViews = this.pageViews.length;
    const uniqueVisitors = new Set(this.pageViews.map(p => p.ip || p.userAgent)).size;
    const todayViews = this.pageViews.filter(p => p.timestamp.startsWith(todayStr)).length;

    // Last 7 days breakdown
    const dailyViews: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      const count = this.pageViews.filter(p => p.timestamp.startsWith(dateStr)).length;
      dailyViews.push({ date: dateStr, label: dayName, count });
    }

    // Top visited paths
    const pathCounts: Record<string, number> = {};
    this.pageViews.forEach(pv => {
      pathCounts[pv.path] = (pathCounts[pv.path] || 0) + 1;
    });

    const topPages = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Device breakdown
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    this.pageViews.forEach(pv => {
      deviceCounts[pv.deviceType] = (deviceCounts[pv.deviceType] || 0) + 1;
    });

    const recentViews = this.pageViews.slice(-20).reverse();

    return {
      totalPageViews,
      uniqueVisitors,
      todayViews,
      dailyViews,
      topPages,
      deviceCounts,
      recentViews
    };
  }

  // --- DELETE ACTIVITY LOGS & RESET ACTIVITY ---
  clearAllActivityLogs(): { clearedEvents: number; clearedViews: number } {
    const clearedEvents = this.paymentEvents.length;
    const clearedViews = this.pageViews.length;
    this.paymentEvents = [];
    this.pageViews = [];
    this.saveToDisk();
    return { clearedEvents, clearedViews };
  }

  // --- DELETE BOOKING (Robust case-insensitive match) ---
  deleteBooking(bookingId: string): boolean {
    const cleanId = (bookingId || '').trim().toLowerCase();
    const idx = this.bookings.findIndex(
      b => b.id.toLowerCase() === cleanId || b.bookingNumber.toLowerCase() === cleanId
    );
    if (idx === -1) return false;
    const target = this.bookings[idx];
    this.bookings.splice(idx, 1);
    this.bookingItems = this.bookingItems.filter(i => i.bookingId !== target.id);
    this.payments = this.payments.filter(p => p.bookingId !== target.id);
    this.saveToDisk();
    return true;
  }

  // --- UPDATE PACKAGE (Robust matching by ID or Slug, numeric conversions) ---
  updatePackage(id: string, data: Partial<TourPackage>): TourPackage | null {
    const pkg = this.packages.find(p => p.id === id || p.slug === id);
    if (!pkg) return null;

    if (data.basePrice !== undefined) {
      data.basePrice = Number(data.basePrice) || pkg.basePrice;
    }
    if (data.durationDays !== undefined) {
      data.durationDays = Number(data.durationDays) || pkg.durationDays;
    }
    if (data.durationNights !== undefined) {
      data.durationNights = Number(data.durationNights) || 0;
    }
    if (data.minParticipants !== undefined) {
      data.minParticipants = Number(data.minParticipants) || 1;
    }
    if (data.maxParticipants !== undefined) {
      data.maxParticipants = Number(data.maxParticipants) || 20;
    }

    Object.assign(pkg, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return pkg;
  }

  // --- DELETE PACKAGE ---
  deletePackage(id: string): boolean {
    const idx = this.packages.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return false;
    const target = this.packages[idx];
    this.packages.splice(idx, 1);
    this.packageImages = this.packageImages.filter(img => img.packageId !== target.id);
    this.saveToDisk();
    return true;
  }

  // --- TESTIMONIALS (CERITA PENGALAMAN TAMU) CRUD ---
  getTestimonials(): Testimonial[] {
    return this.testimonials;
  }

  createTestimonial(data: Partial<Testimonial>): Testimonial {
    const newTestimonial: Testimonial = {
      id: 'testi-' + Date.now(),
      name: data.name || 'Tamu Garut Journey',
      role: data.role || 'Wisatawan',
      city: data.city || 'Indonesia',
      text: data.text || '',
      package: data.package || 'Eksplorasi Wisata Garut',
      rating: data.rating || 5,
      avatarUrl: data.avatarUrl || '',
      createdAt: new Date().toISOString()
    };
    this.testimonials.unshift(newTestimonial);
    this.saveToDisk();
    return newTestimonial;
  }

  updateTestimonial(id: string, data: Partial<Testimonial>): Testimonial | null {
    const item = this.testimonials.find(t => t.id === id);
    if (!item) return null;
    Object.assign(item, data);
    this.saveToDisk();
    return item;
  }

  deleteTestimonial(id: string): boolean {
    const idx = this.testimonials.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.testimonials.splice(idx, 1);
    this.saveToDisk();
    return true;
  }

  // --- UPDATE BOOKING ---
  updateBooking(id: string, data: Partial<Booking>): Booking | null {
    const cleanId = (id || '').trim().toLowerCase();
    const booking = this.bookings.find(b => b.id.toLowerCase() === cleanId || b.bookingNumber.toLowerCase() === cleanId);
    if (!booking) return null;
    Object.assign(booking, data, { updatedAt: new Date().toISOString() });
    this.saveToDisk();
    return booking;
  }
}

export const dbStore = new GarutJourneyStore();
