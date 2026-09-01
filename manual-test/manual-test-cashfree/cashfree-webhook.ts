import crypto from 'crypto';

export async function POST(request: Request) {
  const event = await request.json();

  await markOrderPaid(event.data.order_id);

  return Response.json({ ok: true });
}