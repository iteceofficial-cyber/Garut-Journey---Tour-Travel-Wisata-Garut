import React, { useState, useEffect } from 'react';
import type { SiteSettings } from '../types.js';
import { Compass, Phone, Mail, MapPin, ExternalLink, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface FooterProps {
  navigate: (path: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ navigate, siteSettings: propSettings }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(propSettings || null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!propSettings) {
      fetch('/api/site-settings')
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setSettings(json.data);
          }
        })
        .catch(() => {});
    } else {
      setSettings(propSettings);
    }
  }, [propSettings]);

  const defaultDestinations = [
    'Gunung Papandayan & Hutan Mati',
    'Geothermal Kawah Kamojang',
    'Situ Bagendit & Candi Cangkuang',
    'Curug Sanghyang Taraje',
    'Pantai Santolo & Sayang Heulang'
  ];

  const defaultPolicies = [
    { label: 'Tentang Kami & Tim Pemandu', path: '/tentang-kami' },
    { label: 'Hubungi Kantor Garut', path: '/kontak' },
    { label: 'Syarat & Ketentuan Pemesanan', path: '/syarat-ketentuan' },
    { label: 'Kebijakan Privasi', path: '/kebijakan-privasi' },
    { label: 'Kebijakan Pembatalan & Refund', path: '/kebijakan-pembatalan' }
  ];

  const destinations = settings?.featuredDestinations || defaultDestinations;
  const policies = settings?.infoAndPolicies || defaultPolicies;
  const address = settings?.officeAddress || 'Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151';
  const whatsapp = settings?.whatsappNumber || '6281223456789';
  const email = settings?.supportEmail || 'halo@garutjourney.id';
  const hours = settings?.customerServiceHours || 'Setiap hari, 08.00 – 21.00 WIB';

  return (
    <footer className="bg-[#0A261A] text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.brandName || 'Garut Journey'}
                  className="h-9 w-auto max-w-[150px] object-contain rounded"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-[#17523A] flex items-center justify-center text-[#C8A951]">
                  <Compass className="w-5 h-5" />
                </div>
              )}
              <span className="font-serif-luxury text-xl font-bold tracking-tight text-stone-100">
                {settings?.brandName || 'Garut Journey'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              {t('footerDesc')}
            </p>
            <div className="text-[11px] text-stone-400 space-y-0.5">
              <p>Operasional oleh <strong className="text-stone-300">{settings?.companyName || 'PT Garut Journey Nusantara'}</strong></p>
              {settings?.nibNumber && <p className="font-mono text-stone-500">NIB: {settings.nibNumber}</p>}
            </div>

            {/* Clear, accessible Portal Admin button in brand column */}
            <div className="pt-2">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-white text-xs font-medium transition-all shadow-xs cursor-pointer group"
                title="Akses Portal Administrator Garut Journey"
              >
                <ShieldCheck className="w-4 h-4 text-[#C8A951] group-hover:scale-110 transition-transform" />
                <span>Portal Admin (Kelola Web & Tour)</span>
              </button>
            </div>
          </div>

          {/* Kolom 1: DESTINASI UNGGULAN */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A951]">
              {t('popularDestinations')}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {destinations.map((dest, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate('/paket-wisata')}
                    className="hover:text-stone-100 transition-colors cursor-pointer text-left"
                  >
                    {dest}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 2: INFORMASI & KEBIJAKAN */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A951]">
              Informasi & Kebijakan
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {policies.map((pol, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => navigate(pol.path)}
                    className="hover:text-stone-100 transition-colors cursor-pointer text-left"
                  >
                    {pol.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: KANTOR OPERASIONAL */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#C8A951]">
              {t('footerContact')}
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C8A951] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C8A951] shrink-0" />
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-stone-100 flex items-center gap-1 font-medium"
                >
                  <span>+{whatsapp} (WhatsApp)</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C8A951] shrink-0" />
                <span>{email}</span>
              </div>
              <div className="flex items-start gap-2 pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                <Clock className="w-3.5 h-3.5 text-[#C8A951] shrink-0 mt-0.5" />
                <span>Layanan Pelanggan: {hours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: with generous right padding (pr-20 sm:pr-32) so WhatsApp floating button never covers anything */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4 pr-16 sm:pr-28">
          <div className="flex items-center gap-3 flex-wrap">
            <p>© {new Date().getFullYear()} {settings?.companyName || 'PT Garut Journey Nusantara'}. {t('footerRights')}</p>
            <span className="hidden sm:inline">·</span>
            {/* Dedicated accessible Portal Admin button away from the WhatsApp corner */}
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800/80 hover:bg-stone-700/80 text-[#C8A951] hover:text-amber-200 transition-colors font-medium border border-stone-700/60 cursor-pointer shadow-xs"
              title="Akses Portal Administrator Garut Journey"
            >
              <Lock className="w-3 h-3 text-[#C8A951]" />
              <span>Portal Admin</span>
            </button>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            <button onClick={() => navigate('/artikel')} className="hover:text-stone-300 transition-colors cursor-pointer">{t('navArticles')}</button>
            <span>·</span>
            <button onClick={() => navigate('/galeri')} className="hover:text-stone-300 transition-colors cursor-pointer">{t('navGallery')}</button>
            <span>·</span>
            <button onClick={() => navigate('/tentang-kami')} className="hover:text-stone-300 transition-colors cursor-pointer">{t('navAbout')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
