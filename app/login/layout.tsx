import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your MapSearch account to save your favorite restaurants and access personalized recommendations.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign In | MapSearch',
    description: 'Sign in to your MapSearch account.',
    url: 'https://yourdomain.com/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
