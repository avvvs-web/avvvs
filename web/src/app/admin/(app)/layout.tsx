import Link from 'next/link';
import { hasDatabase } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { AvvvsLockup } from '@/components/Logo';
import { logout } from '../actions';
import { NotConnected } from '../NotConnected';

export const dynamic = 'force-dynamic';

export default async function AdminApp({ children }: { children: React.ReactNode }) {
  if (!hasDatabase()) return <NotConnected />;
  const me = await requireUser();
  return (
    <>
      <header className="ad-bar">
        <Link href="/admin" className="ad-mark" aria-label="Journal admin"><AvvvsLockup height={34} alt="" /><span>Journal admin</span></Link>
        <nav className="ad-nav" aria-label="Admin">
          <Link href="/admin">Articles</Link>
          {me.role === 'admin' && <Link href="/admin/users">Accounts</Link>}
          <Link href="/admin/account">{me.name}</Link>
          <Link href="/journal" target="_blank" rel="noopener">View the Journal ↗</Link>
          <form action={logout}><button className="link-btn">Sign out</button></form>
        </nav>
      </header>
      <main className="ad-main">{children}</main>
    </>
  );
}
