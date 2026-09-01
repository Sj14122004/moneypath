const fastify = require('fastify')();

fastify.route({
  method: 'POST',
  url: '/webhooks/razorpay',
  handler: async (request, reply) => {
    const event = request.body;

    await markOrderPaid(event.payload.payment.entity.notes.order_id);

    return reply.send({ ok: true });
  }
});