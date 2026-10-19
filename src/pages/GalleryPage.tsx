import React, { useState, useEffect } from 'react';
import type { GalleryItem } from '../types.js';
import { Camera, MapPin, X, ArrowUpRight, ZoomIn } from 'lucide-react';

interface GalleryPageProps {
  navigate: (path: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ navigate }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = ['Semua', 'Gunung', 'Kawah & Danau', 'Air Terjun', 'Budaya & Kuliner'];

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(item => {
    if (selectedCategory === 'Semua') return true;
    return item.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
          Galeri Visual Wisata Garut
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
          Pesona Lanskap Vulkanik & Keindahan Alam Tatar Pasundan
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Kumpulan dokumentasi foto perjalanan autentik dari puncak Gunung Papandayan, kawah geothermal Kamojang, air terjun Sanghyang Taraje, hingga keindahan danau Bagendit.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#0F3827] text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500">Memuat galeri foto...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-100 border border-stone-200 shadow-2xs hover:shadow-md transition-all cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#C8A951] font-medium drop-shadow-xs">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.location}</span>
                </div>
                <h3 className="font-serif-luxury text-base font-bold leading-snug drop-shadow-sm">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <Camera className="w-8 h-8 text-stone-400 mx-auto" />
          <p className="text-xs text-stone-600">Belum ada foto dalam kategori ini.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 text-white">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-800/80 hover:bg-stone-700 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-h-[65vh] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-full object-contain"
              />
            </div>

            <div className="p-6 sm:p-8 space-y-4 bg-stone-900 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 text-xs text-[#C8A951] font-medium">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>{activeItem.location}</span>
                  <span>·</span>
                  <span className="uppercase text-[10px] tracking-wider text-stone-400">{activeItem.category}</span>
                </div>
                <h2 className="font-serif-luxury text-xl font-bold text-white">
                  {activeItem.title}
                </h2>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {activeItem.description}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveItem(null);
                  navigate('/paket-wisata');
                }}
                className="px-5 py-3 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto shrink-0 shadow-md"
              >
                <span>Lihat Paket Terkait</span>
                <ArrowUpRight className="w-4 h-4 text-[#C8A951]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
