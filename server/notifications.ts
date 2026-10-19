import type { Booking } from './types.js';

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  type: 'booking_created' | 'payment_success' | 'cancellation' | 'reminder';
}

export const emailLogs: EmailLog[] = [];

export function sendBookingCreatedEmail(booking: Booking, paymentExpiryMinutes: number): EmailLog {
  const subject = `[Garut Journey] Konfirmasi Pemesanan #${booking.bookingNumber}`;
  const htmlContent = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F3827; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.5px;">GARUT JOURNEY</h1>
        <p style="margin: 4px 0 0; color: #C8A951; font-size: 14px;">Wisata Eksklusif Garut Jawa Barat</p>
      </div>
      <div style="padding: 24px;">
        <h2 style="font-size: 18px; color: #111827;">Halo ${booking.customerName},</h2>
        <p style="color: #4b5563; line-height: 1.6;">Terima kasih telah memesan paket wisata bersama Garut Journey. Pesanan Anda telah kami catat dengan nomor referensi <strong>${booking.bookingNumber}</strong>.</p>
        
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Paket Wisata:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${booking.tourPackage?.name || 'Paket Garut Journey'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Tanggal Keberangkatan:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${booking.departureDate || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Jumlah Peserta:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${booking.participantsCount} Orang</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Titik Penjemputan:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #111827;">${booking.pickupLocation}</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #111827; font-weight: 600;">Total Pembayaran:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #0F3827; font-size: 16px;">Rp ${booking.totalAmount.toLocaleString('id-ID')}</td>
            </tr>
          </table>
        </div>

        <p style="color: #b45309; background-color: #fef3c7; padding: 12px; border-radius: 6px; font-size: 13px;">
          Mohon selesaikan pembayaran dalam waktu <strong>${paymentExpiryMinutes} menit</strong> untuk menjamin ketersediaan kursi Anda.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="/pembayaran/${booking.bookingNumber}?token=${booking.accessToken}" style="background-color: #0F3827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Lanjutkan ke Pembayaran Online
          </a>
        </div>
      </div>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
        PT Garut Journey Nusantara • Jl. Cimanuk No. 88, Garut, Jawa Barat • WhatsApp: +62 812-2345-6789
      </div>
    </div>
  `;

  const log: EmailLog = {
    id: 'eml-' + Math.random().toString(36).substring(2, 9),
    to: booking.customerEmail,
    subject,
    htmlContent,
    sentAt: new Date().toISOString(),
    type: 'booking_created'
  };

  emailLogs.unshift(log);
  return log;
}

export function sendPaymentSuccessEmail(booking: Booking): EmailLog {
  const subject = `[E-Ticket] Pembayaran Berhasil — Garut Journey #${booking.bookingNumber}`;
  const htmlContent = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #0F3827; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px;">GARUT JOURNEY</h1>
        <p style="margin: 4px 0 0; color: #C8A951; font-size: 14px;">E-TICKET & VOUCHER PERJALANAN RESMI</p>
      </div>
      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="background-color: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px;">
            PEMBAYARAN TERVERIFIKASI
          </span>
        </div>
        <p style="color: #4b5563; line-height: 1.6;">Selamat, pemesanan Anda telah lunas dan terkonfirmasi. Tim pemandu Garut Journey akan menghubungi Anda melalui WhatsApp H-1 sebelum keberangkatan.</p>
        
        <div style="border: 1px dashed #0F3827; padding: 16px; border-radius: 6px; margin: 20px 0; background: #fafafa;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase;">Kode Booking</p>
          <p style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #0F3827; letter-spacing: 1px;">${booking.bookingNumber}</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Nama Tamu:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${booking.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Paket:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${booking.tourPackage?.name || 'Paket Wisata'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Tanggal:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${booking.departureDate || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Peserta:</td>
              <td style="padding: 4px 0; font-weight: 600; text-align: right;">${booking.participantsCount} Orang</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #6b7280;">Lunas:</td>
              <td style="padding: 4px 0; font-weight: 700; text-align: right; color: #0F3827;">Rp ${booking.totalAmount.toLocaleString('id-ID')}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="/booking/${booking.bookingNumber}?token=${booking.accessToken}" style="background-color: #0F3827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Buka E-Ticket Digital
          </a>
        </div>
      </div>
      <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
        Simpan bukti ini atau tunjukkan nomor booking saat penjemputan di Garut.
      </div>
    </div>
  `;

  const log: EmailLog = {
    id: 'eml-' + Math.random().toString(36).substring(2, 9),
    to: booking.customerEmail,
    subject,
    htmlContent,
    sentAt: new Date().toISOString(),
    type: 'payment_success'
  };

  emailLogs.unshift(log);
  return log;
}

export function generateWhatsAppLink(bookingNumber: string, customerName: string, packageName?: string): string {
  const phone = '6281223456789';
  const text = `Halo Admin Garut Journey, saya ingin konfirmasi pesanan wisata:\n• No. Booking: ${bookingNumber}\n• Atas Nama: ${customerName}\n• Paket: ${packageName || 'Tour Garut'}\nMohon informasi persiapan perjalanannya. Terima kasih!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
