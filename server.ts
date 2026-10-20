import express, { type Request, type Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';
import { dbStore, VERIFIED_ADDONS } from './server/db.ts';
import { paymentService } from './server/midtrans.ts';
import {
  sendBookingCreatedEmail,
  sendPaymentSuccessEmail,
  generateWhatsAppLink,
  emailLogs
} from './server/notifications.ts';
import { generateETicketHtml } from './server/eticket.ts';
import { generateETicketPdfBuffer } from './server/pdf.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Ensure data/uploads directory exists and is publicly served
const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// --- INPUT VALIDATION SCHEMAS (ZOD) ---

const bookingInputSchema = z.object({
  packageSlug: z.string().min(1, 'Slug paket wisata wajib diisi.'),
  scheduleId: z.string().optional().default(''),
  customDate: z.string().optional(),
  departureDate: z.string().optional(),
  participantsCount: z.number().int().min(1, 'Jumlah peserta minimal 1 orang.'),
  customerName: z.string().min(3, 'Nama lengkap minimal 3 karakter.'),
  customerPhone: z.string().min(8, 'Nomor WhatsApp / HP minimal 8 digit.'),
  customerEmail: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), { message: 'Format alamat email tidak valid.' }),
  customerNotes: z.string().optional(),
  pickupLocation: z.string().min(2, 'Lokasi penjemputan wajib ditentukan.'),
  paymentTier: z.enum(['full', 'dp']).optional().default('full'),
  selectedAddons: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number().int().min(1)
      })
    )
    .optional(),
  promoCode: z.string().max(30).optional()
});

const promoValidateSchema = z.object({
  code: z.string().min(1, 'Kode promo wajib diisi.'),
  subtotal: z.number().min(0)
});

// Admin Auth Middleware Helper
const ADMIN_TOKEN_SECRET = process.env.ADMIN_SESSION_SECRET || 'garut-admin-auth-2026';

function requireAdmin(req: Request, res: Response, next: Function) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
  if (token === ADMIN_TOKEN_SECRET || token === 'admin-session-active') {
    return next();
  }
  return res.status(401).json({ error: 'Akses ditolak: Autentikasi admin diperlukan.' });
}

// ==========================================
// UPLOAD API ENDPOINTS (PERMANENT STORAGE)
// ==========================================

app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'Data gambar base64 wajib diisi.' });
    }

    // Match base64 data URI format: data:image/png;base64,...
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      else ext = 'jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, error: 'Ukuran file gambar maksimal 10MB.' });
    }

    const safeBase = (filename || 'upload')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueName = `upload_${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${safeBase}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${uniqueName}`;

    res.status(201).json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      size: buffer.length,
      message: 'Gambar berhasil disimpan secara permanen.'
    });
  } catch (err: any) {
    console.error('[Upload] Error saving image:', err);
    res.status(500).json({ success: false, error: 'Gagal memproses upload gambar: ' + err.message });
  }
});

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. Packages
app.get('/api/packages', (req: Request, res: Response) => {
  try {
    const { category, destination, minPrice, maxPrice, search } = req.query;
    const packages = dbStore.getPackages({
      category: typeof category === 'string' ? category : undefined,
      destination: typeof destination === 'string' ? destination : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: typeof search === 'string' ? search : undefined
    });
    res.json({ success: true, data: packages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/packages/:slug', (req: Request, res: Response) => {
  try {
    const pkg = dbStore.getPackageBySlug(req.params.slug);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Paket wisata tidak ditemukan.' });
    }
    res.json({ success: true, data: pkg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Addons (Public)
app.get('/api/addons', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.getAddons(false) });
});

// Admin Addons CRUD
app.get('/api/admin/addons', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.getAddons(true) });
});

app.post('/api/admin/addons', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, price, unit, description, isActive } = req.body;
    if (!name || isNaN(Number(price))) {
      return res.status(400).json({ success: false, error: 'Nama dan harga layanan tambahan wajib diisi.' });
    }
    const newAddon = dbStore.createAddon({
      name,
      price: Number(price),
      unit: unit || 'per trip',
      description: description || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });
    res.status(201).json({ success: true, data: newAddon, message: 'Layanan tambahan berhasil ditambahkan.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/addons/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateAddon(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Layanan tambahan tidak ditemukan.' });
    }
    res.json({ success: true, data: updated, message: 'Layanan tambahan berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/addons/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const deleted = dbStore.deleteAddon(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Layanan tambahan tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Layanan tambahan berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/addons/:id/delete', requireAdmin, (req: Request, res: Response) => {
  try {
    const deleted = dbStore.deleteAddon(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Layanan tambahan tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Layanan tambahan berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Articles (Blog Wisata Garut)
app.get('/api/articles', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.getArticles() });
});

app.get('/api/articles/:slug', (req: Request, res: Response) => {
  const article = dbStore.getArticleBySlug(req.params.slug);
  if (!article) {
    return res.status(404).json({ success: false, error: 'Artikel tidak ditemukan.' });
  }
  res.json({ success: true, data: article });
});

// 4. Gallery
app.get('/api/gallery', (req: Request, res: Response) => {
  const cat = typeof req.query.category === 'string' ? req.query.category : undefined;
  res.json({ success: true, data: dbStore.getGallery(cat) });
});

// 4b. Testimonials (Cerita Pengalaman Tamu)
app.get('/api/testimonials', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.getTestimonials() });
});

app.post('/api/admin/testimonials', requireAdmin, (req: Request, res: Response) => {
  try {
    const item = dbStore.createTestimonial(req.body);
    res.status(201).json({ success: true, data: item, message: 'Cerita pengalaman tamu berhasil ditambahkan.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/testimonials/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateTestimonial(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Cerita tamu tidak ditemukan.' });
    }
    res.json({ success: true, data: updated, message: 'Cerita pengalaman tamu berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete(['/api/admin/testimonials/:id', '/api/admin/testimonials/:id/delete'], requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteTestimonial(req.params.id);
  if (ok) {
    res.json({ success: true, message: 'Cerita pengalaman tamu berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Cerita tamu tidak ditemukan.' });
  }
});

app.post('/api/admin/testimonials/:id/delete', requireAdmin, (req: Request, res: Response) => {
  const ok = dbStore.deleteTestimonial(req.params.id);
  if (ok) {
    res.json({ success: true, message: 'Cerita pengalaman tamu berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Cerita tamu tidak ditemukan.' });
  }
});

// 5. Promo Validation
app.post('/api/promotions/validate', (req: Request, res: Response) => {
  const parsed = promoValidateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      valid: false,
      error: parsed.error.issues[0]?.message || 'Input tidak valid'
    });
  }

  const { code, subtotal } = parsed.data;
  const result = dbStore.validatePromo(code, subtotal);
  res.json({
    success: true,
    valid: result.valid,
    discount: result.discount,
    message: result.message,
    promoCode: result.promo?.code
  });
});

// 6. Create Booking (Resilient date check & DP option)
app.post('/api/bookings', (req: Request, res: Response) => {
  const parsed = bookingInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || 'Data booking tidak valid.'
    });
  }

  try {
    const departureDate = (parsed.data.departureDate || parsed.data.customDate || '').trim();
    if (!departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Tentukan tanggal keberangkatan trip Anda.'
      });
    }

    const creation = dbStore.createBooking({
      ...parsed.data,
      departureDate
    });
    if (!creation.success || !creation.booking) {
      return res.status(400).json({
        success: false,
        error: creation.error || 'Gagal membuat pesanan.'
      });
    }

    sendBookingCreatedEmail(creation.booking, dbStore.siteSettings.paymentTimeoutMinutes);

    res.status(201).json({
      success: true,
      data: {
        bookingNumber: creation.booking.bookingNumber,
        accessToken: creation.booking.accessToken,
        totalAmount: creation.booking.totalAmount,
        paymentTier: creation.booking.paymentTier,
        dpAmount: creation.booking.dpAmount,
        remainingBalance: creation.booking.remainingBalance,
        status: creation.booking.status,
        paymentExpiry: creation.booking.paymentExpiry
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get Secure Booking Detail
app.get('/api/bookings/:bookingNumber', (req: Request, res: Response) => {
  try {
    const { bookingNumber } = req.params;
    const token = req.query.token as string | undefined;
    const adminHeader = req.headers['x-admin-token'];
    const isAdmin = adminHeader === ADMIN_TOKEN_SECRET || adminHeader === 'admin-session-active';

    const booking = dbStore.getBookingByNumberAndToken(bookingNumber, token, isAdmin);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Pesanan tidak ditemukan atau tautan akses tidak valid.'
      });
    }

    const waLink = generateWhatsAppLink(
      booking.bookingNumber,
      booking.customerName,
      booking.tourPackage?.name
    );

    res.json({
      success: true,
      data: {
        ...booking,
        whatsAppHelpLink: waLink
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7b. Download E-Ticket as PDF & Kwitansi (Direct public download without login)
app.get(
  [
    '/api/bookings/:bookingNumber/pdf',
    '/api/bookings/:bookingNumber/eticket.pdf',
    '/api/bookings/:bookingNumber/kwitansi.pdf',
    '/tiket/:bookingNumber',
    '/tiket/:bookingNumber/pdf',
    '/tiket/:bookingNumber/kwitansi.pdf'
  ],
  async (req: Request, res: Response) => {
    try {
      const { bookingNumber } = req.params;
      const cleanBooking = (bookingNumber || '').trim();
      // Direct access to booking without requiring login
      const booking = dbStore.getBookingByNumberAndToken(cleanBooking, undefined, true);
      if (!booking) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="id">
          <head><meta charset="utf-8"><title>E-Ticket Tidak Ditemukan</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px 20px;">
            <h2>Nomor Pesanan Tidak Ditemukan</h2>
            <p>E-Ticket untuk nomor booking "${cleanBooking}" tidak ditemukan.</p>
            <a href="/" style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #0F3827; color: white; border-radius: 8px; text-decoration: none;">Kembali ke Beranda</a>
          </body>
          </html>
        `);
      }

      // If consumer specifically requests HTML preview or print
      if (req.query.format === 'html' || req.query.view === 'html' || req.query.print === 'true') {
        const html = generateETicketHtml(booking, dbStore.siteSettings);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }

      // Default: Generate and stream true binary PDF
      const pdfBuffer = await generateETicketPdfBuffer(booking, dbStore.siteSettings);
      res.setHeader('Content-Type', 'application/pdf');
      const isInline = req.query.inline === 'true' || req.query.view === 'inline';
      const disposition = isInline ? 'inline' : 'attachment';
      res.setHeader('Content-Disposition', `${disposition}; filename="E-Ticket-Garut-Journey-${booking.bookingNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(pdfBuffer);
    } catch (err: any) {
      res.status(500).send('Gagal membuat dokumen e-ticket PDF: ' + err.message);
    }
  }
);

// Dedicated print endpoint for printing Kwitansi
app.get('/api/bookings/:bookingNumber/print', (req: Request, res: Response) => {
  try {
    const { bookingNumber } = req.params;
    const booking = dbStore.getBookingByNumberAndToken(bookingNumber, undefined, true);
    if (!booking) {
      return res.status(404).send('Booking tidak ditemukan.');
    }
    const html = generateETicketHtml(booking, dbStore.siteSettings);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    res.status(500).send('Gagal memuat dokumen cetak: ' + err.message);
  }
});

// Visitor Analytics Tracking
app.post('/api/track-visit', (req: Request, res: Response) => {
  try {
    const { path } = req.body;
    const userAgent = req.headers['user-agent'] as string | undefined;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    dbStore.trackPageView(path || '/', userAgent, ip);
    res.json({ success: true });
  } catch {
    res.status(200).json({ success: true }); // Silent fail for analytics
  }
});

// Image Upload Endpoint (Permanent storage across sessions/devices)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { image, dataUrl } = req.body;
    const rawData = image || dataUrl;
    if (!rawData || typeof rawData !== 'string') {
      return res.status(400).json({ success: false, error: 'Data gambar wajib disertakan (Base64 atau Data URL).' });
    }

    const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = 'png';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      else if (mime.includes('svg')) ext = 'svg';
      else ext = 'jpg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(rawData, 'base64');
    }

    const uniqueId = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const safeFilename = `${uniqueId}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeFilename}`;

    return res.status(201).json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Gagal mengunggah gambar: ' + err.message });
  }
});

// 8. Midtrans Snap Token
app.post('/api/payments/snap-token', async (req: Request, res: Response) => {
  try {
    const { bookingNumber, accessToken } = req.body;
    if (!bookingNumber || !accessToken) {
      return res.status(400).json({ success: false, error: 'Nomor booking dan token akses diperlukan.' });
    }

    const booking = dbStore.getBookingByNumberAndToken(bookingNumber, accessToken);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan atau akses tidak sah.' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({ success: false, error: 'Pesanan ini telah terbayar lunas.' });
    }

    if (booking.status === 'cancelled' || booking.status === 'expired') {
      return res.status(400).json({
        success: false,
        error: `Pesanan sudah tidak dapat dibayar karena berstatus: ${booking.status}.`
      });
    }

    // If DP was selected, amount charged is dpAmount
    const snapBooking = {
      ...booking,
      totalAmount: booking.paymentTier === 'dp' && booking.dpAmount > 0 ? booking.dpAmount : booking.totalAmount
    };

    const snapResult = await paymentService.createTransaction(snapBooking);

    res.json({
      success: true,
      data: {
        snapToken: snapResult.token,
        redirectUrl: snapResult.redirectUrl,
        isSandboxSimulation: snapResult.isSandboxSimulation,
        clientKey: paymentService.getPublicClientKey(),
        grossAmount: snapBooking.totalAmount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Midtrans Webhook
app.post('/api/payments/midtrans-webhook', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const verification = paymentService.verifyWebhook(payload);
    if (!verification.isValid) {
      return res.status(400).json({ success: false, error: verification.reason || 'Verifikasi webhook gagal.' });
    }

    const booking = dbStore.bookings.find(b => b.bookingNumber === verification.orderId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking tidak ditemukan dalam database.' });
    }

    const expectedCharge = booking.paymentTier === 'dp' && booking.dpAmount > 0 ? booking.dpAmount : booking.totalAmount;
    if (Math.round(expectedCharge) !== verification.grossAmount) {
      return res.status(400).json({ success: false, error: 'Nominal transaksi tidak cocok dengan database.' });
    }

    const eventId = `evt-${verification.orderId}-${payload.transaction_status}-${payload.status_code}`;
    const { isDuplicate } = dbStore.recordPaymentEventIdempotent(
      verification.orderId,
      eventId,
      payload.transaction_status || 'unknown',
      payload
    );

    if (isDuplicate) {
      return res.status(200).json({ success: true, message: 'Event duplicate handled idempotently.' });
    }

    dbStore.updateBookingStatusOnPayment(
      verification.orderId,
      verification.transactionStatus,
      verification.transactionId,
      verification.paymentType
    );

    if (verification.transactionStatus === 'settlement' || verification.transactionStatus === 'capture') {
      const fullBooking = dbStore.getBookingByNumberAndToken(verification.orderId, undefined, true);
      if (fullBooking) sendPaymentSuccessEmail(fullBooking);
    }

    res.status(200).json({ success: true, status: verification.transactionStatus });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Status Simulation
app.post('/api/payments/simulate-status', (req: Request, res: Response) => {
  try {
    const { orderId, targetStatus, paymentType } = req.body;
    const booking = dbStore.bookings.find(b => b.bookingNumber === orderId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking tidak ditemukan.' });
    }

    const expectedCharge = booking.paymentTier === 'dp' && booking.dpAmount > 0 ? booking.dpAmount : booking.totalAmount;
    const mockPayload = {
      order_id: orderId,
      status_code: targetStatus === 'settlement' ? '200' : '201',
      gross_amount: String(Math.round(expectedCharge)),
      transaction_status: targetStatus,
      payment_type: paymentType || 'qris',
      transaction_id: 'sim-' + Date.now()
    };

    const eventId = `sim-evt-${orderId}-${targetStatus}-${Date.now()}`;
    dbStore.recordPaymentEventIdempotent(orderId, eventId, targetStatus, mockPayload);
    dbStore.updateBookingStatusOnPayment(orderId, targetStatus, mockPayload.transaction_id, mockPayload.payment_type);

    if (targetStatus === 'settlement' || targetStatus === 'capture') {
      const full = dbStore.getBookingByNumberAndToken(orderId, undefined, true);
      if (full) sendPaymentSuccessEmail(full);
    }

    res.json({ success: true, message: `Status '${targetStatus}' berhasil disimulasikan.`, bookingStatus: booking.status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Site Settings & Legality (Publicly accessible for dynamic footer)
app.get('/api/site-settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.siteSettings });
});

// ==========================================
// ADMIN DASHBOARD ENDPOINTS
// ==========================================

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'admin@garutjourney.id' && (password === 'garutadmin2026' || password === 'admin123')) {
    return res.json({
      success: true,
      token: ADMIN_TOKEN_SECRET,
      profile: { email: 'admin@garutjourney.id', fullName: 'Administrator Garut Journey', role: 'admin' }
    });
  }
  return res.status(401).json({ success: false, error: 'Email atau password admin salah.' });
});

// Admin Metrics
app.get('/api/admin/metrics', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.getAdminMetrics() });
});

// Admin Bookings
app.get('/api/admin/bookings', requireAdmin, (req: Request, res: Response) => {
  const { status, search } = req.query;
  let list = [...dbStore.bookings];

  if (status && status !== 'all') list = list.filter(b => b.status === status);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(b =>
      b.bookingNumber.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      (b.customerEmail ? b.customerEmail.toLowerCase().includes(q) : false)
    );
  }

  const enriched = list
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(b => ({
      ...b,
      tourPackage: dbStore.packages.find(p => p.id === b.packageId),
      payment: dbStore.payments.find(p => p.bookingId === b.id)
    }));

  res.json({ success: true, data: enriched });
});

// Update Operational Status
app.patch('/api/admin/bookings/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { operationalStatus } = req.body;

  const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(operationalStatus)) {
    return res.status(400).json({ success: false, error: 'Status operasional tidak valid.' });
  }

  const booking = dbStore.bookings.find(b => b.id === id || b.bookingNumber === id);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking tidak ditemukan.' });

  booking.status = operationalStatus;
  booking.updatedAt = new Date().toISOString();

  dbStore.saveToDisk();
  res.json({ success: true, message: 'Status operasional berhasil diperbarui.', data: booking });
});

// Admin Update Booking Full Details
app.put('/api/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = dbStore.updateBooking(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Booking tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Data pesanan berhasil diperbarui.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Generate WhatsApp Invoice for Customer
app.post('/api/admin/bookings/:id/whatsapp-invoice', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { customNote } = req.body;

  const booking = dbStore.getBookingByNumberAndToken(id, undefined, true);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking tidak ditemukan.' });
  }

  const waData = dbStore.generateWhatsAppInvoice(booking, customNote);
  res.json({
    success: true,
    whatsAppInvoiceUrl: waData.url,
    rawText: waData.rawText,
    phone: waData.phone
  });
});

// Admin Delete Booking (with POST fallback)
app.delete('/api/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = dbStore.deleteBooking(id);
  if (ok) {
    res.json({ success: true, message: 'Pesanan booking berhasil dihapus dari sistem.' });
  } else {
    res.status(404).json({ success: false, error: 'Booking tidak ditemukan.' });
  }
});

app.post('/api/admin/bookings/:id/delete', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = dbStore.deleteBooking(id);
  if (ok) {
    res.json({ success: true, message: 'Pesanan booking berhasil dihapus dari sistem.' });
  } else {
    res.status(404).json({ success: false, error: 'Booking tidak ditemukan.' });
  }
});

// Delete Activity from Package Itinerary Day (supports query & body & POST fallback)
app.delete('/api/admin/packages/:id/activities', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const day = req.body?.day ?? req.query?.day;
  const activityIndex = req.body?.activityIndex ?? req.query?.activityIndex;

  const ok = dbStore.deleteActivityFromPackage(id, Number(day), Number(activityIndex));
  if (ok) {
    res.json({ success: true, message: 'Aktivitas berhasil dihapus dari itinerary.' });
  } else {
    res.status(400).json({ success: false, error: 'Gagal menghapus aktivitas atau indeks tidak ditemukan.' });
  }
});

app.post('/api/admin/packages/:id/activities/delete', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const day = req.body?.day ?? req.query?.day;
  const activityIndex = req.body?.activityIndex ?? req.query?.activityIndex;

  const ok = dbStore.deleteActivityFromPackage(id, Number(day), Number(activityIndex));
  if (ok) {
    res.json({ success: true, message: 'Aktivitas berhasil dihapus dari itinerary.' });
  } else {
    res.status(400).json({ success: false, error: 'Gagal menghapus aktivitas atau indeks tidak ditemukan.' });
  }
});

// Add Activity to Package Itinerary Day
app.post('/api/admin/packages/:id/activities', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { day, activityText, title } = req.body;

  if (!activityText || !activityText.trim()) {
    return res.status(400).json({ success: false, error: 'Teks aktivitas wajib diisi.' });
  }

  const ok = dbStore.addActivityToPackage(id, Number(day), activityText, title);
  if (ok) {
    res.json({ success: true, message: 'Aktivitas berhasil ditambahkan ke itinerary.' });
  } else {
    res.status(400).json({ success: false, error: 'Paket tidak ditemukan.' });
  }
});

// Add Day to Itinerary
app.post('/api/admin/packages/:id/days', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { day, title } = req.body;
  const ok = dbStore.addDayToPackage(id, Number(day) || 1, title);
  if (ok) {
    res.json({ success: true, message: 'Hari rencana perjalanan berhasil ditambahkan.' });
  } else {
    res.status(400).json({ success: false, error: 'Gagal menambahkan hari ke itinerary.' });
  }
});

// Delete Day from Itinerary
app.delete('/api/admin/packages/:id/days/:day', requireAdmin, (req: Request, res: Response) => {
  const { id, day } = req.params;
  const ok = dbStore.deleteDayFromPackage(id, Number(day));
  if (ok) {
    res.json({ success: true, message: 'Hari itinerary berhasil dihapus.' });
  } else {
    res.status(400).json({ success: false, error: 'Gagal menghapus hari itinerary.' });
  }
});

app.post('/api/admin/packages/:id/days/:day/delete', requireAdmin, (req: Request, res: Response) => {
  const { id, day } = req.params;
  const ok = dbStore.deleteDayFromPackage(id, Number(day));
  if (ok) {
    res.json({ success: true, message: 'Hari itinerary berhasil dihapus.' });
  } else {
    res.status(400).json({ success: false, error: 'Gagal menghapus hari itinerary.' });
  }
});

// Admin Delete Package (with POST fallback)
app.delete('/api/admin/packages/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = dbStore.deletePackage(id);
  if (ok) {
    res.json({ success: true, message: 'Paket wisata berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Paket tidak ditemukan.' });
  }
});

app.post('/api/admin/packages/:id/delete', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = dbStore.deletePackage(id);
  if (ok) {
    res.json({ success: true, message: 'Paket wisata berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Paket tidak ditemukan.' });
  }
});

// Admin Articles CRUD
app.post('/api/admin/articles', requireAdmin, (req: Request, res: Response) => {
  try {
    const { title, category, summary, content, author, imageUrl, readTimeMinutes, metaTitle, metaDescription, keywords } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newArt = {
      id: 'art-' + Date.now(),
      slug: slug + '-' + Math.random().toString(36).substring(2, 6),
      title,
      category: category || 'Wisata Garut',
      summary: summary || content.slice(0, 140),
      content,
      author: author || 'Admin Garut Journey',
      imageUrl: imageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
      readTimeMinutes: Number(readTimeMinutes) || 4,
      isPublished: true,
      metaTitle: metaTitle || `${title} | Garut Journey`,
      metaDescription: metaDescription || summary || content.slice(0, 150),
      keywords: keywords || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.articles.unshift(newArt);
    dbStore.saveToDisk();
    res.status(201).json({ success: true, data: newArt });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/articles/:id', requireAdmin, (req: Request, res: Response) => {
  const index = dbStore.articles.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    dbStore.articles.splice(index, 1);
    dbStore.saveToDisk();
    res.json({ success: true, message: 'Artikel berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Artikel tidak ditemukan.' });
  }
});

app.post('/api/admin/articles/:id/delete', requireAdmin, (req: Request, res: Response) => {
  const index = dbStore.articles.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    dbStore.articles.splice(index, 1);
    dbStore.saveToDisk();
    res.json({ success: true, message: 'Artikel berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Artikel tidak ditemukan.' });
  }
});

// Admin Update Article
app.put('/api/admin/articles/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = dbStore.updateArticle(id, req.body);
  if (updated) {
    res.json({ success: true, message: 'Artikel berhasil diperbarui.', data: updated });
  } else {
    res.status(404).json({ success: false, error: 'Artikel tidak ditemukan.' });
  }
});

// Admin Gallery CRUD
app.post('/api/admin/gallery', requireAdmin, (req: Request, res: Response) => {
  try {
    const { title, category, location, imageUrl, description } = req.body;
    const newItem = {
      id: 'gal-' + Date.now(),
      title,
      category: category || 'Gunung',
      location: location || 'Garut, Jawa Barat',
      imageUrl: imageUrl || '/src/assets/images/hero_garut_papandayan_1792431914366.jpg',
      description: description || '',
      createdAt: new Date().toISOString()
    };
    dbStore.gallery.unshift(newItem);
    dbStore.saveToDisk();
    res.status(201).json({ success: true, data: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = dbStore.updateGalleryItem(id, req.body);
  if (updated) {
    res.json({ success: true, message: 'Foto galeri berhasil diperbarui.', data: updated });
  } else {
    res.status(404).json({ success: false, error: 'Foto galeri tidak ditemukan.' });
  }
});

app.delete('/api/admin/gallery/:id', requireAdmin, (req: Request, res: Response) => {
  const index = dbStore.gallery.findIndex(g => g.id === req.params.id);
  if (index !== -1) {
    dbStore.gallery.splice(index, 1);
    dbStore.saveToDisk();
    res.json({ success: true, message: 'Foto galeri berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Item galeri tidak ditemukan.' });
  }
});

app.post('/api/admin/gallery/:id/delete', requireAdmin, (req: Request, res: Response) => {
  const index = dbStore.gallery.findIndex(g => g.id === req.params.id);
  if (index !== -1) {
    dbStore.gallery.splice(index, 1);
    dbStore.saveToDisk();
    res.json({ success: true, message: 'Foto galeri berhasil dihapus.' });
  } else {
    res.status(404).json({ success: false, error: 'Item galeri tidak ditemukan.' });
  }
});

// Admin Packages CRUD
app.get('/api/admin/packages', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.packages });
});

app.post('/api/admin/packages', requireAdmin, (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newPkg = {
      id: 'pkg-' + Date.now(),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: data.name,
      category: data.category || 'Gunung & Alam',
      shortDescription: data.shortDescription,
      description: data.description,
      durationDays: Number(data.durationDays) || 1,
      durationNights: Number(data.durationNights) || 0,
      basePrice: Number(data.basePrice),
      minParticipants: Number(data.minParticipants) || 1,
      maxParticipants: Number(data.maxParticipants) || 20,
      destinationArea: data.destinationArea,
      inclusions: data.inclusions || [],
      exclusions: data.exclusions || [],
      itinerary: data.itinerary || [],
      pickupPoints: data.pickupPoints || [],
      termsAndConditions: data.termsAndConditions || '',
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      featuredOrder: Number(data.featuredOrder) || 0,
      tripType: 'private' as const,
      priceTiers: data.priceTiers || dbStore.generateDefaultPriceTiers(Number(data.basePrice)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbStore.packages.push(newPkg);
    dbStore.saveToDisk();
    res.status(201).json({ success: true, data: newPkg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Update Package
app.put('/api/admin/packages/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (data.priceTiers && !Array.isArray(data.priceTiers)) {
      delete data.priceTiers;
    }
    const updated = dbStore.updatePackage(req.params.id, data);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Paket wisata tidak ditemukan.' });
    }
    res.json({ success: true, data: updated, message: 'Paket wisata berhasil diperbarui.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Schedules (Garut Journey operates 100% private trips with flexible dates)
app.get('/api/admin/schedules', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

app.post('/api/admin/schedules', requireAdmin, (_req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Garut Journey mengoperasikan 100% Private Trip dengan tanggal fleksibel.' });
});

app.delete('/api/admin/schedules/:id', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Jadwal berhasil dihapus.' });
});

// Admin Audit Events
app.get('/api/admin/payments/events', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: dbStore.paymentEvents });
});

// Admin CSV Export
app.get('/api/admin/reports/csv', requireAdmin, (_req: Request, res: Response) => {
  const csvContent = dbStore.generateBookingsCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="laporan-booking-garut-journey.csv"');
  res.send(csvContent);
});

// Admin Emails
app.get('/api/admin/emails', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: emailLogs });
});

// Admin Update Legality & Footer & Site Settings
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    Object.assign(dbStore.siteSettings, req.body);
    dbStore.saveToDisk();
    res.json({ success: true, message: 'Pengaturan legalitas dan footer berhasil disimpan.', data: dbStore.siteSettings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Visitor Analytics Report
app.get('/api/admin/analytics', requireAdmin, (_req: Request, res: Response) => {
  try {
    const data = dbStore.getVisitorAnalytics();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Clear All Activity Logs (Audits & Visitor Views)
app.delete('/api/admin/activities/clear', requireAdmin, (_req: Request, res: Response) => {
  try {
    const stats = dbStore.clearAllActivityLogs();
    emailLogs.length = 0; // Clear email logs as well
    res.json({
      success: true,
      message: 'Semua log aktivitas (audit pembayaran, riwayat pengunjung, dan log email) berhasil dibersihkan.',
      data: stats
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Clear Email Logs
app.delete('/api/admin/emails/clear', requireAdmin, (_req: Request, res: Response) => {
  emailLogs.length = 0;
  res.json({ success: true, message: 'Log email berhasil dibersihkan.' });
});

// ==========================================
// DYNAMIC SEO & ROBOTS.TXT
// ==========================================

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://garutjourney.id';
  const staticUrls = [
    '',
    '/paket-wisata',
    '/artikel',
    '/galeri',
    '/tentang-kami',
    '/kontak',
    '/syarat-ketentuan',
    '/kebijakan-privasi',
    '/kebijakan-pembatalan'
  ];

  const packageUrls = dbStore.packages.filter(p => p.isPublished).map(p => `/paket-wisata/${p.slug}`);
  const articleUrls = dbStore.articles.filter(a => a.isPublished).map(a => `/artikel/${a.slug}`);
  const allUrls = [...staticUrls, ...packageUrls, ...articleUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    url => `  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === '' ? '1.0' : url.startsWith('/paket-wisata') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || dbStore.siteSettings.canonicalUrl || 'https://garutjourney.id';
  if (dbStore.siteSettings.robotsTxtContent) {
    res.setHeader('Content-Type', 'text/plain');
    return res.send(dbStore.siteSettings.robotsTxtContent);
  }
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /booking/
Disallow: /pembayaran/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION
// ==========================================

async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Garut Journey] Server running on port ${PORT} (dev: ${isDev})`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
