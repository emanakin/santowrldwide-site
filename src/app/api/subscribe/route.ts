import { NextResponse } from "next/server";
import { addSubscriber } from "@/services/api/newsletter";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          error: "Valid email is required",
        },
        { status: 400 }
      );
    }

    // Get client IP address
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
      console.warn(`Suspected bot attempt: ${userAgent} from ${ipAddress}`);
      // Return success but don't actually process (honeypot approach)
      return NextResponse.json({
        success: true,
        message: "Thanks for subscribing!",
      });
    }

    // Add subscriber with IP address for rate limiting
    const result = await addSubscriber(email, "website", ipAddress);

    if (!result.success) {
      // Special handling for rate limited responses
      if (result.rateLimited) {
        return NextResponse.json(
          {
            error:
              result.error ||
              "Too many subscription attempts, please try again later",
          },
          { status: 429 }
        ); // 429 Too Many Requests
      }

      return NextResponse.json(
        {
          error: result.error || "Failed to subscribe",
        },
        { status: 400 }
      );
    }

    // Return appropriate response based on whether the subscriber was new or existing
    if (result.exists) {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "Thanks for subscribing!",
      });
    }
  } catch (error) {
    console.error("Error in subscribe API:", error);
    return NextResponse.json(
      {
        error: "Failed to process subscription",
      },
      { status: 500 }
    );
  }
}
