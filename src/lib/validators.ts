import { z } from 'zod';

// YouTube video input (URL or 11-char ID)
export const videoInput = z.object({ input: z.string().min(5) });

// Country input for region checking
export const countryInput = z.object({ 
  input: z.string().min(5), 
  country: z.string().length(2) 
});

// Tag generation body
export const genTagsBody = z.object({ 
  title: z.string().default(''), 
  description: z.string().default(''), 
  max: z.number().int().min(5).max(50).default(25), 
  mode: z.enum(['rb','ai','economy']).default('rb') // Added ultra-cheap economy mode
});

// Hashtag generation body
export const hashtagsBody = z.object({ 
  title: z.string().default(''), 
  niche: z.string().default(''), 
  max: z.number().int().min(5).max(50).default(25), 
  mode: z.enum(['rb','ai','economy']).default('rb') // Added ultra-cheap economy mode
});

// Text rewrite body
export const rewriteBody = z.object({ 
  text: z.string().min(3), 
  variant: z.enum(['title','description','paragraph']).default('title'), 
  mode: z.enum(['rb','ai']).default('rb') 
});

// Meta tag analyzer body
export const metaAnalyzeBody = z.object({ html: z.string().min(3) });

// Keyword density checker body
export const densityBody = z.object({ 
  text: z.string().min(3), 
  stopwords: z.array(z.string()).optional() 
});

// AdSense calculator body
export const adsenseBody = z.object({ 
  pageViews: z.number().positive(), 
  ctr: z.number().min(0).max(1), 
  cpc: z.number().min(0) 
});

// Keyword suggestion body
export const kwSuggestBody = z.object({ 
  seed: z.string().min(2), 
  mode: z.enum(['rb','ai']).default('rb'), 
  max: z.number().int().min(5).max(50).default(25) 
});

// FAQ schema body
export const faqBody = z.object({ 
  faqs: z.array(z.object({ q: z.string(), a: z.string() })), 
  mode: z.enum(['rb','ai']).default('rb') 
});

// Text compare body
export const compareBody = z.object({ a: z.string(), b: z.string() });

// AI image generation body
export const imageGenBody = z.object({ 
  prompt: z.string().min(5), 
  size: z.enum(['512x512','1024x1024']).default('1024x1024') 
});

// YouTube money calculator body
export const moneyCalcBody = z.object({
  views: z.number().positive(),
  rpmLow: z.number().positive().optional(),
  rpmHigh: z.number().positive().optional()
});

// YouTube description generator body
export const descriptionGenBody = z.object({
  title: z.string().min(1),
  bullets: z.array(z.string()).optional(),
  mode: z.enum(['rb','ai','economy']).default('rb')
});

// YouTube embed generator query
export const embedQuery = z.object({
  input: z.string().min(5),
  autoplay: z.string().optional().default('0'),
  controls: z.string().optional().default('1')
});

// Text input for simple operations
export const textInput = z.object({ text: z.string().min(1) });

// YouTube video generator body
export const videoGenBody = z.object({
  topic: z.string().min(3),
  outline: z.string().optional(),
  mode: z.enum(['rb','ai']).default('rb')
});

// Meta tag generator body
export const metaGenBody = z.object({
  titleSeed: z.string().min(1),
  descriptionSeed: z.string().min(1),
  mode: z.enum(['rb','ai']).default('rb')
});

// YouTube title generator body
export const titleGenBody = z.object({
  text: z.string().min(1),
  mode: z.enum(['rb','ai','economy']).default('rb')
});

// Search query input
export const searchQuery = z.object({
  q: z.string().min(1),
  limit: z.number().int().min(1).max(50).default(10)
});

// YouTube trending query
export const trendingQuery = z.object({
  country: z.string().length(2).default('US')
});

// Download query
export const downloadQuery = z.object({
  input: z.string().min(5),
  download: z.string().optional().default('0')
});