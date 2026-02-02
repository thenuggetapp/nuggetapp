'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';
import { defaultFetcher } from '@/lib/swr-fetcher';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        ...swrConfig,
        fetcher: defaultFetcher,
      }}
    >
      {children}
    </SWRConfig>
  );
}

