import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyDiarySkills — écris ta journée, découvre tes skills",
  description:
    "Un diary privé, une page par jour, avec une couche skill-progression discrète. Le journal est le produit ; les skills sont un side-effect.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
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
