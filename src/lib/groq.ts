import Groq from "groq-sdk";

const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const DEFAULT_MAX_PROMPT_TOKENS = 5500;
const MAX_PROMPT_TOKENS = Number.parseInt(
  process.env.GROQ_MAX_PROMPT_TOKENS || `${DEFAULT_MAX_PROMPT_TOKENS}`,
  10,
);

const schemaExample = {
  invoice_number: "string or null",
  vendor_name: "string or null",
  customer_name: "string or null",
  invoice_date: "string or null",
  due_date: "string or null",
  currency: "string or null",
  line_items: [
    {
      description: "string or null",
      quantity: "number or null",
      unit_price: "number or null",
      total: "number or null",
    },
  ],
  subtotal: "number or null",
  tax: "number or null",
  total: "number or null",
};

export class PromptTooLargeError extends Error {
  statusCode = 413;

  constructor(
    public readonly estimatedTokens: number,
    public readonly maxTokens: number,
  ) {
    super(
      `This PDF is too large for the current Groq token limit. Estimated prompt size is ${estimatedTokens.toLocaleString()} tokens; the safe limit is ${maxTokens.toLocaleString()} tokens. Please upload a shorter document or split the PDF into smaller parts.`,
    );
    this.name = "PromptTooLargeError";
  }
}

function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function buildInvoicePrompt(pdfText: string): string {
  return `Extract invoice data from the PDF text below.

Return ONLY valid JSON.
No markdown.
No explanation.
No code block.
If a value is not found, use null.
Do not invent data.
Do not add fields outside the schema.

Required JSON schema:
${JSON.stringify(schemaExample, null, 2)}

PDF text:
${pdfText}`;
}

// Conservative language-model token estimate. Llama tokenization varies, so this
// intentionally overestimates instead of risking a provider-side token failure.
export function estimatePromptTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

export function assertPromptFitsGroqLimit(pdfText: string): void {
  const prompt = buildInvoicePrompt(pdfText);
  const estimatedTokens = estimatePromptTokens(prompt);

  if (estimatedTokens > MAX_PROMPT_TOKENS) {
    console.warn("Groq request blocked before send", {
      estimatedTokens,
      maxTokens: MAX_PROMPT_TOKENS,
      model: MODEL,
    });
    throw new PromptTooLargeError(estimatedTokens, MAX_PROMPT_TOKENS);
  }
}

function parseJsonObject(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
    throw new Error("Groq returned a response that could not be parsed as JSON.");
  }
}

export async function extractInvoiceWithGroq(pdfText: string): Promise<unknown> {
  assertPromptFitsGroqLimit(pdfText);
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a careful invoice extraction engine. You only return valid JSON that matches the requested schema.",
      },
      {
        role: "user",
        content: buildInvoicePrompt(pdfText),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return parseJsonObject(content);
}
