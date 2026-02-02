import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Nugget',
  description: 'Reset your Nugget account password.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Reset Password | Nugget',
    description: 'Reset your Nugget account password.',
    url: 'https://thenugget.app/reset-password',
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
