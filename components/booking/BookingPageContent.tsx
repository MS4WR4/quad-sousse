"use client";

import Image from "next/image";
import Link from "next/link";

import { BookingAvailability } from "@/components/booking/BookingAvailability";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import type { ExperienceId } from "@/lib/experiences";
import agencyLogo from "@/public/brand/quad-sousse-logo-4x.png";

export function BookingPageContent({
  initialExperience,
  initialPaymentSuccess,
}: {
  initialExperience: ExperienceId;
  initialPaymentSuccess: boolean;
}) {
  const { locale, messages } = useLanguage();
  const t = messages.booking;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--color-red)_10%,transparent),transparent_28%),var(--color-white)] px-5 py-7 text-[var(--color-blue)] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            className="rounded-xl bg-[var(--color-white)] px-3 py-2 shadow-lg"
            href={`/${locale}`}
          >
            <Image
              alt="Quad Sousse Loisirs"
              className="h-auto w-32 sm:w-40"
              loading="eager"
              quality={100}
              src={agencyLogo}
            />
          </Link>
          <LanguageSwitcher />
        </div>

        <Link
          className="mt-10 inline-flex text-sm font-black uppercase tracking-[0.14em] text-[var(--color-grey-deep)] transition hover:text-[var(--color-red)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-red)]"
          href={`/${locale}`}
        >
          <span aria-hidden="true">←&nbsp;</span>
          {t.back}
        </Link>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
          <div className="lg:sticky lg:top-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[var(--color-red)]">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 text-5xl font-black uppercase leading-none tracking-[-0.055em] sm:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-md leading-7 text-[var(--color-blue)]/62">
              {t.description}
            </p>
          </div>
          <BookingAvailability
            initialExperience={initialExperience}
            initialPaymentSuccess={initialPaymentSuccess}
          />
        </div>
      </div>
    </main>
  );
}
