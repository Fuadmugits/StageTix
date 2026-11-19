import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, grossAmount } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-ItC1JWECRBWchH1J1hnT1a~w';
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

    // Call Midtrans Core API /v2/charge for QRIS
    const payload = {
      payment_type: 'qris',
      transaction_details: {
        order_id: `${orderId}-${Date.now()}`,
        gross_amount: Math.round(Number(grossAmount) || 10000),
      },
      qris: {
        acquirer: 'gopay'
      }
    };

    const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    // actions contains generate-qr-code action with the QR URL
    const qrAction = data.actions?.find((a: any) => a.name === 'generate-qr-code');
    const qrImageUrl = qrAction?.url || null;

    return NextResponse.json({
      ...data,
      qr_image_url: qrImageUrl,
      qr_string: data.qr_string || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

