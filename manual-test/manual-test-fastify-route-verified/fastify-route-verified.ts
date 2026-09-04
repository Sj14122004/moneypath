const fastify = require('fastify')();
const crypto = require('crypto');

fastify.route({
  method: 'POST',
  url: '/webhooks/razorpay',
  handler: async (request, reply) => {
    const signature = request.headers['x-razorpay-signature'];

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(request.body)
      .digest('hex');

    if (signature !== expected) {
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    const event = request.body;

    await markOrderPaid(event.payload.payment.entity.notes.order_id);

    return reply.send({ ok: true });
  }
});