import { create } from 'zustand';
import { TeritageTokenType } from '@/lib/blockchain/constants';
import type { TeritageUserProfileInput } from '@/type';
import { zeroAddress } from 'viem';

const ZERO_ADDRESS = zeroAddress;

export interface SocialLinkEntry {
  url: string;
}

export interface BeneficiaryEntry {
  firstName: string;
  lastName: string;
  email: string;
  walletAddress: string;
  sharePercentage: number;
  notifyBeneficiary: boolean;
}

export interface TokenEntry {
  address: string;
  type: TeritageTokenType;
}

interface InheritancePlanState {
  checkInIntervalSeconds: number | null;
  socialLinks: SocialLinkEntry[];
  beneficiaries: BeneficiaryEntry[];
  tokens: TokenEntry[];
  ownerProfile: TeritageUserProfileInput | null;
  setCheckInData: (data: {
    checkInIntervalSeconds: number;
    socialLinks: SocialLinkEntry[];
  }) => void;
  setBeneficiaries: (beneficiaries: BeneficiaryEntry[]) => void;
  setTokens: (tokens: TokenEntry[]) => void;
  setOwnerProfile: (profile: TeritageUserProfileInput) => void;
  reset: () => void;
}

const initialState: Omit<
  InheritancePlanState,
  'setCheckInData' | 'setBeneficiaries' | 'setTokens' | 'setOwnerProfile' | 'reset'
> = {
  checkInIntervalSeconds: null,
  socialLinks: [{ url: '' }],
  beneficiaries: [],
  tokens: [
    {
      type: 'HBAR' as TeritageTokenType,
      address: ZERO_ADDRESS,
    },
  ],
  ownerProfile: null,
};

export const useInheritancePlanStore = create<InheritancePlanState>((set) => ({
  ...initialState,
  setCheckInData: ({ checkInIntervalSeconds, socialLinks }) =>
    set(() => ({ checkInIntervalSeconds, socialLinks })),
  setBeneficiaries: (beneficiaries) => set(() => ({ beneficiaries })),
  setTokens: (tokens) => set(() => ({ tokens })),
  setOwnerProfile: (ownerProfile) => set(() => ({ ownerProfile })),
  reset: () => set(() => initialState),
}));
