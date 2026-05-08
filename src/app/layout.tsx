import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} - Private diary and skill tracker`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "private diary",
    "daily journal",
    "skill tracker",
    "AI diary",
    "personal growth",
    "reflection",
    "habit journal",
  ],
  authors: [{ name: "MyDiarySkills" }],
  creator: "MyDiarySkills",
  publisher: "MyDiarySkills",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32x32.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Private diary and skill tracker`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MyDiarySkills app preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Private diary and skill tracker`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f8f6f2",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Kill any stale service worker from a previous build that was
            intercepting /auth/signin and breaking the network. The /sw.js file
            self-unregisters and wipes caches on activation. */}
        <Script id="sw-cleanup" strategy="afterInteractive">{`
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then((regs) => {
              regs.forEach((r) => r.unregister().catch(() => {}));
            }).catch(() => {});
            if (window.caches) {
              caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
            }
          }
        `}</Script>
        {children}
      </body>
    </html>
  );
}
