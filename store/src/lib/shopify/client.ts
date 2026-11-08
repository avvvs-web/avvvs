import 'server-only';

/*
 * One door to the Shopify Storefront API. Server side only: the private token never reaches the
 * browser. With no token set it uses Shopify's tokenless access, which covers products,
 * collections, search and the cart (metafields need a token).
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'avvvsglobal.myshopify.com';
const VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';
const PRIVATE = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN?.trim();
const PUBLIC = process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN?.trim();
export const ENDPOINT = `https://${DOMAIN}/api/${VERSION}/graphql.json`;
export const HAS_TOKEN = !!(PRIVATE || PUBLIC);

export class ShopifyError extends Error {
  constructor(message: string, public details?: unknown) { super(message); this.name = 'ShopifyError'; }
}

type Opts = {
  /** cache tags for revalidateTag (from the Shopify webhook) */
  tags?: string[];
  /** seconds; false = never cached (carts, anything per-visitor) */
  revalidate?: number | false;
  buyerIp?: string;
};

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (PRIVATE) {
    headers['Shopify-Storefront-Private-Token'] = PRIVATE;
    if (opts.buyerIp) headers['Shopify-Storefront-Buyer-IP'] = opts.buyerIp;
  } else if (PUBLIC) {
    headers['X-Shopify-Storefront-Access-Token'] = PUBLIC;
  }

  const noCache = opts.revalidate === false;
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      ...(noCache
        ? { cache: 'no-store' as const }
        : { next: { revalidate: opts.revalidate ?? 300, tags: ['shopify', ...(opts.tags ?? [])] } }),
    });
  } catch (e) {
    throw new ShopifyError('Could not reach Shopify', e);
  }

  const body = (await res.json().catch(() => null)) as { data?: T; errors?: { message: string }[] } | null;
  if (!res.ok || !body) throw new ShopifyError(`Shopify responded ${res.status}`, body);
  if (body.errors?.length) {
    // Tokenless access refuses some fields (metafields). Surface it plainly rather than crash pages.
    throw new ShopifyError(body.errors.map((e) => e.message).join('; '), body.errors);
  }
  return body.data as T;
}

/** For pages that should still render if Shopify is briefly unreachable. */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch (e) { console.error('[shopify]', (e as Error).message); return fallback; }
}
