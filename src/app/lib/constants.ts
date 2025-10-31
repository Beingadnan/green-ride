export const ROUTES = {
  JHUMRI_TELAIYA_TO_RANCHI: {
    from: "Jhumri Telaiya",
    to: "Ranchi",
    stops: ["Jhumri Telaiya", "Barhi", "Hazaribagh", "Ramgarh", "Ranchi"],
    distance: 150,
  },
  RANCHI_TO_JHUMRI_TELAIYA: {
    from: "Ranchi",
    to: "Jhumri Telaiya",
    stops: ["Ranchi", "Ramgarh", "Hazaribagh", "Barhi", "Jhumri Telaiya"],
    distance: 150,
  },
};

export const BUS_TIMINGS = [
  { startTime: "07:00", endTime: "10:00", name: "Morning Express" },
  { startTime: "11:00", endTime: "14:00", name: "Noon Comfort" },
  { startTime: "15:00", endTime: "18:00", name: "Evening Ride" },
  { startTime: "19:00", endTime: "22:00", name: "Night Express" },
];

export const SEAT_LAYOUT = {
  totalSeats: 61,
  rows: 15,
  layout: [
    [null, null, "D", null],
    ...Array.from({ length: 14 }, (_, i) => {
      const rowStart = i * 4 + 1;
      return [
        `${rowStart}`,
        `${rowStart + 1}`,
        null,
        `${rowStart + 2}`,
        `${rowStart + 3}`,
      ];
    }),
    ["57", "58", "59", "60", "61"],
  ],
};

export const SEAT_TYPES = {
  AVAILABLE: "available",
  SELECTED: "selected",
  BOOKED: "booked",
  UNAVAILABLE: "unavailable",
};

export const USER_ROLES = { USER: "user", ADMIN: "admin" };
export const BOOKING_STATUS = { PENDING: "pending", CONFIRMED: "confirmed", CANCELLED: "cancelled", COMPLETED: "completed" };
export const PAYMENT_STATUS = { PENDING: "pending", SUCCESS: "success", FAILED: "failed", REFUNDED: "refunded" };
export const CITIES = ["Jhumri Telaiya", "Barhi", "Hazaribagh", "Ramgarh", "Ranchi"];
export const BASE_FARE = 300;
export const FARE_PER_KM = 2;


