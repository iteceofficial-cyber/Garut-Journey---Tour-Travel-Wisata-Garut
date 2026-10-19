import React, { useState } from 'react';
import type { SiteSettings } from '../types.js';
import { Compass, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  isAdminLoggedIn?: boolean;
  siteSettings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, siteSettings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', path: '/' },
    { label: 'Paket Wisata', path: '/paket-wisata' },
    { label: 'Artikel', path: '/artikel' },
    { label: 'Galeri', path: '/galeri' },
    { label: 'Tentang Kami', path: '/tentang-kami' },
    { label: 'Kontak', path: '/kontak' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
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

          {/* Zone 2: Navigation Links (Clean - Admin Portal moved to Footer) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-600">
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

          {/* Zone 3: 1 Primary Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav('/paket-wisata')}
              className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-stone-50 bg-[#0F3827] hover:bg-[#17523A] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cari Paket Wisata
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center">
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
        <div className="lg:hidden border-t border-stone-200 bg-stone-50 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.path}
              onClick={() => handleNav(link.path)}
              className="block w-full text-left py-2 text-sm font-medium text-stone-700 hover:text-[#0F3827]"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2">
            <button
              onClick={() => handleNav('/paket-wisata')}
              className="w-full py-3 text-center text-xs uppercase tracking-wider font-semibold text-stone-50 bg-[#0F3827] rounded-lg"
            >
              Cari Paket Wisata
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
