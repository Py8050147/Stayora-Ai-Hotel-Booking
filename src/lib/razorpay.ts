import { Razorpay } from "razorpay";
import crypto from "crypto";

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}

export function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay secret not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export interface CreateOrderParams {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createOrder(params: CreateOrderParams) {
  const razorpay = getRazorpay();
  return razorpay.orders.create(params);
}

export async function capturePayment(paymentId: string, amount: number) {
  const razorpay = getRazorpay();
  return razorpay.payments.capture(paymentId, amount);
}

export async function refundPayment(paymentId: string, amount?: number) {
  const razorpay = getRazorpay();
  const params: { amount?: number } = {};
  if (amount) params.amount = amount;
  return razorpay.payments.refund(paymentId, params);
}

export async function fetchPayment(paymentId: string) {
  const razorpay = getRazorpay();
  return razorpay.payments.fetch(paymentId);
}

export async function fetchOrder(orderId: string) {
  const razorpay = getRazorpay();
  return razorpay.orders.fetch(orderId);
}