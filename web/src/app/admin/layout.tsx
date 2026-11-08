import type { Metadata } from 'next';
import './admin.css';

// The Journal admin: kept out of search and out of the public site's chrome.
export const metadata: Metadata = {
  title: { default: 'Journal admin', template: '%s · Journal admin' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="ad">{children}</div>;
}
