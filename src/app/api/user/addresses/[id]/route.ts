import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/shopify/customers";

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

// PUT to update an address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the Shopify customer token from cookies
    const cookieStore = await cookies();
    const shopifyToken = cookieStore.get("shopify_customer_token")?.value;

    if (!shopifyToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Decode the address ID from URL
    const addressId = decodeAddressId(params.id);
    const addressData = await request.json();

    console.log("Updating address with ID:", addressId);

    // Update the address in Shopify
    const updateResponse = await updateCustomerAddress(
      shopifyToken,
      addressId,
      addressData
    );

    if (!updateResponse?.customerAddressUpdate?.customerAddress) {
      console.error(
        "Update response errors:",
        updateResponse?.customerAddressUpdate?.customerUserErrors
      );
      return NextResponse.json(
        {
          error: "Failed to update address",
          details: updateResponse?.customerAddressUpdate?.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      updateResponse.customerAddressUpdate.customerAddress
    );
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE to remove an address
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the Shopify customer token from cookies
    const cookieStore = await cookies();
    const shopifyToken = cookieStore.get("shopify_customer_token")?.value;

    if (!shopifyToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Decode the address ID from URL
    const addressId = decodeAddressId(params.id);
    console.log("Deleting address with ID:", addressId);

    // Delete the address in Shopify
    const deleteResponse = await deleteCustomerAddress(shopifyToken, addressId);

    if (!deleteResponse?.customerAddressDelete?.deletedCustomerAddressId) {
      console.error(
        "Delete response errors:",
        deleteResponse?.customerAddressDelete?.customerUserErrors
      );
      return NextResponse.json(
        {
          error: "Failed to delete address",
          details: deleteResponse?.customerAddressDelete?.customerUserErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
