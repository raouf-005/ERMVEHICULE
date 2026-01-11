"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { fetcher } from "@/src/lib/fetcher";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher,
          // Global SWR configuration for optimal performance
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 2000,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
          // Keep stale data while revalidating for instant UI
          keepPreviousData: true,
        }}
      >
        {children}
      </SWRConfig>
    </SessionProvider>
  );
}
