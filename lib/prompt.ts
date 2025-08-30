export function buildPrompt(jsonInput: string, mode: "short" | "long" = "short") {
  if (mode === "short") {
    return `
Explain this JSON in very short, plain English (1–2 sentences, no technical terms).

JSON:
${jsonInput}
`;
  } else {
    return `
You are an API explainer. Read the following JSON and explain it in clear, beginner-friendly English. 
Include details about keys and values.

JSON:
${jsonInput}
`;
  }
}
