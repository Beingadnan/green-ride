"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";

interface PaymentFormProps { onSubmit: (data: PassengerDetails) => void; processing?: boolean; onBack?: () => void; }
export interface PassengerDetails { name: string; email: string; phone: string; }

export function PaymentForm({ onSubmit, processing = false, onBack }: PaymentFormProps) {
  const [formData, setFormData] = useState<PassengerDetails>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<PassengerDetails>>({});
  const validateForm = (): boolean => {
    const newErrors: Partial<PassengerDetails> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"; else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Invalid phone number (10 digits starting with 6-9)";
    setErrors(newErrors); return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (validateForm()) onSubmit(formData); };
  const handleChange = (field: keyof PassengerDetails) => (e: React.ChangeEvent<HTMLInputElement>) => { setFormData(prev => ({ ...prev, [field]: e.target.value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined })); };
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Passenger Details</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" type="text" placeholder="Enter your full name" value={formData.name} onChange={handleChange("name")} error={errors.name} disabled={processing} />
          <Input label="Email Address" type="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange("email")} error={errors.email} disabled={processing} />
          <Input label="Phone Number" type="tel" placeholder="10-digit mobile number" value={formData.phone} onChange={handleChange("phone")} error={errors.phone} maxLength={10} disabled={processing} />
          <div className="pt-4 flex gap-3">
            {onBack && (<Button type="button" variant="outline" onClick={onBack} className="flex-1" size="lg">Back</Button>)}
            <Button type="submit" className="flex-1" size="lg" disabled={processing} loading={processing}>{processing ? "Processing..." : "Proceed to Payment"}</Button>
          </div>
          <p className="text-xs text-gray-500 text-center">By proceeding, you agree to our Terms & Conditions</p>
        </form>
      </CardContent>
    </Card>
  );
}


