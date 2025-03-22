export const GET_PRODUCTS_QUERY = `
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
      }
    }
  }
}`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
query GetProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    handle
    description
    descriptionHtml
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          priceV2 {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
}`;
