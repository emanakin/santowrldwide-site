// Product-related type definitions
export interface ProductImage {
  url: string;
  altText: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  available: boolean;
  options: string[];
  availableForSale?: boolean;
  selectedOptions?: {
    name: string;
    value: string;
  }[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  price: string;
  currencyCode: string;
  imageUrl?: string;
  images: ProductImage[];
  options?: ProductOption[];
  variants: ProductVariant[];
}

// Cart-related types
export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  title: string;
  price: string;
  imageUrl?: string;
  size?: string;
}
