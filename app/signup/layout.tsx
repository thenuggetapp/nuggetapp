import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a Nugget account to save your favorite restaurants, write reviews, and get personalized recommendations.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign Up | Nugget",
    description: "Create a Nugget account to save your favorite restaurants.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/signup`,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
