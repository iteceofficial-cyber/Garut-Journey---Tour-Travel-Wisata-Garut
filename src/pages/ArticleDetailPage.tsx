import React, { useState, useEffect } from 'react';
import type { Article } from '../types.js';
import { updateSEO } from '../utils/seo.js';
import { ArrowLeft, User, Clock, Calendar, Share2, Compass, CheckCircle } from 'lucide-react';

interface ArticleDetailPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, navigate }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setArticle(json.data);
          updateSEO({
            title: json.data.metaTitle || json.data.title,
            description: json.data.metaDescription || json.data.summary,
            keywords: json.data.keywords || `${json.data.title}, Wisata Garut, Panduan Garut`,
            ogImage: json.data.imageUrl,
            canonicalPath: `/artikel/${json.data.slug}`,
            type: 'article',
            structuredData: {
              '@context': 'https://schema.org',
              '@type': 'Article',
              'headline': json.data.title,
              'image': json.data.imageUrl,
              'author': {
                '@type': 'Person',
                'name': json.data.author
              },
              'publisher': {
                '@type': 'Organization',
                'name': 'Garut Journey'
              },
              'datePublished': json.data.createdAt,
              'description': json.data.summary
            }
          });
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-xs text-stone-500">
        Memuat konten artikel...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-xl font-bold text-stone-900">Artikel Tidak Ditemukan</h2>
        <button
          onClick={() => navigate('/artikel')}
          className="px-4 py-2 bg-[#0F3827] text-white text-xs font-semibold rounded-lg"
        >
          Kembali ke Daftar Artikel
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/artikel')}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Artikel</span>
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-[#0F3827] font-semibold uppercase tracking-wider">
          <span>{article.category}</span>
          <span>·</span>
          <span>{article.readTimeMinutes} Menit Membaca</span>
        </div>

        <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-stone-200 py-3 text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-stone-800">
              <User className="w-4 h-4 text-[#C8A951]" />
              <span>{article.author}</span>
            </span>
            <span>·</span>
            <span className="font-mono">{article.createdAt.split('T')[0]}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[#0F3827] hover:underline cursor-pointer font-medium"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan Artikel'}</span>
          </button>
        </div>
      </div>

      {/* Featured Image */}
      <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-md border border-stone-200">
        <img
          src={article.imageUrl}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-2xs space-y-6 text-sm text-stone-700 leading-relaxed font-serif-luxury">
        <div className="text-base font-sans font-medium text-stone-900 border-l-4 border-[#C8A951] pl-4 italic">
          {article.summary}
        </div>

        <div className="space-y-4 font-sans text-stone-700 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
          {article.content}
        </div>
      </div>

      {/* Bottom CTA to packages */}
      <div className="bg-[#0F3827] text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif-luxury text-xl font-bold text-stone-100">
            Ingin Mengunjungi Destinasi Ini Langsung?
          </h3>
          <p className="text-xs text-stone-300">
            Pesan paket perjalanan berlisensi resmi bersama tim pemandu Garut Journey.
          </p>
        </div>

        <button
          onClick={() => navigate('/paket-wisata')}
          className="px-6 py-3 bg-[#C8A951] hover:bg-[#B89940] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-md whitespace-nowrap"
        >
          Lihat Pilihan Paket
        </button>
      </div>
    </div>
  );
};
