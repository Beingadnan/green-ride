"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Bus, MapPin, Calendar, Clock, Users, ArrowRight, Zap } from "lucide-react";

interface BookingSummaryProps { trip: { date: string; startTime: string; endTime: string; fare: number; bus: { busNumber: string; busName: string; type: string; }; route: { from: string; to: string; distance: number; }; }; selectedSeats: string[]; }

export function BookingSummary({ trip, selectedSeats }: BookingSummaryProps) {
  const totalFare = trip.fare * selectedSeats.length;
  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-br from-primary-50 to-emerald-50 border-b-2 border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <div className="bg-primary-600 p-1.5 rounded-lg"><svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><div className="bg-primary-600 w-8 h-8 rounded-lg flex items-center justify-center"><MapPin className="h-4 w-4 text-white" /></div><span className="font-semibold text-slate-900 text-lg">{trip.route.from}</span></div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className="flex items-center gap-2"><span className="font-semibold text-slate-900 text-lg">{trip.route.to}</span><div className="bg-primary-600 w-8 h-8 rounded-lg flex items-center justify-center"><MapPin className="h-4 w-4 text-white" /></div></div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600"><Zap className="h-3.5 w-3.5 text-primary-600" /><span>{trip.route.distance} km • Electric</span></div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200"><Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" /><div><p className="text-xs text-blue-700 font-medium">Travel Date</p><p className="text-sm font-semibold text-slate-900">{formatDate(trip.date, "PPP")}</p></div></div>
          <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200"><Clock className="h-5 w-5 text-purple-600 flex-shrink-0" /><div><p className="text-xs text-purple-700 font-medium">Departure Time</p><p className="text-sm font-semibold text-slate-900">{formatTime(trip.startTime)} - {formatTime(trip.endTime)}</p></div></div>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200"><Bus className="h-5 w-5 text-emerald-600 flex-shrink-0" /><div className="flex-1"><p className="text-xs text-emerald-700 font-medium">Bus Details</p><p className="text-sm font-semibold text-slate-900">{trip.bus.busName}</p><p className="text-xs text-slate-600">{trip.bus.busNumber} • {trip.bus.type}</p></div></div>
        {selectedSeats.length > 0 ? (
          <div className="bg-primary-50 rounded-xl p-4 border-2 border-primary-200"><div className="flex items-center gap-2 mb-3"><Users className="h-5 w-5 text-primary-600" /><span className="font-semibold text-slate-900">{selectedSeats.length} {selectedSeats.length === 1 ? "Seat" : "Seats"} Selected</span></div><div className="flex flex-wrap gap-1.5">{selectedSeats.sort((a,b)=>parseInt(a.replace(/[A-Z]/g,''))-parseInt(b.replace(/[A-Z]/g,''))).map(seat => (<span key={seat} className="px-2.5 py-1 bg-primary-600 text-white text-xs font-bold rounded-lg">{seat}</span>))}</div></div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center"><Users className="h-8 w-8 text-slate-400 mx-auto mb-2" /><p className="text-sm text-slate-600">No seats selected yet</p></div>
        )}
        <div className="border-t-2 border-slate-200 pt-4 space-y-2"><div className="flex justify-between items-center text-sm"><span className="text-slate-600">Fare per seat</span><span className="font-semibold text-slate-900">{formatCurrency(trip.fare)}</span></div>{selectedSeats.length>0 && (<div className="flex justify-between items-center text-sm"><span className="text-slate-600">Number of seats</span><span className="font-semibold text-slate-900">× {selectedSeats.length}</span></div>)}</div>
        <div className="bg-gradient-to-r from-primary-600 to-emerald-600 rounded-xl p-4 shadow-md"><div className="flex justify-between items-center"><div><p className="text-xs text-primary-100 font-medium">Total Amount</p><p className="text-3xl font-bold text-white">{formatCurrency(totalFare)}</p></div><div className="bg-white/20 p-2 rounded-lg"><svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 002-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div></div></div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200"><div className="flex items-start gap-2"><div className="bg-blue-600 text-white p-1 rounded mt-0.5"><svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg></div><p className="text-xs text-blue-800 leading-relaxed">Your seats will be held for 15 minutes. Complete payment to confirm your booking.</p></div></div>
      </CardContent>
    </Card>
  );
}


