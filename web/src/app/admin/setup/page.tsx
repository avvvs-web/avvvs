import { redirect } from 'next/navigation';
import { AvvvsLockup } from '@/components/Logo';
import { hasDatabase } from '@/lib/db';
import { userCount } from '@/lib/auth';
import { SetupForm } from '../AdminForms';
import { NotConnected } from '../NotConnected';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'First admin' };

export default async function Setup() {
  if (!hasDatabase()) return <NotConnected />;
  if ((await userCount()) > 0) redirect('/admin/login');
  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        <AvvvsLockup height={44} alt="" />
        <h1>Create the first admin</h1>
        <p>This works once, while there are no accounts. You need the <code>ADMIN_SETUP_KEY</code> set in the Vercel project.</p>
        <SetupForm />
      </div>
    </main>
  );
}
