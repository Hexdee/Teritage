'use client';

import { getTokenSummaryApi, getUserTeritageApi, getWalletTokenApi } from '@/config/apis';
import { TERITAGES_KEY, WALLETS_SUMMARY_KEY, WALLETS_TOKENS_KEY } from '@/config/key';
import { ApiResponse, DashboardContextType } from '@/type';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext } from 'react';
import { useAccount } from 'wagmi';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount();

  const {
    data: teritageData,
    isLoading: isLoadingTeritage,
    isError: isTeritageError,
    error: teritageError,
  }: ApiResponse | any = useQuery<ApiResponse>({
    queryKey: [TERITAGES_KEY, isConnected],
    queryFn: () => getUserTeritageApi(address || ''),
    enabled: !!isConnected,
    retry: 1,
  });

  const {
    data: walletsData,
    isLoading: isLoadingWallets,
    isError: isWalletError,
    error: walletError,
  }: ApiResponse | any = useQuery<ApiResponse>({
    queryKey: [WALLETS_SUMMARY_KEY, isConnected],
    queryFn: () => getTokenSummaryApi(address || ''),
    enabled: !!isConnected,
    retry: 3,
  });

  const {
    data: walletsTokenData,
    isLoading: isLoadingWalletsToken,
    isError: isWalletTokenError,
    error: walletTokenError,
  }: ApiResponse | any = useQuery<ApiResponse>({
    queryKey: [WALLETS_TOKENS_KEY, isConnected],
    queryFn: () => getWalletTokenApi(address || ''),
    enabled: !!isConnected,
    retry: 3,
  });

  console.log({ walletError });

  return (
    <DashboardContext.Provider
      value={{
        walletsData,
        isLoadingWallets,
        isWalletError,
        walletError,

        teritageData,
        isLoadingTeritage,
        isTeritageError,
        teritageError,

        walletsTokenData,
        isLoadingWalletsToken,
        isWalletTokenError,
        walletTokenError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useApplications must be used within an DashboardProvider');
  }
  return ctx;
}
