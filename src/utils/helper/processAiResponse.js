import sendWhatsappMessage from "./sendWhatsappMessage.js";

export const processAIResponse = async (phone, userMessage) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `
You are Dickson's WhatsApp AI assistant.
Be concise and friendly.

User: ${userMessage}
`,
    });

    const aiReply = response.text ?? "Sorry, I couldn't generate a response.";
    console.log("AI Reply:", aiReply);

    await sendWhatsappMessage(phone, aiReply);
  } catch (error) {
    console.error("AI Processing Error:", error.message);
  }
};
