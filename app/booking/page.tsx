import type { Metadata } from "next";

import { BookingPageContent } from "@/components/booking/BookingPageContent";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { dictionaries } from "@/i18n/site";
import { DEFAULT_EXPERIENCE, isExperienceId } from "@/lib/experiences";

export const metadata: Metadata = {
  title: { absolute: dictionaries.fr.meta.bookingTitle },
  description: dictionaries.fr.meta.bookingDescription,
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{
    experience?: string;
    redirect_status?: string;
  }>;
}) {
  const query = await searchParams;
  const initialExperience = isExperienceId(query.experience)
    ? query.experience
    : DEFAULT_EXPERIENCE;

  return (
    <LanguageProvider initialLocale="fr">
      <BookingPageContent
        initialExperience={initialExperience}
        initialPaymentSuccess={query.redirect_status === "succeeded"}
      />
    </LanguageProvider>
  );
}
