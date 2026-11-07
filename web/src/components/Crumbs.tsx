import Link from 'next/link';

/** The visible breadcrumb on every inner page (the JSON-LD BreadcrumbList mirrors it). */
export function Crumbs({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        {trail.map((c, i) => (
          <li key={c.name}>
            {c.href && i < trail.length - 1 ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
