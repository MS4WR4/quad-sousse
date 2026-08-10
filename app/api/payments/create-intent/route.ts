import { NextResponse } from "next/server";

import { getBookingHoldCutoff, getUtcDateRange } from "@/lib/booking";
import {
  calculateExperiencePrice,
  isExperienceId,
} from "@/lib/experiences";
import { prisma } from "@/lib/prisma";
import { getStripeServer } from "@/lib/stripe";
import { BOOKING_CURRENCY } from "@/types/time-slot";
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from "@/types/payment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: Request,
): Promise<NextResponse<CreatePaymentIntentResponse>> {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ) {
    return paymentError(
      "PAYMENTS_NOT_CONFIGURED",
      "Online payments are not configured yet.",
      503,
    );
  }

  let payload: Partial<CreatePaymentIntentRequest>;

  try {
    payload = (await request.json()) as Partial<CreatePaymentIntentRequest>;
  } catch {
    return paymentError("INVALID_REQUEST", "Invalid JSON payload.", 400);
  }

  const customerName = payload.customerName?.trim() ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  const bookingDate = payload.date ?? "";
  const dateRange = getUtcDateRange(bookingDate);
  const timeSlotId = payload.timeSlotId?.trim() ?? "";
  const experience = payload.experience;

  if (
    customerName.length < 2 ||
    customerName.length > 100 ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 160 ||
    !dateRange ||
    dateRange.end <= new Date() ||
    timeSlotId.length < 5 ||
    !isExperienceId(experience)
  ) {
    return paymentError(
      "INVALID_REQUEST",
      "Check the customer, experience, date and time-slot details.",
      400,
    );
  }

  try {
    const timeSlot = await prisma.timeSlot.findFirst({
      where: { id: timeSlotId, active: true },
      select: { id: true, time: true, price: true, capacity: true },
    });

    if (!timeSlot) {
      return paymentError(
        "SLOT_UNAVAILABLE",
        "This time slot is no longer available.",
        409,
      );
    }

    const reservedCount = await prisma.booking.count({
      where: {
        timeSlotId,
        date: { gte: dateRange.start, lt: dateRange.end },
        OR: [
          { paid: true },
          {
            paid: false,
            stripePaymentIntentId: { not: null },
            createdAt: { gte: getBookingHoldCutoff() },
          },
        ],
      },
    });

    if (reservedCount >= timeSlot.capacity) {
      return paymentError(
        "SLOT_UNAVAILABLE",
        "This time slot has just sold out. Please choose another time.",
        409,
      );
    }

    const amount = calculateExperiencePrice(
      timeSlot.price,
      experience,
    );
    const booking = await prisma.booking.create({
      data: {
        customerName,
        email,
        experience,
        amount,
        currency: BOOKING_CURRENCY,
        date: dateRange.start,
        timeSlotId,
      },
      select: { id: true },
    });

    try {
      const paymentIntent = await getStripeServer().paymentIntents.create({
        amount,
        currency: BOOKING_CURRENCY.toLowerCase(),
        receipt_email: email,
        automatic_payment_methods: { enabled: true },
        description: `Quad Sousse ${experience} - ${bookingDate} ${timeSlot.time}`,
        metadata: {
          bookingId: booking.id,
          experience,
          date: bookingDate,
          timeSlotId,
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error("Stripe did not return a PaymentIntent client secret.");
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });

      return NextResponse.json(
        {
          data: {
            bookingId: booking.id,
            clientSecret: paymentIntent.client_secret,
            amount,
            currency: BOOKING_CURRENCY,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {
        // A failed cleanup is safe: unpaid holds automatically expire.
      });
      throw error;
    }
  } catch (error) {
    console.error("Failed to create Stripe PaymentIntent", error);
    return paymentError(
      "INTERNAL_ERROR",
      "Payment could not be started. Please try again.",
      500,
    );
  }
}

function paymentError(
  code: Extract<
    CreatePaymentIntentResponse,
    { error: unknown }
  >["error"]["code"],
  message: string,
  status: number,
): NextResponse<CreatePaymentIntentResponse> {
  return NextResponse.json({ error: { code, message } }, { status });
}
