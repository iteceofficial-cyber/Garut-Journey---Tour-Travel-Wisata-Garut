import React, { useState, useEffect } from 'react';
import type { TourPackage, AddonOption, PaymentTier } from '../types.js';
import { Calendar, Users, Check, AlertCircle, X, ShieldCheck, Tag, ArrowRight, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface BookingModalProps {
  pkg: TourPackage;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingNumber: string, accessToken: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ pkg, isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [customDate, setCustomDate] = useState<string>('');
  const [participantsCount, setParticipantsCount] = useState<number>(pkg.minParticipants || 2);
  const [pickupLocation, setPickupLocation] = useState<string>(pkg.pickupPoints?.[0] || 'Stasiun Garut');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment Tier: Full (Lunas) vs DP (Baru DP 30%)
  const [paymentTier, setPaymentTier] = useState<PaymentTier>('full');

  // Addons state
  const [addons, setAddons] = useState<AddonOption[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  // Promo state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch verified add-ons
  useEffect(() => {
    fetch('/api/addons')
      .then(res => res.json())
      .then(json => {
        if (json.success) setAddons(json.data);
      })
      .catch(() => {});
  }, []);

  // Default date to 2 days ahead for private trip
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const defaultDateStr = d.toISOString().split('T')[0];
    setCustomDate(defaultDateStr);
  }, [pkg]);

  if (!isOpen) return null;

  const unitPrice = pkg.basePrice;
  const subtotal = unitPrice * participantsCount;

  let addonTotal = 0;
  Object.entries(selectedAddons).forEach(([id, qty]) => {
    const addon = addons.find(a => a.id === id);
    if (addon && qty > 0) {
      addonTotal += addon.price * qty;
    }
  });

  const discountTotal = appliedPromo ? appliedPromo.discount : 0;
  const grandTotal = Math.max(0, subtotal + addonTotal - discountTotal);

  // DP calculation (30% of grand total)
  const dpAmount = Math.round(grandTotal * 0.3);
  const remainingBalance = grandTotal - dpAmount;
  const amountToPayNow = paymentTier === 'dp' ? dpAmount : grandTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = 1;
      }
      return copy;
    });
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeInput.trim(),
          subtotal
        })
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setAppliedPromo({
          code: data.promoCode,
          discount: data.discount,
          message: data.message
        });
        setPromoError('');
      } else {
        setAppliedPromo(null);
        setPromoError(data.error || data.message || 'Kode promo tidak valid');
      }
    } catch {
      setPromoError('Gagal memverifikasi kode promo.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const targetDate = customDate;
    if (!targetDate) {
      setSubmitError('Pilih tanggal keberangkatan terlebih dahulu.');
      return;
    }

    setSubmitting(true);

    const formattedAddons = Object.entries(selectedAddons)
      .map(([id, qty]) => {
        const item = addons.find(a => a.id === id);
        return item ? { id, name: item.name, price: item.price, quantity: qty } : null;
      })
      .filter(Boolean);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageSlug: pkg.slug,
          departureDate: targetDate,
          customDate: targetDate,
          participantsCount,
          customerName,
          customerPhone,
          customerEmail,
          customerNotes,
          pickupLocation,
          paymentTier,
          selectedAddons: formattedAddons,
          promoCode: appliedPromo?.code
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        onSuccess(json.data.bookingNumber, json.data.accessToken);
      } else {
        setSubmitError(json.error || 'Gagal memproses reservasi.');
      }
    } catch (err: any) {
      setSubmitError('Terjadi kesalahan koneksi server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#0F3827] text-white p-6 flex items-start justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#C8A951] font-semibold block">
              Formulir Reservasi Resmi
            </span>
            <h2 className="font-serif-luxury text-xl font-bold mt-1 text-stone-100">
              {pkg.name}
            </h2>
            <p className="text-xs text-stone-300 mt-1">
              Garut Journey • Pilihan Tanggal Fleksibel & Opsi Bayar Lunas / Baru DP
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmitBooking} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {submitError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Step 1: 100% Private Trip Date Selection */}
          <div className="space-y-3">
            <div className="border-b border-stone-100 pb-2">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-800">
                1. Tentukan Tanggal Keberangkatan Private Trip
              </h3>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-white">
                  100% Private Trip
                </span>
                <span className="text-xs text-emerald-950 font-medium">
                  Tidak digabung peserta lain • Tanggal bebas Anda tentukan
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Pilih Tanggal Trip Pilihan Anda:
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#0F3827] absolute left-3 top-2.5" />
                  <input
                    type="date"
                    required
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs font-medium rounded-lg border border-stone-300 pl-9 pr-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-600">
                Tim pemandu bersertifikasi dan armada transportasi Garut Journey siap melayani Anda pada tanggal yang Anda pilih.
              </p>
            </div>
          </div>

            {/* Participants & Pickup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Jumlah Tamu Peserta
                </label>
                <input
                  type="number"
                  min={pkg.minParticipants || 1}
                  max={pkg.maxParticipants || 30}
                  value={participantsCount}
                  onChange={(e) => setParticipantsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Titik Penjemputan di Garut
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                >
                  {(pkg.pickupPoints || ['Stasiun Kereta Api Garut', 'Hotel di Garut Kota']).map((point, idx) => (
                    <option key={idx} value={point}>{point}</option>
                  ))}
                </select>
              </div>
            </div>

          {/* Step 2: Payment Tier (LUNAS vs BARU DP) */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-800 border-b border-stone-100 pb-2">
              2. Skema Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Full Payment */}
              <div
                onClick={() => setPaymentTier('full')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentTier === 'full'
                    ? 'border-[#0F3827] bg-[#F3F8F5] ring-1 ring-[#0F3827]'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">Pelunasan Penuh (Lunas 100%)</span>
                  <input
                    type="radio"
                    name="tier"
                    checked={paymentTier === 'full'}
                    onChange={() => setPaymentTier('full')}
                    className="accent-[#0F3827]"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Bayar lunas langsung. Tidak ada tagihan sisa saat penjemputan di Garut.
                </p>
                <div className="mt-2 font-mono text-xs font-bold text-[#0F3827] tabular-nums">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Option B: Down Payment (DP 30%) */}
              <div
                onClick={() => setPaymentTier('dp')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentTier === 'dp'
                    ? 'border-[#0F3827] bg-[#F3F8F5] ring-1 ring-[#0F3827]'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">Uang Muka (Baru DP 30%)</span>
                  <input
                    type="radio"
                    name="tier"
                    checked={paymentTier === 'dp'}
                    onChange={() => setPaymentTier('dp')}
                    className="accent-[#0F3827]"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Amankan kuota kursi dengan DP 30%. Sisa 70% dilunasi saat penjemputan.
                </p>
                <div className="mt-2 font-mono text-xs font-bold text-amber-700 tabular-nums">
                  Bayar Sekarang: Rp {dpAmount.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                  Sisa Tagihan: Rp {remainingBalance.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Add-ons */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-800 border-b border-stone-100 pb-2">
              3. Layanan Tambahan (Opsional)
            </h3>
            <div className="space-y-2">
              {addons.map(addon => {
                const isChecked = Boolean(selectedAddons[addon.id]);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                      isChecked ? 'border-[#0F3827] bg-[#F3F8F5]' : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-[#0F3827] border-[#0F3827] text-white' : 'border-stone-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{addon.name}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{addon.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="font-semibold text-[#0F3827] tabular-nums">
                        +Rp {addon.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-stone-400 block">{addon.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Customer Details */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-800 border-b border-stone-100 pb-2">
              4. Data Penanggung Jawab Reservasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nomor WhatsApp Aktif (Untuk Kirim Invoice) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Pilihan menu diet, jam tiba stasiun..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Promo Code */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-800 border-b border-stone-100 pb-2">
              5. Kode Promo & Kupon
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: GARUTASRI10 / EXPLOREGARUT"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                className="w-full text-xs uppercase tracking-wider font-mono rounded-lg border border-stone-300 px-3 py-2 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCodeInput}
                className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 rounded-lg transition-colors shrink-0"
              >
                {promoLoading ? 'Cek...' : 'Terapkan'}
              </button>
            </div>
            {appliedPromo && (
              <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{appliedPromo.message}</span>
              </p>
            )}
            {promoError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{promoError}</span>
              </p>
            )}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Paket ({participantsCount} Tamu x Rp {unitPrice.toLocaleString('id-ID')})</span>
              <span className="font-mono tabular-nums">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            {addonTotal > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Layanan Tambahan</span>
                <span className="font-mono tabular-nums">+Rp {addonTotal.toLocaleString('id-ID')}</span>
              </div>
            )}
            {discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Diskon Kupon Promo</span>
                <span className="font-mono tabular-nums">-Rp {discountTotal.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs text-stone-700">
              <span>Total Nilai Paket</span>
              <span className="font-mono font-bold tabular-nums">Rp {grandTotal.toLocaleString('id-ID')}</span>
            </div>

            <div className="pt-2 border-t border-stone-300 flex justify-between items-center text-sm font-bold text-[#0F3827]">
              <div>
                <span>{paymentTier === 'dp' ? 'Tagihan Pembayaran Sekarang (DP 30%)' : 'Tagihan Pembayaran Sekarang (Lunas 100%)'}</span>
                {paymentTier === 'dp' && (
                  <span className="text-[11px] font-normal text-stone-500 block">
                    Keterangan Invoice: BARU DP • Sisa Rp {remainingBalance.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
              <span className="text-lg font-bold font-mono tabular-nums">
                Rp {amountToPayNow.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Memproses Alokasi Kursi...</span>
              ) : (
                <>
                  <span>Lanjutkan ke Pembayaran Online ({paymentTier === 'dp' ? 'Bayar DP' : 'Bayar Lunas'})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-500 text-center mt-2 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kapasitas kursi aman secara atomik. Kwitansi resmi terbit otomatis.</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
