import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your MyDiarySkills account.",
  alternates: { canonical: "/auth/signin" },
  robots: { index: true, follow: true },
};

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
