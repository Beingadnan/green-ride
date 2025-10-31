import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import QRCode from "qrcode";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date, formatStr: string = "PPP"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatTime(time: string): string { return time; }

export function calculateFare(distance: number, baseFare: number = 300): number { return baseFare; }

export async function generateQRCode(data: string): Promise<string> {
  const qrCodeDataUrl = await QRCode.toDataURL(data, { width: 300, margin: 2, color: { dark: "#000000", light: "#FFFFFF" } });
  return qrCodeDataUrl;
}

export function generateBookingId(): string { return `GR${Date.now().toString(36)}${Math.random().toString(36).substring(2,8)}`.toUpperCase(); }
export function generateTransactionId(): string { return `TXN${Date.now().toString(36)}${Math.random().toString(36).substring(2,10)}`.toUpperCase(); }

export function isValidEmail(email: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
export function isValidPhone(phone: string): boolean { return /^[6-9]\d{9}$/.test(phone); }
export function generateSeatNumbers(totalSeats: number): string[] { return Array.from({ length: totalSeats }, (_, i) => (i + 1).toString()); }
export function isFutureDate(date: string | Date): boolean { const d = typeof date === "string" ? parseISO(date) : date; return d > new Date(); }
export function getHoursDifference(date1: Date, date2: Date): number { return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60); }
export function sanitizeInput(input: string): string { return input.trim().replace(/[<>]/g, ""); }
export function getRandomColor(): string { const colors = ["#16a34a", "#15803d", "#14532d", "#22c55e", "#4ade80"]; return colors[Math.floor(Math.random()*colors.length)]; }
export function calculateDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return ((eh*60+em) - (sh*60+sm))/60;
}


