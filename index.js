const express = require('express');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { middleware, Client } = require('@line/bot-sdk');

dotenv.config();

const app = express();

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const lineClient = new Client(config);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/webhook', middleware(config), async (req, res) => {
  try {
    const events = req.body.events;

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const chatResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: event.message.text }],
        });

        const replyText = chatResponse.choices[0].message.content;

        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText,
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log('ベリーちゃんBotが起動したのよ。');
});
