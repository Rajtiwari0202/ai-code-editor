type JsonBodyResult =
  | {
      data: unknown;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return { data: {}, ok: true };
  }

  try {
    return { data: JSON.parse(rawBody) as unknown, ok: true };
  } catch {
    return { error: "Invalid JSON body", ok: false };
  }
}
