import React, { useState, useMemo, useEffect } from 'react';
import type { TourPackage } from '../types.js';
import { PackageCard } from '../components/PackageCard.js';
import { updateSEO } from '../utils/seo.js';
import { Search, Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CatalogPageProps {
  packages: TourPackage[];
  initialCategory?: string;
  initialQuery?: string;
  onSelectPackage: (slug: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  packages,
  initialCategory = 'Semua',
  initialQuery = '',
  onSelectPackage
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDestination, setSelectedDestination] = useState('Semua');
  const [selectedDuration, setSelectedDuration] = useState('Semua');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high'>('recommended');

  useEffect(() => {
    updateSEO({
      title: 'Katalog Paket Wisata Garut – Private Trip Resmi',
      description: 'Daftar paket wisata private trip Gunung Papandayan, Kawah Kamojang, Situ Bagendit, dan Curug Sanghyang Taraje. Tanggal keberangkatan fleksibel langsung ditentukan oleh Anda.',
      keywords: 'Paket Wisata Garut, Private Trip Garut, Tour Papandayan, Tour Kamojang, Situ Bagendit',
      canonicalPath: '/paket-wisata'
    });
  }, []);

  const categories = ['Semua', 'Gunung & Alam', 'Keluarga & Relaksasi', 'Budaya & Sejarah', 'Petualangan Alam'];
  const destinations = ['Semua', 'Papandayan', 'Kamojang', 'Banyuresmi', 'Garut Selatan'];
  const durations = ['Semua', '1 Hari', '2 Hari 1 Malam'];

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = pkg.name.toLowerCase().includes(q);
        const matchDesc = pkg.shortDescription.toLowerCase().includes(q);
        const matchDest = pkg.destinationArea.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchDest) return false;
      }

      // Category
      if (selectedCategory !== 'Semua') {
        if (!pkg.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Destination
      if (selectedDestination !== 'Semua') {
        if (!pkg.destinationArea.toLowerCase().includes(selectedDestination.toLowerCase())) {
          return false;
        }
      }

      // Duration
      if (selectedDuration !== 'Semua') {
        if (selectedDuration === '1 Hari' && pkg.durationDays !== 1) return false;
        if (selectedDuration === '2 Hari 1 Malam' && (pkg.durationDays !== 2 || pkg.durationNights !== 1)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.basePrice - b.basePrice;
      if (sortBy === 'price_high') return b.basePrice - a.basePrice;
      return (a.featuredOrder || 0) - (b.featuredOrder || 0);
    });
  }, [packages, searchQuery, selectedCategory, selectedDestination, selectedDuration, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedDestination('Semua');
    setSelectedDuration('Semua');
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
          {t('catalogTitle')}
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          {t('catalogSubtitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 flex items-center gap-1.5 font-light">
          <Sparkles className="w-3.5 h-3.5 text-[#C8A951] shrink-0" />
          <span>{t('descPrivateTrip')}</span>
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        {/* Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('heroSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
            >
              <option value="recommended">Urutkan: Rekomendasi Pilihan</option>
              <option value="price_low">Harga: Terendah ke Tertinggi</option>
              <option value="price_high">Harga: Tertinggi ke Terendah</option>
            </select>
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-xs">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
              {t('searchCategory')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-stone-50 rounded-lg border border-stone-200"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
              Wilayah Destinasi
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-2.5 py-2 bg-stone-50 rounded-lg border border-stone-200"
            >
              {destinations.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
              Durasi Waktu
            </label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-2.5 py-2 bg-stone-50 rounded-lg border border-stone-200"
            >
              {durations.map(dur => (
                <option key={dur} value={dur}>{dur}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Package Count Indicator */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          Menampilkan <strong className="text-stone-900">{filteredPackages.length}</strong> paket perjalanan
        </span>
        {(selectedCategory !== 'Semua' || selectedDestination !== 'Semua' || selectedDuration !== 'Semua' || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[#0F3827] hover:underline cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        )}
      </div>

      {/* Package Grid or Empty State */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} onSelect={onSelectPackage} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-serif-luxury text-lg font-bold text-stone-800">
            Tidak Ada Paket yang Sesuai Filter
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk melihat seluruh katalog wisata Garut.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#0F3827] text-white text-xs font-semibold rounded-lg hover:bg-[#17523A] transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};
