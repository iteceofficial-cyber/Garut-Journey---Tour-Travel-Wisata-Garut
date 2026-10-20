import React from 'react';
import type { TourPackage } from '../types.js';
import { MapPin, Calendar, Users, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface PackageCardProps {
  pkg: TourPackage;
  onSelect: (slug: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect }) => {
  const { t } = useLanguage();
  const primaryImage = pkg.images?.[0]?.imageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg';

  const durationText =
    pkg.durationNights > 0
      ? `${pkg.durationDays} ${t('days')} ${pkg.durationNights} ${t('nights')}`
      : `${pkg.durationDays} ${t('days')}`;

  return (
    <article
      onClick={() => onSelect(pkg.slug)}
      className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Visual Slot */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={pkg.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80" />

        {/* Quiet destination marker on top of scrim */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-medium drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#C8A951]" />
            <span>{pkg.destinationArea}</span>
          </div>
          <span className="text-stone-200 font-mono text-[11px] bg-stone-900/50 backdrop-blur-xs px-2 py-0.5 rounded">
            {durationText}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="text-[#0F3827] uppercase tracking-wider text-[11px] font-semibold">{pkg.category}</span>
            <span aria-hidden="true">·</span>
            <span>Min. {pkg.minParticipants} Pax</span>
          </div>

          {/* Title */}
          <h3 className="font-serif-luxury text-lg font-bold text-stone-900 group-hover:text-[#0F3827] transition-colors leading-snug line-clamp-2">
            {pkg.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {pkg.shortDescription}
          </p>
        </div>

        {/* Price & CTA baseline */}
        <div className="pt-3 border-t border-stone-100 flex items-end justify-between">
          <div>
            <span className="text-[11px] text-stone-500 block">{t('startingFrom')}</span>
            <div className="text-base font-bold text-[#0F3827] tabular-nums">
              Rp {pkg.basePrice.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-stone-500"> {t('perPerson')}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-[#0F3827] group-hover:text-[#17523A] transition-colors">
            <span>{t('viewDetail')}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </article>
  );
};
