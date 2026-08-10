import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/site";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      {children}
    </div>
  );
}
