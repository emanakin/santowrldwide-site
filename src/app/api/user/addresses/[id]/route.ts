import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase/firebaseApp";
import { getUserFromFirestore } from "@/lib/firebase/firestore";
import {
  updateCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/shopify/admin/customer";

// PUT to update an address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = auth.currentUser;
    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const addressData = await request.json();
    const addressId = params.id;

    // Get the user document to retrieve the Shopify customer ID
    const userData = await getUserFromFirestore(authUser.uid);

    if (!userData || !userData.shopifyCustomerId) {
      return NextResponse.json(
        { error: "User not found or no Shopify ID" },
        { status: 404 }
      );
    }

    // Update the address in Shopify
    const updatedAddress = await updateCustomerAddress(
      userData.shopifyCustomerId,
      addressId,
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

    // Delete the address in Shopify
    const success = await deleteCustomerAddress(
      userData.shopifyCustomerId,
      addressId
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
