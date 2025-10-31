"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface SeatProps { seatNumber: string; status: "available"|"selected"|"booked"|"unavailable"; onClick?: () => void; title?: string; }

export function Seat({ seatNumber, status, onClick, title }: SeatProps) {
  const isClickable = status === "available" || status === "selected";
  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      title={title || `Seat ${seatNumber}`}
      className={cn(
        "relative w-10 h-12 md:w-12 md:h-14 rounded-md transition-all duration-200 flex flex-col items-center justify-end",
        "border",
        {
          // RedBus-like palette: available = white with green border/text
          "bg-white border-green-600 text-green-700 hover:bg-green-50 hover:shadow cursor-pointer": status === "available",
          // Selected = solid green
          "bg-green-600 border-green-700 text-white shadow-md cursor-pointer": status === "selected",
          // Booked = muted gray
          "bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed opacity-70": status === "booked",
          // Unavailable = transparent (layout spacer)
          "bg-transparent border-transparent cursor-not-allowed invisible": status === "unavailable",
        }
      )}
      aria-label={`Seat ${seatNumber} - ${status}`}
    >
      {/* Headrest strip */}
      <div
        className={cn(
          "absolute -top-1.5 md:-top-2 w-6 md:w-8 h-1.5 md:h-2 rounded-sm",
          status === "available" && "bg-green-600",
          status === "selected" && "bg-white/90",
          status === "booked" && "bg-slate-400",
        )}
      />
      {/* Seat number or check icon */}
      <div className="pb-1 md:pb-1.5 text-[10px] md:text-xs font-semibold select-none">
        {status === "selected" ? (<Check className="h-4 w-4 md:h-5 md:w-5" strokeWidth={3} />) : seatNumber}
      </div>
    </button>
  );
}


