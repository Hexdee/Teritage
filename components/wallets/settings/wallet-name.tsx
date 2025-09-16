import { CreateUsernameForm } from '@/components/forms/create-username-form';

export default function WalletName({ handleNext }: INextPage) {
  return (
    <div>
      <CreateUsernameForm handleNext={handleNext} />
    </div>
  );
}
