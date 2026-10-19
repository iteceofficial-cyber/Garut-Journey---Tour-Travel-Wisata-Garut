import React, { useState, useEffect } from 'react';
import type { Article } from '../types.js';
import { updateSEO } from '../utils/seo.js';
import { BookOpen, Clock, User, ArrowRight, Search, Sparkles } from 'lucide-react';

interface ArticlesPageProps {
  navigate: (path: string) => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ navigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');

  useEffect(() => {
    updateSEO({
      title: 'Artikel & Panduan Wisata Garut',
      description: 'Panduan mendaki Gunung Papandayan, tips relaksasi sauna alami Kawah Kamojang, kuliner legendaris Garut, dan etika ekowisata langsung dari pemandu lokal.',
      keywords: 'Artikel Wisata Garut, Tips Papandayan, Panduan Kamojang, Kuliner Garut, Wisata Alam Garut',
      canonicalPath: '/artikel'
    });

    fetch('/api/articles')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setArticles(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Semua', 'Tips & Panduan', 'Eksplorasi Alam', 'Kuliner & Budaya'];

  const filtered = articles.filter(a => {
    if (category !== 'Semua' && a.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
          Jurnal & Cerita Wisata Garut
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
          Inspirasi & Panduan Eksplorasi Tatar Priangan
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
          Kumpulan panduan mendaki, ulasan kuliner autentik, etika ekowisata, dan cerita lokal langsung dari pemandu bersertifikasi Garut Journey.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                category === c
                  ? 'bg-[#0F3827] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari artikel atau topik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
          />
        </div>
      </div>

      {/* Article Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500">Memuat artikel...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(art => (
            <article
              key={art.id}
              onClick={() => navigate(`/artikel/${art.slug}`)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded font-medium">
                    {art.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[#C8A951]" />
                      <span>{art.author}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C8A951]" />
                      <span>{art.readTimeMinutes} menit baca</span>
                    </span>
                  </div>

                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 group-hover:text-[#0F3827] transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-1.5 text-xs font-semibold text-[#0F3827] group-hover:translate-x-1 transition-transform">
                <span>Baca Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-serif-luxury text-base font-bold text-stone-800">Tidak ada artikel yang cocok</h3>
          <p className="text-xs text-stone-500">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}
    </div>
  );
};
