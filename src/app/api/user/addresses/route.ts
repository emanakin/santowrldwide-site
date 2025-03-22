import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/firebaseApp";
import { getUserFromFirestore } from "@/lib/firebase/firestore";
import {
  getCustomerAddresses,
  createCustomerAddress,
} from "@/lib/shopify/admin/customer";

// GET all addresses for the current user
export async function GET() {
  try {
    const authUser = auth.currentUser;
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(authUser.uid);

    if (!userData || !userData.shopifyCustomerId) {
      return NextResponse.json(
        { error: "User not found or no Shopify ID" },
        { status: 404 }
      );
    }

    // Get addresses from Shopify
    const addresses = await getCustomerAddresses(userData.shopifyCustomerId);

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
    const authUser = auth.currentUser;
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const addressData = await request.json();

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(authUser.uid);

    if (!userData || !userData.shopifyCustomerId) {
      return NextResponse.json(
        { error: "User not found or no Shopify ID" },
        { status: 404 }
      );
    }

    // Create the address in Shopify
    const newAddress = await createCustomerAddress(
      userData.shopifyCustomerId,
      addressData
    );

    if (!newAddress) {
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 400 }
      );
    }

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
