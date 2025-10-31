"use client";

import * as React from "react";
import { Seat } from "@/components/ui/Seat";
import { SEAT_LAYOUT } from "@/lib/constants";
import { CheckCircle2, Circle, XCircle, Grip } from "lucide-react";

interface SeatMapProps { availableSeats: string[]; bookedSeats: string[]; selectedSeats: string[]; onSeatSelect: (seatNumber: string) => void; maxSeats?: number; }

export function SeatMap({ availableSeats, bookedSeats, selectedSeats, onSeatSelect, maxSeats = 6 }: SeatMapProps) {
  const getSeatStatus = (seatNumber: string | null): "available" | "selected" | "booked" | "unavailable" => {
    if (!seatNumber || seatNumber === "D") return "unavailable";
    if (selectedSeats.includes(seatNumber)) return "selected";
    if (bookedSeats.includes(seatNumber)) return "booked";
    if (availableSeats.includes(seatNumber)) return "available";
    return "unavailable";
  };

  const handleSeatClick = (seatNumber: string) => {
    const status = getSeatStatus(seatNumber);
    if (status === "available") {
      if (selectedSeats.length >= maxSeats) { alert(`You can select maximum ${maxSeats} seats`); return; }
      onSeatSelect(seatNumber);
    } else if (status === "selected") {
      onSeatSelect(seatNumber);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-primary-200"><Circle className="h-4 w-4 text-primary-600" /><span className="font-medium text-slate-700">Available</span></div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-100 border border-primary-300"><CheckCircle2 className="h-4 w-4 text-primary-600" /><span className="font-medium text-slate-700">Selected</span></div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-300"><XCircle className="h-4 w-4 text-slate-500" /><span className="font-medium text-slate-700">Booked</span></div>
      </div>
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-soft">
        <div className="mb-6 pb-6 border-b-2 border-slate-200"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-slate-600"><Grip className="h-5 w-5" /><span className="text-sm font-medium">Front of Bus</span></div><div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-2xl shadow-md">🚗</div></div></div>
        <div className="space-y-3">
          {SEAT_LAYOUT.layout.slice(1, -1).map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-3">
              {row.map((seat, seatIndex) => (
                <div key={seatIndex}>{seat === null ? (<div className="w-12"></div>) : (<Seat seatNumber={seat as string} status={getSeatStatus(seat as string)} onClick={() => handleSeatClick(seat as string)} />)}</div>
              ))}
            </div>
          ))}
          <div className="flex justify-center gap-3 mt-6 pt-6 border-t-2 border-slate-200">
            {SEAT_LAYOUT.layout[SEAT_LAYOUT.layout.length - 1].map((seat, index) => (seat && (<Seat key={index} seatNumber={seat} status={getSeatStatus(seat)} onClick={() => handleSeatClick(seat)} />)))}
          </div>
        </div>
      </div>
      {selectedSeats.length > 0 && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 animate-slide-up">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary-600" /><span className="text-sm font-semibold text-primary-900">{selectedSeats.length} {selectedSeats.length === 1 ? "Seat" : "Seats"} Selected</span></div><div className="flex flex-wrap gap-1">{selectedSeats.sort((a,b)=>parseInt(a.replace(/[A-Z]/g,''))-parseInt(b.replace(/[A-Z]/g,''))).map(seat => (<span key={seat} className="px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg">{seat}</span>))}</div></div>
        </div>
      )}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl"><div className="bg-blue-600 text-white p-1.5 rounded-lg mt-0.5"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 8 8 0 0118 0z" /></svg></div><div className="flex-1"><p className="text-sm font-medium text-blue-900">Pro Tip</p><p className="text-xs text-blue-700 mt-1">Select seats in the middle rows for the smoothest ride. You can select up to {maxSeats} seats at once.</p></div></div>
    </div>
  );
}


