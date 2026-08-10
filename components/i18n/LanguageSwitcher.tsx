"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { dictionaries, locales } from "@/i18n/site";

export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useLanguage();

  return (
    <div
      aria-label={messages.site.a11y.language}
      className="flex rounded-full border border-[var(--color-blue)]/15 bg-[var(--color-white)]/85 p-1 text-[10px] font-black uppercase tracking-[0.08em] shadow-sm backdrop-blur"
      role="group"
    >
      {locales.map((option) => (
        <button
          aria-pressed={option === locale}
          className={`grid h-7 min-w-8 place-items-center rounded-full px-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-red)] ${
            option === locale
              ? "bg-[var(--color-red)] text-[var(--color-white)]"
              : "text-[var(--color-blue)]/48 hover:text-[var(--color-blue)]"
          }`}
          key={option}
          onClick={() => setLocale(option)}
          title={dictionaries[option].site.localeName}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
