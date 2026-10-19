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
  readTimeMinutes: number;
} {
  const { title, content, category, focusKeyword } = params;
  const kw = focusKeyword?.trim() || title.split(/[:\-\–]/)[0].trim();

  // Craft optimized Meta Title (50-60 chars)
  let optTitle = title.trim();
  if (kw && !optTitle.toLowerCase().includes(kw.toLowerCase())) {
    optTitle = `${kw} – ${optTitle}`;
  }
  if (!optTitle.includes('Garut Journey')) {
    optTitle = `${optTitle} | Garut Journey`;
  }
  if (optTitle.length > 65) {
    optTitle = optTitle.slice(0, 62) + '...';
  }

  // Craft optimized Meta Description (140-155 chars)
  const cleanContent = content.replace(/[#*`\-_>]/g, ' ').replace(/\s+/g, ' ').trim();
  let optDesc = '';
  if (kw) {
    optDesc = `Panduan lengkap ${kw}: informasi rute terbaik, fasilitas, tips wisata Garut, dan rekomendasi pengalaman berkesan bersama Garut Journey.`;
  } else {
    optDesc = cleanContent.slice(0, 140) + '... Baca panduan resmi wisata Garut selengkapnya di Garut Journey.';
  }
  if (optDesc.length > 155) {
    optDesc = optDesc.slice(0, 150) + '...';
  }

  // Keywords suggestions
  const keywordsList = [
    kw,
    'Wisata Garut',
    'Paket Tour Garut',
    category || 'Tour Garut',
    'Liburan Garut',
    'Garut Journey'
  ].filter(Boolean);

  const words = content.trim().split(/\s+/).filter(Boolean);
  const readTimeMinutes = Math.max(1, Math.round(words.length / 200));

  return {
    optimizedTitle: optTitle,
    optimizedDescription: optDesc,
    suggestedKeywords: Array.from(new Set(keywordsList)).join(', '),
    readTimeMinutes
  };
}

