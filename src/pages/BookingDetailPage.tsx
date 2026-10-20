import React, { useState, useEffect } from 'react';
import type { Booking } from '../types.js';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Printer,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  Compass,
  ArrowRight,
  Receipt,
  Download,
  Loader2
} from 'lucide-react';
import { downloadBookingPdf } from '../utils/theme.js';

interface BookingDetailPageProps {
  bookingNumber: string;
  token?: string;
  navigate: (path: string) => void;
}

export const BookingDetailPage: React.FC<BookingDetailPageProps> = ({ bookingNumber, token, navigate }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        const url = `/api/bookings/${bookingNumber}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          setBooking(json.data);
        } else {
          setError(json.error || 'Pesanan tidak ditemukan atau tautan akses tidak valid.');
        }
      } catch {
        setError('Gagal memuat informasi pesanan.');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [bookingNumber, token]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-[#0F3827] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat voucher dan status perjalanan...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-serif-luxury text-xl font-bold text-stone-900">Akses Tidak Diizinkan</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          {error || 'Detail booking hanya dapat diakses melalui tautan resmi yang dikirimkan ke email Anda.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#0F3827] text-white text-xs font-semibold rounded-lg hover:bg-[#17523A] transition-colors cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed';
  const isPending = booking.status === 'pending_payment';
  const isLunas = booking.paymentTier === 'full' || booking.remainingBalance <= 0;

  const handlePrint = () => {
    const printUrl = `/api/bookings/${booking.bookingNumber}/print`;
    try {
      const w = window.open(printUrl, '_blank');
      if (!w) {
        window.location.href = printUrl;
      }
    } catch {
      window.location.href = printUrl;
    }
  };

  const getWhatsAppInvoiceLink = () => {
    const text = `Halo Admin Garut Journey, ini konfirmasi pesanan saya:\n- No. Booking: ${booking.bookingNumber}\n- Status: ${isLunas ? 'LUNAS (100%)' : `BARU DP (Sisa: Rp ${booking.remainingBalance.toLocaleString('id-ID')})`}\n- Paket: ${booking.tourPackage?.name}\n- Tanggal: ${booking.departureDate}\nMohon informasi persiapan penjemputan. Terima kasih!`;
    return `https://wa.me/6281223456789?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Status Notice Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isConfirmed
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : isPending
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-stone-100 border-stone-200 text-stone-800'
      }`}>
        <div className="flex items-center gap-3 text-center sm:text-left">
          {isConfirmed ? (
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
                Status Pembayaran
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isLunas ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
              }`}>
                {isLunas ? 'LUNAS' : 'BARU DP'}
              </span>
            </div>
            <h2 className="font-serif-luxury text-lg font-bold mt-0.5">
              {isConfirmed
                ? isLunas
                  ? 'E-Ticket Terkonfirmasi & Lunas'
                  : 'Booking Terkonfirmasi (Baru DP)'
                : isPending
                ? 'Menunggu Pembayaran'
                : `Status: ${booking.status}`}
            </h2>
            <p className="text-xs opacity-90 mt-0.5">
              {isConfirmed
                ? isLunas
                  ? 'Seluruh pembayaran telah selesai. Kuota perjalanan 100% aman.'
                  : `Uang muka 30% telah diterima. Sisa pelunasan Rp ${booking.remainingBalance.toLocaleString('id-ID')} dibayar saat penjemputan.`
                : 'Selesaikan transaksi Anda untuk mengunci kuota perjalanan.'}
            </p>
          </div>
        </div>

        {isPending && (
          <button
            onClick={() => navigate(`/pembayaran/${booking.bookingNumber}?token=${token || booking.accessToken}`)}
            className="px-5 py-2.5 bg-[#0F3827] text-white text-xs uppercase tracking-wider font-bold rounded-lg hover:bg-[#17523A] transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            Lanjut Bayar
          </button>
        )}
      </div>

      {/* Official Digital Ticket Voucher */}
      <div id="printable-voucher" className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-[#0A261A] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C8A951]" />
              <span className="font-serif-luxury text-xl font-bold tracking-tight">Garut Journey</span>
            </div>
            <p className="text-xs text-[#C8A951] mt-1 font-medium">
              KWITANSI & VOUCHER RESMI PERJALANAN WISATA
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Kode Reservasi</span>
            <span className="font-mono text-xl font-bold text-stone-100 tracking-wider">
              {booking.bookingNumber}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-6 border-b border-stone-100">
            <div>
              <span className="text-stone-400 block text-[11px]">Nama Tamu Penanggung Jawab</span>
              <span className="font-bold text-stone-900 text-sm mt-0.5 block">{booking.customerName}</span>
              <span className="text-stone-500">{booking.customerPhone} · {booking.customerEmail}</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px]">Paket Wisata</span>
              <span className="font-bold text-[#0F3827] text-sm mt-0.5 block">{booking.tourPackage?.name}</span>
              <span className="text-stone-500">{booking.tourPackage?.destinationArea}</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px]">Tanggal Keberangkatan</span>
              <span className="font-mono font-bold text-stone-900 text-sm mt-0.5 block">
                {booking.departureDate}
              </span>
              <span className="text-stone-500">Jumlah: {booking.participantsCount} Orang Peserta</span>
            </div>

            <div>
              <span className="text-stone-400 block text-[11px]">Titik Penjemputan Resmi</span>
              <span className="font-semibold text-stone-900 text-sm mt-0.5 block">
                {booking.pickupLocation}
              </span>
              <span className="text-stone-500">Pemandu standby 30 menit sebelum jadwal</span>
            </div>
          </div>

          {/* Payment Status Box */}
          <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            isLunas ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div>
              <span className="font-bold block text-stone-900">
                Keterangan Status Pembayaran:
              </span>
              <span className={`font-semibold ${isLunas ? 'text-emerald-800' : 'text-amber-800'}`}>
                {isLunas
                  ? 'LUNAS (100% Terbayar via Midtrans)'
                  : `BARU DP (Uang Muka 30% Terbayar: Rp ${booking.dpAmount.toLocaleString('id-ID')})`}
              </span>
            </div>
            {!isLunas && (
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">Sisa Tagihan Pelunasan</span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  Rp {booking.remainingBalance.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          {/* Itemized snapshot */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block">
              Rincian Pembayaran Resmi
            </span>
            {booking.items?.map(item => (
              <div key={item.id} className="flex justify-between py-1 text-stone-700">
                <span>{item.itemName}</span>
                <span className="font-mono tabular-nums">Rp {item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            ))}
            {booking.discountTotal > 0 && (
              <div className="flex justify-between py-1 text-emerald-700 font-medium">
                <span>Potongan Promo ({booking.appliedPromoCode})</span>
                <span className="font-mono tabular-nums">-Rp {booking.discountTotal.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-[#0F3827]">
              <span>Total Nilai Transaksi</span>
              <span className="text-lg font-mono tabular-nums">
                Rp {booking.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div className="bg-stone-50 p-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dokumen sah digital diterbitkan oleh PT Garut Journey Nusantara</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Direct PDF Download (no login needed) */}
            <button
              onClick={() => downloadBookingPdf(booking.bookingNumber, () => setDownloadingPdf(true), () => setDownloadingPdf(false))}
              disabled={downloadingPdf}
              className="px-4 py-2 bg-[#0F3827] hover:bg-[#17523A] text-white font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              title="Unduh file E-Ticket PDF langsung tanpa login"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 text-[#C8A951] animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-[#C8A951]" />
              )}
              <span>{downloadingPdf ? 'Mengunduh PDF...' : 'Unduh E-Ticket (PDF)'}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-stone-800 font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>Cetak Kwitansi</span>
            </button>

            <a
              href={getWhatsAppInvoiceLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim ke WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
