import { NextRequest, NextResponse } from 'next/server';

const AUTHORIZED_ADMINS = ['rawmilkfarm01@gmail.com', 'vivekrao9505@gmail.com'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const expectedPassword = process.env.ANALYTICS_ADMIN_PASSWORD || 'RawMilk@2026';

    // Verify if email is an authorized admin
    if (!AUTHORIZED_ADMINS.includes(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: `Access denied. "${email}" is not authorized for RAW MILK Analytics.` },
        { status: 403 }
      );
    }

    // Verify server-side password secret
    if (password !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin password.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      role: 'admin',
      authenticatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Server auth login API error:', err);
    return NextResponse.json(
      { success: false, error: 'Server authentication request failed.' },
      { status: 500 }
    );
  }
}
