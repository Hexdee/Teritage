export interface ISelectedWallet {
  name: string;
  logo: string;
}

export interface ICreateUsernameForm {
  handleNext: (arg: { username: string }) => void;
  errorMessage?: string | null;
  setErrorMessage?: (arg: string | null) => void;
  isLoading?: boolean;
}

export interface INextPage {
  handleNext?: () => void;
  className?: string;
  isLoading?: boolean;
  newBeneficiary?: boolean;
  handleNext2?: (arg: BeneficiaryEntry) => void;
}

export interface ISelectWalletNextPage {
  handleNext: () => void;
  className?: string;
  handleViewWallet: (arg: WalletToken) => void;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}

export type TeritageTokenType = 'ERC20' | 'HTS' | 'HBAR';

export interface TeritageTokenConfig {
  address: string;
  type: TeritageTokenType;
}

export interface TeritageInheritorInput {
  address: string;
  sharePercentage: number;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface TeritageUserProfileInput {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface CreateTeritagePlanRequest {
  ownerAddress: string;
  inheritors: TeritageInheritorInput[];
  tokens: TeritageTokenConfig[];
  checkInIntervalSeconds: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export interface UpdateTeritagePlanRequest {
  inheritors?: TeritageInheritorInput[];
  tokens?: TeritageTokenConfig[];
  checkInIntervalSeconds?: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string | null;
  name: string | null;
  phone: string | null;
  notes: string | null;
  allowNotifications: boolean;
  walletAddresses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICheckIn {
  checkIns: IUserCheckIn[];
}

export interface IUserCheckIn {
  id: string;
  timestamp: string;
  secondsSinceLast: number;
  timelinessPercent: number;
  triggeredBy: string;
  note: string;
}

export interface UpdateUserProfileRequest {
  name?: string | null;
  phone?: string | null;
  notes?: string | null;
  allowNotifications?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyPinRequest {
  pin: string;
}

export interface ChangePinRequest {
  currentPin: string;
  newPin: string;
}

export interface CreatePinRequest {
  pin: string;
}

export interface PinVerificationResponse {
  valid: boolean;
  hasPin: boolean;
}

export interface UpdateWalletAddressesRequest {
  walletAddresses: string[];
}

export interface WalletToken {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  priceUsd: number;
  change24hPercent: number;
  iconUrl?: string;
}

export interface WalletTokensResponse {
  tokens: WalletToken[];
}

export interface WalletSummary {
  totalPortfolioValueUsd: number;
  change24hPercent: number;
  assignedPercentage: number;
  unallocatedPercentage: number;
  notifyBeneficiary: boolean;
  socialLinks: string[];
  tokenCount: number;
}

export interface WalletSummaryResponse {
  summary: WalletSummary;
}

export type WebContextType = {
  user: string;
};

export type IUser = {
  first_name: string;
};

export type StoreState = {
  user: IUser | null;
  setUser: (user: IUser) => void;
  resetUser: () => void;
};

export type MyPersist = <T extends StoreState>(
  config: (set: StoreApi<T>['setState'], get: StoreApi<T>['getState']) => T,
  options: {
    name: string;
    getStorage?: () => StateStorage;
    partialize?: (state: T) => Partial<T>;
  }
) => (set: StoreApi<T>['setState'], get: StoreApi<T>['getState'], store: StoreApi<T>) => T;

interface IWalletData {
  plan: {
    ownerAddress: string;
    user: {
      name: string;
      email: string;
      phone: string;
      notes: string;
    };
    inheritors: [
      {
        address: string;
        sharePercentage: number;
        name: string;
        email: string;
        phone: string;
        notes: string;
      }
    ];
    tokens: [
      {
        address: string;
        type: string;
      }
    ];
    checkInIntervalSeconds: 0;
    lastCheckInAt: string;
    isClaimInitiated: boolean;
    activities: [
      {
        id: string;
        type: string;
        description: string;
        metadata: any;
        timestamp: string;
      }
    ];
    checkIns: [
      {
        id: string;
        timestamp: string;
        secondsSinceLast: 0;
        timelinessPercent: 0;
        triggeredBy: string;
        note: string;
      }
    ];
    socialLinks: string[];
    notifyBeneficiary: boolean;
    createdAt: string;
    updatedAt: string;
  };
  status: {
    lastCheckInAt: string;
    nextCheckInDueAt: string;
    secondsUntilDue: number;
    isOverdue: boolean;
    isClaimInitiated: boolean;
  };
}

export type DashboardContextType = {
  address?: string;
  isConnected: boolean;

  walletsData: WalletSummaryResponse | null;
  isLoadingWallets: boolean;
  isWalletError: boolean;
  walletError: unknown;

  teritageData: IWalletData | null;
  isLoadingTeritage: boolean;
  isTeritageError: boolean;
  teritageError: unknown;

  walletsTokenData: WalletTokensResponse | null;
  isLoadingWalletsToken: boolean;
  isWalletTokenError: boolean;
  walletTokenError: any;

  // activitiesData: {
  //   id: string;
  //   type: string;
  //   description: string;
  //   metadata: any;
  //   timestamp: string;
  // }[];
  // isLoadingActivities: boolean;
  // isActivitiesError: boolean;
  // activitiesError: any;

  openSheet: boolean;
  setOpenSheet: (arg: boolean) => void;
  currentStage: number;
  setCurrentStage: (arg: number) => void;
  walletTokenError: unknown | null;

  userProfile: UserProfile | null;
  isLoadingUserProfile: boolean;
  isUserProfileError: boolean;
  userProfileError: unknown;
};

interface IInheritors {
  address: string;
  sharePercentage: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
}
