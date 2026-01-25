'use client';

import { useState, useMemo } from 'react';
import { isAxiosError } from 'axios';
import { ArrowDown, ArrowUp, Eye, EyeOff } from 'lucide-react';

import { DashboardSkeleton } from '@/components/ui/loading';
import { CircularProgress } from '@/components/ui/circular-progress';
import DataTable from '@/components/ui/data-table';
import EmptyState from '@/components/ui/empty-state';
import CurrencyText from '@/components/ui/currency-text';
import { useApplications } from '@/context/dashboard-provider';

import { columns } from './columns';
import { getApiErrorMessage } from '@/lib/api-error';

const formatChangeLabel = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

export default function Wallet() {
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const [showUnassignedBalance, setShowUnassignedBalance] = useState<boolean>(false);

  const {
    address,
    isConnected,
    walletsData,
    isLoadingWallets,
    isWalletError,
    walletError,
    walletsTokenData,
    isLoadingWalletsToken,
    isWalletTokenError,
    walletTokenError,
  } = useApplications();

  const isLoading = isLoadingWallets || isLoadingWalletsToken;
  const tokens = walletsTokenData?.tokens ?? [];
  const summary = walletsData?.summary ?? null;

  const assignedValue = useMemo(() => {
    if (!summary) return 0;
    return Number(((summary.totalPortfolioValueUsd * summary.assignedPercentage) / 100).toFixed(2));
  }, [summary]);

  const unassignedValue = useMemo(() => {
    if (!summary) return 0;
    return Number(((summary.totalPortfolioValueUsd * summary.unallocatedPercentage) / 100).toFixed(2));
  }, [summary]);

  const totalValue = summary?.totalPortfolioValueUsd ?? 0;
  const changePercent = summary?.change24hPercent ?? 0;

  const errorMessage = (() => {
    const err = walletError ?? walletTokenError;
    if (!err) return null;
    if (isAxiosError(err)) {
      return getApiErrorMessage(err, err.message);
    }
    return getApiErrorMessage(err, 'Something went wrong while loading wallet data.');
  })();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isConnected || !address) {
    return (
      <div className="h-[70vh] flex items-center lg:px-20">
        <EmptyState hasButton />
      </div>
    );
  }

  if (isWalletError || isWalletTokenError) {
    return (
      <div className="h-[70vh] flex items-center lg:px-20">
        <div className="w-full space-y-6">
          <EmptyState />
          {errorMessage && <p className="text-center text-sm text-destructive">{errorMessage}</p>}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="h-[70vh] flex items-center lg:px-20">
        <EmptyState hasButton />
      </div>
    );
  }

  const showPositiveChange = changePercent >= 0;

  return (
    <div className="text-inverse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 space-y-4">
          <div className="flex space-x-2 text-muted-foreground items-center">
            <p>Balance</p>
            <button className="cursor-pointer" onClick={() => setShowBalance((prev) => !prev)} aria-label="Toggle balance visibility">
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showBalance ? <CurrencyText amount={assignedValue} /> : <h1 className="text-inverse text-5xl font-medium">******</h1>}

          <div className="text-white flex items-center gap-4">
            <p>{formatCurrency(totalValue)}</p>
            <div
              className={`flex items-center space-x-2 rounded-lg px-3 py-1 ${
                showPositiveChange ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
              }`}
            >
              {showPositiveChange ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              <span>{formatChangeLabel(changePercent)}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-4 space-y-4 grid grid-cols-2 sm:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex space-x-2 text-muted-foreground items-center">
              <p>Unassigned Balance</p>
              <button className="cursor-pointer" onClick={() => setShowUnassignedBalance((prev) => !prev)} aria-label="Toggle unassigned balance visibility">
                {showUnassignedBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {showUnassignedBalance ? <CurrencyText amount={unassignedValue} /> : <h1 className="text-inverse text-5xl font-medium">******</h1>}
          </div>
          <div className="flex justify-end items-center">
            <CircularProgress value={summary.unallocatedPercentage} />
          </div>
        </div>
      </div>

      <DataTable tableTitle="Tokens" columns={columns} data={tokens} />
    </div>
  );
}
