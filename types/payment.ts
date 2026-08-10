import type { ExperienceId } from "@/lib/experiences";
import type { BOOKING_CURRENCY } from "@/types/time-slot";

export type CreatePaymentIntentRequest = {
  customerName: string;
  email: string;
  date: string;
  timeSlotId: string;
  experience: ExperienceId;
};

export type CreatePaymentIntentSuccessResponse = {
  data: {
    bookingId: string;
    clientSecret: string;
    amount: number;
    currency: typeof BOOKING_CURRENCY;
  };
};

export type CreatePaymentIntentErrorResponse = {
  error: {
    code:
      | "INVALID_REQUEST"
      | "SLOT_UNAVAILABLE"
      | "PAYMENTS_NOT_CONFIGURED"
      | "INTERNAL_ERROR";
    message: string;
  };
};

export type CreatePaymentIntentResponse =
  | CreatePaymentIntentSuccessResponse
  | CreatePaymentIntentErrorResponse;
