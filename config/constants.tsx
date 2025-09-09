import { ActivityIcon, BeneficiaryIcon, SettingsIcon, WalletIcon } from '@/components/icons';
import { ACTIVITY_URL, BENEFICIARY_URL, SETTINGS_URL, WALLET_URL } from './path';

export const sidebar = [
  {
    title: 'Wallet',
    url: WALLET_URL,
    icon: <WalletIcon width={24} height={24} />,
  },
  {
    title: 'Beneficiary',
    url: BENEFICIARY_URL,
    icon: <BeneficiaryIcon width={24} height={24} />,
  },
  {
    title: 'Activity',
    url: ACTIVITY_URL,
    icon: <ActivityIcon width={24} height={24} />,
  },
  {
    title: 'Settings',
    url: SETTINGS_URL,
    icon: <SettingsIcon width={24} height={24} />,
  },
];
