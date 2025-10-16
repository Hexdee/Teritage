import { CreateUsernameForm } from '@/components/forms/create-username-form';
import type { INextPage } from '@/type';

export default function WalletName({ handleNext }: INextPage) {
  return (
    <div>
      <CreateUsernameForm handleNext={handleNext} />
    </div>
  );
}
