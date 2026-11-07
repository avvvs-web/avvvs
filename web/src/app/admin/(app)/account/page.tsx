import { requireUser } from '@/lib/auth';
import { PasswordForm } from '../../AdminForms';

export const metadata = { title: 'Account' };

export default async function Account() {
  const me = await requireUser();
  return (
    <div className="ad-page ad-narrow">
      <h1>{me.name}</h1>
      <p className="ad-muted">{me.email} · {me.role === 'admin' ? 'Admin' : 'Writer'}</p>
      <section className="ad-card">
        <h2>Change your password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
