import type { QA } from '@/lib/faq';
import { faqLd } from '@/lib/site';
import { JsonLd } from './JsonLd';

/** Questions and answers, readable on the page and mirrored as FAQPage structured data. */
export function Faq({ id, title, items }: { id: string; title: string; items: QA[] }) {
  return (
    <section className="faq" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="faq-title">{title}</h2>
      <div className="faq-list">
        {items.map((it, i) => (
          <details key={it.q} className="faq-item" open={i === 0}>
            <summary><span>{it.q}</span><i aria-hidden="true" /></summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqLd(items)} />
    </section>
  );
}
