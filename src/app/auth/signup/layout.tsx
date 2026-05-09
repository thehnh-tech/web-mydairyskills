import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your diary",
  description:
    "Sign up for MyDiarySkills — a private daily diary that turns reflection into skills.",
  alternates: { canonical: "/auth/signup" },
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
