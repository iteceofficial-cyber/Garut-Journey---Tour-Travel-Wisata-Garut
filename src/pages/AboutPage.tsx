import React from 'react';
import { Compass, ShieldCheck, HeartHandshake, Trees, Users, MapPin, Award } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
          Profil Perusahaan
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
          Menghadirkan Keaslian Garut untuk Setiap Langkah Wisatawan
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
          Garut Journey adalah platform tour & travel berbadan hukum resmi yang berdedikasi memperkenalkan pesona vulkanik, keasrian danau, dan kekayaan budaya Tatar Sunda di Garut, Jawa Barat.
        </p>
      </div>

      {/* Visual Banner */}
      <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-lg border border-stone-200">
        <img
          src="/src/assets/images/tour_kamojang_pine_1792431915131.jpg"
          alt="Hutan Pinus Kamojang Garut"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A261A]/80 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white text-xs sm:text-sm font-medium">
          PT Garut Journey Nusantara • NIB: 9120003482194 • Surat Izin Usaha Pariwisata Resmi
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
            Pemberdayaan Warga Lokal
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            100% pemandu wisata, porter gunung, pengemudi lokal, hingga penyedia jamuan makan Sunda adalah masyarakat lokal Garut yang kami berdayakan secara adil dan berkelanjutan.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
            <Trees className="w-5 h-5" />
          </div>
          <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
            Ekowisata Beretika (Leave No Trace)
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Kami menjaga ketat kelestarian bunga abadi Edelweiss di Tegal Alun, kebersihan sumber air panas kawah, dan mematuhi etika konservasi alam di seluruh destinasi.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
            Profesional & Berlisensi
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Didukung armada kendaraan prima dengan pengemudi ramah dan pemandu yang tergabung dalam Himpunan Pramuwisata Indonesia (HPI) DPC Garut.
          </p>
        </div>
      </div>

      {/* Legal & Office Identity */}
      <div className="bg-stone-100 p-8 rounded-3xl border border-stone-200 space-y-4">
        <h2 className="font-serif-luxury text-xl font-bold text-stone-900">
          Legalitas & Kantor Operasional
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700">
          <div>
            <span className="text-stone-400 block text-[11px]">Nama Entitas Usaha</span>
            <span className="font-semibold text-stone-900">PT Garut Journey Nusantara</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Nomor Induk Berusaha (NIB)</span>
            <span className="font-mono font-semibold text-stone-900">9120003482194</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Alamat Kantor Pusat</span>
            <span>Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Rekening Resmi Perusahaan</span>
            <span className="font-semibold text-stone-900">BCA 148-092-8899 a/n PT Garut Journey Nusantara</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/paket-wisata')}
          className="px-8 py-3.5 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Lihat Paket Perjalanan Kami
        </button>
      </div>
    </div>
  );
};
