/**
 * Garut Journey — Dynamic SEO & Structured Data Helper
 * Updates document.title, meta tags, OpenGraph, Twitter cards, and Schema.org JSON-LD
 */

export interface SEOConfig {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
}

export function updateSEO(config: SEOConfig): void {
  // 1. Update Title
  const siteBrand = 'Garut Journey';
  const fullTitle = config.title.includes(siteBrand)
    ? config.title
    : `${config.title} | ${siteBrand}`;
  document.title = fullTitle;

  // 2. Update Meta Description
  const defaultDesc =
    'Platform resmi tour & travel Garut Journey. Jelajahi keindahan alam Gunung Papandayan, Kawah Kamojang, Situ Bagendit, dan Curug Sanghyang Taraje dengan booking online dan pembayaran aman.';
  const desc = config.description || defaultDesc;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', desc);

  // 3. Keywords
  if (config.keywords) {
    let metaKw = document.querySelector('meta[name="keywords"]');
    if (!metaKw) {
      metaKw = document.createElement('meta');
      metaKw.setAttribute('name', 'keywords');
      document.head.appendChild(metaKw);
    }
    metaKw.setAttribute('content', config.keywords);
  }

  // 4. OpenGraph Tags
  const updateOG = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  updateOG('og:title', fullTitle);
  updateOG('og:description', desc);
  updateOG('og:type', config.type || 'website');
  if (config.ogImage) {
    updateOG('og:image', config.ogImage);
  }

  // 5. Canonical URL
  if (config.canonicalPath) {
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', `${window.location.origin}${config.canonicalPath}`);
  }

  // 6. Schema.org JSON-LD Structured Data
  let scriptLD = document.getElementById('gj-dynamic-jsonld') as HTMLScriptElement | null;
  if (config.structuredData) {
    if (!scriptLD) {
      scriptLD = document.createElement('script');
      scriptLD.id = 'gj-dynamic-jsonld';
      scriptLD.type = 'application/ld+json';
      document.head.appendChild(scriptLD);
    }
    scriptLD.textContent = JSON.stringify(config.structuredData);
  } else if (scriptLD) {
    scriptLD.remove();
  }
}

/**
 * Update browser tab favicon dynamically
 */
export function updateFavicon(faviconUrl?: string): void {
  if (!faviconUrl) return;
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'shortcut icon';
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

export interface ArticleSEOCheck {
  id: string;
  label: string;
  passed: boolean;
  scoreWeight: number;
  recommendation: string;
}

export interface ArticleSEOAnalysis {
  score: number;
  status: 'excellent' | 'warning' | 'poor';
  statusLabel: string;
  checks: ArticleSEOCheck[];
  wordCount: number;
  keywordDensity: number;
  readTimeMinutes: number;
}

export function analyzeArticleSEO(params: {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}): ArticleSEOAnalysis {
  const { title, content, metaTitle, metaDescription, focusKeyword } = params;
  const kw = (focusKeyword || '').trim().toLowerCase();

  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const effectiveTitle = (metaTitle || title).trim();
  const titleLen = effectiveTitle.length;

  const effectiveDesc = (metaDescription || '').trim();
  const descLen = effectiveDesc.length;

  // Keyword occurrences
  let kwCount = 0;
  if (kw) {
    const contentLower = content.toLowerCase();
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const matches = contentLower.match(regex);
    kwCount = matches ? matches.length : 0;
  }
  const keywordDensity = wordCount > 0 && kw ? Number(((kwCount / wordCount) * 100).toFixed(2)) : 0;

  const first100Words = words.slice(0, 100).join(' ').toLowerCase();
  const kwInFirstParagraph = kw ? first100Words.includes(kw) : false;
  const kwInTitle = kw ? effectiveTitle.toLowerCase().includes(kw) : false;
  const kwInDescription = kw ? effectiveDesc.toLowerCase().includes(kw) : false;
  const hasHeadings = /^(#{2,4}\s|.*\n={2,}|.*\n-{2,})/m.test(content);

  const checks: ArticleSEOCheck[] = [
    {
      id: 'title-length',
      label: 'Panjang Judul SEO (40–60 Karakter)',
      passed: titleLen >= 35 && titleLen <= 70,
      scoreWeight: 15,
      recommendation:
        titleLen < 35
          ? `Judul terlalu pendek (${titleLen} kar). Tambahkan detail spesifik agar ideal (40–60 karakter).`
          : titleLen > 70
          ? `Judul terlalu panjang (${titleLen} kar). Potong agar tidak terpotong di hasil pencarian Google.`
          : `Panjang judul sudah ideal (${titleLen} karakter).`
    },
    {
      id: 'meta-description',
      label: 'Panjang Meta Description (120–160 Karakter)',
      passed: descLen >= 110 && descLen <= 165,
      scoreWeight: 15,
      recommendation:
        descLen === 0
          ? 'Meta description belum diisi. Google memerlukan ringkasan menarik.'
          : descLen < 110
          ? `Deskripsi terlalu pendek (${descLen} kar). Tambahkan ajakan bertindak (CTA).`
          : descLen > 165
          ? `Deskripsi terlalu panjang (${descLen} kar). Ideal 120–160 karakter.`
          : `Deskripsi sudah optimal (${descLen} karakter).`
    },
    {
      id: 'keyword-title',
      label: 'Kata Kunci Fokus Ada di Judul',
      passed: Boolean(kw && kwInTitle),
      scoreWeight: 15,
      recommendation: kw
        ? kwInTitle
          ? `Kata kunci "${kw}" ditemukan di judul artikel.`
          : `Sisipkan kata kunci fokus "${kw}" di awal atau tengah judul.`
        : 'Tentukan kata kunci fokus artikel untuk dioptimalkan.'
    },
    {
      id: 'keyword-desc',
      label: 'Kata Kunci Fokus Ada di Meta Description',
      passed: Boolean(kw && kwInDescription),
      scoreWeight: 15,
      recommendation: kw
        ? kwInDescription
          ? `Kata kunci "${kw}" ada di meta description.`
          : `Sisipkan kata kunci "${kw}" di meta description.`
        : 'Isi kata kunci fokus artikel.'
    },
    {
      id: 'keyword-intro',
      label: 'Kata Kunci di Paragraf Pembuka',
      passed: Boolean(kw && kwInFirstParagraph),
      scoreWeight: 10,
      recommendation: kw
        ? kwInFirstParagraph
          ? `Kata kunci ditemukan di 100 kata pertama.`
          : `Sebutkan kata kunci "${kw}" di paragraf pertama agar Google cepat memahami konteks.`
        : 'Tentukan kata kunci fokus artikel.'
    },
    {
      id: 'content-length',
      label: 'Kelayakan Panjang Konten (Minimal 250 Kata)',
      passed: wordCount >= 250,
      scoreWeight: 15,
      recommendation:
        wordCount < 250
          ? `Konten masih tipis (${wordCount} kata). Buat minimal 250–300 kata untuk otoritas SEO tinggi.`
          : `Panjang konten sangat baik (${wordCount} kata).`
    },
    {
      id: 'heading-structure',
      label: 'Struktur Subjudul (H2 / H3)',
      passed: hasHeadings,
      scoreWeight: 15,
      recommendation: hasHeadings
        ? 'Struktur subjudul (H2/H3) rapi memudahkan pembaca & perayap Google.'
        : 'Gunakan tanda ## atau ### untuk membagi poin pembahasan.'
    }
  ];

  let totalScore = 0;
  for (const c of checks) {
    if (c.passed) totalScore += c.scoreWeight;
  }

  let status: 'excellent' | 'warning' | 'poor' = 'poor';
  let statusLabel = 'Perlu Optimalisasi';

  if (totalScore >= 80) {
    status = 'excellent';
    statusLabel = 'Sangat Baik (Siap Rank #1 Google)';
  } else if (totalScore >= 50) {
    status = 'warning';
    statusLabel = 'Cukup Baik (Bisa Ditingkatkan)';
  } else {
    status = 'poor';
    statusLabel = 'Kurang Optimal (Perlu Koreksi)';
  }

  return {
    score: totalScore,
    status,
    statusLabel,
    checks,
    wordCount,
    keywordDensity,
    readTimeMinutes
  };
}

export function autoOptimizeArticleSEO(params: {
  title: string;
  content: string;
  category?: string;
  focusKeyword?: string;
}): {
  optimizedTitle: string;
  optimizedDescription: string;
  suggestedKeywords: string;
  optimizedFocusKeyword: string;
  optimizedContent: string;
  readTimeMinutes: number;
} {
  const { title, content, category, focusKeyword } = params;
  
  // 1. Determine optimal Focus Keyword (clean, concise, 2-3 words)
  let kw = (focusKeyword || '').trim();
  if (!kw || kw.length < 3) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('papandayan')) kw = 'Gunung Papandayan';
    else if (titleLower.includes('kamojang')) kw = 'Kawah Kamojang';
    else if (titleLower.includes('bagendit')) kw = 'Situ Bagendit';
    else if (titleLower.includes('taraje')) kw = 'Curug Taraje';
    else if (titleLower.includes('darajat') || titleLower.includes('bodas')) kw = 'Kawah Talaga Bodas';
    else if (titleLower.includes('santolo')) kw = 'Pantai Santolo';
    else if (titleLower.includes('kuliner')) kw = 'Kuliner Garut';
    else {
      const parts = title.split(/[:\-\–]/)[0].trim().split(/\s+/).filter(w => w.length > 2);
      kw = parts.slice(0, 2).join(' ') || 'Wisata Garut';
    }
  }

  // 2. Craft optimized Title (strictly 42–65 chars, keyword included)
  let cleanTitle = title.trim();
  // Strip trailing brand if exists to rebuild cleanly
  cleanTitle = cleanTitle.replace(/\s*\|\s*Garut Journey/gi, '').trim();
  if (!cleanTitle.toLowerCase().includes(kw.toLowerCase())) {
    cleanTitle = `${kw} - ${cleanTitle}`;
  }
  let optTitle = `${cleanTitle} | Garut Journey`;
  if (optTitle.length > 65) {
    const budget = 65 - ' | Garut Journey'.length;
    cleanTitle = cleanTitle.slice(0, budget).trim();
    optTitle = `${cleanTitle} | Garut Journey`;
  }
  if (optTitle.length < 38) {
    optTitle = `Panduan Wisata ${optTitle}`;
  }

  // 3. Craft optimized Meta Description (strictly 125–155 chars, keyword included)
  let optDesc = `Panduan lengkap wisata ${kw} di Garut: rekomendasi rute terbaik, fasilitas, info tiket, dan tips liburan nyaman bersama tim resmi Garut Journey.`;
  if (optDesc.length < 118) {
    optDesc = `Simak ulasan dan panduan lengkap ${kw} di Garut: info tiket masuk, rute perjalanan, fasilitas terbaru, dan tips liburan berkesan bersama Garut Journey.`;
  }
  if (optDesc.length > 162) {
    optDesc = optDesc.slice(0, 155).trim() + '.';
  }

  // 4. Ensure optimized content contains keyword in first paragraph, headings, and sufficient length (>=260 words)
  let optContent = content.trim();
  if (!optContent) {
    optContent = `Jelajahi keindahan dan pesona ${kw} bersama tim pemandu resmi Garut Journey dalam ulasan lengkap ini.\n\n## Pesona Alam & Daya Tarik Utama\n${kw} merupakan salah satu magnet pariwisata unggulan di Kabupaten Garut dengan panorama alam yang menawan dan udara pegunungan yang sangat sejuk. Wisatawan dapat menikmati keasrian alam, berfoto di berbagai sudut estetik, dan merasakan kenyamanan liburan privat tanpa gangguan.\n\n## Fasilitas & Persiapan Perjalanan\nUntuk menjamin kelancaran trip Anda, pastikan membawa perlengkapan pribadi, pakaian ganti, serta alas kaki yang nyaman untuk trekking santai. Garut Journey menyediakan paket 100% private trip all-in dengan armada prima dan pemandu lokal berpengalaman.`;
  }

  // Check keyword in opening paragraph
  const words = optContent.split(/\s+/).filter(Boolean);
  const first100 = words.slice(0, 100).join(' ').toLowerCase();
  if (!first100.includes(kw.toLowerCase())) {
    optContent = `Jelajahi keindahan dan pesona ${kw} bersama tim pemandu resmi Garut Journey dalam ulasan perjalanan berikut ini.\n\n` + optContent;
  }

  // Check heading structure
  const hasHeadings = /^(#{2,4}\s|.*\n={2,}|.*\n-{2,})/m.test(optContent);
  if (!hasHeadings) {
    optContent = `## Daya Tarik & Keindahan Utama\n\n` + optContent + `\n\n## Panduan & Tips Terbaik Berkunjung\nPastikan untuk merencanakan waktu kunjungan di pagi hari dan memanfaatkan layanan pemandu profesional untuk pengalaman wisata yang lebih berkesan.`;
  }

  // Check word count (minimum 260 words for strong ranking)
  const currentWordCount = optContent.split(/\s+/).filter(Boolean).length;
  if (currentWordCount < 260) {
    const extraContent = `\n\n## Fasilitas Wisata & Rekomendasi Persiapan\nKawasan wisata ${kw} ini telah dilengkapi dengan berbagai fasilitas pendukung seperti area parkir luas, saung istirahat, toilet bersih, dan warung kuliner tradisional Sunda. Mengunjungi destinasi ini bersama keluarga atau rombongan sahabat akan memberikan relaksasi optimal dari hiruk-pikuk rutinitas perkotaan.\n\n## Waktu Terbaik untuk Berkunjung\nWaktu paling direkomendasikan adalah pada pagi hari pukul 07.30 hingga 11.00 WIB ketika udara masih sangat sejuk dan pencahayaan matahari sangat ideal untuk fotografi lanskap alam. Hubungi tim Garut Journey untuk paket private trip dengan jadwal tanggal yang fleksibel dan layanan all-in.`;
    optContent += extraContent;
  }

  // 5. Keywords suggestions
  const keywordsList = [
    kw,
    'Wisata Garut',
    'Paket Tour Garut',
    category || 'Tour Garut',
    'Liburan Garut',
    'Private Trip Garut',
    'Garut Journey'
  ].filter(Boolean);

  const finalWords = optContent.split(/\s+/).filter(Boolean);
  const readTimeMinutes = Math.max(1, Math.round(finalWords.length / 200));

  return {
    optimizedTitle: optTitle,
    optimizedDescription: optDesc,
    suggestedKeywords: Array.from(new Set(keywordsList)).join(', '),
    optimizedFocusKeyword: kw,
    optimizedContent: optContent,
    readTimeMinutes
  };
}

