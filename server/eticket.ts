import type { Booking, SiteSettings } from './types.js';

export function generateETicketHtml(booking: Booking, settings?: SiteSettings): string {
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
  const duration = pkg ? `${pkg.durationDays} Hari ${pkg.durationNights > 0 ? `${pkg.durationNights} Malam` : ''}` : '-';

  const dateIssued = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Ticket Resmi – ${booking.bookingNumber} – Garut Journey</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f5f5f4;
      color: #1c1917;
      line-height: 1.5;
      padding: 24px 16px;
    }
    .no-print-bar {
      max-width: 820px;
      margin: 0 auto 20px auto;
      background: #0A261A;
      color: #ffffff;
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      gap: 12px;
      flex-wrap: wrap;
    }
    .no-print-bar button, .no-print-bar a {
      background: #C8A951;
      color: #0c1a13;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .no-print-bar button:hover, .no-print-bar a:hover {
      background: #e2c36b;
    }
    .ticket-container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    }
    .ticket-header {
      background: #0A261A;
      color: #ffffff;
      padding: 32px 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #C8A951;
      gap: 20px;
    }
    .brand-title {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      color: #C8A951;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 600;
      margin-top: 2px;
    }
    .company-legal {
      font-size: 11px;
      color: #a8a29e;
      margin-top: 6px;
      line-height: 1.4;
    }
    .booking-badge-col {
      text-align: right;
    }
    .booking-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #a8a29e;
    }
    .booking-number {
      font-family: 'Space Mono', monospace;
      font-size: 22px;
      font-weight: 700;
      color: #C8A951;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .issued-date {
      font-size: 11px;
      color: #d6d3d1;
      margin-top: 4px;
    }

    .ticket-body {
      padding: 32px 36px;
    }

    .status-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-radius: 12px;
      margin-bottom: 28px;
      border: 1px solid;
    }
    .status-banner.lunas {
      background: #ecfdf5;
      border-color: #a7f3d0;
      color: #065f46;
    }
    .status-banner.dp {
      background: #fffbeb;
      border-color: #fde68a;
      color: #92400e;
    }
    .status-title {
      font-weight: 700;
      font-size: 15px;
    }
    .status-desc {
      font-size: 12px;
      margin-top: 2px;
      opacity: 0.9;
    }
    .stamp-badge {
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 6px;
      text-transform: uppercase;
      border: 2px dashed;
      letter-spacing: 0.5px;
    }
    .status-banner.lunas .stamp-badge {
      border-color: #059669;
      color: #047857;
      background: #ffffff;
    }
    .status-banner.dp .stamp-badge {
      border-color: #d97706;
      color: #b45309;
      background: #ffffff;
    }

    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 700;
      color: #0F3827;
      border-bottom: 2px solid #e7e5e4;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px 24px;
      margin-bottom: 28px;
    }
    .info-item {
      font-size: 13px;
    }
    .info-label {
      font-size: 11px;
      color: #78716c;
      margin-bottom: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-weight: 600;
      color: #1c1917;
    }
    .info-value.highlight {
      color: #0F3827;
      font-size: 15px;
    }

    .table-container {
      margin-bottom: 28px;
      border: 1px solid #e7e5e4;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f5f5f4;
      text-align: left;
      padding: 10px 16px;
      font-size: 11px;
      text-transform: uppercase;
      color: #57534e;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 16px;
      border-top: 1px solid #f5f5f4;
      color: #292524;
    }
    .text-right {
      text-align: right;
    }
    .font-mono {
      font-family: 'Space Mono', monospace;
    }
    .total-row {
      background: #fafaf9;
      font-weight: 700;
      font-size: 14px;
      color: #0F3827;
      border-top: 2px solid #e7e5e4;
    }

    .instructions-box {
      background: #f5f5f4;
      padding: 16px 20px;
      border-radius: 10px;
      font-size: 11px;
      color: #57534e;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .instructions-box strong {
      color: #1c1917;
    }

    .ticket-footer {
      background: #fafaf9;
      padding: 20px 36px;
      border-top: 1px solid #e7e5e4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #78716c;
      gap: 12px;
      flex-wrap: wrap;
    }
    .footer-left strong {
      color: #292524;
    }
    .barcode-svg {
      letter-spacing: 3px;
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      color: #0A261A;
      font-size: 13px;
      background: #e7e5e4;
      padding: 4px 10px;
      border-radius: 4px;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print-bar {
        display: none !important;
      }
      .ticket-container {
        border: none;
        box-shadow: none;
        border-radius: 0;
      }
      @page {
        size: A4 portrait;
        margin: 12mm;
      }
    }
  </style>
</head>
<body>

  <!-- Top Action Bar for consumer (hidden during print) -->
  <div class="no-print-bar">
    <div>
      <span style="font-weight: 700; font-size: 14px;">E-Ticket Wisata Garut Resmi</span>
      <span style="font-size: 12px; opacity: 0.8; display: block;">Simpan dokumen ini untuk konfirmasi saat penjemputan di Garut.</span>
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <a href="/api/bookings/${booking.bookingNumber}/pdf" download style="background: #ffffff; color: #0F3827; font-weight: 700;">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Unduh File PDF
      </a>
      <button onclick="try { window.print(); } catch(e) { alert('Silakan gunakan menu Cetak browser (Ctrl+P) atau unduh PDF.'); }">
        <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
        Cetak Kwitansi
      </button>
      <a href="/" target="_self" style="background: rgba(255,255,255,0.15); color: #ffffff;">
        Kembali ke Beranda
      </a>
    </div>
  </div>

  <!-- Printable Ticket Document -->
  <div class="ticket-container">
    <!-- Header -->
    <div class="ticket-header">
      <div>
        <h1 class="brand-title">${brandName}</h1>
        <div class="brand-sub">E-TICKET & VOUCHER RESMI PERJALANAN</div>
        <div class="company-legal">
          Operasional Resmi oleh <strong>${companyName}</strong><br>
          NIB: ${nib} • Izin Pariwisata: ${license}<br>
          ${address}
        </div>
      </div>

      <div class="booking-badge-col">
        <div class="booking-label">Nomor Booking</div>
        <div class="booking-number">${booking.bookingNumber}</div>
        <div class="issued-date">Diterbitkan: ${dateIssued}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="ticket-body">
      <!-- Status Banner -->
      <div class="status-banner ${isLunas ? 'lunas' : 'dp'}">
        <div>
          <div class="status-title">${isLunas ? 'STATUS: TERKONFIRMASI LUNAS' : 'STATUS: TERKONFIRMASI - BARU DP (30%)'}</div>
          <div class="status-desc">
            ${isLunas
              ? 'Seluruh pembayaran telah terverifikasi lunas via Midtrans. Kuota perjalanan 100% aman.'
              : `Uang muka 30% telah diterima sebesar Rp ${booking.dpAmount.toLocaleString('id-ID')}. Sisa pelunasan dibayarkan saat penjemputan.`}
          </div>
        </div>
        <div class="stamp-badge">
          ${isLunas ? 'MIDTRANS LUNAS' : 'DP TERVERIFIKASI'}
        </div>
      </div>

      <!-- Section: Data Tamu & Perjalanan -->
      <div class="section-title">Detail Reservasi & Jadwal Perjalanan</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nama Tamu Penanggung Jawab</div>
          <div class="info-value highlight">${booking.customerName}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Paket Wisata Garut</div>
          <div class="info-value highlight">${pkgName}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Tanggal Keberangkatan Trip</div>
          <div class="info-value font-mono" style="font-size: 14px; color: #0F3827;">
            ${booking.departureDate} (100% Private Trip)
          </div>
        </div>

        <div class="info-item">
          <div class="info-label">Wilayah Destinasi & Durasi</div>
          <div class="info-value">${destination} • ${duration}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Jumlah Peserta</div>
          <div class="info-value">${booking.participantsCount} Orang Tamu</div>
        </div>

        <div class="info-item">
          <div class="info-label">Titik Penjemputan di Garut</div>
          <div class="info-value">${booking.pickupLocation}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Kontak WhatsApp Tamu</div>
          <div class="info-value font-mono">${booking.customerPhone}</div>
        </div>

        <div class="info-item">
          <div class="info-label">Alamat Email Tamu</div>
          <div class="info-value font-mono">${booking.customerEmail || '-'}</div>
        </div>
      </div>

      ${booking.customerNotes ? `
      <div class="info-item" style="margin-bottom: 24px; padding: 12px; background: #fafaf9; border-radius: 8px;">
        <div class="info-label">Catatan Tambahan Tamu:</div>
        <div class="info-value" style="font-style: italic;">"${booking.customerNotes}"</div>
      </div>` : ''}

      <!-- Section: Rincian Pembayaran -->
      <div class="section-title">Rincian Pembayaran Transaksi</div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Rincian Item Reservasi</th>
              <th class="text-right">Harga Satuan</th>
              <th class="text-right">Jumlah</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${pkgName}</strong></td>
              <td class="text-right font-mono">Rp ${(pkg?.basePrice || 0).toLocaleString('id-ID')}</td>
              <td class="text-right">${booking.participantsCount} pax</td>
              <td class="text-right font-mono">Rp ${booking.subtotal.toLocaleString('id-ID')}</td>
            </tr>
            ${(booking.items || []).filter(i => i.itemType === 'addon').map(item => `
            <tr>
              <td>${item.itemName} (Layanan Tambahan)</td>
              <td class="text-right font-mono">Rp ${item.unitPrice.toLocaleString('id-ID')}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right font-mono">Rp ${item.subtotal.toLocaleString('id-ID')}</td>
            </tr>`).join('')}
            ${booking.discountTotal > 0 ? `
            <tr style="color: #059669;">
              <td colspan="3">Potongan Diskon Promo (${booking.appliedPromoCode})</td>
              <td class="text-right font-mono">-Rp ${booking.discountTotal.toLocaleString('id-ID')}</td>
            </tr>` : ''}
            <tr class="total-row">
              <td colspan="3">TOTAL TAGIHAN</td>
              <td class="text-right font-mono">Rp ${booking.totalAmount.toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td colspan="3" style="color: #059669; font-weight: 600;">Jumlah Telah Dibayar</td>
              <td class="text-right font-mono" style="color: #059669; font-weight: 700;">Rp ${booking.paidAmount.toLocaleString('id-ID')}</td>
            </tr>
            ${!isLunas ? `
            <tr style="color: #b91c1c; font-weight: 700; background: #fef2f2;">
              <td colspan="3">SISA TAGIHAN PELUNASAN (Dibayar saat penjemputan)</td>
              <td class="text-right font-mono">Rp ${booking.remainingBalance.toLocaleString('id-ID')}</td>
            </tr>` : ''}
          </tbody>
        </table>
      </div>

      <!-- Instructions -->
      <div class="instructions-box">
        <strong>Ketentuan & Panduan Penjemputan:</strong><br>
        1. Harap tunjukkan dokumen E-Ticket ini (dalam bentuk cetak atau layar ponsel) kepada kru/pemandu penjemputan Garut Journey.<br>
        2. Pemandu lokal dan armada transportasi akan standby di titik penjemputan 30 menit sebelum jadwal perjalanan.<br>
        3. Seluruh armada dan pemandu wisata dioperasikan secara <strong>100% Private Trip</strong> tanpa digabung dengan tamu lain.<br>
        4. Bantuan layanan pelanggan 24/7 dan koordinasi lokasi driver dapat dihubungi melalui WhatsApp resmi: <strong>+${whatsapp}</strong>.
      </div>
    </div>

    <!-- Footer -->
    <div class="ticket-footer">
      <div class="footer-left">
        Dokumen elektronik sah diterbitkan oleh <strong>${companyName}</strong><br>
        Layanan resmi: www.garutjourney.id • Email: ${email}
      </div>
      <div class="barcode-svg">
        |||| | ||||| || |||||| | ||| ${booking.bookingNumber}
      </div>
    </div>
  </div>

  <script>
    // Safe auto-open print dialog if triggered via direct print intent or /print URL
    if (window.location.search.includes('print=true') || window.location.pathname.endsWith('/print')) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          try {
            window.print();
          } catch (e) {
            console.log('Browser blocked automated print:', e);
          }
        }, 400);
      });
    }
  </script>
</body>
</html>`;
}
