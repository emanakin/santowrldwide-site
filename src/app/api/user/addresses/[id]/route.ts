import { NextResponse } from "next/server";
import { getUserFromFirestore } from "@/lib/firebase/client/firestore";
import { verifyAuthToken } from "@/lib/firebase/admin/auth";
import { initializeFirebaseAdmin } from "@/lib/firebase/admin/firebaseAdmin";
import {
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/shopify/admin/customer";

// Initialize Firebase Admin if not already done
initializeFirebaseAdmin();

// PUT to update an address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Add error handling for JSON parsing
    let addressData;
    try {
      addressData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Sanitize the address ID by removing the query parameter
    const param = await params;
    const addressId = param.id;
    const cleanAddressId = addressId.split("?")[0];

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(userId);

    if (!userData || !userData.shopifyCustomerId) {
      return NextResponse.json(
        { error: "User not found or no Shopify ID" },
        { status: 404 }
      );
    }

    // Update the address in Shopify
    const updatedAddress = await updateCustomerAddress(
      userData.shopifyCustomerId,
      cleanAddressId,
      addressData
    );

    if (!updatedAddress) {
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedAddress);
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
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Sanitize the address ID by removing the query parameter
    const param = await params;
    const addressId = param.id;
    const cleanAddressId = addressId.split("?")[0];

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(userId);

    if (!userData || !userData.shopifyCustomerId) {
      return NextResponse.json(
        { error: "User not found or no Shopify ID" },
        { status: 404 }
      );
    }

    // Delete the address in Shopify
    const success = await deleteCustomerAddress(
      userData.shopifyCustomerId,
      cleanAddressId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete address" },
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
