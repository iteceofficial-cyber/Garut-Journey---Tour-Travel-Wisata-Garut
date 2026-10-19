import React from 'react';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'cancellation';
  navigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ type, navigate }) => {
  if (type === 'terms') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
            Ketentuan Layanan Resmi
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-stone-900 mt-1">
            Syarat & Ketentuan Pemesanan
          </h1>
          <p className="text-xs text-stone-500 mt-1">Terakhir diperbarui: 19 Oktober 2026 • PT Garut Journey Nusantara</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">1. Ketentuan Umum Pemesanan</h2>
            <p>
              Dengan melakukan pemesanan paket wisata melalui situs resmi Garut Journey, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku. Seluruh transaksi diproses di bawah naungan hukum Republik Indonesia dan badan usaha resmi PT Garut Journey Nusantara.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">2. Pembayaran dan Batas Waktu</h2>
            <p>
              Pemesanan tanpa pembayaran hanya akan ditahan (hold) secara sistemik selama 60 menit. Apabila pembayaran melalui payment gateway Midtrans tidak terselesaikan dalam batas waktu tersebut, sistem secara otomatis akan membatalkan reservasi dan melepas kuota kursi ke publik demi keadilan bersama.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">3. Keabsahan E-Ticket</h2>
            <p>
              E-Ticket digital yang memuat kode booking unik merupakan bukti sah transaksi. Peserta wajib menunjukkan voucher digital ini kepada tim penjemputan atau pemandu lokal kami pada saat hari keberangkatan di titik meeting point Garut yang disepakati.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">4. Keselamatan dan Tanggung Jawab</h2>
            <p>
              Seluruh peserta wajib mematuhi instruksi pemandu lapangan, terutama saat berada di kawasan kawah aktif Gunung Papandayan, Kawah Kamojang, dan tebing air terjun Sanghyang Taraje. Peserta diwajibkan dalam kondisi fisik sehat dan memberitahukan riwayat kesehatan khusus sebelumnya.
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (type === 'privacy') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
            Perlindungan Data Pelanggan
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-stone-900 mt-1">
            Kebijakan Privasi
          </h1>
          <p className="text-xs text-stone-500 mt-1">Garut Journey menjunjung tinggi integritas data pribadi Anda</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">1. Data yang Kami Kumpulkan</h2>
            <p>
              Kami hanya mengumpulkan data yang esensial untuk kebutuhan operasional perjalanan: Nama Lengkap, Nomor Kontak WhatsApp, Alamat Email (pengiriman E-ticket), titik penjemputan, serta catatan kesehatan khusus jika ada.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">2. Keamanan Pembayaran</h2>
            <p>
              Kami tidak menyimpan data nomor kartu kredit atau detail perbankan Anda di server kami. Semua pemrosesan pembayaran dilakukan secara aman melalui gateway Midtrans yang telah tersertifikasi PCI-DSS Level 1 dan diawasi oleh Bank Indonesia.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif-luxury text-base font-bold text-stone-900">3. Penggunaan Informasi</h2>
            <p>
              Informasi kontak Anda hanya digunakan untuk koordinasi penjemputan, pengiriman voucher perjalanan, dan layanan darurat. Kami menjamin tidak akan pernah menjual, menyewakan, atau membagikan data Anda kepada pihak ketiga untuk kepentingan periklanan di luar program Garut Journey.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // cancellation & refund
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
          Prosedur Pembatalan Transparan
        </span>
        <h1 className="font-serif-luxury text-3xl font-bold text-stone-900 mt-1">
          Kebijakan Pembatalan & Pengembalian Dana (Refund)
        </h1>
        <p className="text-xs text-stone-500 mt-1">Panduan resmi refund dan jadwal ulang (reschedule)</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6 text-xs text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif-luxury text-base font-bold text-stone-900">1. Penjadwalan Ulang (Reschedule)</h2>
          <p>
            Permintaan perubahan jadwal keberangkatan dapat diajukan selambat-lambatnya <strong>5 hari kerja</strong> sebelum tanggal pelaksanaan tour, tanpa dikenakan biaya administrasi, selama kuota tanggal tujuan baru masih tersedia.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-luxury text-base font-bold text-stone-900">2. Skema Pengembalian Dana (Refund)</h2>
          <div className="space-y-2 pl-3 border-l-2 border-[#C8A951]">
            <p>• <strong>Pembatalan H-7 atau lebih awal:</strong> Pengembalian dana sebesar 85% dari total biaya transaksi (dipotong biaya administrasi perbankan/tiket masuk yang terlanjur terbit).</p>
            <p>• <strong>Pembatalan H-6 s/d H-3:</strong> Pengembalian dana sebesar 50% dari total biaya transaksi.</p>
            <p>• <strong>Pembatalan H-2 hingga Hari-H:</strong> Tidak dapat dilakukan pengembalian dana (non-refundable) karena akomodasi, armada, dan pemandu telah disiapkan penuh.</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-luxury text-base font-bold text-stone-900">3. Pembatalan Akibat Keadaan Kahar (Force Majeure)</h2>
          <p>
            Apabila terjadi penutupan resmi Taman Wisata Alam Gunung Papandayan oleh PVMBG/BKSDA akibat aktivitas vulkanik atau bencana alam ekstrem, peserta berhak memilih pengalihan destinasi alternatif yang setara di Garut atau pengembalian dana 100% tanpa potongan.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-luxury text-base font-bold text-stone-900">4. Alur Pengajuan</h2>
          <p>
            Pengajuan pembatalan atau refund wajib disampaikan melalui WhatsApp resmi Garut Journey (+62 812-2345-6789) dengan menyertakan Nomor Booking dan foto KTP pemesan asli. Proses pencairan dana transfer memakan waktu 3–5 hari kerja.
          </p>
        </section>
      </div>
    </div>
  );
};
