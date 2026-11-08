import 'server-only';
import { storefront, safe, HAS_TOKEN } from './client';
import type { Collection, Connection, Filter, Page, PredictiveResult, Product, ProductCard, ProductPage } from './types';
import { PHARMACY_KEYS } from '../medicine';

/* ---------------- fragments ---------------- */

const IMAGE = `fragment Img on Image { url altText width height }`;

const CARD = `
fragment Card on Product {
  id handle title productType availableForSale
  featuredImage { ...Img }
  priceRange { minVariantPrice { amount currencyCode } }
  compareAtPriceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id availableForSale } }
}`;

const PRODUCT = `
fragment Full on Product {
  ...Card
  description descriptionHtml tags vendor updatedAt
  seo { title description }
  images(first: 12) { nodes { ...Img } }
  options { name optionValues { name } }
  collections(first: 20) { nodes { handle title } }
  variants(first: 50) {
    nodes {
      id title availableForSale sku weight weightUnit
      quantityAvailable @include(if: $token)
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      image { ...Img }
    }
  }
  metafields(identifiers: $meta) @include(if: $token) { namespace key value type }
}`;

const COLLECTION = `fragment Coll on Collection { id handle title description descriptionHtml updatedAt image { ...Img } seo { title description } }`;

/* ---------------- listing options ---------------- */

export type Sort = 'featured' | 'name' | 'price-asc' | 'price-desc' | 'newest';
export const SORTS: { value: Sort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'name', label: 'Name, A–Z' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'newest', label: 'Newest' },
];

export type Listing = {
  sort?: Sort;
  inStock?: boolean;
  min?: number;
  max?: number;
  /** a Shopify product type, e.g. KASHAYAM */
  type?: string;
  after?: string | null;
  first?: number;
};

/** Reads ?sort=&stock=1&min=&max=&form=&after= from a page's searchParams. */
export function listingFromParams(sp: Record<string, string | string[] | undefined>, formType?: (slug: string) => string | undefined): Listing {
  const one = (k: string) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; };
  const num = (k: string) => { const n = Number(one(k)); return Number.isFinite(n) && n > 0 ? n : undefined; };
  const sort = one('sort') as Sort | undefined;
  const form = one('form');
  return {
    sort: SORTS.some((s) => s.value === sort) ? sort : undefined,
    inStock: one('stock') === '1',
    min: num('min'),
    max: num('max'),
    type: form && formType ? formType(form) : undefined,
  };
}

function productFilters(l: Listing) {
  const f: Record<string, unknown>[] = [];
  if (l.inStock) f.push({ available: true });
  if (l.min || l.max) f.push({ price: { ...(l.min ? { min: l.min } : {}), ...(l.max ? { max: l.max } : {}) } });
  if (l.type) f.push({ productType: l.type });
  return f;
}

function collectionSort(s?: Sort) {
  switch (s) {
    case 'name': return { sortKey: 'TITLE', reverse: false };
    case 'price-asc': return { sortKey: 'PRICE', reverse: false };
    case 'price-desc': return { sortKey: 'PRICE', reverse: true };
    case 'newest': return { sortKey: 'CREATED', reverse: true };
    default: return { sortKey: 'COLLECTION_DEFAULT', reverse: false };
  }
}
function productSort(s?: Sort) {
  switch (s) {
    case 'price-asc': return { sortKey: 'PRICE', reverse: false };
    case 'price-desc': return { sortKey: 'PRICE', reverse: true };
    case 'newest': return { sortKey: 'CREATED_AT', reverse: true };
    case 'featured': return { sortKey: 'BEST_SELLING', reverse: false };
    default: return { sortKey: 'TITLE', reverse: false };
  }
}

/* ---------------- collections ---------------- */

export async function getCollectionPage(handle: string, l: Listing = {}): Promise<{ collection: Collection; page: ProductPage } | null> {
  const q = `${IMAGE}${CARD}${COLLECTION}
  query Collection($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
      ...Coll
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, filters: $filters) {
        nodes { ...Card }
        pageInfo { hasNextPage endCursor }
        filters { id label type values { id label count input } }
      }
    }
  }`;
  const d = await storefront<{ collection: (Collection & { products: Connection<ProductCard> & { filters: Filter[] } }) | null }>(
    q,
    { handle, first: l.first ?? 24, after: l.after ?? null, ...collectionSort(l.sort), filters: productFilters(l) },
    { tags: ['collections', `collection:${handle}`, 'products'] },
  );
  if (!d.collection) return null;
  const { products, ...collection } = d.collection;
  return { collection, page: { products: products.nodes, pageInfo: products.pageInfo!, filters: products.filters } };
}

export async function getCollections(): Promise<(Collection & { count: number })[]> {
  const q = `${IMAGE}${COLLECTION}
  query Collections { collections(first: 100) { nodes { ...Coll products(first: 1) { nodes { id } } } } }`;
  const d = await storefront<{ collections: Connection<Collection & { products: Connection<{ id: string }> }> }>(q, {}, { tags: ['collections'] });
  // Storefront has no product count; "has at least one" is what the store needs
  return d.collections.nodes.map(({ products, ...c }) => ({ ...c, count: products.nodes.length }));
}

/* ---------------- products ---------------- */

function productQueryString(l: Listing, extra?: string) {
  const parts: string[] = [];
  if (extra) parts.push(extra);
  if (l.type) parts.push(`product_type:"${l.type.replace(/"/g, '')}"`);
  if (l.inStock) parts.push('available_for_sale:true');
  if (l.min) parts.push(`variants.price:>=${l.min}`);
  if (l.max) parts.push(`variants.price:<=${l.max}`);
  return parts.join(' AND ') || null;
}

/** Products by query (form pages, A–Z): the root products connection, which takes search syntax. */
export async function getProducts(l: Listing = {}, extra?: string): Promise<ProductPage> {
  const q = `${IMAGE}${CARD}
  query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...Card }
      pageInfo { hasNextPage endCursor }
    }
  }`;
  const d = await storefront<{ products: Connection<ProductCard> }>(
    q,
    { first: l.first ?? 24, after: l.after ?? null, query: productQueryString(l, extra), ...productSort(l.sort) },
    { tags: ['products'] },
  );
  return { products: d.products.nodes, pageInfo: d.products.pageInfo!, filters: [] };
}

/** Every product, for the A–Z index and the sitemap (the store has a few hundred at most). */
export async function getAllProducts(): Promise<ProductCard[]> {
  const all: ProductCard[] = [];
  let after: string | null = null;
  for (let i = 0; i < 8; i++) {
    const p: ProductPage = await getProducts({ first: 250, after, sort: 'name' });
    all.push(...p.products);
    if (!p.pageInfo.hasNextPage) break;
    after = p.pageInfo.endCursor;
  }
  return all;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const q = `${IMAGE}${CARD}${PRODUCT}
  query Product($handle: String!, $token: Boolean!, $meta: [HasMetafieldsIdentifier!]!) {
    product(handle: $handle) { ...Full }
  }`;
  const d = await storefront<{ product: Product | null }>(
    q,
    { handle, token: HAS_TOKEN, meta: PHARMACY_KEYS.map((key) => ({ namespace: 'pharmacy', key })) },
    { tags: ['products', `product:${handle}`] },
  );
  return d.product;
}

export async function getRecommendations(productId: string, intent: 'RELATED' | 'COMPLEMENTARY' = 'RELATED'): Promise<ProductCard[]> {
  const q = `${IMAGE}${CARD}
  query Recs($id: ID!, $intent: ProductRecommendationIntent) { productRecommendations(productId: $id, intent: $intent) { ...Card } }`;
  const d = await safe(storefront<{ productRecommendations: ProductCard[] | null }>(q, { id: productId, intent }, { tags: ['products'] }), { productRecommendations: [] });
  return d.productRecommendations ?? [];
}

/** Cards for a list of handles (recently viewed, wishlist). */
export async function getProductsByHandles(handles: string[]): Promise<ProductCard[]> {
  if (!handles.length) return [];
  const clean = handles.filter((h) => /^[a-z0-9-]+$/i.test(h)).slice(0, 48);
  if (!clean.length) return [];
  const q = `${IMAGE}${CARD}
  query ByHandle($query: String!, $first: Int!) { products(first: $first, query: $query) { nodes { ...Card } } }`;
  const d = await storefront<{ products: Connection<ProductCard> }>(q, { query: clean.map((h) => `handle:${h}`).join(' OR '), first: clean.length }, { tags: ['products'] });
  const byHandle = new Map(d.products.nodes.map((p) => [p.handle, p]));
  return clean.map((h) => byHandle.get(h)).filter(Boolean) as ProductCard[];
}

/* ---------------- search ---------------- */

export async function searchProducts(term: string, l: Listing = {}): Promise<ProductPage> {
  const q = `${IMAGE}${CARD}
  query Search($term: String!, $first: Int!, $after: String, $sortKey: SearchSortKeys, $reverse: Boolean, $filters: [ProductFilter!]) {
    search(query: $term, first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, types: PRODUCT, productFilters: $filters, unavailableProducts: LAST) {
      totalCount
      nodes { ... on Product { ...Card } }
      pageInfo { hasNextPage endCursor }
      productFilters { id label type values { id label count input } }
    }
  }`;
  const sort = l.sort === 'price-asc' ? { sortKey: 'PRICE', reverse: false } : l.sort === 'price-desc' ? { sortKey: 'PRICE', reverse: true } : { sortKey: 'RELEVANCE', reverse: false };
  const d = await storefront<{ search: Connection<ProductCard> & { totalCount: number; productFilters: Filter[] } }>(
    q,
    { term, first: l.first ?? 24, after: l.after ?? null, ...sort, filters: productFilters(l) },
    { revalidate: 120, tags: ['products'] },
  );
  return { products: d.search.nodes.filter((n) => n && n.handle), pageInfo: d.search.pageInfo!, filters: d.search.productFilters, total: d.search.totalCount };
}

export async function predictiveSearch(term: string): Promise<PredictiveResult> {
  const q = `${IMAGE}
  query Predictive($term: String!) {
    predictiveSearch(query: $term, limit: 8, types: [PRODUCT, COLLECTION, QUERY], unavailableProducts: LAST) {
      products { id handle title productType availableForSale featuredImage { ...Img } priceRange { minVariantPrice { amount currencyCode } } }
      collections { handle title }
      queries { text styledText }
    }
  }`;
  const d = await storefront<{ predictiveSearch: PredictiveResult | null }>(q, { term }, { revalidate: 300, tags: ['products'] });
  return d.predictiveSearch ?? { products: [], collections: [], queries: [] };
}

/* ---------------- content ---------------- */

export async function getPage(handle: string): Promise<Page | null> {
  const q = `query Page($handle: String!) { page(handle: $handle) { id handle title body bodySummary updatedAt seo { title description } } }`;
  const d = await storefront<{ page: Page | null }>(q, { handle }, { revalidate: 3600, tags: ['pages'] });
  return d.page;
}

export async function getPages(): Promise<Pick<Page, 'handle' | 'title' | 'updatedAt'>[]> {
  const d = await storefront<{ pages: Connection<Pick<Page, 'handle' | 'title' | 'updatedAt'>> }>(
    `query Pages { pages(first: 50) { nodes { handle title updatedAt } } }`, {}, { revalidate: 3600, tags: ['pages'] });
  return d.pages.nodes;
}

export type ShopPolicy = { handle: string; title: string; body: string };
export async function getPolicy(handle: string): Promise<ShopPolicy | null> {
  const d = await storefront<{ shop: Record<string, ShopPolicy | null> }>(
    `query Policies { shop {
      privacyPolicy { handle title body } refundPolicy { handle title body }
      shippingPolicy { handle title body } termsOfService { handle title body }
    } }`, {}, { revalidate: 3600, tags: ['pages'] });
  return Object.values(d.shop).find((p) => p?.handle === handle) ?? null;
}
