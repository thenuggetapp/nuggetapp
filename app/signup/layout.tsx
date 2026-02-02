import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a MapSearch account to save your favorite restaurants, write reviews, and get personalized recommendations.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign Up | MapSearch',
    description: 'Create a MapSearch account to save your favorite restaurants.',
    url: 'https://yourdomain.com/signup',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
