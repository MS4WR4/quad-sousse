"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  DEFAULT_EXPERIENCE,
  EXPERIENCE_IDS,
  type ExperienceId,
} from "@/lib/experiences";
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from "@/types/payment";
import type {
  TimeSlotAvailability,
  TimeSlotsApiResponse,
} from "@/types/time-slot";

const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

export function BookingAvailability({
  initialExperience,
  initialPaymentSuccess,
}: {
  initialExperience: ExperienceId;
  initialPaymentSuccess: boolean;
}) {
  const { locale, messages } = useLanguage();
  const t = messages.booking;
  const experiences = messages.site.experiences.cards;
  const dateOptions = useMemo(() => getUpcomingDates(locale), [locale]);
  const [experience, setExperience] =
    useState<ExperienceId>(initialExperience ?? DEFAULT_EXPERIENCE);
  const [date, setDate] = useState(
    () => getUpcomingDates("en")[0]?.value ?? "",
  );
  const [response, setResponse] = useState<TimeSlotsApiResponse | null>(null);
  const [selectedSlot, setSelectedSlot] =
    useState<TimeSlotAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(initialPaymentSuccess);

  useEffect(() => {
    if (!date) return;

    const controller = new AbortController();
    let active = true;

    fetch(
      `/api/time-slots?date=${encodeURIComponent(date)}&experience=${encodeURIComponent(experience)}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (result) => {
        const body = (await result.json()) as TimeSlotsApiResponse;
        if (active) setResponse(body);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) {
          setResponse({
            error: {
              code: "INTERNAL_ERROR",
              message: t.loadError,
            },
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [date, experience, t.loadError]);

  const selectedExperienceIndex = EXPERIENCE_IDS.indexOf(experience);
  const selectedExperience = experiences[selectedExperienceIndex];
  const currency =
    response && "data" in response ? response.data.currency : "TND";

  const chooseExperience = (nextExperience: ExperienceId) => {
    setExperience(nextExperience);
    setPaymentSuccess(false);
    resetAvailabilitySelection();
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("experience", nextExperience);
    nextUrl.searchParams.delete("payment_intent");
    nextUrl.searchParams.delete("payment_intent_client_secret");
    nextUrl.searchParams.delete("redirect_status");
    window.history.replaceState(window.history.state, "", nextUrl);
  };

  const chooseDate = (nextDate: string) => {
    setDate(nextDate);
    resetAvailabilitySelection();
  };

  const resetAvailabilitySelection = () => {
    setLoading(true);
    setResponse(null);
    setSelectedSlot(null);
    setClientSecret("");
    setPaymentError("");
  };

  const startPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot) return;

    if (!stripePromise) {
      setPaymentError(t.paymentUnavailable);
      return;
    }

    setCheckoutLoading(true);
    setPaymentError("");

    const payload: CreatePaymentIntentRequest = {
      customerName,
      email,
      date,
      timeSlotId: selectedSlot.id,
      experience,
    };

    try {
      const result = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await result.json()) as CreatePaymentIntentResponse;

      if (!result.ok || "error" in body) {
        throw new Error("PaymentIntent creation failed");
      }

      setClientSecret(body.data.clientSecret);
      setCheckoutAmount(body.data.amount);
    } catch {
      setPaymentError(t.paymentError);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--color-blue)]/12 bg-[var(--color-white)] p-5 shadow-[0_24px_80px_rgba(7,21,40,.08)] sm:p-8">
        <StepLabel number="01" text={t.chooseExperience} />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {experiences.map((item, index) => {
            const experienceId = EXPERIENCE_IDS[index];
            const selected = experienceId === experience;

            return (
              <button
                aria-pressed={selected}
                className={`rounded-2xl border px-4 py-4 text-start transition ${
                  selected
                    ? "border-[var(--color-red)] bg-[var(--color-red)] text-white shadow-[0_12px_30px_rgba(240,24,50,.22)]"
                    : "border-[var(--color-blue)]/12 bg-white text-[var(--color-blue)] hover:border-[var(--color-red)]"
                }`}
                key={experienceId}
                onClick={() => chooseExperience(experienceId)}
                type="button"
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.18em] opacity-60">
                  {item.duration}
                </span>
                <span className="mt-2 block font-black leading-tight">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-blue)]/12 bg-[var(--color-white)] p-5 shadow-[0_24px_80px_rgba(7,21,40,.08)] sm:p-8">
        <StepLabel number="02" text={t.availableDates} />
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dateOptions.map((option) => {
            const selected = option.value === date;
            return (
              <button
                aria-pressed={selected}
                className={`rounded-2xl border px-3 py-3 text-start transition ${
                  selected
                    ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white"
                    : "border-[var(--color-blue)]/12 hover:border-[var(--color-red)]"
                }`}
                key={option.value}
                onClick={() => chooseDate(option.value)}
                type="button"
              >
                <span className="block text-[10px] font-black uppercase tracking-[0.14em] opacity-65">
                  {option.weekday}
                </span>
                <span className="mt-1 block text-sm font-black capitalize">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <label
          className="mt-6 block text-xs font-black uppercase tracking-[0.16em] text-[var(--color-blue)]/55"
          htmlFor="tour-date"
        >
          {t.otherDate}
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--color-blue)]/15 bg-[var(--color-grey-light)]/45 px-4 py-3 text-[var(--color-blue)] outline-none transition focus:border-[var(--color-red)] focus-visible:ring-2 focus-visible:ring-[var(--color-red)]"
          id="tour-date"
          min={new Date().toISOString().slice(0, 10)}
          onChange={(event) => chooseDate(event.target.value)}
          type="date"
          value={date}
        />
      </section>

      <section className="rounded-3xl border border-[var(--color-blue)]/12 bg-[var(--color-white)] p-5 shadow-[0_24px_80px_rgba(7,21,40,.08)] sm:p-8">
        <StepLabel number="03" text={t.availableTimes} />
        <div aria-live="polite" className="mt-5">
          {loading ? (
            <p className="text-[var(--color-grey-deep)]/70">{t.checking}</p>
          ) : null}
          {!loading && response && "error" in response ? (
            <p className="rounded-2xl border border-[var(--color-red)]/35 bg-[var(--color-red)]/10 p-4 text-[var(--color-blue)]">
              {t.loadError}
            </p>
          ) : null}
          {!loading && response && "data" in response ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {response.data.slots.length === 0 ? (
                <p className="sm:col-span-2 text-[var(--color-grey-deep)]/70">
                  {t.noSlots}
                </p>
              ) : (
                response.data.slots.map((slot) => {
                  const selected = selectedSlot?.id === slot.id;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-start transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)] disabled:cursor-not-allowed disabled:opacity-45 ${
                        selected
                          ? "border-[var(--color-red)] bg-[var(--color-red)]/8"
                          : "border-[var(--color-blue)]/12 bg-[var(--color-white)] hover:border-[var(--color-red)] hover:bg-[var(--color-grey-light)]/35"
                      }`}
                      disabled={slot.availableCapacity === 0}
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setClientSecret("");
                        setPaymentError("");
                      }}
                      type="button"
                    >
                      <span>
                        <span className="block text-lg font-black">
                          {slot.time}
                        </span>
                        <span className="text-sm text-[var(--color-grey-deep)]/65">
                          {slot.availableCapacity === 1
                            ? t.oneQuadLeft
                            : t.quadsLeft.replace(
                                "{count}",
                                String(slot.availableCapacity),
                              )}
                        </span>
                      </span>
                      <span className="font-black text-[var(--color-red)]">
                        {formatPrice(slot.price, response.data.currency, locale)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          ) : null}
          {!loading && !selectedSlot ? (
            <p className="mt-4 text-sm text-[var(--color-blue)]/52">
              {t.selectSlotHint}
            </p>
          ) : null}
        </div>
      </section>

      {selectedSlot && !paymentSuccess ? (
        <section className="rounded-3xl border border-[var(--color-blue)]/12 bg-[var(--color-white)] p-5 shadow-[0_24px_80px_rgba(7,21,40,.08)] sm:p-8">
          <StepLabel number="04" text={t.customerDetails} />
          <div className="mt-5 rounded-2xl bg-[var(--color-blue)] p-5 text-white">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
              {t.selectedSlot}
            </span>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <strong className="block text-xl">{selectedExperience.title}</strong>
                <span className="text-sm text-white/68">
                  {formatHumanDate(date, locale)} · {selectedSlot.time}
                </span>
              </div>
              <strong className="text-xl text-[var(--color-red-light)]">
                {formatPrice(selectedSlot.price, currency, locale)}
              </strong>
            </div>
          </div>

          {!clientSecret ? (
            <form className="mt-6 grid gap-4" onSubmit={startPayment}>
              <label className="grid gap-2 text-sm font-black" htmlFor="customer-name">
                {t.fullName}
                <input
                  autoComplete="name"
                  className="rounded-2xl border border-[var(--color-blue)]/15 bg-[var(--color-grey-light)]/35 px-4 py-3 font-normal outline-none focus:border-[var(--color-red)]"
                  id="customer-name"
                  maxLength={100}
                  minLength={2}
                  onChange={(event) => setCustomerName(event.target.value)}
                  required
                  type="text"
                  value={customerName}
                />
              </label>
              <label className="grid gap-2 text-sm font-black" htmlFor="customer-email">
                {t.email}
                <input
                  autoComplete="email"
                  className="rounded-2xl border border-[var(--color-blue)]/15 bg-[var(--color-grey-light)]/35 px-4 py-3 font-normal outline-none focus:border-[var(--color-red)]"
                  id="customer-email"
                  maxLength={160}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
              </label>
              <button
                className="mt-2 rounded-2xl bg-[var(--color-red)] px-5 py-4 font-black uppercase tracking-[0.1em] text-white transition hover:bg-[var(--color-red-deep)] disabled:cursor-wait disabled:opacity-60"
                disabled={checkoutLoading}
                type="submit"
              >
                {checkoutLoading ? t.paymentStarting : t.continueToPayment}
              </button>
            </form>
          ) : null}

          {paymentError ? (
            <p className="mt-4 rounded-2xl border border-[var(--color-red)]/35 bg-[var(--color-red)]/8 p-4 text-sm text-[var(--color-blue)]">
              {paymentError}
            </p>
          ) : null}

          {clientSecret && stripePromise ? (
            <div className="mt-8 border-t border-[var(--color-blue)]/10 pt-7">
              <h3 className="text-2xl font-black">{t.paymentTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-blue)]/58">
                {t.paymentSecurity}
              </p>
              <Elements
                key={clientSecret}
                options={{
                  clientSecret,
                  locale,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#f01832",
                      colorText: "#071528",
                      colorBackground: "#ffffff",
                      colorDanger: "#d8122a",
                      borderRadius: "14px",
                      fontFamily: "Manrope Variable, sans-serif",
                    },
                  },
                }}
                stripe={stripePromise}
              >
                <StripePaymentForm
                  amount={checkoutAmount}
                  currency={currency}
                  locale={locale}
                  onError={() => setPaymentError(t.paymentError)}
                  onSuccess={() => setPaymentSuccess(true)}
                  payLabel={t.payNow}
                />
              </Elements>
            </div>
          ) : null}
        </section>
      ) : null}

      {paymentSuccess ? (
        <div
          aria-live="polite"
          className="rounded-3xl border border-[var(--color-blue)]/12 bg-[var(--color-blue)] p-7 text-white shadow-[0_24px_80px_rgba(7,21,40,.16)]"
        >
          <span className="grid size-11 place-items-center rounded-full bg-[var(--color-red)] text-xl font-black">
            ✓
          </span>
          <p className="mt-5 text-xl font-black">{t.paymentSuccess}</p>
        </div>
      ) : null}
    </div>
  );
}

function StripePaymentForm({
  amount,
  currency,
  locale,
  onError,
  onSuccess,
  payLabel,
}: {
  amount: number;
  currency: string;
  locale: string;
  onError: () => void;
  onSuccess: () => void;
  payLabel: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking`,
      },
      redirect: "if_required",
    });
    setSubmitting(false);

    if (result.error) {
      onError();
      return;
    }

    if (result.paymentIntent?.status === "succeeded") onSuccess();
  };

  return (
    <form className="mt-6" onSubmit={submitPayment}>
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        className="mt-6 w-full rounded-2xl bg-[var(--color-red)] px-5 py-4 font-black uppercase tracking-[0.1em] text-white transition hover:bg-[var(--color-red-deep)] disabled:cursor-wait disabled:opacity-60"
        disabled={!stripe || !elements || submitting}
        type="submit"
      >
        {payLabel} · {formatPrice(amount, currency, locale)}
      </button>
    </form>
  );
}

function StepLabel({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-full bg-[var(--color-red)] text-xs font-black text-white">
        {number}
      </span>
      <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[var(--color-blue)]">
        {text}
      </h2>
    </div>
  );
}

function getUpcomingDates(locale: string) {
  const weekdayFormatter = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-TN" : `${locale}-TN`,
    { weekday: "short" },
  );
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-TN" : `${locale}-TN`,
    { day: "numeric", month: "short" },
  );
  const today = new Date();

  return Array.from({ length: 8 }, (_, index) => {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + index + 1);
    nextDate.setHours(12, 0, 0, 0);

    return {
      value: toDateInputValue(nextDate),
      weekday: weekdayFormatter.format(nextDate),
      label: dateFormatter.format(nextDate),
    };
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHumanDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-TN" : `${locale}-TN`,
    { weekday: "long", day: "numeric", month: "long" },
  ).format(new Date(`${date}T12:00:00`));
}

function formatPrice(amount: number, currency: string, locale: string): string {
  const numberLocale = locale === "ar" ? "ar-TN" : `${locale}-TN`;

  return new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency,
  }).format(amount / 1_000);
}
