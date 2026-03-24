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

app.post("/webhook", (req, res) => {
  console.log("Webhook received:", JSON.stringify(req.body, null, 2));
  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
