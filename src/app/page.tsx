import { redirect } from "next/navigation";
import Script from "next/script";
import { getSession } from "@/lib/session";
import { LandingPageClient } from "./LandingPageClient";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";

export default async function LandingPage() {
  const session = await getSession();
  if (session.userId) redirect("/today");

  // JSON-LD: tells search engines what this page is.
  // SoftwareApplication is the right schema for a productivity app's landing.
  const siteUrl = getSiteUrl().toString().replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web, iOS, Android",
    description: SITE_DESCRIPTION,
    url: siteUrl,
    image: `${siteUrl}/og-image.png`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "thehnh-tech",
      url: siteUrl,
    },
  };

  return (
    <>
      <Script
        id="ld-json-software"
        type="application/ld+json"
        strategy="beforeInteractive"
      >
        {JSON.stringify(jsonLd)}
      </Script>
      <LandingPageClient />
    </>
  );
}
