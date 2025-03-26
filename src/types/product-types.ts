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
  availableForSale: boolean;
  quantityAvailable: number;
  priceV2: ProductPrice;
  selectedOptions: {
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

// Define types for product data

export interface ProductPrice {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  priceRange: {
    minVariantPrice: ProductPrice;
  };
  images: {
    edges: {
      node: ProductImage;
    }[];
  };
  options?: {
    id: string;
    name: string;
    values: string[];
  }[];
  variants?: {
    edges: {
      node: ProductVariant;
    }[];
  };
}

export interface ProductsResponse {
  products: {
    edges: {
      node: ShopifyProduct;
    }[];
  };
}

export interface ProductResponse {
  productByHandle: ShopifyProduct | null;
}

export type ProductCardProps = {
  product: {
    handle: string;
    title: string;
    featuredImage: {
      url: string;
      altText: string;
    };
    price: string;
    images: {
      edges: {
        node: ProductImage;
      }[];
    };
  };
};
