import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface WelcomeEmailData {
  email: string;
  phone?: string;
}

/**
 * Send a welcome email to new subscribers
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return { success: true }; // Fail silently in development
    }

    // Use development sender for testing if FROM_EMAIL not configured
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

    if (!process.env.FROM_EMAIL) {
      console.warn(
        `FROM_EMAIL not configured, using development sender: ${fromEmail}`
      );
    }

    const emailData = await resend.emails.send({
      from: fromEmail,
      to: [data.email],
      subject: "Welcome to SANTOWRLDWIDE! 🔥",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 10px;">Welcome to SANTOWRLDWIDE</h1>
            <p style="color: #666; font-size: 16px;">Thanks for joining the family!</p>
          </div>
          
          <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #000; font-size: 18px; margin-bottom: 15px;">You're now in the loop! 🎯</h2>
            <p style="color: #333; line-height: 1.6;">
              We're excited to have you as part of the SANTOWRLDWIDE community. You'll be the first to know when we drop new content, releases, and exclusive updates.
            </p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #000; font-size: 16px; margin-bottom: 10px;">What to expect:</h3>
            <ul style="color: #333; line-height: 1.6;">
              <li>Early access to new drops</li>
              <li>Exclusive content and behind-the-scenes updates</li>
              <li>Special announcements and events</li>
              <li>Community updates and news</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              Stay connected with us:
            </p>
            <p style="color: #666; font-size: 12px;">
              This email was sent to ${data.email}
              ${data.phone ? `<br>Phone: ${data.phone}` : ""}
            </p>
          </div>
        </div>
      `,
      text: `
Welcome to SANTOWRLDWIDE!

Thanks for joining the family! You're now in the loop and will be the first to know when we drop new content, releases, and exclusive updates.

What to expect:
- Early access to new drops
- Exclusive content and behind-the-scenes updates  
- Special announcements and events
- Community updates and news

Stay tuned!

---
This email was sent to ${data.email}
${data.phone ? `Phone: ${data.phone}` : ""}
      `,
    });

    console.log("Welcome email sent successfully:", emailData);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send notification email to admin when new subscriber joins
 */
export async function sendAdminNotification(data: WelcomeEmailData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "Email configuration incomplete, skipping admin notification"
      );
      return { success: true };
    }

    // Use development sender for testing if FROM_EMAIL not configured
    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn("ADMIN_EMAIL not configured, skipping admin notification");
      return { success: true };
    }

    const emailData = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: "New Subscriber - SANTOWRLDWIDE",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #000;">New Subscriber Alert</h2>
          <div style="background: #f8f8f8; padding: 15px; border-radius: 8px;">
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ""}
            <p><strong>Subscribed:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Source:</strong> Website (Locked Page)</p>
          </div>
        </div>
      `,
      text: `
New Subscriber Alert

Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ""}
Subscribed: ${new Date().toLocaleString()}
Source: Website (Locked Page)
      `,
    });

    console.log("Admin notification sent successfully:", emailData);
    return { success: true };
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send admin notification",
    };
  }
}
