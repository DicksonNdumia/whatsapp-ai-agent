# WhatsApp AI Assistant

A simple WhatsApp AI chatbot built with **Node.js**, **Express**, **OpenAI**, and the **WhatsApp Cloud API**.

When a user sends a WhatsApp message:

1. Meta sends the message to your webhook.
2. The server receives the message.
3. The message is sent to OpenAI.
4. OpenAI generates a response.
5. The response is sent back to the user on WhatsApp.

---

## Features

* WhatsApp Cloud API integration
* OpenAI-powered responses
* Express webhook endpoint
* Environment variable configuration
* Automatic message replies

---

## Prerequisites

Before running the project, make sure you have:

* Node.js 18+
* A Meta Developer Account
* A WhatsApp Business App
* WhatsApp Cloud API access
* An OpenAI API key
* A public webhook URL (Ngrok, Vercel, Railway, Render, etc.)

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd whatsapp-ai-assistant
```

Install dependencies:

```bash
npm install
```

Required packages:

```bash
npm install express openai dotenv axios
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key

PHONE_NUMBER_ID=your_whatsapp_phone_number_id

WHATSAPP_TOKEN=your_whatsapp_cloud_api_token
```

---

## Project Structure

```text
project/
│
├── server.js
├── .env
├── package.json
└── README.md
```

---

## Running the Application

Start the server:

```bash
node server.js
```

or

```bash
npm start
```

Expected output:

```text
Server running
```

---

## Webhook Endpoint

The application listens for WhatsApp messages at:

```text
POST /webhook
```

Example:

```text
https://your-domain.com/webhook
```

Configure this URL inside your Meta Developer App webhook settings.

---

## How It Works

### Receive Message

The webhook receives incoming WhatsApp messages.

```javascript
const message =
  req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
```

### Generate AI Response

The message is sent to OpenAI.

```javascript
const completion =
  await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful WhatsApp assistant.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });
```

### Send WhatsApp Reply

The AI response is sent back through the WhatsApp Cloud API.

```javascript
await sendWhatsappMessage(phone, aiReply);
```

---

## WhatsApp Cloud API Setup

1. Create a Meta Developer App.
2. Add the WhatsApp product.
3. Generate a temporary or permanent access token.
4. Copy:

   * PHONE_NUMBER_ID
   * WHATSAPP_TOKEN
5. Configure your webhook URL.
6. Subscribe to the `messages` webhook event.

---

## Testing Locally with Ngrok

Install Ngrok:

```bash
npm install -g ngrok
```

Run your server:

```bash
node server.js
```

Expose it:

```bash
ngrok http 3000
```

Ngrok will provide a public URL:

```text
https://abcd1234.ngrok-free.app
```

Use:

```text
https://abcd1234.ngrok-free.app/webhook
```

as your Meta webhook URL.

---

## Error Handling

The application catches and logs errors:

```javascript
try {
  // process message
} catch (error) {
  console.error(error);
  res.sendStatus(500);
}
```

---

## Future Improvements

* Conversation memory
* User authentication
* Database integration
* Multiple AI personalities
* Function calling / tool usage
* Voice message support
* Image analysis
* Multi-language support
* Rate limiting
* Message history storage

---

## License

MIT License

---

## Author

Built using:

* Node.js
* Express
* OpenAI API
* WhatsApp Cloud API
* Axios
