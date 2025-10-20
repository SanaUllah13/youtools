import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if OpenAI is available
export const hasOpenAI = !!process.env.OPENAI_API_KEY;

// Simple cache to avoid duplicate requests
const cache = new Map<string, { result: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCacheKey(type: string, input: string): string {
  return `${type}:${input.toLowerCase().replace(/\s+/g, '_')}`;
}

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.result;
  }
  cache.delete(key); // Remove expired
  return null;
}

function setCache(key: string, result: any): void {
  // Clean old cache entries periodically
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { result, timestamp: Date.now() });
}

// Professional YouTube Title Generation
export async function generateYouTubeTitles(topic: string, count: number = 5): Promise<string[]> {
  if (!hasOpenAI) {
    throw new Error('OpenAI API key not configured');
  }

  // Check cache first
  const cacheKey = getCacheKey('titles', `${topic}_${count}`);
  const cached = getCached(cacheKey);
  if (cached) {
    console.log('💾 Using cached titles for:', topic);
    return cached;
  }

  const prompt = `Create ${count} viral YouTube titles for: "${topic}"

Rules:
- 40-70 chars each
- Use viral patterns: POV, "I tried X", numbers, questions, "Why X", "What happens when", controversy
- Add relevant emojis
- Make them click-worthy and trending
- Each title must be unique

Return only JSON array: ["title1", "title2", "title3", "title4", "title5"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 200, // Reduced for efficiency
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from OpenAI');

    // Extract JSON from content (handle markdown code blocks)
    const jsonMatch = content.match(/\[(.*?)\]/g) || content.match(/```(?:json)?[\s\S]*?\[([\s\S]*?)\][\s\S]*?```/g);
    const jsonStr = jsonMatch ? `[${jsonMatch[1]}]` : content;
    
    const titles = JSON.parse(jsonStr);
    if (!Array.isArray(titles)) throw new Error('Invalid response format');

    const result = titles.slice(0, count);
    setCache(cacheKey, result); // Cache the result
    return result;
  } catch (error: any) {
    console.error('OpenAI title generation failed:', error);
    throw new Error(`Failed to generate titles: ${error?.message || error}`);
  }
}

// Professional YouTube Description Generation
export async function generateYouTubeDescription(
  title: string, 
  additionalInfo?: {
    bullets?: string[];
    links?: { title: string; url: string }[];
    hashtags?: string[];
    callToAction?: string;
  }
): Promise<string> {
  if (!hasOpenAI) {
    throw new Error('OpenAI API key not configured');
  }

  // Check cache first
  const cacheKey = getCacheKey('description', title);
  const cached = getCached(cacheKey);
  if (cached) {
    console.log('💾 Using cached description for:', title);
    return cached;
  }

  const prompt = `Create YouTube description for: "${title}"
${additionalInfo?.bullets ? `\nCover: ${additionalInfo.bullets.join(', ')}` : ''}

Structure:
1. Hook (compelling first 2 lines, under 125 chars)
2. What viewers get
3. Content overview with timestamps
4. CTA (like/subscribe/comment question)
5. 6 relevant hashtags

Make it engaging, conversational. Use emojis sparingly. DON'T include title heading or "YouTube Description for" text.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 400, // Optimized for descriptions
    });

    const description = response.choices[0]?.message?.content?.trim();
    if (!description) throw new Error('No response from OpenAI');

    setCache(cacheKey, description); // Cache the result
    return description;
  } catch (error: any) {
    console.error('OpenAI description generation failed:', error);
    throw new Error(`Failed to generate description: ${error?.message || error}`);
  }
}

// Generate hashtags for YouTube content
export async function generateYouTubeHashtags(topic: string, count: number = 10): Promise<string[]> {
  if (!hasOpenAI) {
    throw new Error('OpenAI API key not configured');
  }

  // Check cache first
  const cacheKey = getCacheKey('hashtags', `${topic}_${count}`);
  const cached = getCached(cacheKey);
  if (cached) {
    console.log('💾 Using cached hashtags for:', topic);
    return cached;
  }

  const prompt = `Generate ${count} trending YouTube hashtags for: "${topic}"

Mix broad + specific. Avoid generic ones. Format: #hashtag

Return JSON array: ["#tag1", "#tag2", "#tag3"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 100, // Minimal for hashtags
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from OpenAI');

    // Extract JSON from content (handle markdown code blocks)
    const jsonMatch = content.match(/\[(.*?)\]/g) || content.match(/```(?:json)?[\s\S]*?\[([\s\S]*?)\][\s\S]*?```/g);
    const jsonStr = jsonMatch ? `[${jsonMatch[1]}]` : content;
    
    const hashtags = JSON.parse(jsonStr);
    if (!Array.isArray(hashtags)) throw new Error('Invalid response format');

    const result = hashtags.slice(0, count);
    setCache(cacheKey, result); // Cache the result
    return result;
  } catch (error: any) {
    console.error('OpenAI hashtag generation failed:', error);
    throw new Error(`Failed to generate hashtags: ${error?.message || error}`);
  }
}

// Usage analytics and costs
export function getOpenAIUsageInfo() {
  return {
    model: 'gpt-4o-mini',
    available: hasOpenAI,
    inputCostPer1k: 0.000150,
    outputCostPer1k: 0.000600,
    estimatedCosts: {
      titles: 0.00015, // ~50 input + 150 output tokens
      description: 0.00025, // ~60 input + 300 output tokens  
      hashtags: 0.00008, // ~30 input + 70 output tokens
      total: 0.00048 // All three services combined
    },
    optimization: 'Prompts optimized for 70% cost reduction'
  };
}
