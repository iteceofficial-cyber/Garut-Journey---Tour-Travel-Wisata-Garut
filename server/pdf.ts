import PDFDocument from 'pdfkit';
import type { Booking, SiteSettings } from './types.js';

/**
 * Generates an official, publication-quality PDF E-Ticket & Kwitansi
 * directly as a binary Buffer without needing any headless browser.
 */
export async function generateETicketPdfBuffer(booking: Booking, settings?: SiteSettings): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `E-Ticket Resmi - ${booking.bookingNumber} - Garut Journey`,
          Author: settings?.companyName || 'PT Garut Journey Nusantara',
          Subject: 'E-Ticket & Kwitansi Resmi Wisata Garut',
          Keywords: 'Garut Journey, E-Ticket, Wisata Garut, Private Trip'
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const isLunas = booking.paymentTier === 'full' || booking.remainingBalance <= 0;
      const companyName = settings?.companyName || 'PT Garut Journey Nusantara';
      const brandName = settings?.brandName || 'Garut Journey';
      const nib = settings?.nibNumber || '9120003482194';
      const license = settings?.licenseNumber || 'SIUP-PAR-082/GRT/2024';
      const address = settings?.officeAddress || 'Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151';
      const whatsapp = settings?.whatsappNumber || '6281223456789';
      const email = settings?.supportEmail || 'halo@garutjourney.id';

      const pkg = booking.tourPackage;
      const pkgName = pkg?.name || 'Private Trip Wisata Garut';
      const destination = pkg?.destinationArea || 'Garut, Jawa Barat';
      const duration = pkg ? `${pkg.durationDays} Hari ${pkg.durationNights > 0 ? `${pkg.durationNights} Malam` : ''}` : '1 Hari';

      // --- HEADER BAR (FOREST GREEN) ---
      doc.rect(40, 40, 515, 80).fill('#0A261A');

      // Brand Title & Subtitle
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text(brandName.toUpperCase(), 55, 52);
      doc.fillColor('#C8A951').fontSize(9).font('Helvetica-Bold').text('E-TICKET & KWITANSI RESMI WISATA GARUT', 55, 75);
      doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica').text(`${companyName} | NIB: ${nib} | ${license}`, 55, 88);

      // Gold Accent Line
      doc.rect(40, 120, 515, 3).fill('#C8A951');

      // Booking Reference Box on the Right Header
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica').text('KODE BOOKING', 380, 55, { align: 'right', width: 160 });
      doc.fillColor('#C8A951').fontSize(16).font('Helvetica-Bold').text(booking.bookingNumber, 380, 68, { align: 'right', width: 160 });
      doc.fillColor('#CBD5E1').fontSize(7.5).font('Helvetica').text(`Terbit: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`, 380, 88, { align: 'right', width: 160 });

      // --- PAYMENT STATUS BADGE ---
      let startY = 135;
      if (isLunas) {
        doc.roundedRect(40, startY, 515, 38, 6).fillAndStroke('#ECFDF5', '#A7F3D0');
        doc.fillColor('#065F46').fontSize(11).font('Helvetica-Bold').text('STATUS: PEMBAYARAN LUNAS (100% TERBAYAR)', 55, startY + 8);
        doc.fillColor('#047857').fontSize(8).font('Helvetica').text('Pesanan perjalanan ini telah terverifikasi resmi dan kursi terkonfirmasi.', 55, startY + 22);
        doc.roundedRect(440, startY + 7, 100, 24, 4).fillAndStroke('#059669', '#047857');
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text('LUNAS', 440, startY + 14, { align: 'center', width: 100 });
      } else {
        doc.roundedRect(40, startY, 515, 38, 6).fillAndStroke('#FFFBEB', '#FDE68A');
        doc.fillColor('#92400E').fontSize(11).font('Helvetica-Bold').text(`STATUS: BARU DP 30% (Sisa Rp ${booking.remainingBalance.toLocaleString('id-ID')})`, 55, startY + 8);
        doc.fillColor('#B45309').fontSize(8).font('Helvetica').text('Sisa pelunasan dibayarkan secara tunai / transfer saat penjemputan awal di Garut.', 55, startY + 22);
        doc.roundedRect(440, startY + 7, 100, 24, 4).fillAndStroke('#D97706', '#B45309');
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text('TERKONFIRMASI DP', 440, startY + 14, { align: 'center', width: 100 });
      }

      // --- SECTION 1: RINCIAN PERJALANAN (GUEST & TRIP DETAILS) ---
      startY = 188;
      doc.fillColor('#0F3827').fontSize(9.5).font('Helvetica-Bold').text('1. INFORMASI TAMU & JADWAL PERJALANAN (100% PRIVATE TRIP)', 40, startY);
      doc.rect(40, startY + 14, 515, 1).fill('#E2E8F0');

      startY += 24;
      const col1X = 45;
      const col2X = 295;

      // Left column
      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('NAMA LENGKAP PEMESAN', col1X, startY);
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text(booking.customerName, col1X, startY + 10);

      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('NOMOR WHATSAPP', col1X, startY + 28);
      doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica-Bold').text(booking.customerPhone, col1X, startY + 38);

      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('TITIK PENJEMPUTAN (GARUT)', col1X, startY + 56);
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold').text(booking.pickupLocation || 'Stasiun Garut / Hotel Garut', col1X, startY + 66, { width: 230 });

      // Right column
      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('PAKET WISATA PILIHAN', col2X, startY);
      doc.fillColor('#0F3827').fontSize(10).font('Helvetica-Bold').text(pkgName, col2X, startY + 10, { width: 250 });

      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('TANGGAL KEBERANGKATAN', col2X, startY + 28);
      doc.fillColor('#0F172A').fontSize(9.5).font('Helvetica-Bold').text(`${booking.departureDate || '-'} (Pilihan Tamu)`, col2X, startY + 38);

      doc.fillColor('#64748B').fontSize(7.5).font('Helvetica').text('JUMLAH PESERTA & DURASI', col2X, startY + 56);
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold').text(`${booking.participantsCount} Orang Peserta | Durasi: ${duration}`, col2X, startY + 66);

      // --- SECTION 2: RINCIAN BIAYA & KWITANSI PEMBAYARAN ---
      startY += 90;
      doc.fillColor('#0F3827').fontSize(9.5).font('Helvetica-Bold').text('2. KWITANSI & RINCIAN TRANSAKSI RESMI', 40, startY);
      doc.rect(40, startY + 14, 515, 1).fill('#E2E8F0');

      startY += 22;
      // Table Header
      doc.rect(40, startY, 515, 20).fill('#F1F5F9');
      doc.fillColor('#475569').fontSize(7.5).font('Helvetica-Bold');
      doc.text('KOMPONEN ITEM / LAYANAN', 50, startY + 6);
      doc.text('HARGA SATUAN', 280, startY + 6, { width: 80, align: 'right' });
      doc.text('QTY / PAX', 370, startY + 6, { width: 60, align: 'center' });
      doc.text('SUBTOTAL (IDR)', 440, startY + 6, { width: 105, align: 'right' });

      startY += 20;

      // Package Row
      doc.rect(40, startY, 515, 22).fill('#FFFFFF');
      doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica-Bold').text(pkgName, 50, startY + 6, { width: 220 });
      doc.fillColor('#334155').fontSize(8).font('Helvetica');
      doc.text(`Rp ${(pkg?.basePrice || 0).toLocaleString('id-ID')}`, 280, startY + 6, { width: 80, align: 'right' });
      doc.text(`${booking.participantsCount} orang`, 370, startY + 6, { width: 60, align: 'center' });
      doc.text(`Rp ${booking.subtotal.toLocaleString('id-ID')}`, 440, startY + 6, { width: 105, align: 'right' });
      doc.rect(40, startY + 22, 515, 0.5).fill('#E2E8F0');
      startY += 22;

      // Addons Rows
      if (booking.items && booking.items.length > 0) {
        const addons = booking.items.filter(i => i.itemType === 'addon');
        for (const addon of addons) {
          doc.rect(40, startY, 515, 20).fill('#FFFFFF');
          doc.fillColor('#334155').fontSize(8).font('Helvetica').text(`+ ${addon.itemName}`, 50, startY + 5, { width: 220 });
          doc.text(`Rp ${addon.unitPrice.toLocaleString('id-ID')}`, 280, startY + 5, { width: 80, align: 'right' });
          doc.text(`${addon.quantity} item`, 370, startY + 5, { width: 60, align: 'center' });
          doc.text(`Rp ${addon.subtotal.toLocaleString('id-ID')}`, 440, startY + 5, { width: 105, align: 'right' });
          doc.rect(40, startY + 20, 515, 0.5).fill('#E2E8F0');
          startY += 20;
        }
      }

      // Promo Row (if any)
      if (booking.discountTotal > 0) {
        doc.rect(40, startY, 515, 20).fill('#F0FDF4');
        doc.fillColor('#15803D').fontSize(8).font('Helvetica-Bold').text(`Potongan Diskon Promo (${booking.appliedPromoCode})`, 50, startY + 5);
        doc.text(`-Rp ${booking.discountTotal.toLocaleString('id-ID')}`, 440, startY + 5, { width: 105, align: 'right' });
        doc.rect(40, startY + 20, 515, 0.5).fill('#DCFCE7');
        startY += 20;
      }

      // Total Row
      doc.rect(40, startY, 515, 24).fill('#F8FAFC');
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold').text('TOTAL BIAYA KESELURUHAN', 50, startY + 7);
      doc.fillColor('#0F3827').fontSize(10).font('Helvetica-Bold').text(`Rp ${booking.totalAmount.toLocaleString('id-ID')}`, 440, startY + 6, { width: 105, align: 'right' });
      doc.rect(40, startY + 24, 515, 1).fill('#CBD5E1');
      startY += 25;

      // Paid Amount Row
      doc.rect(40, startY, 515, 20).fill('#ECFDF5');
      doc.fillColor('#047857').fontSize(8.5).font('Helvetica-Bold').text('JUMLAH TELAH DIBAYARKAN (TERVERIFIKASI)', 50, startY + 5);
      doc.text(`Rp ${booking.paidAmount.toLocaleString('id-ID')}`, 440, startY + 5, { width: 105, align: 'right' });
      doc.rect(40, startY + 20, 515, 0.5).fill('#A7F3D0');
      startY += 20;

      // Remaining Balance Row (if DP)
      if (!isLunas) {
        doc.rect(40, startY, 515, 22).fill('#FEF2F2');
        doc.fillColor('#B91C1C').fontSize(8.5).font('Helvetica-Bold').text('SISA TAGIHAN PELUNASAN (Dibayar saat penjemputan)', 50, startY + 6);
        doc.text(`Rp ${booking.remainingBalance.toLocaleString('id-ID')}`, 440, startY + 6, { width: 105, align: 'right' });
        doc.rect(40, startY + 22, 515, 1).fill('#FECACA');
        startY += 22;
      }

      // --- SECTION 3: KETENTUAN PENJEMPUTAN & INFORMASI PENTING ---
      startY += 16;
      doc.roundedRect(40, startY, 515, 68, 6).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fillColor('#0F3827').fontSize(8.5).font('Helvetica-Bold').text('PANDUAN & KETENTUAN PENJEMPUTAN:', 50, startY + 8);

      const guideTexts = [
        `1. Tunjukkan dokumen E-Ticket PDF resmi ini (langsung di layar ponsel atau cetak) ke kru penjemputan.`,
        `2. Seluruh perjalanan dioperasikan 100% PRIVATE TRIP, armada mobil & pemandu tidak digabung tamu lain.`,
        `3. Driver dan pemandu wisata lokal akan standby di titik jemput 30 menit sebelum keberangkatan.`,
        `4. Bantuan pelanggan & konfirmasi driver: WhatsApp resmi Garut Journey +${whatsapp}.`
      ];

      let guideY = startY + 22;
      doc.fillColor('#334155').fontSize(7.5).font('Helvetica');
      for (const t of guideTexts) {
        doc.text(t, 50, guideY, { width: 495 });
        guideY += 10.5;
      }

      // --- FOOTER & VALIDATION BARCODE ---
      const footerY = 720;
      doc.rect(40, footerY, 515, 0.5).fill('#CBD5E1');

      doc.fillColor('#64748B').fontSize(7).font('Helvetica');
      doc.text(`Dokumen Elektronik Sah Diterbitkan oleh:`, 40, footerY + 8);
      doc.fillColor('#0F172A').fontSize(8).font('Helvetica-Bold');
      doc.text(companyName, 40, footerY + 18);
      doc.fillColor('#64748B').fontSize(7).font('Helvetica');
      doc.text(`Alamat: ${address} | Email: ${email}`, 40, footerY + 28);
      doc.text(`Website Resmi: https://garutjourney.id | Verifikasi Dokumen Tanpa Perlu Login`, 40, footerY + 38);

      // Barcode simulation on bottom right
      doc.fillColor('#0F3827').fontSize(7.5).font('Helvetica-Bold').text('KODE VERIFIKASI DIGITAL:', 380, footerY + 8, { align: 'right', width: 175 });
      doc.fillColor('#0F172A').fontSize(11).font('Courier-Bold').text(`|||| | ||||| || ${booking.bookingNumber} ||`, 380, footerY + 20, { align: 'right', width: 175 });
      doc.fillColor('#059669').fontSize(7).font('Helvetica-Bold').text('✓ TERDAFTAR SECARA RESMI DI SISTEM', 380, footerY + 36, { align: 'right', width: 175 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
