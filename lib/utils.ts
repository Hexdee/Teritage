import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';
import { deleteCookie } from 'cookies-next';
import { twMerge } from 'tailwind-merge';
import { STORAGE_KEY } from '@/config/key';
import { LOGIN_URL } from '@/config/path';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatAddress = (address: string) => {
  const start: number = 6;
  const end: number = 6;
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
      });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast.success('Copied to clipboard');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textarea);
  }
}

export function transformBeneficiaries(oldArray: { address: string; name: string; email: string; sharePercentage: number }[]) {
  return oldArray.map((item) => {
    const [firstName, lastName] = item.name.split(' ');

    return {
      firstName: firstName || '',
      lastName: lastName || '',
      email: item.email || '',
      walletAddress: item.address || '',
      sharePercentage: item.sharePercentage || 0,
      notifyBeneficiary: false,
    };
  });
}

export const capitalizeFirstLetter = (str: string) => {
  const capitalized = str && str.charAt(0).toUpperCase() + str.slice(1);

  return capitalized;
};

export const handleLogout = () => {
  deleteCookie('user_token');
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = LOGIN_URL;
};
