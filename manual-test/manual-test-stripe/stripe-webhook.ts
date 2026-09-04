import Stripe from 'stripe';

const stripe = new Stripe('sk_test');

export async function POST(request: Request) {
  const event = await request.json();

  await markOrderPaid(event.data.object.id);

  return Response.json({ ok: true });
}