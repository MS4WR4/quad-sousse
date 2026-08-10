import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";

import { dictionaries } from "@/i18n/site";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Quad Sousse Loisirs",
      template: "%s | Quad Sousse Loisirs",
    },
    description: dictionaries.fr.meta.siteDescription,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      description: dictionaries.fr.meta.siteDescription,
      images: [
        {
          alt: "Quad Sousse Loisirs — L’aventure commence ici.",
          height: 1024,
          url: `${origin}/og.png`,
          width: 1792,
        },
      ],
      siteName: "Quad Sousse Loisirs",
      title: "Quad Sousse Loisirs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      description: dictionaries.fr.meta.siteDescription,
      images: [`${origin}/og.png`],
      title: "Quad Sousse Loisirs",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="fr" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
