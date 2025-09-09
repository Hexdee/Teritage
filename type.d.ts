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
  handleNext: () => void;
}

interface INextPage {
  handleNext: () => void;
  className?: string;
}
