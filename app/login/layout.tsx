import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Nugget account to save your favorite restaurants and access personalized recommendations.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Sign In | Nugget",
    description: "Sign in to your Nugget account.",
    url: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
