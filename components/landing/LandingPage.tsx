"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { useRef } from "react";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { QuadCanvas } from "@/components/three/QuadCanvas";
import type { Locale, SiteDictionary } from "@/i18n/site";
import { EXPERIENCE_IDS } from "@/lib/experiences";
import agencyLogo from "@/public/brand/quad-sousse-logo-4x.png";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=0021623703703&text=Bonjour%2C+je+souhaite+joindre+un+conseiller.";

const REAL_EXPERIENCE_IMAGES = [
  "/images/real-experiences/fleet-lineup.webp?v=20260810-hq",
  "/images/real-experiences/quad-group.webp?v=20260810-hq",
  "/images/real-experiences/quad-guests.webp?v=20260810-hq",
  "/images/real-experiences/trail-lineup.webp?v=20260810-hq",
  "/images/real-experiences/camel-trail.webp?v=20260810-hq",
  "/images/real-experiences/camel-caravan.webp?v=20260810-hq",
  "/images/real-experiences/rosa-transfer.webp?v=20260810-hq",
] as const;

const REAL_EXPERIENCE_LAYOUTS = [
  "lg:col-span-8 lg:row-span-2 min-h-[430px] lg:min-h-[680px]",
  "lg:col-span-4 lg:min-h-[330px]",
  "lg:col-span-4 lg:min-h-[330px]",
  "lg:col-span-5 lg:row-span-2 min-h-[520px] lg:min-h-[690px]",
  "lg:col-span-7 min-h-[390px] lg:min-h-[335px]",
  "lg:col-span-7 min-h-[390px] lg:min-h-[335px]",
  "lg:col-span-12 min-h-[300px] lg:min-h-[440px]",
] as const;

const OFFER_IMAGES = [
  "/images/offers/quad-experience.webp?v=20260810-hq",
  "/images/offers/camel-experience.webp?v=20260810-hq",
  "/images/offers/quad-camel-experience.webp?v=20260810-hq",
] as const;

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 42 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export function LandingPage() {
  const { locale, messages } = useLanguage();
  const t = messages.site;
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const pageProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.2,
  });
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroCopyY = useTransform(heroProgress, [0, 1], [0, 110]);
  const heroCanvasY = useTransform(heroProgress, [0, 1], [0, 190]);
  const heroOpacity = useTransform(heroProgress, [0, 0.82], [1, 0]);
  const isArabic = locale === "ar";

  const reveal = {
    initial: reduceMotion ? undefined : "hidden",
    whileInView: "visible",
    viewport: { once: true, amount: 0.2 },
    variants: revealVariants,
  } as const;

  return (
    <main className="overflow-clip bg-[var(--color-white)] text-[var(--color-blue)]">
      <motion.div
        className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-[var(--color-red)]"
        style={{ scaleX: pageProgress }}
      />

      <section
        className="relative isolate min-h-[100svh] overflow-hidden border-b border-[var(--color-blue)]/10"
        ref={heroRef}
      >
        <div className="absolute inset-0 -z-30 bg-[var(--color-white)]" />
        <div className="absolute -right-[18vw] -top-[34vw] -z-20 size-[74vw] rounded-full border-[1px] border-[var(--color-blue)]/10 bg-[radial-gradient(circle,rgba(227,232,238,.88)_0%,rgba(255,255,255,0)_67%)]" />
        <motion.div
          animate={reduceMotion ? undefined : { rotate: [0, 360] }}
          className="absolute right-[4vw] top-[15vh] -z-10 size-[42vw] min-h-80 min-w-80 rounded-full border border-dashed border-[var(--color-red)]/25"
          transition={{ duration: 45, ease: "linear", repeat: Infinity }}
        />
        <div className="qs-grid absolute inset-0 -z-10 opacity-50" />
        <div className="qs-grain pointer-events-none absolute inset-0 z-20 opacity-[0.035]" />

        <Header locale={locale} t={t} />

        <div className="mx-auto grid min-h-[calc(100svh-104px)] min-w-0 w-full max-w-[1500px] items-center gap-3 px-5 pb-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 min-w-0 max-w-full py-12 lg:py-0"
            initial={reduceMotion ? undefined : { opacity: 0, x: isArabic ? 50 : -50 }}
            style={reduceMotion ? undefined : { opacity: heroOpacity, y: heroCopyY }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-7 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.28em] text-[var(--color-blue)]/55 sm:text-xs">
              <span className="h-px w-10 bg-[var(--color-red)]" />
              {t.hero.eyebrow}
            </div>
            <h1
              className={`max-w-full break-words font-[family-name:var(--font-display)] text-[3rem] font-black leading-[0.84] text-[var(--color-blue)] sm:max-w-4xl sm:text-[clamp(4.5rem,8.2vw,8.8rem)] ${
                isArabic
                  ? "tracking-[-0.04em]"
                  : "uppercase tracking-[-0.075em]"
              }`}
            >
              {t.hero.titleLead}
              <span className="mt-2 block text-[var(--color-red)]">{t.hero.titleAccent}</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[var(--color-blue)]/64 sm:text-lg sm:leading-8">
              {t.hero.description}
            </p>
            <div className="mt-9 flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <motion.a
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[var(--color-red)] px-5 py-3.5 text-center text-xs font-black uppercase tracking-[0.07em] text-white shadow-[0_20px_55px_var(--color-red-shadow)] sm:px-6 sm:text-sm"
                href="/booking?experience=signature"
                whileHover={reduceMotion ? undefined : { y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.hero.primaryCta}
                <span className="text-lg transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  ↗
                </span>
              </motion.a>
              <a
                className="rounded-full border border-[var(--color-blue)]/18 bg-[var(--color-white)]/80 px-6 py-3.5 text-center text-sm font-bold text-[var(--color-blue)]/82 backdrop-blur transition hover:border-[var(--color-blue)]/45 hover:bg-[var(--color-grey-light)]"
                href="#experiences"
              >
                {t.hero.secondaryCta}
              </a>
            </div>
            <div className="mt-9 grid min-w-0 gap-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-blue)]/48 sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3 sm:text-xs sm:tracking-[0.12em]">
              {t.hero.tags.map((tag) => (
                <span className="flex items-center gap-2" key={tag}>
                  <span className="size-1.5 rounded-full bg-[var(--color-red)]" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[50vh] min-h-[430px] min-w-0 max-w-full sm:h-[64vh] lg:h-[78vh] lg:min-h-[620px]"
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.88 }}
            style={reduceMotion ? undefined : { opacity: heroOpacity, y: heroCanvasY }}
            transition={{ delay: 0.1, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-x-[10%] bottom-[12%] h-[16%] rounded-full bg-[var(--color-red)]/12 blur-[70px]" />
            <div className="absolute left-[6%] top-[13%] font-[family-name:var(--font-display)] text-[10rem] font-black leading-none tracking-[-0.09em] text-[var(--color-blue)]/[0.035] sm:text-[16rem]">
              4×4
            </div>
            <div className="absolute inset-[12%] rounded-full border border-[var(--color-blue)]/10" />
            <div className="absolute inset-[23%] rounded-full border border-dashed border-[var(--color-red)]/25" />
            <QuadCanvas
              ariaLabel={t.a11y.quadModel}
              className="absolute inset-0 z-10"
              loadingLabel={t.a11y.loadingModel}
              modelUrl="/models/crimson-quad.glb"
              unavailableLabel={t.a11y.unavailableModel}
            />
            <div className="absolute left-[4%] top-[15%] z-20 rounded-full border border-[var(--color-blue)]/10 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.19em] text-[var(--color-blue)]/55 shadow-lg backdrop-blur-xl">
              {t.hero.modelLabel}
            </div>
            <div className="absolute bottom-[7%] right-0 z-20 border-e-2 border-[var(--color-red)] bg-[var(--color-white)]/82 px-5 py-3 text-end shadow-[0_18px_50px_rgba(7,21,40,.1)] backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.23em] text-[var(--color-red-light)]">
                {t.hero.scroll}
              </p>
              <p className="mt-1 text-xs text-[var(--color-blue)]/55">{t.hero.modelHint}</p>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-blue)]/34 lg:flex">
          <motion.span
            animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
            className="grid size-8 place-items-center rounded-full border border-[var(--color-blue)]/15"
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            ↓
          </motion.span>
          {t.hero.scroll}
        </div>
      </section>

      <Marquee items={t.ticker} reduceMotion={Boolean(reduceMotion)} />

      <section className="relative bg-[var(--color-white)] px-5 py-28 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:py-36">
        <motion.div
          {...reveal}
          className="mx-auto grid w-full max-w-[1400px] gap-14 lg:grid-cols-[0.38fr_1fr]"
        >
          <div>
            <p className="eyebrow-dark">{t.intro.eyebrow}</p>
            <div className="mt-12 flex items-end gap-4 border-b border-[var(--color-blue)]/15 pb-7">
              <strong className="text-7xl font-black tracking-[-0.07em] text-[var(--color-red)] sm:text-8xl">
                {t.intro.since}
              </strong>
              <span className="max-w-28 pb-2 text-xs font-black uppercase leading-5 tracking-[0.12em] text-[var(--color-blue)]/50">
                {t.intro.sinceLabel}
              </span>
            </div>
          </div>
          <div>
            <h2 className="max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-7xl lg:text-[6.7rem]">
              {t.intro.title}
            </h2>
            <p className="mt-9 max-w-3xl text-lg leading-8 text-[var(--color-blue)]/65 sm:text-xl sm:leading-9">
              {t.intro.body}
            </p>
          </div>
        </motion.div>
      </section>

      <section
        className="relative overflow-hidden border-y border-white/10 bg-[var(--color-blue-deep)] px-5 py-28 text-white sm:px-8 lg:px-12 lg:py-36"
        id="circuit"
      >
        <div className="qs-grid absolute inset-0 opacity-[0.08] invert" />
        <div className="absolute -right-48 top-20 size-[34rem] rounded-full bg-[var(--color-red)]/10 blur-[140px]" />
        <motion.div {...reveal} className="relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.6fr] lg:items-end">
            <div>
              <p className="eyebrow-light">{t.gallery.eyebrow}</p>
              <h2 className="mt-7 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
                {t.gallery.title}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-white/58 lg:pb-2 lg:text-lg">
              {t.gallery.body}
            </p>
          </div>

          <div className="mt-14 grid auto-rows-auto gap-4 lg:grid-cols-12 lg:gap-5">
            {REAL_EXPERIENCE_IMAGES.map((image, index) => {
              const photo = t.gallery.photos[index];

              return (
                <motion.figure
                  className={`group relative isolate min-h-[360px] overflow-hidden rounded-[1.75rem] border border-white/12 bg-[var(--color-blue)] ${REAL_EXPERIENCE_LAYOUTS[index]}`}
                  key={photo.title}
                  whileHover={reduceMotion ? undefined : { y: -6 }}
                >
                  <Image
                    alt={photo.alt}
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                    fill
                    loading="lazy"
                    quality={92}
                    sizes={index === 0 || index === 6 ? "(max-width: 1024px) 100vw, 1400px" : "(max-width: 1024px) 100vw, 760px"}
                    src={image}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-blue-deep)] via-[var(--color-blue-deep)]/5 to-transparent" />
                  <div className="absolute left-5 top-5 z-10 rounded-xl border border-white/30 bg-white/92 px-3 py-2 shadow-[0_12px_34px_rgba(7,21,40,.22)] backdrop-blur-md sm:left-6 sm:top-6">
                    <Image
                      alt=""
                      aria-hidden
                      className="h-auto w-24 sm:w-28"
                      quality={100}
                      src={agencyLogo}
                    />
                  </div>
                  <span className="absolute right-5 top-5 rounded-full border border-white/18 bg-[var(--color-blue-deep)]/45 px-3 py-1.5 text-[10px] font-black tracking-[0.18em] text-white/75 backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <span className="mb-4 block h-1 w-12 bg-[var(--color-red)]" />
                    <h3 className="text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                      {photo.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-white/68">
                      {photo.caption}
                    </p>
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section
        className="relative overflow-hidden border-y border-[var(--color-blue)]/10 bg-[var(--color-white)] px-5 py-28 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:py-36"
        id="experiences"
      >
        <div className="qs-grid absolute inset-0 opacity-20" />
        <div className="absolute -left-56 top-16 size-[32rem] rounded-full bg-[var(--color-red)]/8 blur-[140px]" />
        <motion.div {...reveal} className="relative mx-auto w-full max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.58fr] lg:items-end">
            <div>
              <p className="eyebrow-dark">{t.offers.eyebrow}</p>
              <h2 className="mt-7 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
                {t.offers.title}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--color-blue)]/58 lg:pb-2 lg:text-lg">
              {t.offers.body}
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {OFFER_IMAGES.map((image, index) => {
              const offer = t.offers.cards[index];

              return (
                <motion.article
                  className={`group overflow-hidden rounded-[2rem] border border-[var(--color-blue)]/12 bg-[var(--color-blue-deep)] shadow-[0_28px_70px_rgba(7,21,40,.14)] ${index === 2 ? "md:col-span-2 lg:col-span-1" : ""}`}
                  key={offer.title}
                  whileHover={reduceMotion ? undefined : { y: -8 }}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      alt={offer.alt}
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                      fill
                      loading="lazy"
                      quality={92}
                      sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      src={image}
                      unoptimized
                    />
                  </div>
                  <div className="flex min-h-48 flex-col border-t border-white/10 p-6 text-white sm:p-7">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-red-light)]">
                      {offer.duration}
                    </span>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.035em] sm:text-3xl">
                      {offer.title}
                    </h3>
                    <a
                      className="mt-auto inline-flex items-center gap-3 pt-7 text-xs font-black uppercase tracking-[0.13em] text-white transition hover:text-[var(--color-red-light)]"
                      href={WHATSAPP_URL}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {t.offers.enquire} <span className="text-lg">↗</span>
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section
        className="relative border-y border-[var(--color-blue)]/10 bg-[var(--color-white)] px-5 py-28 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:py-36"
        id="ride-formats"
      >
        <div className="qs-grid absolute inset-0 opacity-20" />
        <motion.div {...reveal} className="relative mx-auto w-full max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <p className="eyebrow-dark">{t.experiences.eyebrow}</p>
              <h2 className="mt-7 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
                {t.experiences.title}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-[var(--color-blue)]/54 lg:pb-2 lg:text-lg">
              {t.experiences.body}
            </p>
          </div>

          <div className="mt-16 grid border-t border-[var(--color-blue)]/12 lg:grid-cols-3">
            {t.experiences.cards.map((experience, index) => (
              <motion.article
                className="group relative min-h-[430px] overflow-hidden border-b border-[var(--color-blue)]/12 px-6 py-8 lg:border-b-0 lg:border-e"
                key={experience.number}
                whileHover={reduceMotion ? undefined : { y: -8 }}
              >
                <div className="absolute inset-0 origin-bottom scale-y-0 bg-[var(--color-red)] transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-black tracking-[0.2em] text-[var(--color-red)] transition-colors group-hover:text-white/65">
                      {experience.number}
                    </span>
                    <span className="rounded-full border border-[var(--color-blue)]/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-blue)]/45 group-hover:border-white/35 group-hover:text-white/75">
                      {experience.duration}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <h3 className="max-w-xs text-3xl font-black leading-none tracking-[-0.04em] transition-colors group-hover:text-white sm:text-4xl">
                      {experience.title}
                    </h3>
                    <p className="mt-5 max-w-sm leading-7 text-[var(--color-blue)]/52 transition-colors group-hover:text-white/78">
                      {experience.description}
                    </p>
                    <Link
                      className="mt-8 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-blue)] transition-colors group-hover:text-white"
                      href={`/booking?experience=${EXPERIENCE_IDS[index]}`}
                    >
                      {t.experiences.enquire} <span className="text-lg">↗</span>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-[var(--color-white)] px-5 py-28 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:py-36" id="story">
        <motion.div {...reveal} className="mx-auto w-full max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <p className="eyebrow-dark">{t.story.eyebrow}</p>
            <div>
              <h2 className="max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-7xl lg:text-[6rem]">
                {t.story.title}
              </h2>
              <p className="mt-9 max-w-3xl text-lg leading-8 text-[var(--color-blue)]/62">
                {t.story.body}
              </p>
            </div>
          </div>
          <div className="mt-20 grid border-s border-t border-[var(--color-blue)]/15 sm:grid-cols-2 lg:grid-cols-4">
            {t.story.stats.map((stat) => (
              <motion.div
                className="border-b border-e border-[var(--color-blue)]/15 p-7 sm:p-9"
                key={stat.label}
                whileHover={reduceMotion ? undefined : { backgroundColor: "var(--color-grey-light)" }}
              >
                <strong className="text-5xl font-black tracking-[-0.06em] text-[var(--color-red)] sm:text-6xl">
                  {stat.value}
                </strong>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-blue)]/48">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative overflow-hidden border-y border-[var(--color-blue)]/10 bg-[var(--color-white)] px-5 py-28 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:py-36">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(240,24,50,.16),transparent_62%)]" />
        <motion.div {...reveal} className="relative mx-auto w-full max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="eyebrow-dark">{t.journey.eyebrow}</p>
              <h2 className="mt-7 max-w-3xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl">
                {t.journey.title}
              </h2>
            </div>
            <div className="grid gap-0 border-t border-[var(--color-blue)]/15 sm:grid-cols-2">
              {t.journey.steps.map((step, index) => (
                <div className="border-b border-e border-[var(--color-blue)]/15 p-6" key={step.title}>
                  <span className="text-xs font-black text-[var(--color-red)]">0{index + 1}</span>
                  <h3 className="mt-7 text-xl font-black">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-blue)]/52">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[var(--color-blue)]/10 bg-[var(--color-white)] px-5 py-24 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:py-32" id="safety">
        <motion.div
          {...reveal}
          className="mx-auto grid w-full max-w-[1400px] gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-[var(--color-red)]">
              {t.safety.eyebrow}
            </p>
            <h2 className="mt-7 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-[6rem]">
              {t.safety.title}
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--color-blue)]/64">
              {t.safety.body}
            </p>
          </div>
          <div className="border-t border-[var(--color-blue)]/20">
            {t.safety.points.map((point, index) => (
              <div className="flex items-center gap-5 border-b border-[var(--color-blue)]/20 py-6" key={point}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--color-red)] text-xs font-black text-white">
                  {index + 1}
                </span>
                <p className="font-bold">{point}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative bg-[var(--color-white)] px-5 pb-10 pt-28 text-[var(--color-blue)] sm:px-8 lg:px-12 lg:pt-36" id="contact">
        <div className="qs-grid absolute inset-0 opacity-20" />
        <motion.div {...reveal} className="relative mx-auto w-full max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-end">
            <div>
              <p className="eyebrow-dark">{t.contact.eyebrow}</p>
              <h2 className="mt-7 text-6xl font-black leading-[0.86] tracking-[-0.07em] sm:text-8xl lg:text-[9rem]">
                {t.contact.title}
              </h2>
            </div>
            <div>
              <p className="max-w-xl text-lg leading-8 text-[var(--color-blue)]/58">{t.contact.body}</p>
              <motion.a
                className="mt-8 inline-flex items-center gap-4 rounded-full bg-[var(--color-red)] px-7 py-4 text-sm font-black uppercase tracking-[0.1em] text-white"
                href={WHATSAPP_URL}
                rel="noreferrer"
                target="_blank"
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              >
                {t.contact.whatsapp} <span className="text-xl">↗</span>
              </motion.a>
            </div>
          </div>

          <div className="mt-20 grid border-s border-t border-[var(--color-blue)]/12 md:grid-cols-2 lg:grid-cols-4">
            <ContactItem label={t.contact.addressLabel} value={t.contact.address} />
            <ContactItem label={t.contact.hoursLabel} value={t.contact.hours} />
            <ContactItem href="tel:+21623703703" label={t.contact.call} value="(+216) 23 703 703" />
            <ContactItem href="mailto:booking@quadsousse.com" label={t.contact.email} value="booking@quadsousse.com" />
          </div>

          <footer className="mt-16 flex flex-col gap-7 border-t border-[var(--color-blue)]/12 py-8 text-xs text-[var(--color-blue)]/48 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                alt="Quad Sousse Loisirs"
                className="h-auto w-36 rounded-lg bg-white p-2"
                quality={100}
                src={agencyLogo}
              />
              <span>{t.footer}</span>
            </div>
            <div className="flex items-center gap-5">
              <a className="transition hover:text-[var(--color-red)]" href="https://www.facebook.com/share/18w29RD3si/?mibextid=wwXIfr" rel="noreferrer" target="_blank">
                Facebook ↗
              </a>
              <span>© {new Date().getFullYear()} Quad Sousse Loisirs</span>
            </div>
          </footer>
        </motion.div>
      </section>
    </main>
  );
}

function Header({ locale, t }: { locale: Locale; t: SiteDictionary }) {
  return (
    <header className="relative z-50 mx-auto flex w-full max-w-[1500px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12 lg:py-6">
      <Link
        aria-label="Quad Sousse Loisirs"
        className="shrink-0 rounded-xl bg-white px-3 py-2 shadow-[0_12px_38px_rgba(0,0,0,.2)]"
        href={`/${locale}`}
      >
        <Image
          alt="Quad Sousse Loisirs"
          className="h-auto w-[140px] sm:w-[170px]"
          loading="eager"
          quality={100}
          src={agencyLogo}
        />
      </Link>
      <nav aria-label={t.a11y.mainNavigation} className="hidden items-center gap-7 text-xs font-bold text-[var(--color-blue)]/58 xl:flex">
        <a className="transition hover:text-[var(--color-red)]" href="#circuit">{t.nav.circuit}</a>
        <a className="transition hover:text-[var(--color-red)]" href="#experiences">{t.nav.experiences}</a>
        <a className="transition hover:text-[var(--color-red)]" href="#story">{t.nav.story}</a>
        <a className="transition hover:text-[var(--color-red)]" href="#safety">{t.nav.safety}</a>
        <a className="transition hover:text-[var(--color-red)]" href="#contact">{t.nav.contact}</a>
      </nav>
      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <Link
          className="hidden rounded-full bg-[var(--color-blue)] px-5 py-2.5 text-xs font-black uppercase tracking-[0.09em] text-white transition hover:bg-[var(--color-red)] sm:inline-flex"
          href="/booking?experience=signature"
        >
          {t.nav.book}
        </Link>
      </div>
    </header>
  );
}

function Marquee({ items, reduceMotion }: { items: string[]; reduceMotion: boolean }) {
  const sequence = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-b border-white/10 bg-[var(--color-red)] py-4" aria-hidden="true">
      <div className={`marquee-track flex w-max items-center ${reduceMotion ? "marquee-paused" : ""}`}>
        {sequence.map((item, index) => (
          <div className="flex items-center" key={`${item}-${index}`}>
            <span className="px-6 text-sm font-black uppercase tracking-[0.18em] text-white sm:px-10 sm:text-base">
              {item}
            </span>
            <span className="text-xl text-[var(--color-blue)]">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-red-light)]">{label}</p>
      <p className="mt-5 max-w-xs text-sm font-bold leading-6 text-[var(--color-blue)]/72">{value}</p>
    </>
  );

  return href ? (
    <a className="border-b border-e border-[var(--color-blue)]/12 p-6 transition hover:bg-[var(--color-grey-light)]/55 sm:p-8" href={href}>
      {content}
    </a>
  ) : (
    <div className="border-b border-e border-[var(--color-blue)]/12 p-6 sm:p-8">{content}</div>
  );
}
