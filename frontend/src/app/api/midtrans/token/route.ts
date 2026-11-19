import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, grossAmount, customerName, customerEmail } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-ItC1JWECRBWchH1J1hnT1a~w';
    const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64');

    const midtransPayload = {
      transaction_details: {
        order_id: `${orderId}-${Date.now()}`,
        gross_amount: Math.round(Number(grossAmount) || 10000),
      },
      customer_details: {
        first_name: customerName || 'Kageitsu',
        email: customerEmail || 'customer@example.com',
      },
      bca_va: {
        va_number: '12345678901'
      }
    };

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(midtransPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

