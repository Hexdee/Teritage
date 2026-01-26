/* eslint-disable @next/next/no-img-element */
'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './button';
import { cn } from '@/lib/utils';

export const CustomConnectButton = ({ buttonClassName }: { buttonClassName?: string }) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }: any) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button" className={buttonClassName}>
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type="button" className={buttonClassName}>
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className={cn('lg:flex block gap-12 space-y-2.5', buttonClassName)}>
                  <Button onClick={openChainModal} style={{ display: 'flex', alignItems: 'center' }} type="button">
                    <>
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} style={{ width: 12, height: 12 }} />}
                        </div>
                      )}
                      {chain.name}
                    </>
                  </Button>
                  <Button onClick={openAccountModal} type="button">
                    <>
                      {account.displayName}
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
                    </>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
