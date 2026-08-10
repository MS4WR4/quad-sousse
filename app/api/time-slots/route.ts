import { NextResponse } from "next/server";

import { getBookingHoldCutoff, getUtcDateRange } from "@/lib/booking";
import {
  DEFAULT_EXPERIENCE,
  calculateExperiencePrice,
  isExperienceId,
} from "@/lib/experiences";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_CURRENCY,
  type TimeSlotsApiResponse,
} from "@/types/time-slot";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
): Promise<NextResponse<TimeSlotsApiResponse>> {
  const searchParams = new URL(request.url).searchParams;
  const dateParam = searchParams.get("date");
  const experienceParam = searchParams.get("experience");
  const dateRange = dateParam ? getUtcDateRange(dateParam) : null;
  const experience = experienceParam ?? DEFAULT_EXPERIENCE;

  if (!dateParam || !dateRange) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_DATE",
          message: "Pass a valid date using the YYYY-MM-DD format.",
        },
      },
      { status: 400 },
    );
  }

  if (!isExperienceId(experience)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_EXPERIENCE",
          message: "Pass a valid experience identifier.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const [timeSlots, reservedBookings] = await prisma.$transaction([
      prisma.timeSlot.findMany({
        where: { active: true },
        orderBy: { time: "asc" },
        select: {
          id: true,
          time: true,
          price: true,
          capacity: true,
        },
      }),
      prisma.booking.findMany({
        where: {
          date: {
            gte: dateRange.start,
            lt: dateRange.end,
          },
          OR: [
            { paid: true },
            {
              paid: false,
              stripePaymentIntentId: { not: null },
              createdAt: { gte: getBookingHoldCutoff() },
            },
          ],
        },
        select: { timeSlotId: true },
      }),
    ]);

    const reservedCountBySlot = reservedBookings.reduce<Map<string, number>>(
      (counts, booking) => {
        counts.set(
          booking.timeSlotId,
          (counts.get(booking.timeSlotId) ?? 0) + 1,
        );
        return counts;
      },
      new Map(),
    );

    return NextResponse.json(
      {
        data: {
          date: dateParam,
          experience,
          currency: BOOKING_CURRENCY,
          slots: timeSlots.map((slot) => ({
            ...slot,
            price: calculateExperiencePrice(slot.price, experience),
            availableCapacity: Math.max(
              0,
              slot.capacity - (reservedCountBySlot.get(slot.id) ?? 0),
            ),
          })),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Failed to fetch time-slot availability", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Availability is temporarily unavailable.",
        },
      },
      { status: 500 },
    );
  }
}
