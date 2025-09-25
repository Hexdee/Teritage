import { ActivityIcon, BeneficiaryIcon, SettingsIcon, WalletIcon } from '@/components/icons';
import { ACTIVITY_URL, BENEFICIARY_URL, MANAGE_WALLETS_URL, SETTINGS_URL, WALLET_URL } from './path';
import {
  CheckInIcon,
  ContactUsIcon,
  ManagedWalletIcon,
  NotificationIcon2,
  PrivacyPolicyIcon,
  SecurityIcon,
  TermsAndPolicyIcon,
  ThemeIcon,
} from '@/components/icons';
import { CHECK_IN_PROTOCOL_URL, CONTACT_US_URL, NOTIFICATIONS_URL, PRIVACY_POLICY_URL, SECURITY_URL, TERMS_AND_CONDITION_URL, THEME_URL } from '@/config/path';

export const sidebar = [
  {
    title: 'Wallet',
    url: WALLET_URL,
    default: WALLET_URL,
    icon: <WalletIcon width={24} height={24} />,
  },
  {
    title: 'Beneficiary',
    url: BENEFICIARY_URL,
    default: BENEFICIARY_URL,
    icon: <BeneficiaryIcon width={24} height={24} />,
  },
  {
    title: 'Activity',
    default: ACTIVITY_URL,
    url: ACTIVITY_URL,
    icon: <ActivityIcon width={24} height={24} />,
  },
  {
    title: 'Settings',
    default: SETTINGS_URL,
    url: MANAGE_WALLETS_URL,
    icon: <SettingsIcon width={24} height={24} />,
  },
];

export const sidebarLinks = [
  {
    title: 'Manage Wallets',
    href: MANAGE_WALLETS_URL,
    icon: <ManagedWalletIcon />,
  },
  {
    title: 'Check-in Protocol',
    href: CHECK_IN_PROTOCOL_URL,
    icon: <CheckInIcon />,
  },
  {
    title: 'Notifications',
    href: NOTIFICATIONS_URL,
    icon: <NotificationIcon2 />,
  },
  {
    title: 'Theme',
    href: THEME_URL,
    icon: <ThemeIcon />,
  },
  {
    title: 'Security',
    href: SECURITY_URL,
    icon: <SecurityIcon />,
  },
  {
    title: 'Contact Us',
    href: CONTACT_US_URL,
    icon: <ContactUsIcon />,
  },
  {
    title: 'Privacy Policy',
    href: PRIVACY_POLICY_URL,
    icon: <PrivacyPolicyIcon />,
  },
  {
    title: 'Terms & Conditions',
    href: TERMS_AND_CONDITION_URL,
    icon: <TermsAndPolicyIcon />,
  },
];
