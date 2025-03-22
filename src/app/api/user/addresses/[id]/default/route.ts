import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/firebaseApp";
import { getUserFromFirestore } from "@/lib/firebase/firestore";
import { setDefaultCustomerAddress } from "@/lib/shopify/admin/customer";

// PUT to set an address as default
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = auth.currentUser;
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const addressId = params.id;

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(authUser.uid);

    if (!userData || !userData.shopifyCustomerId) {
      return NextResponse.json(
        { error: "User not found or no Shopify ID" },
        { status: 404 }
      );
    }

    // Set as default in Shopify
    const success = await setDefaultCustomerAddress(
      userData.shopifyCustomerId,
      addressId
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
