import React, { useState, useEffect } from 'react';
import type { Booking } from '../types.js';
import { SnapModal } from '../components/SnapModal.js';
import {
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PaymentPageProps {
  bookingNumber: string;
  token?: string;
  navigate: (path: string) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ bookingNumber, token, navigate }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 60, seconds: 0 });
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [snapData, setSnapData] = useState<{ token: string; redirectUrl: string } | null>(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const url = `/api/bookings/${bookingNumber}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setBooking(json.data);
        if (json.data.status === 'confirmed') {
          navigate(`/booking/${bookingNumber}?token=${token || json.data.accessToken}`);
        }
      } else {
        setError(json.error || 'Pesanan tidak ditemukan atau akses tidak sah.');
      }
    } catch {
      setError('Gagal memuat status pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingNumber, token]);

  // Countdown timer calculation
  useEffect(() => {
    if (!booking || booking.status !== 'pending_payment') return;

    const interval = setInterval(() => {
      const expiry = new Date(booking.paymentExpiry).getTime();
      const now = Date.now();
      const diff = Math.max(0, expiry - now);

      if (diff <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0 });
        clearInterval(interval);
        fetchBooking(); // Refresh to expired state
      } else {
        const m = Math.floor(diff / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const handleLaunchPayment = async () => {
    if (!booking) return;

    try {
      const res = await fetch('/api/payments/snap-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingNumber: booking.bookingNumber,
          accessToken: token || booking.accessToken
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSnapData(json.data);
        setIsSnapModalOpen(true);
      } else {
        alert(json.error || 'Gagal memproses pembayaran.');
      }
    } catch {
      alert('Terjadi kendala menghubungi server pembayaran.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-3 border-[#0F3827] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat detail tagihan pesanan...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="font-serif-luxury text-xl font-bold text-stone-900">Akses Tidak Sah atau Kedaluwarsa</h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          {error || 'Tautan pembayaran ini tidak valid atau batas waktu telah habis.'}
        </p>
        <button
          onClick={() => navigate('/paket-wisata')}
          className="px-5 py-2.5 bg-[#0F3827] text-white text-xs font-semibold rounded-lg hover:bg-[#17523A] transition-colors cursor-pointer"
        >
          Lihat Katalog Paket Lain
        </button>
      </div>
    );
  }

  const isExpired = booking.status === 'expired' || (timeLeft.minutes === 0 && timeLeft.seconds === 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Expiry Header */}
      <div className={`p-6 rounded-2xl border text-center space-y-2 ${
        isExpired
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-[#FAF5E8] border-[#D8BD6E] text-stone-900'
      }`}>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-4 h-4 text-[#A8862F]" />
          <span>{isExpired ? 'Waktu Pembayaran Telah Berakhir' : 'Batas Waktu Penyelesaian Pembayaran'}</span>
        </div>

        {!isExpired ? (
          <div className="text-3xl sm:text-4xl font-bold font-mono text-[#0F3827] tabular-nums tracking-tight">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </div>
        ) : (
          <p className="text-xs text-rose-700">
            Kapasitas kursi telah dikembalikan ke sistem. Silakan buat reservasi baru untuk memilih jadwal keberangkatan.
          </p>
        )}

        <p className="text-[11px] text-stone-600">
          Nomor Pesanan Resmi: <strong className="font-mono text-stone-900">{booking.bookingNumber}</strong>
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="bg-[#0F3827] text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#C8A951] font-semibold block">
              Ringkasan Transaksi
            </span>
            <h2 className="font-serif-luxury text-lg font-bold">
              {booking.tourPackage?.name || 'Paket Wisata Garut'}
            </h2>
          </div>
          <span className="text-xs bg-amber-400/20 text-amber-200 px-3 py-1 rounded-md font-mono">
            {booking.status === 'pending_payment' ? 'Menunggu Pembayaran' : booking.status}
          </span>
        </div>

        <div className="p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-4 border-b border-stone-100">
            <div>
              <span className="text-stone-400 block text-[11px]">Nama Pemesan</span>
              <span className="font-semibold text-stone-800">{booking.customerName}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">WhatsApp & Email</span>
              <span className="font-semibold text-stone-800">{booking.customerPhone} · {booking.customerEmail}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Tanggal Keberangkatan</span>
              <span className="font-semibold text-stone-800 font-mono">{booking.departureDate || '-'}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[11px]">Jumlah Tamu</span>
              <span className="font-semibold text-stone-800">{booking.participantsCount} Orang</span>
            </div>
          </div>

          {/* Snapshot Item Breakdown */}
          <div className="space-y-2.5 text-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block">
              Rincian Item Resmi
            </span>
            {booking.items?.map(item => (
              <div key={item.id} className="flex justify-between items-center text-stone-700">
                <span>{item.itemName}</span>
                <span className="font-mono tabular-nums">Rp {item.subtotal.toLocaleString('id-ID')}</span>
              </div>
            ))}
            {booking.discountTotal > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>Diskon Kupon ({booking.appliedPromoCode})</span>
                <span className="font-mono tabular-nums">-Rp {booking.discountTotal.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-[#0F3827]">
              <span>Total yang Harus Dibayar</span>
              <span className="text-xl font-mono tabular-nums">
                Rp {booking.totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Action Area */}
          {!isExpired ? (
            <div className="pt-4 space-y-3">
              <button
                onClick={handleLaunchPayment}
                className="w-full py-4 px-6 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-[#C8A951]" />
                <span>Bayar Sekarang via Midtrans (QRIS, VA Bank)</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={fetchBooking}
                  className="text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Periksa Status Pembayaran</span>
                </button>

                <a
                  href={booking.whatsAppHelpLink || 'https://wa.me/6281223456789'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0F3827] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Bantuan Pembayaran via WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <button
                onClick={() => navigate('/paket-wisata')}
                className="w-full py-3.5 px-4 bg-stone-900 text-white text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-stone-800 transition-colors"
              >
                Pesan Ulang Paket
              </button>
            </div>
          )}
        </div>

        <div className="bg-stone-50 p-4 border-t border-stone-200 text-center text-[11px] text-stone-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Midtrans Payment Gateway Indonesia • Standar Keamanan PCI-DSS Level 1</span>
        </div>
      </div>

      {/* Snap Simulator / Modal */}
      <SnapModal
        isOpen={isSnapModalOpen}
        orderId={booking.bookingNumber}
        grossAmount={booking.totalAmount}
        customerName={booking.customerName}
        onClose={() => {
          setIsSnapModalOpen(false);
          fetchBooking();
        }}
        onPaymentSettled={() => {
          setIsSnapModalOpen(false);
          navigate(`/booking/${booking.bookingNumber}?token=${token || booking.accessToken}`);
        }}
      />
    </div>
  );
};
