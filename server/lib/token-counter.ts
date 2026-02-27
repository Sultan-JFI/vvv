/**
 * Simple token estimation utility.
 * Standard estimation: 1 token ~= 4 characters for English text.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  // A more robust estimation: words * 1.3 or chars / 4
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).length;
  
  // We'll take the average of word-based and char-based estimation
  const estFromChars = Math.ceil(charCount / 4);
  const estFromWords = Math.ceil(wordCount * 1.3);
  
  return Math.max(estFromChars, estFromWords);
}

/**
 * Calculate cost based on tokens and provider/model
 * (Simplified pricing for demonstration)
 */
export function calculateCost(tokens: number, modelId: string): number {
  // Mock pricing: $0.01 per 1k tokens
  const ratePer1k = 0.01;
  return (tokens / 1000) * ratePer1k;
}
