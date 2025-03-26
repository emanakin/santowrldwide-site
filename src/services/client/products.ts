import { ProductCardProps } from "@/types/product-types";

export const fetchProductsBySearch = async (
  query: string
): Promise<ProductCardProps[]> => {
  try {
    const response = await fetch(
      `/api/products/search?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const results = await response.json();
    console.log("Search results from API:", results);

    // Check if results is an array and not empty
    if (Array.isArray(results) && results.length > 0) {
      console.log(
        "First result structure:",
        JSON.stringify(results[0]).substring(0, 300)
      );
    } else {
      console.log("No search results found or invalid format");
    }

    return results;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};
