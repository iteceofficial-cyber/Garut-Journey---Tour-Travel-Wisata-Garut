import React, { useState } from 'react';
import { MessageSquare, ExternalLink, X, ChevronRight } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  whatsappNumber?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ whatsappNumber = '6281223456789' }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Never render on admin pages
  if (pathname === '/admin' || pathname.startsWith('/admin')) {
    return null;
  }

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Halo Tim Garut Journey, saya ingin konsultasi paket wisata Garut.')}`;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-40 px-3 py-1.5 rounded-full bg-emerald-700/90 hover:bg-emerald-800 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 backdrop-blur-xs transition-all cursor-pointer border border-white/20"
        title="Buka Chat WhatsApp"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Chat CS</span>
      </button>
    );
  }

  return (
    <aside aria-label="Bantuan WhatsApp" className="fixed bottom-6 right-6 z-40 flex items-center gap-2 group">
      <div className="hidden sm:flex items-center gap-2 bg-stone-900/90 text-white text-xs pl-3.5 pr-2 py-1.5 rounded-full shadow-md backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 font-medium border border-white/10">
        <span>Konsultasi WhatsApp Garut Journey</span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMinimized(true);
          }}
          className="text-stone-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Kecilkan icon"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi kami melalui WhatsApp"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/80 ring-2 ring-emerald-600/30"
      >
        {/* Official WhatsApp SVG icon */}
        <svg
          className="w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.507 14.307l-.009.075c-.328.788-1.468 1.542-2.316 1.704-.61.116-1.396.196-4.08-1.002-3.432-1.53-5.65-5.074-5.823-5.32-.167-.247-1.39-1.92-1.39-3.66 0-1.741.874-2.597 1.185-2.951.312-.355.68-.444.908-.444.227 0 .454.002.653.012.21.01.49-.08.766.634.284.733.973 2.502 1.057 2.686.085.183.142.398.028.643-.114.246-.171.398-.34.613-.17.215-.357.48-.51.644-.17.18-.347.377-.149.742.198.365.88 1.518 1.888 2.455 1.298 1.206 2.39 1.58 2.73 1.732.34.152.538.127.737-.114.198-.242.85-1.042 1.077-1.4.227-.357.454-.298.766-.176.312.122 1.977.974 2.317 1.152.34.178.567.265.65.413.084.148.084.862-.244 1.65zM12 2C6.48 2 2 6.48 2 12c0 1.97.57 3.81 1.56 5.37L2 22l4.79-1.52C8.3 21.46 10.1 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
        </svg>
      </a>
    </aside>
  );
};
