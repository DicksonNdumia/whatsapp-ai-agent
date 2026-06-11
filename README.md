# WhatsApp AI Assistant with Gemini & Meeting Notifications

A WhatsApp AI Assistant built using **Node.js**, **Express**, **Google Gemini**, **WhatsApp Cloud API**, and **Resend Email API**.

The assistant can:

- Receive WhatsApp messages via webhook.
- Generate AI-powered responses using Gemini.
- Reply directly on WhatsApp.
- Detect meeting-related intents.
- Send email notifications when users request meetings, calls, or appointments.

---

## Features

### AI-Powered WhatsApp Chat

Incoming WhatsApp messages are processed by Google's Gemini model and responded to automatically.

### Meeting Intent Detection

The assistant scans messages for keywords such as:

- meet
- meeting
- schedule
- appointment
- call
- discuss

When detected, an email notification is sent to the owner.

### Email Notifications

Meeting requests are forwarded to your email inbox using Resend.

Notification email includes:

- Sender Name
- WhatsApp Number
- Original Message

### Secure WhatsApp Integration

Uses the Meta WhatsApp Cloud API to:

- Receive messages
- Send responses
- Verify webhook subscriptions

---

# Tech Stack

- Node.js
- Express.js
- Axios
- Google Gemini API
- WhatsApp Cloud API
- Resend Email API
- dotenv

---

# Project Structure

```bash
project/
│
├── server.js
├── .env
├── package.json
└── README.md
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/whatsapp-ai-assistant.git

cd whatsapp-ai-assistant
```

## 2. Install Dependencies

```bash
npm install
```

Required packages:

```bash
npm install express dotenv axios @google/genai
```

---

# Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key

WHATSAPP_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id

RESEND_API_KEY=your_resend_api_key
MY_EMAIL_ADDRESS=your_email@example.com
```

---

# Meta Webhook Verification

Inside the code:

```javascript
const MY_VERIFY_TOKEN = "your_secret_token_here";
```

Use the same value when configuring the WhatsApp webhook in the Meta Developer Dashboard.

---

# Running the Application

Start the server:

```bash
node server.js
```

or

```bash
npm start
```

Expected output:

```bash
Server running on port 3000
```

---

# Webhook Endpoints

## Verification Endpoint

```http
GET /webhook
```

Used by Meta to verify ownership of the webhook.

---

## Message Endpoint

```http
POST /webhook
```

Receives incoming WhatsApp messages and triggers:

1. Message parsing
2. Meeting intent detection
3. AI response generation
4. WhatsApp reply delivery

---

# Example Workflow

### User Message

```text
Hello, I'd like to schedule a meeting next week.
```

### System Actions

1. WhatsApp sends webhook event.
2. Meeting keyword detected.
3. Email notification sent.
4. Gemini generates response.
5. AI response returned to user on WhatsApp.

---

# Example Notification Email

```text
New WhatsApp Meeting Request

Sender Name: John Doe
WhatsApp Number: +254700000000

Message:
"I'd like to schedule a meeting next week."
```

---

# Deployment

You can deploy this application on:

- Render
- Railway
- VPS
- DigitalOcean
- AWS EC2

For Render:

1. Push code to GitHub.
2. Create a new Web Service.
3. Connect repository.
4. Add environment variables.
5. Deploy.

---

# Security Notes

- Never commit your `.env` file.
- Keep API keys private.
- Restrict webhook access where possible.
- Use HTTPS in production.

---

# Future Improvements

- Conversation memory
- Appointment booking integration
- CRM integration
- Lead qualification
- Multi-language support
- Voice message transcription
- Calendar scheduling automation

---

Built with ❤️ using Gemini, WhatsApp Cloud API, and Node.js.
