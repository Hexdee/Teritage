import { LOGIN_URL } from '@/config/path';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect(LOGIN_URL);
}
