import { GraphQLClient } from "graphql-request";

export const adminClient = new GraphQLClient(
  `${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-04/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }
);
