'use client';

import { getActivities, getTokenSummaryApi, getUserTeritageApi, getWalletTokenApi } from '@/config/apis';
import { ACTIVITIES_KEY, TERITAGES_KEY, WALLETS_SUMMARY_KEY, WALLETS_TOKENS_KEY } from '@/config/key';
import { ApiResponse, DashboardContextType } from '@/type';
import { useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';
import { useAccount } from 'wagmi';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount();
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [openSheet, setOpenSheet] = useState<boolean>(false);

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
    retry: 1,
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
    retry: 1,
  });

  const {
    data: activitiesData,
    isLoading: isLoadingActivities,
    isError: isActivitiesError,
    error: activitiesError,
  }: ApiResponse | any = useQuery<ApiResponse>({
    queryKey: [ACTIVITIES_KEY, isConnected],
    queryFn: () => getActivities(address || ''),
    enabled: !!isConnected,
    retry: 3,
  });

  console.log({ teritageData });

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

        activitiesData,
        isLoadingActivities,
        isActivitiesError,
        activitiesError,

        openSheet,
        setOpenSheet,
        currentStage,
        setCurrentStage,
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
