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
  CreateBookingRequest,
  Article,
  GalleryItem,
  PageViewEvent
} from './types.js';

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
    ]
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
          this.pageViews = state.pageViews || [];
          if (state.siteSettings) {
            this.siteSettings = { ...this.siteSettings, ...state.siteSettings };
          }
          console.log('[Garut Journey] Database restored from disk.');
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load database from disk:', e);
    }
    return false;
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

    this.packages = [pkg1, pkg2, pkg3, pkg4];

    this.packageImages = [
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
      }
    ];

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

    const unitPrice = pkg.basePrice;
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
      itemName: `${pkg.name} (${participants} Pax Private)`,
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
    const pkg = this.packages.find(p => p.id === packageId);
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

  addActivityToPackage(packageId: string, day: number, newActivityText: string): boolean {
    const pkg = this.packages.find(p => p.id === packageId);
    if (!pkg) return false;

    let dayItem = pkg.itinerary.find(it => it.day === day);
    if (!dayItem) {
      dayItem = {
        id: 'itin-' + Date.now(),
        day,
        title: `Hari ke-${day}`,
        activities: []
      };
      pkg.itinerary.push(dayItem);
    }

    dayItem.activities.push(newActivityText.trim());
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

    const rawText = `*=========================================*
*KWITANSI & INVOICE RESMI*
*PT GARUT JOURNEY NUSANTARA*
*=========================================*

Halo Kak *${booking.customerName}*, berikut adalah rincian kwitansi pemesanan wisata Garut Anda:

*No. Booking* : ${booking.bookingNumber}
*Tgl Keberangkatan* : ${dateTrip} (100% Private Trip)
*Paket Wisata* : ${pkgName}
*Jumlah Peserta* : ${booking.participantsCount} Orang
*Titik Jemput* : ${booking.pickupLocation}

*DETAIL PEMBAYARAN:*
• Total Tagihan : Rp ${booking.totalAmount.toLocaleString('id-ID')}
• Status Bayar : *${statusLabel}*
${!isLunas ? `• Sisa Pelunasan : *Rp ${booking.remainingBalance.toLocaleString('id-ID')}* (Dibayarkan saat penjemputan)\n` : ''}
*Unduh E-Ticket Resmi (PDF Langsung Tanpa Perlu Login):*
${baseAppUrl}/api/bookings/${booking.bookingNumber}/pdf

*Akses E-Ticket Web:*
${baseAppUrl}/booking/${booking.bookingNumber}?token=${booking.accessToken}

${customNote ? `*Catatan Admin:* ${customNote}\n\n` : ''}*Kantor Operasional:*
${this.siteSettings.officeAddress}
WhatsApp CS: +${this.siteSettings.whatsappNumber}

Terima kasih telah mempercayakan perjalanan Anda bersama Garut Journey!`;

    const cleanPhone = booking.customerPhone.replace(/[^0-9]/g, '');
    const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
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

  // --- DELETE BOOKING ---
  deleteBooking(bookingId: string): boolean {
    const idx = this.bookings.findIndex(b => b.id === bookingId || b.bookingNumber === bookingId);
    if (idx === -1) return false;
    const target = this.bookings[idx];
    this.bookings.splice(idx, 1);
    this.bookingItems = this.bookingItems.filter(i => i.bookingId !== target.id);
    this.payments = this.payments.filter(p => p.bookingId !== target.id);
    this.saveToDisk();
    return true;
  }
}

export const dbStore = new GarutJourneyStore();
