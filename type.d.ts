interface ISelectedWallet {
  name: string;
  logo: string;
}

interface ICreateUsernameForm {
  handleNext: (arg: { username: string }) => void;
  errorMessage: string | null;
  setErrorMessage: (arg: string | null) => void;
  isLoading: boolean;
}

interface INextPage {
  handleNext: () => void;
  className?: string;
}

interface ISelectWalletNextPage {
  handleNext: () => void;
  className?: string;
  handleViewWallet: () => void;
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
  user: TeritageUserProfileInput;
  inheritors: TeritageInheritorInput[];
  tokens: TeritageTokenConfig[];
  checkInIntervalSeconds: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
}

export interface UpdateTeritagePlanRequest {
  user?: Partial<TeritageUserProfileInput>;
  inheritors?: TeritageInheritorInput[];
  tokens?: TeritageTokenConfig[];
  checkInIntervalSeconds?: number;
  socialLinks?: string[];
  notifyBeneficiary?: boolean;
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
  walletsData: {
    summary: {
      totalPortfolioValueUsd: number;
      change24hPercent: number;
      assignedPercentage: number;
      unallocatedPercentage: number;
      notifyBeneficiary: boolean;
      socialLinks: string[];
      tokenCount: number;
    };
  };
  isLoadingWallets: boolean;
  isWalletError: boolean;
  walletError: any;

  teritageData: IWalletData;
  isLoadingTeritage: boolean;
  isTeritageError: boolean;
  teritageError: any;

  walletsTokenData: {
    tokens: {
      tokenId: string;
      symbol: string;
      name: string;
      decimals: number;
      balance: number;
      priceUsd: number;
      change24hPercent: number;
    }[];
  };
  isLoadingWalletsToken: boolean;
  isWalletTokenError: boolean;
  walletTokenError: any;

  activitiesData: {
    id: string;
    type: string;
    description: string;
    metadata: any;
    timestamp: string;
  }[];
  isLoadingActivities: boolean;
  isActivitiesError: boolean;
  activitiesError: any;

  openSheet: boolean;
  setOpenSheet: (arg: boolean) => void;
  currentStage: number;
  setCurrentStage: (arg: number) => void;
};
