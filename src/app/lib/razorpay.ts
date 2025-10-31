import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || "";

export const razorpayInstance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_SECRET });

export async function createRazorpayOrder(amount: number, bookingId: string) {
  const options = { amount: amount * 100, currency: "INR", receipt: bookingId, notes: { bookingId } } as any;
  try { return await (razorpayInstance as any).orders.create(options); } catch (e) { throw new Error("Failed to create payment order"); }
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = orderId + "|" + paymentId;
  const expected = crypto.createHmac("sha256", RAZORPAY_SECRET).update(body).digest("hex");
  return expected === signature;
}

export async function fetchPaymentDetails(paymentId: string) {
  try { return await (razorpayInstance as any).payments.fetch(paymentId); } catch (e) { throw new Error("Failed to fetch payment details"); }
}

export async function initiateRefund(paymentId: string, amount?: number) {
  try { return await (razorpayInstance as any).payments.refund(paymentId, { amount: amount ? amount * 100 : undefined }); } catch (e) { throw new Error("Failed to initiate refund"); }
}


