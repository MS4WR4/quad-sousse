import ar from "@/i18n/messages/ar.json";
import en from "@/i18n/messages/en.json";
import fr from "@/i18n/messages/fr.json";

export const locales = ["fr", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

type Experience = {
  number: string;
  title: string;
  duration: string;
  description: string;
};

export type SiteDictionary = {
  localeName: string;
  nav: {
    circuit: string;
    experiences: string;
    story: string;
    safety: string;
    contact: string;
    book: string;
  };
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    tags: string[];
    modelLabel: string;
    modelHint: string;
    scroll: string;
  };
  ticker: string[];
  intro: {
    eyebrow: string;
    title: string;
    body: string;
    since: string;
    sinceLabel: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    body: string;
    mainAlt: string;
    mainCaption: string;
    archiveAlt: string;
    archiveCaption: string;
    photos: Array<{
      title: string;
      caption: string;
      alt: string;
    }>;
  };
  experiences: {
    eyebrow: string;
    title: string;
    body: string;
    cards: Experience[];
    enquire: string;
  };
  story: {
    eyebrow: string;
    title: string;
    body: string;
    stats: Array<{ value: string; label: string }>;
  };
  journey: {
    eyebrow: string;
    title: string;
    steps: Array<{ title: string; body: string }>;
  };
  safety: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    addressLabel: string;
    address: string;
    hoursLabel: string;
    hours: string;
    call: string;
    email: string;
    whatsapp: string;
  };
  footer: string;
  a11y: {
    mainNavigation: string;
    language: string;
    quadModel: string;
    loadingModel: string;
    unavailableModel: string;
  };
};

export type BookingDictionary = {
  back: string;
  eyebrow: string;
  title: string;
  description: string;
  chooseExperience: string;
  availableDates: string;
  otherDate: string;
  tourDate: string;
  availableTimes: string;
  selectSlotHint: string;
  selectedSlot: string;
  customerDetails: string;
  fullName: string;
  email: string;
  continueToPayment: string;
  paymentTitle: string;
  paymentSecurity: string;
  paymentStarting: string;
  paymentUnavailable: string;
  paymentError: string;
  paymentSuccess: string;
  payNow: string;
  checking: string;
  loadError: string;
  noSlots: string;
  oneQuadLeft: string;
  quadsLeft: string;
};

export type Messages = {
  meta: {
    siteTitle: string;
    siteDescription: string;
    bookingTitle: string;
    bookingDescription: string;
  };
  site: SiteDictionary;
  booking: BookingDictionary;
};

export function isLocale(value: string | null): value is Locale {
  return value !== null && locales.includes(value as Locale);
}

export const dictionaries: Record<Locale, Messages> = { fr, en, ar };
