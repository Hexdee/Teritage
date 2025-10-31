'use client';

import { getUserTeritageApi, getWalletSummaryApi, getWalletTokensApi, getUserProfileApi } from '@/config/apis';
import { TERITAGES_KEY, USER_PROFILE_KEY, WALLETS_SUMMARY_KEY, WALLETS_TOKENS_KEY } from '@/config/key';
import { ApiResponse, DashboardContextType, IWalletData, UserProfile, WalletSummaryResponse, WalletTokensResponse } from '@/type';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';
import React, { createContext, useContext, useState } from 'react';
import { useAccount } from 'wagmi';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, address } = useAccount();
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const hasWalletAddress = Boolean(isConnected && address);
  const authToken = typeof window !== 'undefined' ? getCookie('teritage_token') : null;
  const isAuthenticated = Boolean(authToken);

  const {
    data: teritageData,
    isLoading: isLoadingTeritage,
    isError: isTeritageError,
    error: teritageError,
  } = useQuery<ApiResponse>({
    queryKey: [TERITAGES_KEY, isAuthenticated],
    queryFn: () => getUserTeritageApi(),
    enabled: isAuthenticated,
  });

  const {
    data: walletsData,
    isLoading: isLoadingWallets,
    isError: isWalletError,
    error: walletError,
  } = useQuery<WalletSummaryResponse, AxiosError>({
    queryKey: [WALLETS_SUMMARY_KEY, address],
    queryFn: () => {
      if (!address) {
        throw new Error('Wallet address unavailable');
      }
      return getWalletSummaryApi(address);
    },
    enabled: isAuthenticated && hasWalletAddress,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const {
    data: walletsTokenData,
    isLoading: isLoadingWalletsToken,
    isError: isWalletTokenError,
    error: walletTokenError,
  } = useQuery<WalletTokensResponse, AxiosError>({
    queryKey: [WALLETS_TOKENS_KEY, address],
    queryFn: () => {
      if (!address) {
        throw new Error('Wallet address unavailable');
      }
      return getWalletTokensApi(address);
    },
    enabled: isAuthenticated && hasWalletAddress,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const normalizedTeritageData = teritageData ? (teritageData as unknown as IWalletData) : null;

  const {
    data: userProfileData,
    isLoading: isLoadingUserProfile,
    isError: isUserProfileError,
    error: userProfileError,
  } = useQuery<{ user: UserProfile }, AxiosError>({
    queryKey: [USER_PROFILE_KEY, address],
    queryFn: getUserProfileApi,
    enabled: isAuthenticated,
    retry: 2,
    staleTime: 60 * 1000,
  });

  const userProfile = userProfileData?.user ?? null;

  return (
    <DashboardContext.Provider
      value={{
        address: address ?? undefined,
        isConnected,

        walletsData: walletsData ?? null,
        isLoadingWallets,
        isWalletError,
        walletError: walletError ?? null,

        teritageData: normalizedTeritageData,
        isLoadingTeritage,
        isTeritageError,
        teritageError: teritageError ?? null,

        walletsTokenData: walletsTokenData ?? null,
        isLoadingWalletsToken,
        isWalletTokenError,

        // activitiesData,
        // isLoadingActivities,
        // isActivitiesError,
        // activitiesError,

        openSheet,
        setOpenSheet,
        currentStage,
        setCurrentStage,
        walletTokenError: walletTokenError ?? null,

        userProfile,
        isLoadingUserProfile,
        isUserProfileError,
        userProfileError: userProfileError ?? null,
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
