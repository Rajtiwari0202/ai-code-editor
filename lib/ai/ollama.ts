type OllamaGenerateOptions = {
  maxTokens?: number
  model?: string
  temperature?: number
  timeoutMs?: number
  topP?: number
}

type OllamaGenerateResponse = {
  response?: string
  error?: string
}

const DEFAULT_TIMEOUT_MS = 30000

export class AIProviderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AIProviderError"
  }
}

function getOllamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\/$/, "")
}

function getOllamaModel(model?: string) {
  return model || process.env.OLLAMA_MODEL || "codellama:latest"
}

function isOllamaResponse(value: unknown): value is OllamaGenerateResponse {
  return typeof value === "object" && value !== null
}

export async function generateWithOllama(
  prompt: string,
  options: OllamaGenerateOptions = {}
) {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  )

  try {
    const response = await fetch(`${getOllamaBaseUrl()}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: getOllamaModel(options.model),
        prompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
          top_p: options.topP ?? 0.9,
        },
      }),
    })

    if (!response.ok) {
      throw new AIProviderError(`Ollama returned ${response.status}`)
    }

    const data: unknown = await response.json()

    if (!isOllamaResponse(data) || typeof data.response !== "string") {
      throw new AIProviderError("Ollama response did not include generated text")
    }

    return data.response.trim()
  } catch (error) {
    if (error instanceof AIProviderError) {
      throw error
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AIProviderError("Ollama request timed out")
    }

    throw new AIProviderError("Ollama is unavailable")
  } finally {
    clearTimeout(timeout)
  }
}
