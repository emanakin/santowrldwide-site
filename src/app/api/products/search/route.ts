import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/shopify/products";
import { ProductCardProps } from "@/types/product-types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query) {
      return NextResponse.json([]);
    }

    // Search products in Shopify
    const products = await getProducts();

    // Filter products based on search query
    const filteredProducts = products.filter((product) => {
      if (!product || !product.title) {
        return false;
      }

      const title = product.title.toLowerCase();
      const searchQuery = query.toLowerCase();
      return title.includes(searchQuery);
    });

    // Transform products into the format expected by the UI
    const formattedProducts = filteredProducts.map(
      (product): ProductCardProps => ({
        product: {
          handle: product.handle,
          title: product.title,
          price: product.price,
          featuredImage: {
            url: product.featuredImage?.url || "",
            altText: product.featuredImage?.altText || product.title,
          },
          images: {
            edges: [
              {
                node: {
                  url: product.featuredImage?.url || "",
                  altText: product.featuredImage?.altText || product.title,
                },
              },
            ],
          },
        },
      })
    );

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
