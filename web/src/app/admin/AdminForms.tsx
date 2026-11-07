'use client';

import { useActionState, useState, useTransition } from 'react';
import { login, setup, changePassword, addUser, resetPassword, setDisabled, type FormState } from './actions';

function Note({ s }: { s: FormState }) {
  if (s.error) return <p className="ad-note ad-note-error" role="alert">{s.error}</p>;
  if (s.ok) return <p className="ad-note ad-note-ok" role="status">{s.ok}</p>;
  return null;
}

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      <input {...p} />
    </label>
  );
}

export function LoginForm() {
  const [s, act, pending] = useActionState(login, {});
  return (
    <form action={act} className="ad-form">
      <Field label="Email" name="email" type="email" autoComplete="username" required autoFocus />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <Note s={s} />
      <button className="btn" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}

export function SetupForm() {
  const [s, act, pending] = useActionState(setup, {});
  return (
    <form action={act} className="ad-form">
      <Field label="Setup key (ADMIN_SETUP_KEY from Vercel)" name="key" type="password" autoComplete="off" required />
      <Field label="Your name" name="name" autoComplete="name" required />
      <Field label="Your email" name="email" type="email" autoComplete="username" required />
      <Field label="Choose a password (10+ characters)" name="password" type="password" autoComplete="new-password" minLength={10} required />
      <Note s={s} />
      <button className="btn" disabled={pending}>{pending ? 'Creating…' : 'Create the admin account'}</button>
    </form>
  );
}

export function PasswordForm() {
  const [s, act, pending] = useActionState(changePassword, {});
  return (
    <form action={act} className="ad-form">
      <Field label="Current password" name="current" type="password" autoComplete="current-password" required />
      <Field label="New password (10+ characters)" name="next" type="password" autoComplete="new-password" minLength={10} required />
      <Note s={s} />
      <button className="btn" disabled={pending}>{pending ? 'Saving…' : 'Change password'}</button>
    </form>
  );
}

export function AddUserForm() {
  const [s, act, pending] = useActionState(addUser, {});
  return (
    <form action={act} className="ad-form ad-form-row">
      <Field label="Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <label className="ad-field">
        <span>Role</span>
        <select name="role" defaultValue="writer">
          <option value="writer">Writer: writes and edits their own articles</option>
          <option value="admin">Admin: all articles, and manages accounts</option>
        </select>
      </label>
      <button className="btn" disabled={pending}>{pending ? 'Adding…' : 'Add account'}</button>
      <Note s={s} />
    </form>
  );
}

export function UserControls({ id, disabled, self }: { id: number; disabled: boolean; self: boolean }) {
  const [s, setS] = useState<FormState>({});
  const [pending, start] = useTransition();
  if (self) return <span className="ad-muted">You</span>;
  return (
    <div className="ad-user-controls">
      <button type="button" className="link-btn" disabled={pending}
        onClick={() => { if (confirm('Give this person a new temporary password? Their current sessions end.')) start(async () => setS(await resetPassword(id))); }}>
        Reset password
      </button>
      <button type="button" className="link-btn" disabled={pending} onClick={() => start(async () => setS(await setDisabled(id, !disabled)))}>
        {disabled ? 'Enable' : 'Disable'}
      </button>
      <Note s={s} />
    </div>
  );
}
