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
