import React, { useState, useEffect } from 'react';
import type { TourPackage } from '../types.js';
import { BookingModal } from '../components/BookingModal.js';
import { updateSEO } from '../utils/seo.js';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface PackageDetailPageProps {
  pkg: TourPackage;
  onBack: () => void;
  onBookingSuccess: (bookingNumber: string, accessToken: string) => void;
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({ pkg, onBack, onBookingSuccess }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    updateSEO({
      title: `${pkg.name} – Private Trip Garut`,
      description: pkg.shortDescription || pkg.description.slice(0, 160),
      keywords: `Paket ${pkg.name}, Wisata ${pkg.destinationArea}, Tour Garut, Private Trip Garut`,
      ogImage: pkg.images?.[0]?.imageUrl,
      canonicalPath: `/paket-wisata/${pkg.slug}`,
      type: 'product',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        'name': pkg.name,
        'description': pkg.shortDescription,
        'touristType': 'Private Group',
        'offers': {
          '@type': 'Offer',
          'price': pkg.basePrice,
          'priceCurrency': 'IDR',
          'availability': 'https://schema.org/InStock',
          'url': `${window.location.origin}/paket-wisata/${pkg.slug}`
        }
      }
    });
  }, [pkg]);

  const images = pkg.images && pkg.images.length > 0
    ? pkg.images
    : [
        {
          id: 'def-1',
          packageId: pkg.id,
          imageUrl: '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
          altText: pkg.name,
          sortOrder: 1,
          isPrimary: true
        }
      ];

  const durationStr =
    pkg.durationNights > 0
      ? `${pkg.durationDays} Hari ${pkg.durationNights} Malam`
      : `${pkg.durationDays} Hari Penuh (One Day Trip)`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <button
          onClick={onBack}
          className="hover:text-stone-900 flex items-center gap-1 cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Katalog</span>
        </button>
        <span>/</span>
        <span className="text-[#0F3827] font-semibold">{pkg.category}</span>
        <span>/</span>
        <span className="text-stone-800 truncate max-w-xs">{pkg.name}</span>
      </div>

      {/* Main Grid: Gallery & Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7 cols): Photo Gallery & Itinerary */}
        <div className="lg:col-span-7 space-y-8">
          {/* Gallery Module */}
          <div className="space-y-3">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={images[selectedImageIdx]?.imageUrl || images[0].imageUrl}
                alt={pkg.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4 bg-stone-900/60 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-md font-medium">
                {pkg.destinationArea}
              </div>
            </div>

            {/* Thumbnail row if multiple */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIdx === idx ? 'border-[#0F3827] ring-1 ring-[#0F3827]' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
              Tentang Perjalanan Ini
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {pkg.description}
            </p>
          </div>

          {/* Itinerary Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
                Rencana Perjalanan (Itinerary)
              </h2>
              <span className="text-xs text-stone-500 font-medium font-mono">{durationStr}</span>
            </div>

            <div className="space-y-6">
              {pkg.itinerary.map((dayItem, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0F3827] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {dayItem.day}
                    </span>
                    <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                      Hari {dayItem.day}: {dayItem.title}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 pl-8 border-l border-stone-200 ml-3">
                    {dayItem.activities.map((act, actIdx) => (
                      <li key={actIdx} className="text-xs text-stone-600 leading-relaxed list-disc marker:text-[#C8A951]">
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <h2 className="font-serif-luxury text-xl font-bold text-stone-900 border-b border-stone-100 pb-3">
              Fasilitas & Layanan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Termasuk Dalam Paket (Include)</span>
                </h3>
                <ul className="space-y-2 text-xs text-stone-600">
                  {pkg.inclusions.map((inc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-stone-400" />
                  <span>Tidak Termasuk (Exclude)</span>
                </h3>
                <ul className="space-y-2 text-xs text-stone-500">
                  {pkg.exclusions.map((exc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-stone-400 font-bold">✕</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-stone-100 p-6 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-2">
            <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
              Ketentuan Khusus Paket
            </h4>
            <p className="leading-relaxed">
              {pkg.termsAndConditions}
            </p>
          </div>
        </div>

        {/* Right Column (5 cols): Sticky Contiguous Purchase Module */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-md space-y-6">
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="text-[#0F3827] uppercase tracking-wider text-[11px] font-semibold">{pkg.category}</span>
                <span aria-hidden="true">·</span>
                <span>{pkg.destinationArea}</span>
              </div>

              <h1 className="font-serif-luxury text-2xl font-bold text-stone-900 leading-snug">
                {pkg.name}
              </h1>

              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-[#0F3827] font-mono tabular-nums">
                  Rp {pkg.basePrice.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-stone-500">/ orang (all-in)</span>
              </div>
            </div>

            {/* Quick Spec Highlights */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C8A951] shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase">Durasi</div>
                  <div className="font-medium text-stone-800">{durationStr}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C8A951] shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-400 uppercase">Kapasitas</div>
                  <div className="font-medium text-stone-800">{pkg.minParticipants}–{pkg.maxParticipants} Tamu</div>
                </div>
              </div>
            </div>

            {/* 100% Private Trip Flexibility Notice */}
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-[#C8A951]" />
                <span>100% PRIVATE TRIP EKSKLUSIF</span>
              </div>
              <p className="text-xs text-emerald-950/80 leading-relaxed font-light">
                Garut Journey <strong>hanya menerima private trip</strong> (tidak digabung rombongan lain). Anda bebas menentukan tanggal keberangkatan yang Anda inginkan.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pemandu, armada, dan jadwal eksklusif untuk grup Anda</span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full py-4 px-6 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Pesan Private Trip Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/6281223456789?text=${encodeURIComponent(`Halo Garut Journey, saya tertarik dengan paket "${pkg.name}". Mohon informasi ketersediaan tanggal dan detail penjemputan.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#0F3827]" />
                <span>Konsultasi via WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pembayaran resmi via Midtrans Snap (QRIS, VA Bank)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C8A951] shrink-0" />
                <span>E-Ticket digital terbit instan setelah pembayaran terkonfirmasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      <BookingModal
        pkg={pkg}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={(bookingNum, token) => {
          setIsBookingOpen(false);
          onBookingSuccess(bookingNum, token);
        }}
      />
    </div>
  );
};
