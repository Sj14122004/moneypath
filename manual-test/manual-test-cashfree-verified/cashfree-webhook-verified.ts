import crypto from 'crypto';

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature =
    request.headers.get('x-webhook-signature');

  const timestamp =
    request.headers.get('x-webhook-timestamp');

  const payload = `${timestamp}${rawBody}`;

  const expected = crypto
    .createHmac(
      'sha256',
      process.env.CASHFREE_CLIENT_SECRET!
    )
    .update(payload)
    .digest('base64');

  if (signature !== expected) {
    return new Response('Invalid signature', {
      status: 400,
    });
  }

  const event = JSON.parse(rawBody);

  await markOrderPaid(event.data.order_id);

  return Response.json({ ok: true });
}