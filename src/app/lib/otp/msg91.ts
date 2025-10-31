import axios from "axios";
import type { OtpProvider } from "./provider";

export const msg91Provider: OtpProvider = {
  async sendOtp(phoneE164: string, otp: string) {
    try {
      const { MSG91_AUTHKEY, MSG91_TEMPLATE_ID, MSG91_SENDER_ID } = process.env as any;
      if (!MSG91_AUTHKEY || !MSG91_TEMPLATE_ID) throw new Error("MSG91 configuration missing");
      const mobile = phoneE164.replace("+", "");
      const url = "https://control.msg91.com/api/v5/flow/";
      const payload = { template_id: MSG91_TEMPLATE_ID, sender: MSG91_SENDER_ID || "GRNRID", short_url: "0", mobiles: mobile, OTP: otp };
      await axios.post(url, payload, { headers: { authkey: MSG91_AUTHKEY, "Content-Type": "application/json" }, timeout: 10000 });
      return { refId: `msg91_${Date.now()}`, success: true };
    } catch (error: any) {
      throw new Error("Failed to send OTP. Please try again.");
    }
  },
};


