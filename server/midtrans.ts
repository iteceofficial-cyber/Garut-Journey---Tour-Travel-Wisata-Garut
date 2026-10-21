import crypto from 'node:crypto';
import type { Booking, PaymentStatus } from './types.ts';
import { dbStore } from './db.ts';

export interface PaymentGateway {
  createTransaction(booking: Booking): Promise<{
    token: string;
    redirectUrl: string;
    isSandboxSimulation: boolean;
  }>;
  verifyWebhook(payload: Record<string, any>): {
    isValid: boolean;
    orderId: string;
    transactionStatus: PaymentStatus;
    grossAmount: number;
    transactionId?: string;
    paymentType?: string;
    reason?: string;
  };
}

export class MidtransService implements PaymentGateway {
  private serverKey: string;
  private clientKey: string;
  private isProduction: boolean;
  private snapApiUrl: string;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SANDBOX_SERVER_KEY';
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY';
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    this.snapApiUrl = this.isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  }

  getPublicClientKey(): string {
    return this.clientKey;
  }

  isRealCredentialsConfigured(): boolean {
    return (
      Boolean(this.serverKey) &&
      !this.serverKey.includes('YOUR_SANDBOX_SERVER_KEY') &&
      (this.serverKey.startsWith('SB-Mid-server-') || this.serverKey.startsWith('Mid-server-'))
    );
  }

  async createTransaction(booking: Booking): Promise<{
    token: string;
    redirectUrl: string;
    isSandboxSimulation: boolean;
  }> {
    const grossAmount = Math.round(booking.totalAmount);

    // If real credentials are provided in .env, attempt actual Midtrans API call
    if (this.isRealCredentialsConfigured()) {
      try {
        const authString = Buffer.from(`${this.serverKey}:`).toString('base64');
        const itemDetails = (booking.items || []).map(i => ({
          id: i.id.slice(0, 50),
          price: Math.round(i.unitPrice),
          quantity: i.quantity,
          name: i.itemName.slice(0, 50)
        }));

        // Include discount as negative item if present
        if (booking.discountTotal > 0) {
          itemDetails.push({
            id: 'PROMO-DISCOUNT',
            price: -Math.round(booking.discountTotal),
            quantity: 1,
            name: `Diskon Promo (${booking.appliedPromoCode || 'Promo'})`.slice(0, 50)
          });
        }

        const payload = {
          transaction_details: {
            order_id: booking.bookingNumber,
            gross_amount: grossAmount
          },
          customer_details: {
            first_name: booking.customerName,
            email: booking.customerEmail,
            phone: booking.customerPhone
          },
          item_details: itemDetails,
          expiry: {
            unit: 'minutes',
            duration: 60
          }
        };

        const res = await fetch(this.snapApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authString}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = (await res.json()) as { token: string; redirect_url: string };
          // Record payment state
          dbStore.saveOrUpdatePayment({
            bookingId: booking.id,
            orderId: booking.bookingNumber,
            grossAmount,
            status: 'pending',
            snapToken: data.token,
            snapRedirectUrl: data.redirect_url
          });

          return {
            token: data.token,
            redirectUrl: data.redirect_url,
            isSandboxSimulation: false
          };
        } else {
          const errText = await res.text();
          console.warn('[Midtrans] API error response, falling back to Sandbox Simulator:', errText);
        }
      } catch (err) {
        console.warn('[Midtrans] Network connection error, using local Sandbox Simulator:', err);
      }
    }

    // High-Fidelity Sandbox Simulator token
    const mockToken = `snap_sandbox_${booking.bookingNumber}_${crypto.randomBytes(4).toString('hex')}`;
    const mockRedirectUrl = `/pembayaran/${booking.bookingNumber}?simulated=snap`;

    dbStore.saveOrUpdatePayment({
      bookingId: booking.id,
      orderId: booking.bookingNumber,
      grossAmount,
      status: 'pending',
      snapToken: mockToken,
      snapRedirectUrl: mockRedirectUrl
    });

    return {
      token: mockToken,
      redirectUrl: mockRedirectUrl,
      isSandboxSimulation: true
    };
  }

  verifyWebhook(payload: Record<string, any>): {
    isValid: boolean;
    orderId: string;
    transactionStatus: PaymentStatus;
    grossAmount: number;
    transactionId?: string;
    paymentType?: string;
    reason?: string;
  } {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type
    } = payload;

    if (!order_id || !status_code || !gross_amount) {
      return {
        isValid: false,
        orderId: order_id || '',
        transactionStatus: 'deny',
        grossAmount: 0,
        reason: 'Payload tidak lengkap.'
      };
    }

    const numericGross = Math.round(parseFloat(gross_amount));

    // Verify cryptographic signature if real server key is set and signature_key was sent
    if (this.isRealCredentialsConfigured() && signature_key) {
      const rawString = `${order_id}${status_code}${gross_amount}${this.serverKey}`;
      const calculatedSignature = crypto.createHash('sha512').update(rawString).digest('hex');

      if (calculatedSignature !== signature_key) {
        return {
          isValid: false,
          orderId: order_id,
          transactionStatus: 'deny',
          grossAmount: numericGross,
          reason: 'Signature key tidak cocok.'
        };
      }
    }

    // Map Midtrans transaction_status to our domain PaymentStatus
    let status: PaymentStatus = 'pending';
    if (transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        status = 'pending';
      } else if (fraud_status === 'accept') {
        status = 'capture';
      }
    } else if (transaction_status === 'settlement') {
      status = 'settlement';
    } else if (transaction_status === 'cancel') {
      status = 'cancel';
    } else if (transaction_status === 'deny') {
      status = 'deny';
    } else if (transaction_status === 'expire') {
      status = 'expire';
    } else if (transaction_status === 'pending') {
      status = 'pending';
    } else if (transaction_status === 'refund') {
      status = 'refund';
    }

    return {
      isValid: true,
      orderId: order_id,
      transactionStatus: status,
      grossAmount: numericGross,
      transactionId: transaction_id,
      paymentType: payment_type
    };
  }
}

export const paymentService = new MidtransService();
