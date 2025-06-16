import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SMSData {
  phone: string;
  email: string;
}

/**
 * Send welcome SMS to new subscribers
 */
export async function sendWelcomeSMS(data: SMSData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      console.warn("Twilio not configured, skipping SMS");
      return { success: true }; // Fail silently if not configured
    }

    // Clean and validate phone number
    const cleanPhone = cleanPhoneNumber(data.phone);
    if (!cleanPhone) {
      console.warn("Invalid phone number format, skipping SMS");
      return { success: true };
    }

    const message = await client.messages.create({
      body: `🔥 Welcome to SANTOWRLDWIDE! 

Thanks for joining the family! You're now in the loop and will be the first to know when we drop new content and releases.

Stay tuned for exclusive updates!

Reply STOP to opt out.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone,
    });

    console.log("Welcome SMS sent successfully:", message.sid);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

/**
 * Send admin SMS notification when new subscriber joins
 */
export async function sendAdminSMSNotification(data: SMSData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER ||
      !process.env.ADMIN_PHONE
    ) {
      console.warn("Twilio admin SMS not configured, skipping");
      return { success: true };
    }

    const adminPhone = cleanPhoneNumber(process.env.ADMIN_PHONE);
    if (!adminPhone) {
      console.warn("Invalid admin phone number, skipping admin SMS");
      return { success: true };
    }

    const message = await client.messages.create({
      body: `🚨 SANTOWRLDWIDE - New Subscriber!

Email: ${data.email}
Phone: ${data.phone}
Time: ${new Date().toLocaleString()}

Check your email for full details.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: adminPhone,
    });

    console.log("Admin SMS notification sent:", message.sid);
    return { success: true };
  } catch (error) {
    console.error("Error sending admin SMS:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send admin SMS",
    };
  }
}

/**
 * Clean and format phone number for SMS
 */
function cleanPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // If starts with +1, keep it
  if (cleaned.startsWith("+1")) {
    return cleaned;
  }

  // If starts with 1 and is 11 digits, add +
  if (cleaned.startsWith("1") && cleaned.length === 11) {
    return "+" + cleaned;
  }

  // If 10 digits, assume US number and add +1
  if (cleaned.length === 10) {
    return "+1" + cleaned;
  }

  // If starts with +, assume international
  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // Invalid format
  return null;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  return cleanPhoneNumber(phone) !== null;
}
