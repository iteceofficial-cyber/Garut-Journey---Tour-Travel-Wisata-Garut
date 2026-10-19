import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="max-w-2xl">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#0F3827]">
          Pusat Informasi & Reservasi
        </span>
        <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Hubungi Tim Garut Journey
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
          Punya pertanyaan seputar kustomisasi private trip, paket rombongan perusahaan, atau konsultasi rute pendakian? Tim representatif kami di Garut siap membantu Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact info side */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <h2 className="font-serif-luxury text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Informasi Kantor Garut
            </h2>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Alamat Kantor Pusat:</strong>
                  <span>Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Hotline WhatsApp Resmi:</strong>
                  <a
                    href="https://wa.me/6281223456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0F3827] hover:underline flex items-center gap-1 font-medium mt-0.5"
                  >
                    <span>+62 812-2345-6789</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Email Korespondensi:</strong>
                  <span>halo@garutjourney.id</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E6F0EB] text-[#0F3827] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-stone-900">Jam Operasional Layanan:</strong>
                  <span>Senin – Minggu: 08.00 – 21.00 WIB</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <a
                href="https://wa.me/6281223456789?text=Halo%20Garut%20Journey%2C%20saya%20ingin%20berkonsultasi%20paket%20wisata."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#C8A951]" />
                <span>Chat Langsung via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Message Form Side */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs">
            <h2 className="font-serif-luxury text-lg font-bold text-stone-900 mb-1">
              Kirimkan Pesan atau Pertanyaan Khusus
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Isi formulir di bawah ini dan konsultan perjalanan kami akan menghubungi Anda dalam waktu maksimal 2 jam.
            </p>

            {sent ? (
              <div className="p-8 text-center bg-[#F3F8F5] rounded-xl border border-emerald-200 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif-luxury text-base font-bold text-stone-900">
                  Pesan Anda Berhasil Terkirim
                </h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Terima kasih <strong>{name}</strong>. Tim Garut Journey telah menerima pesan Anda dan akan menghubungi melalui nomor WhatsApp <strong>{phone}</strong>.
                </p>
                <button
                  onClick={() => { setSent(false); setMessage(''); }}
                  className="mt-2 text-xs font-semibold text-[#0F3827] hover:underline"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nomor WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Pesan atau Rincian Permintaan Wisata <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Ceritakan rencana perjalanan Anda, estimasi tanggal, jumlah orang..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs rounded-lg border border-stone-300 px-3 py-2.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F3827]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-[#0F3827] hover:bg-[#17523A] text-white text-xs uppercase tracking-wider font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirimkan Pertanyaan</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
