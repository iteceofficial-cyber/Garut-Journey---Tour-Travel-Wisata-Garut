/**
 * GARUT JOURNEY — AUTOMATED TEST SUITE
 * Tests:
 * 1. Official Price & Promo Calculation
 * 2. 100% Private Trip: Consumer-selected departureDate validation
 * 3. Security Token Protection (No unauthorized access)
 * 4. DP (Down Payment 30%) vs Lunas (100%) Calculation & Remaining Balance
 * 5. Admin Itinerary Management: deleting activity from package
 * 6. Webhook Idempotency: repeated notifications do not duplicate state
 * 7. Stale booking expiration: past payment deadline auto-expires booking
 * 8. Visitor Analytics: pageview tracking and analytics summary
 */

import assert from 'node:assert';
import { dbStore, VERIFIED_ADDONS } from '../server/db.ts';

console.log('>>> RUNNING GARUT JOURNEY INTEGRATION TESTS <<<\n');

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // --- TEST 1: Price and Promo Discount Calculation ---
  test('1. Official price calculation & valid promo code discount', () => {
    const pkg = dbStore.packages[0];
    const subtotal = pkg.basePrice * 2; // 2 pax = 1.100.000

    const promoCheck = dbStore.validatePromo('GARUTASRI10', subtotal);
    assert.strictEqual(promoCheck.valid, true, 'Promo GARUTASRI10 should be valid');
    assert.strictEqual(promoCheck.discount, 110000, '10% of 1.100.000 is 110.000');

    const lowSpendCheck = dbStore.validatePromo('FAMILYTRIP', 400000);
    assert.strictEqual(lowSpendCheck.valid, false, 'Should fail min spend requirement');
  });

  // --- TEST 2: 100% Private Trip Creation with Consumer Chosen Date ---
  test('2. 100% Private Trip: Consumer directly chooses departureDate', () => {
    const pkg = dbStore.packages[1];
    const targetDate = '2026-11-25';

    const res = dbStore.createBooking({
      packageSlug: pkg.slug,
      departureDate: targetDate,
      participantsCount: 3,
      customerName: 'Keluarga Budi',
      customerPhone: '081234567890',
      customerEmail: 'budi@example.com',
      pickupLocation: 'Stasiun Garut'
    });

    assert.strictEqual(res.success, true, 'Private trip booking should succeed');
    assert.strictEqual(res.booking?.departureDate, targetDate, 'Departure date should match consumer choice');
    assert.strictEqual(res.booking?.participantsCount, 3);
    const expectedTier = pkg.priceTiers?.find(t => 3 >= t.minParticipants && 3 <= t.maxParticipants);
    const expectedUnitPrice = expectedTier ? expectedTier.pricePerPerson : pkg.basePrice;
    assert.strictEqual(res.booking?.subtotal, expectedUnitPrice * 3);
  });

  // --- TEST 3: Access Token Security ---
  test('3. Booking access security: unauthorized access without crypto token rejected', () => {
    const pkg = dbStore.packages[0];

    const bookingRes = dbStore.createBooking({
      packageSlug: pkg.slug,
      departureDate: '2026-12-01',
      participantsCount: 1,
      customerName: 'Budi Santoso',
      customerPhone: '0833333333',
      customerEmail: 'budi@example.com',
      pickupLocation: 'Hotel Santika Garut'
    });

    const booking = bookingRes.booking!;
    assert.ok(booking.accessToken.startsWith('gj_sec_'), 'Access token must be cryptographically prefixed');

    const wrongTokenResult = dbStore.getBookingByNumberAndToken(booking.bookingNumber, 'wrong_token');
    assert.strictEqual(wrongTokenResult, null, 'Access with invalid token must return null');

    const validTokenResult = dbStore.getBookingByNumberAndToken(booking.bookingNumber, booking.accessToken);
    assert.ok(validTokenResult !== null, 'Access with correct token must succeed');
    assert.strictEqual(validTokenResult?.bookingNumber, booking.bookingNumber);
  });

  // --- TEST 4: DP (Down Payment 30%) Calculation & Remaining Balance ---
  test('4. DP vs Lunas: 30% Down Payment calculation and remaining balance', () => {
    const pkg = dbStore.packages[0];

    const dpBookingRes = dbStore.createBooking({
      packageSlug: pkg.slug,
      departureDate: '2026-12-10',
      participantsCount: 2,
      customerName: 'Doni Pratama',
      customerPhone: '081299998888',
      customerEmail: 'doni@example.com',
      pickupLocation: 'Stasiun Garut',
      paymentTier: 'dp'
    });

    const b = dpBookingRes.booking!;
    assert.strictEqual(b.paymentTier, 'dp');
    const expectedDp = Math.round(b.totalAmount * 0.3);
    assert.strictEqual(b.dpAmount, expectedDp, 'DP amount should be exactly 30% of total');
    assert.strictEqual(b.remainingBalance, b.totalAmount - expectedDp, 'Remaining balance should be 70%');

    // Simulate DP payment settlement
    dbStore.updateBookingStatusOnPayment(b.id, 'settlement');
    const updated = dbStore.getBookingByNumberAndToken(b.bookingNumber, b.accessToken)!;
    assert.strictEqual(updated.status, 'confirmed', 'DP booking should be confirmed upon 30% DP payment');
    assert.strictEqual(updated.paidAmount, expectedDp);
  });

  // --- TEST 5: Admin Itinerary Activity Deletion ---
  test('5. Admin Itinerary Management: deleting activity from package', () => {
    const pkg = dbStore.packages[0];
    const initialDayActivities = [...pkg.itinerary[0].activities];
    const initialCount = initialDayActivities.length;

    // Delete first activity
    const success = dbStore.deleteActivityFromPackage(pkg.id, 1, 0);
    assert.strictEqual(success, true, 'Deleting activity must return true');

    const updatedPkg = dbStore.packages.find(p => p.id === pkg.id)!;
    assert.strictEqual(updatedPkg.itinerary[0].activities.length, initialCount - 1);

    // Add activity back
    dbStore.addActivityToPackage(pkg.id, 1, initialDayActivities[0]);
    assert.strictEqual(updatedPkg.itinerary[0].activities.length, initialCount);
  });

  // --- TEST 6: Webhook Idempotency ---
  test('6. Webhook idempotency: repeated notifications do not duplicate state', () => {
    const orderId = 'GJ-TEST-IDEMPOTENT-' + Date.now();
    const eventId = 'evt-' + Date.now();

    const ev1 = dbStore.recordPaymentEventIdempotent(orderId, eventId, 'payment.settlement', { transaction_status: 'settlement' });
    assert.strictEqual(ev1.isDuplicate, false, 'First event should not be duplicate');

    const ev2 = dbStore.recordPaymentEventIdempotent(orderId, eventId, 'payment.settlement', { transaction_status: 'settlement' });
    assert.strictEqual(ev2.isDuplicate, true, 'Second event with same ID must be detected as duplicate');
  });

  // --- TEST 7: Auto-expire Stale Bookings ---
  test('7. Stale booking expiration: past payment deadline auto-expires booking', () => {
    const pkg = dbStore.packages[0];
    const bookingRes = dbStore.createBooking({
      packageSlug: pkg.slug,
      departureDate: '2026-11-30',
      participantsCount: 2,
      customerName: 'Stale Customer',
      customerPhone: '0899999999',
      customerEmail: 'stale@example.com',
      pickupLocation: 'Stasiun Garut'
    });

    const booking = bookingRes.booking!;
    // Set expiry to 1 hour ago
    booking.paymentExpiry = new Date(Date.now() - 3600000).toISOString();

    const expiredCount = dbStore.expireStaleBookings();
    assert.ok(expiredCount >= 1, 'At least 1 booking must be expired');

    const checkedBooking = dbStore.getBookingByNumberAndToken(booking.bookingNumber, booking.accessToken)!;
    assert.strictEqual(checkedBooking.status, 'expired', 'Booking status must transition to expired');
  });

  // --- TEST 8: Visitor Analytics Tracking ---
  test('8. Visitor Analytics: tracking pageviews and retrieving statistics report', () => {
    dbStore.trackPageView('/paket-wisata/jelajah-gunung-papandayan-edelweiss', 'Mozilla/5.0 (iPhone)', '114.124.50.1');
    dbStore.trackPageView('/artikel', 'Mozilla/5.0 (Windows NT 10.0)', '114.124.50.2');

    const analytics = dbStore.getVisitorAnalytics();
    assert.ok(analytics.totalPageViews >= 2, 'Total pageviews should track recorded views');
    assert.ok(analytics.uniqueVisitors >= 1, 'Unique visitors should be counted');
    assert.ok(Array.isArray(analytics.dailyViews), 'Daily views breakdown should be an array');
    assert.ok(Array.isArray(analytics.topPages), 'Top pages should be an array');
  });

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed}/${total} PASSED`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
