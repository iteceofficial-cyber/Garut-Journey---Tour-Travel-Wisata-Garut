import React, { useState } from 'react';
import { ShieldCheck, QrCode, CreditCard, Building2, Store, CheckCircle, Clock, XCircle, X } from 'lucide-react';

interface SnapModalProps {
  isOpen: boolean;
  orderId: string;
  grossAmount: number;
  customerName: string;
  onClose: () => void;
  onPaymentSettled: () => void;
}

export const SnapModal: React.FC<SnapModalProps> = ({
  isOpen,
  orderId,
  grossAmount,
  customerName,
  onClose,
  onPaymentSettled
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'bca_va' | 'card'>('qris');
  const [processing, setProcessing] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const simulateStatus = async (status: 'settlement' | 'pending' | 'cancel') => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payments/simulate-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          targetStatus: status,
          paymentType: selectedMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        if (status === 'settlement') {
          setOutcomeMessage('Pembayaran Berhasil! Mengalihkan ke E-Ticket...');
          setTimeout(() => {
            onPaymentSettled();
          }, 1500);
        } else if (status === 'pending') {
          setOutcomeMessage('Instruksi pembayaran Virtual Account tersimpan.');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setOutcomeMessage('Transaksi dibatalkan. Kursi dikembalikan.');
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch {
      setOutcomeMessage('Terjadi kesalahan simulasi.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Midtrans Header */}
        <div className="bg-[#002B49] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">midtrans</span>
            <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded font-mono">
              Snap Gateway
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Strip */}
        <div className="bg-stone-50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-500 block">Nomor Pesanan</span>
            <span className="font-mono text-xs font-bold text-stone-900">{orderId}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-stone-500 block">Total Tagihan</span>
            <span className="font-mono text-sm font-bold text-[#0F3827]">
              Rp {grossAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-4">
          <div className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Pilih Jalur Pembayaran
          </div>

          <div className="space-y-2.5">
            {/* QRIS */}
            <div
              onClick={() => setSelectedMethod('qris')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                selectedMethod === 'qris'
                  ? 'border-[#002B49] bg-sky-50/50 ring-1 ring-[#002B49]'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                  <QrCode className="w-5 h-5 text-sky-700" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-stone-900">QRIS (GoPay, ShopeePay, BCA QR)</div>
                  <div className="text-[11px] text-stone-500">Scan instan bebas biaya admin</div>
                </div>
              </div>
              <input
                type="radio"
                name="payMethod"
                checked={selectedMethod === 'qris'}
                onChange={() => {}}
                className="accent-[#002B49]"
              />
            </div>

            {/* BCA Virtual Account */}
            <div
              onClick={() => setSelectedMethod('bca_va')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                selectedMethod === 'bca_va'
                  ? 'border-[#002B49] bg-sky-50/50 ring-1 ring-[#002B49]'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                  <Building2 className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-stone-900">Virtual Account Bank (BCA / Mandiri / BNI)</div>
                  <div className="text-[11px] text-stone-500">Nomor rekening unik otomatis terverifikasi</div>
                </div>
              </div>
              <input
                type="radio"
                name="payMethod"
                checked={selectedMethod === 'bca_va'}
                onChange={() => {}}
                className="accent-[#002B49]"
              />
            </div>

            {/* Credit / Debit Card */}
            <div
              onClick={() => setSelectedMethod('card')}
              className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                selectedMethod === 'card'
                  ? 'border-[#002B49] bg-sky-50/50 ring-1 ring-[#002B49]'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
                  <CreditCard className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-stone-900">Kartu Kredit / Debit Online</div>
                  <div className="text-[11px] text-stone-500">Visa, Mastercard, JCB berlisensi 3D Secure</div>
                </div>
              </div>
              <input
                type="radio"
                name="payMethod"
                checked={selectedMethod === 'card'}
                onChange={() => {}}
                className="accent-[#002B49]"
              />
            </div>
          </div>

          {/* Sandbox Controls */}
          <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
            <div className="text-[11px] font-semibold text-stone-600 flex items-center justify-between">
              <span>Simulator Pengujian Pembayaran:</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                Sandbox Mode Active
              </span>
            </div>

            {outcomeMessage && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium text-center">
                {outcomeMessage}
              </div>
            )}

            <button
              onClick={() => simulateStatus('settlement')}
              disabled={processing}
              className="w-full py-2.5 px-3 bg-[#0F3827] hover:bg-[#17523A] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 text-[#C8A951]" />
              <span>{processing ? 'Memverifikasi...' : 'Simulasi Pembayaran Berhasil (Settlement)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => simulateStatus('pending')}
                disabled={processing}
                className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Simulasi Pending</span>
              </button>
              <button
                onClick={() => simulateStatus('cancel')}
                disabled={processing}
                className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Simulasi Batal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-stone-100 px-5 py-3 text-center text-[11px] text-stone-500 border-t border-stone-200 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
          <span>Enkripsi 256-bit SSL • Aman & Terverifikasi Bank Indonesia</span>
        </div>
      </div>
    </div>
  );
};
