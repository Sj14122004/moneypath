const fastify = require('fastify')();

fastify.post('/webhooks/razorpay', async (request, reply) => {
  const event = request.body;

  await markOrderPaid(event.payload.payment.entity.notes.order_id);

  return reply.send({ ok: true });
});