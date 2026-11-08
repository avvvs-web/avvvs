// Shapes of what the Storefront queries in ./queries.ts return, kept by hand to match them.

export type Money = { amount: string; currencyCode: string };
export type Image = { url: string; altText: string | null; width: number | null; height: number | null };
export type Connection<T> = { nodes: T[]; pageInfo?: PageInfo };
export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type Metafield = { key: string; value: string; type: string; namespace: string } | null;

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  sku: string | null;
  price: Money;
  compareAtPrice: Money | null;
  quantityAvailable?: number | null;
  weight: number | null;
  weightUnit: string;
  selectedOptions: { name: string; value: string }[];
  image: Image | null;
};

/** A product as it appears in a grid. */
export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money };
  variants: { nodes: Pick<Variant, 'id' | 'availableForSale'>[] };
};

export type Product = ProductCard & {
  description: string;
  descriptionHtml: string;
  tags: string[];
  vendor: string;
  updatedAt: string;
  seo: { title: string | null; description: string | null };
  images: Connection<Image>;
  variants: Connection<Variant>;
  options: { name: string; optionValues: { name: string }[] }[];
  collections: Connection<{ handle: string; title: string }>;
  metafields?: Metafield[];
};

export type Filter = {
  id: string;
  label: string;
  type: 'LIST' | 'PRICE_RANGE' | 'BOOLEAN';
  values: { id: string; label: string; count: number; input: string }[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  seo: { title: string | null; description: string | null };
  updatedAt: string;
};

export type ProductPage = {
  products: ProductCard[];
  pageInfo: PageInfo;
  filters: Filter[];
  total?: number;
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money; amountPerQuantity: Money; compareAtAmountPerQuantity: Money | null };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    image: Image | null;
    price: Money;
    product: { handle: string; title: string; productType: string };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  note: string | null;
  attributes: { key: string; value: string | null }[];
  discountCodes: { code: string; applicable: boolean }[];
  cost: { subtotalAmount: Money; totalAmount: Money; totalTaxAmount: Money | null };
  lines: Connection<CartLine>;
  buyerIdentity: { email: string | null } | null;
};

export type Page = { id: string; handle: string; title: string; body: string; bodySummary: string; updatedAt: string; seo: { title: string | null; description: string | null } };

export type PredictiveResult = {
  products: Pick<ProductCard, 'id' | 'handle' | 'title' | 'productType' | 'featuredImage' | 'priceRange' | 'availableForSale'>[];
  collections: { handle: string; title: string }[];
  queries: { text: string; styledText: string }[];
};
