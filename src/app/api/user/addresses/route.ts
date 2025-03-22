import { NextResponse } from "next/server";
import { getUserFromFirestore } from "@/lib/firebase/client/firestore";
import { verifyAuthToken } from "@/lib/firebase/admin/auth";
import {
  getCustomerAddresses,
  createCustomerAddress,
} from "@/lib/shopify/admin/customer";
import { initializeFirebaseAdmin } from "@/lib/firebase/admin/firebaseAdmin";

initializeFirebaseAdmin();

// GET all addresses for the current user
export async function GET(request: Request) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(userId);

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
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const addressData = await request.json();

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(userId);

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
