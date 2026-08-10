import type { ExperienceId } from "@/lib/experiences";

export const BOOKING_CURRENCY = "TND" as const;

export type TimeSlotAvailability = {
  id: string;
  time: string;
  price: number;
  capacity: number;
  availableCapacity: number;
};

export type TimeSlotsSuccessResponse = {
  data: {
    date: string;
    experience: ExperienceId;
    currency: typeof BOOKING_CURRENCY;
    slots: TimeSlotAvailability[];
  };
};

export type TimeSlotsErrorResponse = {
  error: {
    code: "INVALID_DATE" | "INVALID_EXPERIENCE" | "INTERNAL_ERROR";
    message: string;
  };
};

export type TimeSlotsApiResponse =
  | TimeSlotsSuccessResponse
  | TimeSlotsErrorResponse;
