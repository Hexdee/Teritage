import { SIGN_UP_URL } from '@/config/path';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect(SIGN_UP_URL);
}
