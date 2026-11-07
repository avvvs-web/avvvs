import { AvvvsLockup } from '@/components/Logo';

/** Shown by the admin until Neon and Blob are added to the Vercel project. */
export function NotConnected() {
  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        <AvvvsLockup height={44} alt="" />
        <h1>Connect the database</h1>
        <p>The Journal admin stores articles in Neon Postgres and images in Vercel Blob. In the Vercel project, open Storage and add:</p>
        <ol className="ad-steps">
          <li><b>Neon</b> (Postgres), which sets <code>DATABASE_URL</code></li>
          <li><b>Blob</b>, which sets <code>BLOB_READ_WRITE_TOKEN</code></li>
          <li>an environment variable <code>ADMIN_SETUP_KEY</code>: any long random phrase, used once to create the first admin</li>
        </ol>
        <p>Then redeploy and come back here.</p>
      </div>
    </main>
  );
}
