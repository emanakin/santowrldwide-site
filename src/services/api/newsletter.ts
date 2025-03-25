import {
  adminDb,
  isAdminSDKAvailable,
} from "@/lib/firebase/admin/firebaseAdmin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export interface SubscriberData {
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: "active" | "unsubscribed";
  source?: string;
  version: number;
  ipAddress?: string; // Store IP for rate limiting
  verified?: boolean; // Track if email is verified
}

// Define proper types for rate limiting data
interface IpRateData {
  count: number;
  timestamps: number[];
}

interface RateLimitData {
  ips: Record<string, IpRateData>;
  globalRequests: number[];
}

// Rate limiting configurations
const RATE_LIMIT = {
  MAX_REQUESTS_PER_IP: 5, // Maximum 5 subscriptions per IP
  TIME_WINDOW_MINUTES: 60, // Within a 60 minute window
  GLOBAL_REQUESTS_PER_MIN: 30, // Maximum 30 total subscriptions per minute
};

/**
 * Add or update a subscriber to the newsletter
 */
export async function addSubscriber(
  email: string,
  source = "website",
  ipAddress?: string
): Promise<{
  success: boolean;
  error?: string;
  exists?: boolean;
  rateLimited?: boolean;
}> {
  if (!isAdminSDKAvailable() || !adminDb) {
    console.error("Firebase Admin SDK not available");
    return { success: false, error: "Database connection error" };
  }

  try {
    // Check rate limiting if IP address is provided
    if (ipAddress) {
      const rateCheck = await checkIpRateLimit(ipAddress);
      if (!rateCheck.allowed) {
        return {
          success: false,
          error: rateCheck.reason || "Rate limit exceeded",
          rateLimited: true,
        };
      }
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Reference to subscribers collection
    const subscribersRef = adminDb.collection("newsletter_subscribers");

    // Use a transaction to ensure uniqueness
    return await adminDb.runTransaction(async (transaction) => {
      // Check if email already exists - include in transaction
      const emailQuery = subscribersRef.where("email", "==", normalizedEmail);
      const emailDocs = await transaction.get(emailQuery);

      if (!emailDocs.empty) {
        // Email already exists, update the timestamp and ensure status is active
        const docId = emailDocs.docs[0].id;
        transaction.update(subscribersRef.doc(docId), {
          updatedAt: Timestamp.now(),
          status: "active",
          source: source,
        });

        console.log(`Subscriber updated: ${normalizedEmail}`);
        return { success: true, exists: true };
      }

      // Add new subscriber
      const newSubscriber: SubscriberData = {
        email: normalizedEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: "active",
        source: source,
        version: 1,
        ipAddress: ipAddress,
      };

      // Create a new document reference
      const newDocRef = subscribersRef.doc();
      transaction.set(newDocRef, newSubscriber);

      console.log(`New subscriber added: ${normalizedEmail}`);
      return { success: true, exists: false };
    });
  } catch (error) {
    console.error("Error adding subscriber:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Unsubscribe an email from the newsletter
 */
export async function unsubscribeEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  if (!isAdminSDKAvailable() || !adminDb) {
    return { success: false, error: "Database connection error" };
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const subscribersRef = adminDb.collection("newsletter_subscribers");

    const emailDoc = await subscribersRef
      .where("email", "==", normalizedEmail)
      .get();

    if (emailDoc.empty) {
      return { success: false, error: "Email not found" };
    }

    // Update status to unsubscribed
    const docId = emailDoc.docs[0].id;
    await subscribersRef.doc(docId).update({
      updatedAt: Timestamp.now(),
      status: "unsubscribed",
    });

    console.log(`Subscriber unsubscribed: ${normalizedEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all active subscribers
 */
export async function getActiveSubscribers(): Promise<SubscriberData[]> {
  if (!isAdminSDKAvailable() || !adminDb) {
    console.error("Firebase Admin SDK not available");
    return [];
  }

  try {
    const subscribersRef = adminDb.collection("newsletter_subscribers");
    const snapshot = await subscribersRef.where("status", "==", "active").get();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as SubscriberData;
      return data;
    });
  } catch (error) {
    console.error("Error getting subscribers:", error);
    return [];
  }
}

/**
 * Check if IP is hitting rate limits
 */
export async function checkIpRateLimit(
  ipAddress: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (!adminDb) return { allowed: true }; // Skip if no DB connection

  try {
    // Get rate limit doc
    const rateLimitRef = adminDb.collection("rate_limits").doc("ip_limits");

    return await adminDb.runTransaction(async (transaction) => {
      const rateLimitDoc = await transaction.get(rateLimitRef);

      // Current timestamp minus time window
      const cutoffTime = new Date();
      cutoffTime.setMinutes(
        cutoffTime.getMinutes() - RATE_LIMIT.TIME_WINDOW_MINUTES
      );

      // Initialize/update rate limiting data with proper typing
      const rateData: RateLimitData = rateLimitDoc.exists
        ? (rateLimitDoc.data() as RateLimitData)
        : { ips: {}, globalRequests: [] };

      // Clean up old data (older than time window)
      if (rateData.globalRequests) {
        rateData.globalRequests = rateData.globalRequests.filter(
          (timestamp: number) => timestamp > cutoffTime.getTime()
        );
      } else {
        rateData.globalRequests = [];
      }

      // Check global rate limit
      if (
        rateData.globalRequests.length >= RATE_LIMIT.GLOBAL_REQUESTS_PER_MIN
      ) {
        return {
          allowed: false,
          reason: "Too many subscription requests. Please try again later.",
        };
      }

      // Check IP-specific rate limit
      const ipData: IpRateData = rateData.ips[ipAddress] || {
        count: 0,
        timestamps: [],
      };

      // Filter out old timestamps
      ipData.timestamps = ipData.timestamps.filter(
        (timestamp: number) => timestamp > cutoffTime.getTime()
      );

      // Check if IP has hit the limit
      if (ipData.timestamps.length >= RATE_LIMIT.MAX_REQUESTS_PER_IP) {
        return {
          allowed: false,
          reason: "Too many subscription attempts. Please try again later.",
        };
      }

      // Update rate limit data
      ipData.timestamps.push(Date.now());
      ipData.count = ipData.timestamps.length;
      rateData.ips[ipAddress] = ipData;
      rateData.globalRequests.push(Date.now());

      // Save updated rate limit data
      transaction.set(rateLimitRef, rateData);

      // Log suspicious activity if approaching limits
      if (ipData.count >= RATE_LIMIT.MAX_REQUESTS_PER_IP - 1 && adminDb) {
        const suspiciousActivityRef = adminDb
          .collection("suspicious_activity")
          .doc();
        transaction.set(suspiciousActivityRef, {
          ipAddress,
          activity: "multiple_subscriptions",
          count: ipData.count,
          timestamp: FieldValue.serverTimestamp(),
        });
      }

      return { allowed: true };
    });
  } catch (error) {
    console.error("Rate limit check error:", error);
    // If rate limiting fails, allow the request to continue (fail open for user experience)
    return { allowed: true };
  }
}
