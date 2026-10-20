import React, { useState, useRef, useEffect } from 'react';
import type { SiteSettings } from '../types.js';
import { Compass, Menu, X, Globe, ChevronDown, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import type { SupportedLanguage } from '../utils/i18n.js';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isAdminLoggedIn?: boolean;
  siteSettings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, siteSettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { language, setLanguage, t, languages, currentMeta } = useLanguage();
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navPackages'), path: '/paket-wisata' },
    { label: t('navArticles'), path: '/artikel' },
    { label: t('navGallery'), path: '/galeri' },
    { label: t('navAbout'), path: '/tentang-kami' },
    { label: t('navContact'), path: '/kontak' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setLangDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          {/* Zone 1: Wordmark & Dynamic Logo */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
          >
            {siteSettings?.logoUrl ? (
              <img
                src={siteSettings.logoUrl}
                alt={siteSettings.brandName || 'Garut Journey Logo'}
                className="h-10 w-auto max-w-[160px] object-contain rounded"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#0F3827] flex items-center justify-center text-[#C8A951] shadow-sm">
                <Compass className="w-6 h-6 stroke-[1.75]" />
              </div>
            )}
            <div className="leading-none">
              <span className="block font-serif-luxury text-xl font-bold tracking-tight text-[#0F3827] whitespace-nowrap">
                {siteSettings?.brandName || 'Garut Journey'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A951] font-semibold mt-0.5 block">
                Official Travel Co.
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-stone-600">
            {navLinks.map(link => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0F3827] cursor-pointer ${
                    isActive ? 'text-[#0F3827] font-semibold' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Switcher & Primary Action */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Direct Admin Portal Shortcut Button */}
            <button
              onClick={() => handleNav('/admin')}
              className="px-2.5 py-2 text-xs font-medium text-stone-600 hover:text-[#0F3827] hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Portal Admin Garut Journey"
            >
              <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
              <span className="text-[11px] font-semibold">Admin</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                aria-label="Pilih Bahasa / Select Language"
                aria-expanded={langDropdownOpen}
              >
                <span className="text-sm">{currentMeta.flag}</span>
                <span className="uppercase font-semibold tracking-wider">{currentMeta.code}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[10px] uppercase tracking-wider font-bold text-stone-400">
                    Pilih Bahasa / Language
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                          language === l.code ? 'bg-[#F3F8F5] text-[#0F3827] font-bold' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-base">{l.flag}</span>
                          <span>{l.nativeName}</span>
                        </span>
                        {language === l.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F3827]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNav('/paket-wisata')}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold text-stone-50 bg-[#0F3827] hover:bg-[#17523A] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('navBookTrip')}
            </button>
          </div>

          {/* Mobile hamburger & mobile language icon */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => {
                const nextIndex = (languages.findIndex(l => l.code === language) + 1) % languages.length;
                setLanguage(languages[nextIndex].code);
              }}
              className="px-2 py-1 text-xs border border-stone-200 rounded bg-white flex items-center gap-1"
              title="Ganti Bahasa"
            >
              <span>{currentMeta.flag}</span>
              <span className="uppercase font-bold text-[10px]">{currentMeta.code}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className="block w-full text-left py-2 text-sm font-medium text-stone-700 hover:text-[#0F3827]"
            >
              {link.label}
            </button>
          ))}

          {/* Mobile Language Selector List */}
          <div className="pt-2 border-t border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-2">
              Pilihan Bahasa / Select Language:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left border ${
                    language === l.code
                      ? 'border-[#0F3827] bg-[#F3F8F5] text-[#0F3827] font-bold'
                      : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span className="truncate">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => handleNav('/paket-wisata')}
              className="w-full py-3 text-center text-xs uppercase tracking-wider font-semibold text-stone-50 bg-[#0F3827] rounded-lg"
            >
              {t('navBookTrip')}
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="w-full py-2.5 text-center text-xs font-semibold text-stone-700 bg-stone-200/80 rounded-lg flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
              <span>Portal Administrator</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
