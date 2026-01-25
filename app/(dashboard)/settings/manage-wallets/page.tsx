'use client';

import { useState } from 'react';
import { isAddress, getAddress } from 'viem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CopyIcon, DeleteIconRounded } from '@/components/icons';
import EmptyState from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/loading';
import { useApplications } from '@/context/dashboard-provider';
import { updateWalletAddressesApi } from '@/config/apis';
import { USER_PROFILE_KEY } from '@/config/key';
import { Plus } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/api-error';

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function ManageWalletsSettings() {
  const { userProfile, isLoadingUserProfile, isUserProfileError, userProfileError } = useApplications();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateWalletAddressesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PROFILE_KEY] });
      setNewAddress('');
      setIsDialogOpen(false);
    },
  });

  if (isLoadingUserProfile) {
    return <DashboardSkeleton />;
  }

  if (isUserProfileError) {
    const message = getApiErrorMessage(userProfileError, 'Unable to load wallets');
    return (
      <div className="h-[70vh] flex items-center px-20">
        <div className="w-full space-y-6">
          <EmptyState />
          <p className="text-center text-sm text-destructive">{message}</p>
        </div>
      </div>
    );
  }

  const walletAddresses = userProfile?.walletAddresses ?? [];

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const handleRemove = async (address: string) => {
    try {
      const updated = walletAddresses.filter((item) => item !== address);
      await mutateAsync({ walletAddresses: updated });
      toast.success('Wallet removed successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to remove wallet'));
    }
  };

  const handleAddWallet = async () => {
    const trimmed = newAddress.trim();
    if (!trimmed) {
      toast.error('Enter a wallet address');
      return;
    }

    if (!isAddress(trimmed)) {
      toast.error('Enter a valid EVM address');
      return;
    }

    const normalized = getAddress(trimmed);
    if (walletAddresses.includes(normalized)) {
      toast.error('Wallet address already added');
      return;
    }

    try {
      await mutateAsync({ walletAddresses: [...walletAddresses, normalized] });
      toast.success('Wallet added successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to add wallet'));
    }
  };

  return (
    <div className="space-y-6 min-h-[50vh]">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="font-medium text-xl">Manage Wallets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button startIcon={<Plus size={16} />} variant="secondary" className="w-fit">
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a wallet</DialogTitle>
              <DialogDescription>Link another EVM wallet address to your Teritage account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="0x..." value={newAddress} onChange={(event) => setNewAddress(event.target.value)} autoFocus />
              <Button onClick={handleAddWallet} isLoading={isPending} loadingText="Saving...">
                Save wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {walletAddresses.length === 0 ? (
        <div className="h-[60vh] flex items-center">
          <EmptyState hasButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {walletAddresses.map((address) => (
            <div key={address} className="p-1 border border-primary/50 rounded-md">
              <div className="bg-primary dark:bg-transparent rounded-md p-4 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} />
                      <AvatarFallback>{address.slice(2, 4).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet Address</p>
                      <p className="text-inverse font-medium font-mono">{formatAddress(address)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 text-inverse" onClick={() => handleCopy(address)}>
                    <CopyIcon />
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" startIcon={<DeleteIconRounded />}>
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove this wallet?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Removing the wallet will unlink it from your Teritage account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemove(address)} className="bg-destructive text-white hover:bg-destructive/90">
                        Remove wallet
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
