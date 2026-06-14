import { AIProviderError, generateAIText } from "@/lib/ai/provider";
import { readJsonBody } from "@/lib/api/request";
import { chatRequestSchema, type ChatMessage } from "@/lib/ai/contracts";
import { NextRequest, NextResponse } from "next/server";

async function generateAIResponse(messages: ChatMessage[]) {
  const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

  const fullMessages = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  return generateAIText(prompt, {
    maxTokens: 1000,
    temperature: 0.7,
    topP: 0.9,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);

    if (!body.ok) {
      return NextResponse.json(
        { error: body.error },
        { status: 400 }
      );
    }

    const result = chatRequestSchema.safeParse(body.data);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid chat request",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message, history } = result.data;

    const recentHistory = history.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    const aiResponse = await generateAIResponse(messages);

    return NextResponse.json({
      response: aiResponse.text,
      provider: aiResponse.provider,
      model: aiResponse.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof AIProviderError ? 503 : 500;

    return NextResponse.json(
      {
        error:
          status === 503
            ? "AI provider unavailable"
            : "Failed to generate AI response",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }
}
