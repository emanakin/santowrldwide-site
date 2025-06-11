# SMS Notifications Setup Guide

This guide explains how to set up automated SMS notifications for SANTOWRLDWIDE subscribers who provide phone numbers.

## 🔧 **Required Environment Variables**

Add these to your `.env.local` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number

# Optional: Admin SMS notifications
ADMIN_PHONE=+1234567890  # Your phone number for admin notifications
```

## 📱 **Twilio Setup Steps**

### 1. Create Twilio Account

1. Go to [twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Complete phone verification

### 2. Get Your Credentials

1. Go to Twilio Console Dashboard
2. Find your **Account SID** and **Auth Token**
3. Copy both values

### 3. Get a Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number (free trial gives you one number)
3. Copy the phone number (format: +1234567890)

### 4. Configure Environment Variables

Update your `.env.local` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
ADMIN_PHONE=+15559876543
```

## 🚀 **What Gets Automated**

### When someone subscribes WITH a phone number:

#### Welcome SMS (to subscriber):

```
🔥 Welcome to SANTOWRLDWIDE!

Thanks for joining the family! You're now in the loop and will be the first to know when we drop new content and releases.

Stay tuned for exclusive updates!

Reply STOP to opt out.
```

#### Admin SMS (to you):

```
🚨 SANTOWRLDWIDE - New Subscriber!

Email: user@example.com
Phone: +1234567890
Time: 12/6/2024, 3:24:15 PM

Check your email for full details.
```

### When someone subscribes WITHOUT a phone number:

- Only email notifications sent
- No SMS sent (graceful handling)

## 📊 **Current Workflow**

When someone subscribes with phone number, they get:

1. ✅ **Welcome Email** (via Resend)
2. ✅ **Welcome SMS** (via Twilio) - NEW!
3. ✅ **Stored in Database** (Firestore)

You (admin) get:

1. ✅ **Admin Email Notification** (via Resend)
2. ✅ **Admin SMS Notification** (via Twilio) - NEW!

## 🧪 **Testing SMS**

### Basic Test

1. Set up environment variables
2. Restart your development server
3. Go to locked page and subscribe with your phone number
4. Check your phone for welcome SMS

### Console Output (Success)

```
New subscriber added: test@example.com
Welcome email sent successfully: { id: '...' }
Welcome SMS sent successfully: SMxxxxxxxxxxxx
Admin notification sent successfully: { id: '...' }
Admin SMS notification sent: SMxxxxxxxxxxxx
```

## 💰 **Twilio Pricing**

### Free Trial

- $15.50 in free credits
- One free phone number
- SMS: $0.0075 per message
- Perfect for testing and small volume

### Production

- SMS: $0.0075 per message sent
- Phone number: ~$1/month
- Very affordable for notification purposes

## 🔧 **Phone Number Handling**

The system automatically handles various phone formats:

- `1234567890` → `+11234567890`
- `+1234567890` → `+1234567890`
- `(123) 456-7890` → `+11234567890`
- International numbers supported

## 🛡️ **Privacy & Compliance**

### Automatic Opt-out

- All SMS include "Reply STOP to opt out"
- Twilio handles STOP requests automatically
- Required by SMS regulations

### Data Storage

- Phone numbers stored securely in Firestore
- Only sent SMS if explicitly provided by user
- No SMS sent to email-only subscribers

## 🚨 **Error Handling**

The system gracefully handles:

- Invalid phone numbers (skips SMS)
- Twilio service outages (continues with email)
- Missing credentials (development mode)
- International numbers (properly formatted)

## 🔄 **Manual vs Automated**

### Current Setup (Automated) ✅

**Pros:**

- Instant notifications
- No manual work required
- Consistent messaging
- Scales automatically

**Cons:**

- Uses Twilio credits
- Less control over timing

### Alternative: Manual Scripts

You could create manual sending scripts, but the automated approach is better because:

- Immediate response to subscribers
- No risk of forgetting to send
- Professional user experience
- Easy to monitor and debug

## 📝 **Development vs Production**

### Development

- Use your personal phone for testing
- Monitor console logs for errors
- Small volume, use free Twilio credits

### Production

- Set up proper admin phone number
- Monitor Twilio usage and costs
- Consider SMS volume limits

## 🔍 **Troubleshooting**

### SMS Not Received

1. Check console logs for Twilio errors
2. Verify phone number format
3. Check Twilio console for message status
4. Ensure phone can receive SMS from US numbers

### Invalid Phone Numbers

1. System automatically validates and cleans numbers
2. Invalid numbers are skipped gracefully
3. Check console for "Invalid phone number format" warnings

### Twilio Errors

1. Verify Account SID and Auth Token
2. Check Twilio phone number is active
3. Ensure sufficient account balance
4. Check Twilio status page for outages

## 📋 **Complete Environment Example**

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=info@santowrldwide.com
ADMIN_EMAIL=info@santowrldwide.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
ADMIN_PHONE=+15559876543
```

This gives you complete email + SMS automation for subscriber notifications! 🚀
