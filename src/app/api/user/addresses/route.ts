import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomer, createCustomerAddress } from "@/lib/shopify/customers";

// GET all addresses for the current user
export async function GET() {
  try {
    // Get the Shopify customer token from cookies
    const cookieStore = await cookies();
    const shopifyToken = cookieStore.get("shopify_customer_token")?.value;

    if (!shopifyToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get customer data including addresses directly from Shopify using the token
    const customer = await getCustomer(shopifyToken);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Extract and format addresses from the customer data
    const defaultAddressId = customer.defaultAddress?.id;

    const addresses = customer.addresses.edges.map((edge) => {
      const address = edge.node;
      // Set isDefault property based on matching IDs with defaultAddress
      return {
        ...address,
        isDefault: address.id === defaultAddressId,
      };
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST to create a new address
export async function POST(request: Request) {
  try {
    // Get the Shopify customer token from cookies
    const cookieStore = await cookies();
    const shopifyToken = cookieStore.get("shopify_customer_token")?.value;

    if (!shopifyToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const addressData = await request.json();

    // Create the address in Shopify using the customer token
    const addressResponse = await createCustomerAddress(
      shopifyToken,
      addressData
    );

    if (!addressResponse?.customerAddressCreate?.customerAddress) {
      return NextResponse.json(
        {
          error: "Failed to create address",
          details: addressResponse?.customerAddressCreate?.customerUserErrors,
        },
        { status: 400 }
      );
    }

    // Get the customer to determine if this is a default address
    const customer = await getCustomer(shopifyToken);
    const newAddress = addressResponse.customerAddressCreate.customerAddress;
    const isDefault = customer?.defaultAddress?.id === newAddress.id;

    // Return the formatted address
    return NextResponse.json({
      ...newAddress,
      isDefault,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
