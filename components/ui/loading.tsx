import { TailSpinPreloader } from '../icons/tail-spin-preloader';

export function ActionLoading() {
  return (
    <div className="min-h-[30vh] items-center w-full flex justify-center">
      <TailSpinPreloader width={100} height={100} fill="#224FF0" />
    </div>
  );
}
