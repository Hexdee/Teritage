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
