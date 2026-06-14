import {
  AIProviderError,
  generateWithOllama,
  getOllamaModel,
} from "@/lib/ai/ollama"

type AIProvider = "ollama" | "openai-compatible"

type GenerateTextOptions = {
  maxTokens?: number
  temperature?: number
  timeoutMs?: number
  topP?: number
}

type GenerateTextResult = {
  model: string
  provider: string
  text: string
}

type OpenAICompatibleResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

const DEFAULT_TIMEOUT_MS = 30000
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"

function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || "ollama").toLowerCase()

  if (provider === "ollama") {
    return "ollama"
  }

  if (provider === "openai-compatible") {
    return "openai-compatible"
  }

  throw new AIProviderError(
    `Invalid AI_PROVIDER "${process.env.AI_PROVIDER}". Expected ollama or openai-compatible`
  )
}

function getOpenAIBaseUrl() {
  return (process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(
    /\/$/,
    ""
  )
}

function getOpenAIModel() {
  const model = process.env.OPENAI_MODEL

  if (!model) {
    throw new AIProviderError(
      "OPENAI_MODEL is required when AI_PROVIDER=openai-compatible"
    )
  }

  return model
}

function getOpenAIKey() {
  const key = process.env.OPENAI_API_KEY

  if (!key) {
    throw new AIProviderError(
      "OPENAI_API_KEY is required when AI_PROVIDER=openai-compatible"
    )
  }

  return key
}

function isOpenAICompatibleResponse(
  value: unknown
): value is OpenAICompatibleResponse {
  return typeof value === "object" && value !== null
}

async function generateWithOpenAICompatible(
  prompt: string,
  options: GenerateTextOptions = {}
): Promise<GenerateTextResult> {
  const model = getOpenAIModel()
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  )

  try {
    const response = await fetch(`${getOpenAIBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAIKey()}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.maxTokens ?? 1000,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP ?? 0.9,
      }),
    })

    const data: unknown = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        isOpenAICompatibleResponse(data) && data.error?.message
          ? data.error.message
          : `OpenAI-compatible provider returned ${response.status}`

      throw new AIProviderError(message)
    }

    if (!isOpenAICompatibleResponse(data)) {
      throw new AIProviderError(
        "OpenAI-compatible response did not include JSON"
      )
    }

    const text = data.choices?.[0]?.message?.content?.trim()

    if (!text) {
      throw new AIProviderError(
        "OpenAI-compatible response did not include generated text"
      )
    }

    return {
      model,
      provider: "OpenAI-compatible",
      text,
    }
  } catch (error) {
    if (error instanceof AIProviderError) {
      throw error
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AIProviderError("OpenAI-compatible request timed out")
    }

    throw new AIProviderError("OpenAI-compatible provider is unavailable")
  } finally {
    clearTimeout(timeout)
  }
}

export async function generateAIText(
  prompt: string,
  options: GenerateTextOptions = {}
): Promise<GenerateTextResult> {
  if (getAIProvider() === "openai-compatible") {
    return generateWithOpenAICompatible(prompt, options)
  }

  const model = getOllamaModel()
  const text = await generateWithOllama(prompt, {
    ...options,
    model,
  })

  return {
    model,
    provider: "Ollama",
    text,
  }
}

export { AIProviderError }
