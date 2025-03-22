import { NextResponse } from "next/server";
import { getUserFromFirestore } from "@/lib/firebase/client/firestore";
import { verifyAuthToken } from "@/lib/firebase/admin/auth";
import { initializeFirebaseAdmin } from "@/lib/firebase/admin/firebaseAdmin";
import { setDefaultCustomerAddress } from "@/lib/shopify/admin/customer";

// Initialize Firebase Admin if not already done
initializeFirebaseAdmin();

// PUT to set an address as default
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyAuthToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    // Set as default in Shopify
    const success = await setDefaultCustomerAddress(
      userData.shopifyCustomerId,
      cleanAddressId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to set default address" },
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
