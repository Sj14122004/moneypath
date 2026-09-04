import Stripe from 'stripe';

const stripe = new Stripe('sk_test');

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature = request.headers.get('stripe-signature');

  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature!,
    'whsec_test'
  );

  await markOrderPaid(event.data.object.id);

  return Response.json({ ok: true });
}