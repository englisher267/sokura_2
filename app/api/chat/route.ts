import Anthropic from '@anthropic-ai/sdk';
import { SOKURA_SYSTEM_PROMPT } from '@/lib/system-prompt';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY が設定されていません。.env.local ファイルにAPIキーを設定してください。' },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });
    const { messages } = await req.json();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SOKURA_SYSTEM_PROMPT,
      messages: messages.length === 0
        ? [{ role: 'user', content: '対話を始めてください。' }]
        : messages.map((m: { role: string; content: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const content = textBlock && 'text' in textBlock ? textBlock.text : '';

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
