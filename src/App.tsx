import React, { useState, useEffect } from 'react';
import type { TourPackage, SiteSettings } from './types.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton.js';
import { HomePage } from './pages/HomePage.js';
import { CatalogPage } from './pages/CatalogPage.js';
import { PackageDetailPage } from './pages/PackageDetailPage.js';
import { PaymentPage } from './pages/PaymentPage.js';
import { BookingDetailPage } from './pages/BookingDetailPage.js';
import { ArticlesPage } from './pages/ArticlesPage.js';
import { ArticleDetailPage } from './pages/ArticleDetailPage.js';
import { GalleryPage } from './pages/GalleryPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { LegalPages } from './pages/LegalPages.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { AdminLogin } from './components/AdminLogin.js';

import { updateFavicon } from './utils/seo.js';
import { applyThemeColors } from './utils/theme.js';
import initialDbData from '../data/database.json';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [packages, setPackages] = useState<TourPackage[]>((initialDbData.packages as any) || []);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>((initialDbData.siteSettings as any) || undefined);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track visitor views on path changes
  useEffect(() => {
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentPath })
    }).catch(() => {});
  }, [currentPath]);

  useEffect(() => {
    const token = localStorage.getItem('gj_admin_token');
    if (token) {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setPackages(json.data);
        }
      })
      .catch(err => console.error('Failed to load packages', err))
      .finally(() => setLoadingPackages(false));

    fetch('/api/site-settings')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setSiteSettings(json.data);
          applyThemeColors(json.data);
          if (json.data.faviconUrl) {
            updateFavicon(json.data.faviconUrl);
          }
        }
      })
      .catch(() => {});
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getQueryParams = (customPath?: string) => {
    const raw = customPath || currentPath || (typeof window !== 'undefined' ? window.location.search : '');
    const queryPart = raw.includes('?') ? raw.slice(raw.indexOf('?')) : (typeof window !== 'undefined' ? window.location.search : '');
    return new URLSearchParams(queryPart);
  };

  const renderCurrentView = () => {
    const normalizedPath = currentPath.split('?')[0];

    // 1. Admin Portal
    if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
      if (!isAdminLoggedIn) {
        return (
          <AdminLogin
            onSuccess={() => setIsAdminLoggedIn(true)}
            onCancel={() => navigate('/')}
          />
        );
      }
      return (
        <AdminDashboard
          onLogout={() => {
            localStorage.removeItem('gj_admin_token');
            setIsAdminLoggedIn(false);
            navigate('/');
          }}
        />
      );
    }

    // 2. Package Detail: /paket-wisata/:slug
    if (normalizedPath.startsWith('/paket-wisata/') && normalizedPath !== '/paket-wisata') {
      const slug = normalizedPath.replace('/paket-wisata/', '').split('?')[0];
      const pkg = packages.find(p => p.slug === slug);
      if (pkg) {
        return (
          <PackageDetailPage
            pkg={pkg}
            onBack={() => navigate('/paket-wisata')}
            onBookingSuccess={(bookingNumber, accessToken) => {
              navigate(`/pembayaran/${bookingNumber}?token=${accessToken}`);
            }}
          />
        );
      } else if (!loadingPackages) {
        return (
          <div className="max-w-md mx-auto py-20 text-center space-y-4">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">Paket Wisata Tidak Ditemukan</h2>
            <p className="text-xs text-stone-600">Paket yang Anda cari mungkin telah diperbarui atau dinonaktifkan.</p>
            <button
              onClick={() => navigate('/paket-wisata')}
              className="px-4 py-2 bg-[#0F3827] text-white text-xs font-semibold rounded-lg hover:bg-[#17523A]"
            >
              Lihat Katalog Paket Lain
            </button>
          </div>
        );
      }
    }

    // 3. Payment Page: /pembayaran/:bookingNumber
    if (normalizedPath.startsWith('/pembayaran/')) {
      const bookingNumber = normalizedPath.replace('/pembayaran/', '').split('?')[0];
      const params = getQueryParams();
      const token = params.get('token') || undefined;

      return (
        <PaymentPage
          bookingNumber={bookingNumber}
          token={token}
          navigate={navigate}
        />
      );
    }

    // 4. Booking Detail (E-Ticket): /booking/:bookingNumber
    if (normalizedPath.startsWith('/booking/')) {
      const bookingNumber = normalizedPath.replace('/booking/', '').split('?')[0];
      const params = getQueryParams();
      const token = params.get('token') || undefined;

      return (
        <BookingDetailPage
          bookingNumber={bookingNumber}
          token={token}
          navigate={navigate}
        />
      );
    }

    // 5. Catalog: /paket-wisata (Supports /paket-wisata?q=...&cat=...)
    if (normalizedPath === '/paket-wisata') {
      const params = getQueryParams();
      const initialCat = params.get('cat') || 'Semua';
      const initialQ = params.get('q') || '';

      return (
        <CatalogPage
          packages={packages}
          initialCategory={initialCat}
          initialQuery={initialQ}
          onSelectPackage={(slug) => navigate(`/paket-wisata/${slug}`)}
        />
      );
    }

    // 6. Articles List: /artikel
    if (normalizedPath === '/artikel') {
      return <ArticlesPage navigate={navigate} />;
    }

    // 7. Article Detail: /artikel/:slug
    if (normalizedPath.startsWith('/artikel/')) {
      const slug = normalizedPath.replace('/artikel/', '').split('?')[0];
      return <ArticleDetailPage slug={slug} navigate={navigate} />;
    }

    // 8. Gallery: /galeri
    if (normalizedPath === '/galeri') {
      return <GalleryPage navigate={navigate} />;
    }

    // 9. About Us: /tentang-kami
    if (normalizedPath === '/tentang-kami') {
      return <AboutPage navigate={navigate} />;
    }

    // 10. Contact: /kontak
    if (normalizedPath === '/kontak') {
      return <ContactPage />;
    }

    // 11. Legal Pages
    if (normalizedPath === '/syarat-ketentuan') {
      return <LegalPages type="terms" navigate={navigate} />;
    }
    if (normalizedPath === '/kebijakan-privasi') {
      return <LegalPages type="privacy" navigate={navigate} />;
    }
    if (normalizedPath === '/kebijakan-pembatalan') {
      return <LegalPages type="cancellation" navigate={navigate} />;
    }

    // 12. Home Default: /
    return (
      <HomePage
        packages={packages}
        navigate={navigate}
        onSelectPackage={(slug) => navigate(`/paket-wisata/${slug}`)}
        siteSettings={siteSettings}
      />
    );
  };

  const isAdminPage = currentPath === '/admin' || currentPath.startsWith('/admin');
  const isAdminDashboard = isAdminPage && isAdminLoggedIn;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900">
      {/* Hide standard navbar on full admin dashboard */}
      {!isAdminDashboard && (
        <Navbar
          currentPath={currentPath}
          navigate={navigate}
          isAdminLoggedIn={isAdminLoggedIn}
          siteSettings={siteSettings}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Floating WhatsApp button on public pages (never on admin portal or dashboard) */}
      {!isAdminPage && (
        <WhatsAppFloatingButton whatsappNumber={siteSettings?.whatsappNumber} />
      )}

      {/* Dynamic footer */}
      {!isAdminDashboard && (
        <Footer navigate={navigate} siteSettings={siteSettings} />
      )}
    </div>
  );
}
