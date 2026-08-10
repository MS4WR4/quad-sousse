"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  dictionaries,
  isLocale,
  type Locale,
  type Messages,
} from "@/i18n/site";

const STORAGE_KEY = "quad-sousse-locale";

type LanguageContextValue = {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const applyLocale = useCallback((nextLocale: Locale, updateUrl: boolean) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = nextLocale === "ar" ? "rtl" : "ltr";

    if (updateUrl) {
      const segments = window.location.pathname.split("/");
      if (isLocale(segments[1] ?? null)) {
        segments[1] = nextLocale;
        const nextUrl = `${segments.join("/")}${window.location.search}${window.location.hash}`;
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }
  }, []);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(STORAGE_KEY);
    let frameId: number | null = null;

    if (isLocale(storedLocale) && storedLocale !== initialLocale) {
      frameId = window.requestAnimationFrame(() => {
        applyLocale(storedLocale, true);
      });
    } else {
      window.localStorage.setItem(STORAGE_KEY, initialLocale);
      document.documentElement.lang = initialLocale;
      document.documentElement.dir = initialLocale === "ar" ? "rtl" : "ltr";
    }

    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [applyLocale, initialLocale]);

  const setLocale = useCallback(
    (nextLocale: Locale) => applyLocale(nextLocale, true),
    [applyLocale],
  );

  const value = useMemo(
    () => ({ locale, messages: dictionaries[locale], setLocale }),
    [locale, setLocale],
  );

  useEffect(() => {
    const meta = dictionaries[locale].meta;
    const isBookingPage = window.location.pathname.startsWith("/booking");
    const title = isBookingPage ? meta.bookingTitle : meta.siteTitle;
    const description = isBookingPage
      ? meta.bookingDescription
      : meta.siteDescription;

    document.title = title;
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [locale]);

  return (
    <LanguageContext.Provider value={value}>
      <div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
