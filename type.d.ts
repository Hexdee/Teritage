interface ISelectedWallet {
  name: string;
  logo: string;
}

type IType = 'new' | 'existing';

interface ISelectNewWallet {
  type: IType;
  handleNext: (arg: ISelectedWallet) => void;
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
