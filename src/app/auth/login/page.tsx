"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Toasts removed for clean UI
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Bus, Phone, Shield, ArrowLeft } from "lucide-react";
import axios from "@/lib/axios";

type Step = "phone" | "otp";

function PhoneLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/";

  // State management
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [phoneE164, setPhoneE164] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("/api/auth/me");
        if (response.data.success && response.data.user) {
          // User is already logged in, redirect
          router.push(nextUrl);
        }
      } catch (error) {
        // User is not logged in, stay on login page
      }
    };
    checkAuth();
  }, [router, nextUrl]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Format phone as user types (10 digits only)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  // Format OTP as user types (6 digits)
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    setError("");

    // Validate phone number
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid Indian mobile number (starts with 6-9)");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/send-otp", { phone });

      if (response.data.success) {
        setPhoneE164(response.data.phone);
        setMaskedPhone(response.data.maskedPhone);
        setStep("otp");
        setOtp("");
        setResendTimer(30);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      setError(message);
      // silent error; message is shown inline above
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    await handleSendOTP();
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/verify-otp", {
        phone: phoneE164 || phone,
        otp,
        name: name.trim() || undefined,
      });

      if (response.data.success) {
        router.push(nextUrl);
        router.refresh();
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      const attemptsLeft = err.response?.data?.attemptsLeft;

      if (attemptsLeft !== undefined) {
        setError(`${message}`);
      } else {
        setError(message);
      }

      // silent error; inline message already set
    } finally {
      setLoading(false);
    }
  };

  // Go back to phone input
  const handleBack = () => {
    setStep("phone");
    setOtp("");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-gray-50">
      <Header />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Bus className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to GreenRide
            </h1>
            <p className="text-gray-600">
              {step === "phone"
                ? "Login or sign up with your mobile number"
                : "Enter the OTP sent to your phone"}
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-2xl border-0">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-green-50/30">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                {step === "otp" && (
                  <button
                    onClick={handleBack}
                    className="absolute left-6 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                {step === "phone" ? "Enter Phone Number" : "Verify OTP"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {step === "phone" ? (
                <>
                  {/* Phone Input Step */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-600 font-medium text-base">
                            🇮🇳 +91
                          </span>
                        </div>
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={handlePhoneChange}
                          className="pl-20 flex h-14 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-lg font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          disabled={loading}
                          maxLength={10}
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleSendOTP();
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        We'll send you an OTP to verify your number
                      </p>
                    </div>

                    <Button
                      onClick={handleSendOTP}
                      disabled={loading || phone.length !== 10}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Secure & Fast
                        </p>
                        <p className="text-xs text-gray-500">
                          One-time password authentication
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <Bus className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Instant Access
                        </p>
                        <p className="text-xs text-gray-500">
                          New users are registered automatically
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* OTP Input Step */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        Enter the 6-digit OTP sent to{" "}
                        <span className="font-semibold text-gray-900">
                          {maskedPhone || phone}
                        </span>
                      </p>

                      <input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={handleOtpChange}
                        className="flex h-16 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-center text-3xl font-bold tracking-[0.5em] placeholder:text-gray-300 placeholder:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        disabled={loading}
                        maxLength={6}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && otp.length === 6)
                            handleVerifyOTP();
                        }}
                      />

                      <div className="text-xs text-gray-500 mt-2 text-center">
                        OTP valid for 5 minutes
                      </div>
                    </div>

                    {/* Optional Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Help us personalize your experience
                      </p>
                    </div>

                    <Button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      {loading ? "Verifying..." : "Verify & Continue"}
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center space-y-2 pt-2">
                      <button
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || loading}
                        className="text-sm text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Footer Info */}
          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PhoneLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PhoneLoginContent />
    </Suspense>
  );
}
