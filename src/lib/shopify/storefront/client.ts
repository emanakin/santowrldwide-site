import { GraphQLClient } from "graphql-request";

export const storefrontClient = new GraphQLClient(
  `${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token":
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      "Content-Type": "application/json",
    },
  }
);
