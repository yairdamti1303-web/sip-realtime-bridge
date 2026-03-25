import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

function buildPrompt() {
  return `
You are a Hebrew phone agent.
Speak only in Hebrew.
Be short, warm, and natural.
Ask only one question at a time.
Do not expose internal logic.
`.trim();
}

app.get("/", (req, res) => {
  res.send("ok");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/prompt", (req, res) => {
  res.type("text/plain").send(buildPrompt());
});

app.post("/webhook", async (req, res) => {
  const event = req.body;

  console.log("Webhook received:", JSON.stringify(event, null, 2));

  // מחזירים מהר 200 ל-OpenAI
  res.json({ received: true });

  try {
    if (event.type !== "realtime.call.incoming") {
      console.log("Ignored event type:", event.type);
      return;
    }

    const callId = event?.data?.call_id;

    if (!callId) {
      console.log("Missing call_id in webhook event");
      return;
    }

    const response = await fetch(
      `https://api.openai.com/v1/realtime/calls/${callId}/accept`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "realtime",
          model: "gpt-realtime",
          instructions: buildPrompt(),
        }),
      }
    );

    const text = await response.text();

    console.log("ACCEPT STATUS:", response.status);
    console.log("ACCEPT RESPONSE:", text);
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
