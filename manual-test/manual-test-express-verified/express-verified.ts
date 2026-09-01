import express from 'express';
import crypto from 'crypto';

const app = express();

app.post('/webhooks/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(req.body)
    .digest('hex');

  if (signature !== expected) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  await markOrderPaid(event.payload.payment.entity.notes.order_id);

  res.json({ ok: true });
});