import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AvvvsLockup } from '@/components/Logo';
import { hasDatabase } from '@/lib/db';
import { currentUser, userCount } from '@/lib/auth';
import { LoginForm } from '../AdminForms';
import { NotConnected } from '../NotConnected';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in' };

export default async function Login() {
  if (!hasDatabase()) return <NotConnected />;
  if (await currentUser()) redirect('/admin');
  const first = (await userCount()) === 0;
  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        <Link href="/" aria-label="AVVVS home"><AvvvsLockup height={44} alt="" /></Link>
        <h1>Journal admin</h1>
        {first ? (
          <p>No accounts yet. <Link href="/admin/setup">Create the first admin account</Link>.</p>
        ) : (
          <>
            <p>Sign in to write and publish Journal articles.</p>
            <LoginForm />
          </>
        )}
      </div>
    </main>
  );
}
