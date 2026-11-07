import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { formatDate } from '@/lib/journal';
import { AddUserForm, UserControls } from '../../AdminForms';

export const metadata = { title: 'Accounts' };

export default async function Users() {
  const me = await requireAdmin();
  const rows = (await sql()`SELECT id, name, email, role, disabled, created_at FROM users ORDER BY created_at`) as
    { id: number; name: string; email: string; role: string; disabled: boolean; created_at: string }[];
  return (
    <div className="ad-page">
      <div className="ad-head">
        <div>
          <h1>Accounts</h1>
          <p className="ad-muted">Everyone who can write for the Journal. Writers edit their own articles; admins edit all of them and manage accounts.</p>
        </div>
      </div>
      <table className="ad-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Since</th><th /></tr></thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className={u.disabled ? 'is-disabled' : undefined}>
              <td><b>{u.name}</b>{u.disabled && <span className="ad-pill ad-pill-draft">Disabled</span>}</td>
              <td>{u.email}</td>
              <td>{u.role === 'admin' ? 'Admin' : 'Writer'}</td>
              <td>{formatDate(String(u.created_at).slice(0, 10))}</td>
              <td><UserControls id={u.id} disabled={u.disabled} self={u.id === me.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="ad-card">
        <h2>Add an account</h2>
        <p className="ad-muted">They get a temporary password to share with them privately; they can change it once signed in.</p>
        <AddUserForm />
      </section>
    </div>
  );
}
