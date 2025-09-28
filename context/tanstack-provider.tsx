/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/rainbowkit';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

interface TanstackProviderProps {
  children: ReactNode;
}

const TanstackProvider: React.FC<TanstackProviderProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: (error: any) => {
              if (error.response?.status === 401) {
                toast('User not authorized');
              }
            },
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default TanstackProvider;
