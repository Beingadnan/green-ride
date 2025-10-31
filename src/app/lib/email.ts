import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
const FROM_EMAIL = process.env.ADMIN_EMAIL || "noreply@greenride-express.com";
if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

interface BookingDetails { bookingId: string; passengerName: string; passengerEmail: string; tripDate: string; startTime: string; endTime: string; from: string; to: string; seats: string[]; totalFare: number; busNumber: string; qrCodeUrl?: string; }

function generateTicketHTML(details: BookingDetails): string {
  return `<!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;background:#f4f4f4;padding:20px}.container{max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,.1)}.header{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;padding:30px;border-radius:10px 10px 0 0;text-align:center;margin:-30px -30px 20px}.ticket-info{background:#f8f8f8;padding:20px;border-radius:8px;margin:20px 0}.info-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e0e0e0}.info-row:last-child{border-bottom:none}.seats{background:#16a34a;color:#fff;padding:15px;border-radius:8px;text-align:center;font-size:18px;font-weight:bold;margin:20px 0}.qr-code{text-align:center;margin:20px 0}.qr-code img{max-width:200px}.important{background:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px}</style></head><body><div class="container"><div class="header"><h1>🚌 GreenRide Express</h1><p>Your E-Ticket Confirmation</p></div><h2 style="color:#16a34a;">Booking Confirmed! 🎉</h2><p>Dear ${details.passengerName},</p><p>Your bus ticket has been successfully booked. Here are your journey details:</p><div class="ticket-info"><div class="info-row"><span>Booking ID:</span><span>${details.bookingId}</span></div><div class="info-row"><span>Date:</span><span>${details.tripDate}</span></div><div class="info-row"><span>Time:</span><span>${details.startTime} - ${details.endTime}</span></div><div class="info-row"><span>From:</span><span>${details.from}</span></div><div class="info-row"><span>To:</span><span>${details.to}</span></div><div class="info-row"><span>Bus Number:</span><span>${details.busNumber}</span></div><div class="info-row"><span>Total Fare:</span><span>₹${details.totalFare}</span></div></div><div class="seats">Seat Numbers: ${details.seats.join(", ")}</div>${details.qrCodeUrl ? `<div class="qr-code"><p><strong>Scan this QR code at boarding:</strong></p><img src="${details.qrCodeUrl}" alt="Ticket QR Code" /></div>` : ``}<div class="important"><strong>⚠️ Important:</strong><ul style="margin:10px 0;"><li>Please arrive 15 minutes early</li><li>Carry a valid ID proof</li><li>This is an e-ticket. No need to print.</li></ul></div><div class="footer" style="text-align:center;margin-top:30px;padding-top:20px;border-top:2px solid #e0e0e0;color:#666"><p>Thank you for choosing GreenRide Express!</p><p style="color:#16a34a;font-weight:bold;">India's First Electric Intercity Bus Service</p><p style="font-size:12px;margin-top:15px;">For support, email us at ${FROM_EMAIL}<br/>This is an automated email, please do not reply.</p></div></div></body></html>`;
}

export async function sendBookingConfirmation(details: BookingDetails): Promise<boolean> {
  if (!SENDGRID_API_KEY) return false;
  const msg = { to: details.passengerEmail, from: FROM_EMAIL, subject: `✅ Booking Confirmed - ${details.bookingId} | GreenRide Express`, html: generateTicketHTML(details) } as any;
  try { await sgMail.send(msg); return true; } catch { return false; }
}

export async function sendCancellationEmail(email: string, bookingId: string, refundAmount: number): Promise<boolean> {
  if (!SENDGRID_API_KEY) return false;
  const msg = { to: email, from: FROM_EMAIL, subject: `Booking Cancelled - ${bookingId} | GreenRide Express`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style=\"color:#dc2626;\">Booking Cancelled</h2><p>Your booking <strong>${bookingId}</strong> has been cancelled.</p><p>Refund amount of <strong>₹${refundAmount}</strong> will be credited within 5-7 business days.</p><p>For support: ${FROM_EMAIL}</p></div>` } as any;
  try { await sgMail.send(msg); return true; } catch { return false; }
}


