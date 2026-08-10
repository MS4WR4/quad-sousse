import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { LandingPage } from "@/components/landing/LandingPage";
import { dictionaries, isLocale, locales } from "@/i18n/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const { meta } = dictionaries[locale];

  return {
    title: { absolute: meta.siteTitle },
    description: meta.siteDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: { fr: "/fr", en: "/en", ar: "/ar" },
    },
  };
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <LanguageProvider initialLocale={locale}>
      <LandingPage />
    </LanguageProvider>
  );
}
