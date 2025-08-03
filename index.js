import express from "express";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { middleware, Client } from "@line/bot-sdk";

dotenv.config();

const app = express();
app.use(express.json());

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const lineClient = new Client(lineConfig);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/webhook", middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const userMessage = event.message.text;

        const chatResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: userMessage }]
        });

        const replyText = chatResponse.choices[0].message.content.trim();

        await lineClient.replyMessage(event.replyToken, {
          type: "text",
          text: replyText
        });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("エラー:", error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ベリーちゃんBotが起動しました（ポート: ${PORT}）`);
});
