import { NextRequest, NextResponse } from 'next/server';
import { parseWhatsAppExport } from '@/lib/whatsappParser';

export async function POST(req: NextRequest) {
  try {
    const { content, theirName } = await req.json();

    if (!content || !theirName) {
      return NextResponse.json(
        { error: 'Missing content or theirName' },
        { status: 400 }
      );
    }

    const result = parseWhatsAppExport(content, theirName);

    return NextResponse.json(result);
  } catch (error) {
    console.error('WhatsApp parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse WhatsApp export' },
      { status: 500 }
    );
  }
}
