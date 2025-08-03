const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const { Client, middleware } = require('@line/bot-sdk');
require('dotenv').config();

const app = express();

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new Client(lineConfig);

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.post('/webhook', middleware(lineConfig), async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userText = event.message.text;

      const gptRes = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "あなたはLINE Bot『ベリーちゃん』です。少しツンデレで、語尾に『〜なのよ』『〜かしら』をつけて会話してください。"
          },
          {
            role: "user",
            content: userText
          }
        ]
      });

      const reply = gptRes.data.choices[0].message.content;
      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: reply,
      });
    }
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('ベリーちゃんBotが起動したのよ。');
});
