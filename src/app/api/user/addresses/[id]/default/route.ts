import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setDefaultCustomerAddress } from "@/lib/shopify/customers";

/**
 * Decode the address ID coming from the URL
 */
function decodeAddressId(encodedId: string): string {
  try {
    return decodeURIComponent(encodedId);
  } catch (error) {
    console.warn("Error decoding address ID:", error);
    return encodedId; // Return as-is if decoding fails
  }
}

// PUT to set an address as default
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the Shopify customer token from cookies
    const cookieStore = await cookies();
    const shopifyToken = cookieStore.get("shopify_customer_token")?.value;

    if (!shopifyToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Decode the address ID from URL
    const id = (await params).id;
    const addressId = decodeAddressId(id);
    console.log("Setting default address with ID:", addressId);

    // Set as default in Shopify
    const defaultResponse = await setDefaultCustomerAddress(
      shopifyToken,
      addressId
    );

    if (!defaultResponse?.customerDefaultAddressUpdate?.customer) {
      console.error(
        "Default address response errors:",
        defaultResponse?.customerDefaultAddressUpdate?.customerUserErrors
      );
      return NextResponse.json(
        {
          error: "Failed to set default address",
          details:
            defaultResponse?.customerDefaultAddressUpdate?.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    );
  }
}
