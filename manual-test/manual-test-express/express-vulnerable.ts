import express from 'express';

const app = express();

app.post('/webhooks/razorpay', async (req, res) => {
  const event = req.body;

  await markOrderPaid(event.payload.payment.entity.notes.order_id);

  res.json({ ok: true });
});