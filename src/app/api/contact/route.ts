import { NextResponse } from "next/server";
import {
  sendContactEmail,
  ContactEmailData,
} from "@/services/email/emailService";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const {
      fullName,
      email,
      subject,
      message,
      request: requestType,
      orderNumber,
    } = await request.json();

    // Validate required fields
    if (!fullName || typeof fullName !== "string") {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string") {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!requestType || typeof requestType !== "string") {
      return NextResponse.json(
        { error: "Request type is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Get client IP address for logging
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : "127.0.0.1";

    // Check if request is from a known bot/crawler by user agent
    const userAgent = headersList.get("user-agent") || "";
    const botPatterns = [
      /bot/i,
      /crawl/i,
      /spider/i,
      /scraper/i,
      /headless/i,
      /python/i,
      /http/i,
      /curl/i,
      /wget/i,
      /selenium/i,
      /phantomjs/i,
      /puppeteer/i,
    ];

    const isLikelyBot = botPatterns.some((pattern) => pattern.test(userAgent));
    if (isLikelyBot) {
      console.warn(
        `Suspected bot contact attempt: ${userAgent} from ${ipAddress}`
      );
      // Return success but don't actually process (honeypot approach)
      return NextResponse.json({
        success: true,
        message: "Thank you for your message. We'll get back to you soon!",
      });
    }

    // Prepare contact email data
    const contactData: ContactEmailData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      request: requestType,
      orderNumber:
        orderNumber && orderNumber.trim() ? orderNumber.trim() : undefined,
    };

    // Send contact email
    const result = await sendContactEmail(contactData);

    if (!result.success) {
      console.error("Failed to send contact email:", result.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    console.log(
      `Contact form submitted successfully from ${email} (${ipAddress})`
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
