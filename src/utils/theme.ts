import type { SiteSettings } from '../types.js';

export interface ColorPreset {
  id: string;
  name: string;
  primaryColor: string;
  primaryDarkColor: string;
  primaryHoverColor: string;
  accentColor: string;
  accentHoverColor: string;
}

export const PRESET_THEMES: ColorPreset[] = [
  {
    id: 'forest-emerald',
    name: 'Hutan Pinus & Gold (Default Garut Journey)',
    primaryColor: '#0F3827',
    primaryDarkColor: '#0A261A',
    primaryHoverColor: '#17523A',
    accentColor: '#C8A951',
    accentHoverColor: '#B89940'
  },
  {
    id: 'deep-teal',
    name: 'Kawah Belerang Papandayan (Deep Teal & Amber)',
    primaryColor: '#0F4C5C',
    primaryDarkColor: '#0A313C',
    primaryHoverColor: '#1B6A7F',
    accentColor: '#E36414',
    accentHoverColor: '#C2520E'
  },
  {
    id: 'royal-navy',
    name: 'Situ Bagendit Sunset (Royal Navy & Gold)',
    primaryColor: '#1E293B',
    primaryDarkColor: '#0F172A',
    primaryHoverColor: '#334155',
    accentColor: '#D97706',
    accentHoverColor: '#B45309'
  },
  {
    id: 'earth-volcano',
    name: 'Gunung Guntur & Cikuray (Warm Earth & Bronze)',
    primaryColor: '#292524',
    primaryDarkColor: '#1C1917',
    primaryHoverColor: '#44403C',
    accentColor: '#CA8A04',
    accentHoverColor: '#A16207'
  },
  {
    id: 'spring-fresh',
    name: 'Curug Sanghyang Taraje (Fresh Jade & Emerald)',
    primaryColor: '#065F46',
    primaryDarkColor: '#064E3B',
    primaryHoverColor: '#047857',
    accentColor: '#10B981',
    accentHoverColor: '#059669'
  }
];

export function applyThemeColors(settings?: Partial<SiteSettings>) {
  if (typeof document === 'undefined') return;

  const primary = settings?.primaryColor || '#0F3827';
  const primaryDark = settings?.primaryDarkColor || '#0A261A';
  const primaryHover = settings?.primaryHoverColor || '#17523A';
  const accent = settings?.accentColor || '#C8A951';
  const accentHover = settings?.accentHoverColor || '#B89940';

  const styleId = 'gj-dynamic-theme-styles';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    :root {
      --forest-900: ${primaryDark} !important;
      --forest-800: ${primary} !important;
      --forest-700: ${primaryHover} !important;
      --forest-600: ${primaryHover} !important;
      --gold-600: ${accentHover} !important;
      --gold-500: ${accent} !important;
      --gold-400: ${accent} !important;
    }
    
    /* Dynamic overrides for hardcoded Tailwind arbitrary hex classes */
    .bg-\\[\\#0F3827\\], [class*="bg-[#0F3827]"] {
      background-color: ${primary} !important;
    }
    .bg-\\[\\#0A261A\\], [class*="bg-[#0A261A]"] {
      background-color: ${primaryDark} !important;
    }
    .text-\\[\\#0F3827\\], [class*="text-[#0F3827]"] {
      color: ${primary} !important;
    }
    .border-\\[\\#0F3827\\], [class*="border-[#0F3827]"] {
      border-color: ${primary} !important;
    }
    .ring-\\[\\#0F3827\\]:focus, [class*="ring-[#0F3827]"]:focus {
      --tw-ring-color: ${primary} !important;
    }

    .bg-\\[\\#C8A951\\], [class*="bg-[#C8A951]"] {
      background-color: ${accent} !important;
    }
    .text-\\[\\#C8A951\\], [class*="text-[#C8A951]"] {
      color: ${accent} !important;
    }
    .border-\\[\\#C8A951\\], [class*="border-[#C8A951]"] {
      border-color: ${accent} !important;
    }

    .hover\\:bg-\\[\\#17523A\\]:hover, [class*="hover:bg-[#17523A]"]:hover {
      background-color: ${primaryHover} !important;
    }
    .hover\\:bg-\\[\\#B89940\\]:hover, [class*="hover:bg-[#B89940]"]:hover {
      background-color: ${accentHover} !important;
    }
  `;
}

/**
 * Downloads booking E-Ticket PDF via direct blob retrieval.
 * Immune to iframe popup blocks and works on mobile/desktop browsers reliably.
 */
export async function downloadBookingPdf(bookingNumber: string, onStart?: () => void, onEnd?: () => void): Promise<void> {
  const cleanNumber = (bookingNumber || '').trim();
  if (!cleanNumber) return;

  if (onStart) onStart();
  try {
    const res = await fetch(`/api/bookings/${cleanNumber}/pdf?download=true`, {
      headers: { Accept: 'application/pdf' }
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh file E-Ticket (HTTP ${res.status})`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `E-Ticket-Garut-Journey-${cleanNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (err: any) {
    console.warn('[PDF Download] Blob failed, attempting direct URL navigation:', err);
    // Fallback: direct window location
    window.location.href = `/api/bookings/${cleanNumber}/pdf?download=true`;
  } finally {
    if (onEnd) onEnd();
  }
}
