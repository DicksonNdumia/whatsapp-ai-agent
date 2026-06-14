# WhatsApp AI Agent

A WhatsApp AI Agent built with **Node.js** and **Express** that automatically replies to WhatsApp messages using AI-powered responses.

Currently powered by **Google Gemini** and **WhatsApp Cloud API**, this application detects meeting intents and sends email notifications for meeting requests.

## 📋 Features

### 🤖 AI-Powered Responses
- Receive WhatsApp messages via webhook
- Generate intelligent responses using Google Gemini API
- Reply automatically on WhatsApp

### 📅 Meeting Intent Detection
- Automatically detects meeting-related keywords:
  - `meet`, `meeting`, `schedule`, `appointment`, `call`, `discuss`
- Sends email notifications for meeting requests

### 📧 Email Notifications
- Sends meeting request alerts to your email inbox via Resend
- Includes sender name, WhatsApp number, and original message

### 🔐 Secure Integration
- Meta WhatsApp Cloud API for reliable message delivery
- Webhook verification for security
- Environment-based configuration

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **HTTP Client:** Axios
- **AI Model:** Google Gemini API
- **Messaging:** WhatsApp Cloud API (Meta)
- **Email Service:** Resend Email API
- **Configuration:** dotenv

---

## 📁 Project Structure

```
whatsapp-ai-agent/
├── server.js
├── .env (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/DicksonNdumia/whatsapp-ai-agent.git
cd whatsapp-ai-agent
```

### 2. Install Dependencies

```bash
npm install
```

Or install specific packages:

```bash
npm install express dotenv axios @google/genai
```

### 3. Create Environment File

Create a `.env` file in the root directory:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# WhatsApp Cloud API
WHATSAPP_TOKEN=your_whatsapp_access_token
PHONE_NUMBER_ID=your_phone_number_id

# Resend Email API
RESEND_API_KEY=your_resend_api_key
MY_EMAIL_ADDRESS=your_email@example.com

# Server Configuration
PORT=3000
```

### 4. Configure Webhook Verification

In `server.js`, set your webhook verification token:

```javascript
const MY_VERIFY_TOKEN = "your_secret_token_here";
```

Use the same token when configuring the WhatsApp webhook in the [Meta Developer Dashboard](https://developers.facebook.com).

---

## 🚀 Running the Application

Start the server:

```bash
node server.js
```

Or using npm:

```bash
npm start
```

Expected output:

```bash
Server running on port 3000
```

---

## 🔗 API Endpoints

### GET `/webhook` - Webhook Verification

Used by Meta to verify webhook ownership during setup.

**Query Parameters:**
- `hub.mode` - Verification mode
- `hub.challenge` - Challenge token
- `hub.verify_token` - Your verification token

---

### POST `/webhook` - Message Reception

Receives incoming WhatsApp messages and processes them.

**Workflow:**
1. Parse incoming message from WhatsApp
2. Detect meeting intent (keywords analysis)
3. Generate AI response using Gemini
4. Send email notification (if meeting intent detected)
5. Reply to user on WhatsApp

**Payload:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "body": "User message here"
        }]
      }
    }]
  }]
}
```

---

## 📝 Example Workflow

### User sends:
```
Hello, I'd like to schedule a meeting next week.
```

### System processes:
1. ✅ Message received via webhook
2. 🎯 Meeting keyword detected
3. 📧 Email notification sent to owner
4. 🤖 Gemini generates AI response
5. 💬 Response sent to user on WhatsApp

### User receives:
```
Thank you for your message! I'll help you schedule a meeting. 
Please provide more details about your preferred date and time.
```

---

## 📮 Example Notification Email

```
Subject: New WhatsApp Meeting Request

---

Sender Name: John Doe
WhatsApp Number: +254700000000

Message:
"I'd like to schedule a meeting next week."

---
Sent via WhatsApp AI Agent
```

---

## 🌐 Deployment

This application can be deployed on:

- **Render** - Recommended for quick setup
- **Railway**
- **DigitalOcean App Platform**
- **AWS EC2**
- **Heroku** (legacy)
- **Self-hosted VPS**

### Deploy to Render (Recommended)

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Add environment variables in Render settings
6. Deploy

---

## 🔒 Security Best Practices

⚠️ **Important:**
- ❌ Never commit `.env` file to version control
- ❌ Never share API keys publicly
- ✅ Keep all credentials private
- ✅ Use HTTPS in production
- ✅ Validate webhook signatures
- ✅ Restrict webhook access where possible
- ✅ Rotate API keys regularly

Add to `.gitignore`:
```
.env
node_modules/
.DS_Store
*.log
```

---

## 🔑 Getting API Keys

### Google Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add to `GEMINI_API_KEY`

### WhatsApp Cloud API
1. Go to [Meta Developer Dashboard](https://developers.facebook.com)
2. Create a WhatsApp Business Account
3. Get access token and phone number ID
4. Add to `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID`

### Resend Email API
1. Visit [Resend Console](https://resend.com)
2. Create an API key
3. Add to `RESEND_API_KEY`

---

## 🚧 Future Enhancements

- [ ] Conversation memory / context handling
- [ ] Automatic appointment booking integration
- [ ] CRM integration
- [ ] Lead qualification system
- [ ] Multi-language support
- [ ] Voice message transcription
- [ ] Calendar scheduling automation
- [ ] Admin dashboard
- [ ] Message analytics and logging
- [ ] Support for multiple WhatsApp Business Accounts

---

## 📞 Support & Contribution

If you encounter issues or have suggestions:

1. Check existing issues on GitHub
2. Create a new issue with detailed description
3. Include environment setup details
4. Share error logs (without sensitive data)

Contributions are welcome! Feel free to fork and submit pull requests.

---

## 📄 License

This project is open source. Please check for a LICENSE file or specify your preferred license.

---

## ❤️ Built with

- Node.js
- Google Gemini
- WhatsApp Cloud API
- Resend Email Service

**Built with ❤️ for WhatsApp automation**
