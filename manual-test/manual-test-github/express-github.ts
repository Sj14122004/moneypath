import express from 'express';

const app = express();

app.post('/webhooks/github', async (req, res) => {
  const event = req.body;

  await handleGithubEvent(event);

  res.json({ ok: true });
});