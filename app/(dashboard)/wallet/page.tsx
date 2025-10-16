'use client';
import { CircularProgress } from '@/components/ui/circular-progress';
import DataTable from '@/components/ui/data-table';
import { ArrowUp, Eye, EyeOff } from 'lucide-react';
import { columns } from './columns';
import { wallets } from './data';
import { useState } from 'react';
import { useApplications } from '@/context/dashboard-provider';
import { DashboardSkeleton } from '@/components/ui/loading';

export default function Wallet() {
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const [showUnassignedBalance, setShowUnassignedBalance] = useState<boolean>(false);
  const { walletsData, isLoadingWallets, isWalletError, walletError, walletsTokenData, isLoadingWalletsToken, isWalletTokenError, walletTokenError } =
    useApplications();

  if (isLoadingWallets || isLoadingWalletsToken) {
    return <DashboardSkeleton />;
  }

  if (isWalletError || isWalletTokenError) {
    throw new Error(walletError?.response?.data?.message || walletTokenError?.response?.data?.message || 'Error occured while trying to access the server');
  }

  console.log(walletsTokenData);

  return (
    <>
      {/* {isWalletError && walletError?.response?.data?.message !== 'Teritage plan not found' ? (
        <div className="h-[80vh] flex items-center px-20">
          <EmptyState hasButton />
        </div>
      ) : ( */}
      <div className="text-inverse space-y-8" contentEditable={false}>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-xl p-4 space-y-4">
            <div className="flex space-x-2 text-muted-foreground items-center">
              <p>Balance</p>
              <div className="cursor-pointer" onClick={() => setShowBalance((prev) => !prev)} role="button" aria-roledescription="Show amount">
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
            {showBalance ? (
              <h1 className="text-inverse text-5xl font-medium">
                ${(walletsData.summary.totalPortfolioValueUsd * walletsData.summary.assignedPercentage) / 100}.<span className="text-muted-foreground">00</span>
              </h1>
            ) : (
              <h1 className="text-inverse text-5xl font-medium">******</h1>
            )}

            <div className="tect-white flex items-center gap-4">
              <p>${walletsData.summary.totalPortfolioValueUsd}.00</p>
              <div className="flex bg-card p-2 w-fit rounded-lg items-center">
                <ArrowUp size={18} />
                <p>{walletsData.summary.change24hPercent}%</p>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-4 space-y-4 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex space-x-2 text-muted-foreground items-center">
                <p>Unassigned Balance</p>

                <div className="cursor-pointer" onClick={() => setShowUnassignedBalance((prev) => !prev)} role="button" aria-roledescription="Show amount">
                  {showUnassignedBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
              {showUnassignedBalance ? (
                <h1 className="text-inverse text-5xl font-medium">
                  ${(walletsData.summary.totalPortfolioValueUsd * walletsData.summary.unallocatedPercentage) / 100}.
                  <span className="text-muted-foreground">00</span>
                </h1>
              ) : (
                <h1 className="text-inverse text-5xl font-medium">******</h1>
              )}
            </div>
            <div className="flex justify-end">
              <CircularProgress value={walletsData.summary.unallocatedPercentage} />
            </div>
          </div>
        </div>

        <DataTable tableTitle="Tokens" columns={columns} data={walletsTokenData.tokens} />
      </div>
      {/* )} */}
    </>
  );
}
