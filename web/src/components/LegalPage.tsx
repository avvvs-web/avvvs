import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Crumbs } from './Crumbs';

export interface LegalSection { id: string; title: string; body: ReactNode }

/** A long-form legal page: a title block, a contents list that stays in view, then numbered sections. */
export function LegalPage({ kicker, title, updated, intro, sections }: { kicker: string; title: string; updated: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <>
      <SiteHeader page="other" />
      <main id="main" className="legal">
        <header className="legal-head">
          <Crumbs trail={[{ name: title }]} />
          <p className="legal-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="legal-updated">Last updated {updated}</p>
          <div className="legal-intro">{intro}</div>
        </header>
        <div className="legal-body">
          <nav className="legal-toc" aria-label="On this page">
            <p className="legal-toc-h">On this page</p>
            <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
          </nav>
          <div className="legal-sections">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}><span className="legal-no">{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
