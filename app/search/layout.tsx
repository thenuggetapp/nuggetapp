import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Restaurants",
  description:
    "Search and discover family-friendly restaurants with filters for kids menus, high chairs, parking, WiFi, and more. View results on an interactive map.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Search Family-Friendly Restaurants | Nugget",
    description:
      "Search and discover family-friendly restaurants with filters for kids menus, high chairs, parking, WiFi, and more.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/search`,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
