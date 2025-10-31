import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export function toE164Indian(phone: string): string | null {
  try {
    const cleaned = phone.replace(/[^\d+]/g, "");
    let withCountry: string;
    if (cleaned.startsWith("+91")) withCountry = cleaned;
    else if (cleaned.startsWith("91") && cleaned.length === 12) withCountry = `+${cleaned}`;
    else if (cleaned.length === 10) withCountry = `+91${cleaned}`;
    else withCountry = cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    const parsed = parsePhoneNumberFromString(withCountry, "IN" as CountryCode);
    if (!parsed || !parsed.isValid() || parsed.country !== "IN") return null;
    return parsed.number;
  } catch { return null; }
}

export function maskPhone(phoneE164: string): string {
  if (!phoneE164 || phoneE164.length < 10) return phoneE164;
  const country = phoneE164.slice(0, 3);
  const number = phoneE164.slice(3);
  if (number.length === 10) return `${country}-${number.slice(0,2)}XXXX${number.slice(-4)}`;
  return phoneE164;
}

export function isValidIndianMobile(phone: string): boolean {
  const e164 = toE164Indian(phone);
  if (!e164) return false;
  const number = e164.slice(3);
  return /^[6-9]\d{9}$/.test(number);
}


