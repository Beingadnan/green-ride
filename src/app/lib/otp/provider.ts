export interface OtpProvider {
  sendOtp(phoneE164: string, otp: string): Promise<{ refId?: string; success: boolean }>;
}

export function getOtpProvider(): OtpProvider {
  const { MSG91_AUTHKEY, MSG91_TEMPLATE_ID } = process.env;
  if (!MSG91_AUTHKEY || !MSG91_TEMPLATE_ID) throw new Error("MSG91 credentials missing.");
  const { msg91Provider } = require("./msg91");
  return msg91Provider;
}

export const mockProvider: OtpProvider = {
  async sendOtp(phoneE164: string, otp: string) {
    console.log(`🔐 [MOCK OTP] Phone: ${phoneE164}, OTP: ${otp}`);
    return { refId: `mock_${Date.now()}`, success: true };
  },
};


