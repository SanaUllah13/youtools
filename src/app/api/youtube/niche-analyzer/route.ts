import { NextRequest, NextResponse } from 'next/server';
import { guard } from '@/lib/limit';
import { getC, setC } from '@/lib/cache';
import youtubeSearch from 'youtube-sr';
import { videoInfo, extractId } from '@/lib/youtube';
import OpenAI from 'openai';

// Lazy initialization of OpenAI
let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

// Interfaces for real YouTube data
interface RealVideo {
  id: string;
  title: string;
  views: number;
  uploadedAt: string;
  duration: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  channelSubscribers: number;
  channelVerified: boolean;
}

interface NicheHierarchy {
  mainNiche: string;
  subNiche: string;
  displayName: string;
}

interface NicheAnalysis {
  niche: string;
  nicheHierarchy: NicheHierarchy;
  totalChannels: number;
  totalVideos: number;
  averageViews: number;
  topVideos: RealVideo[];
  marketSize: {
    score: number;
    level: 'Low' | 'Medium' | 'High' | 'Excellent';
    totalViews: number;
    videoCount: number;
    avgViewsPerVideo: number;
  };
  competition: {
    score: number;
    level: 'Low' | 'Medium' | 'High' | 'Saturated';
    topChannels: number;
    averageSubscribers: number;
    competitionIntensity: string;
  };
  monetization: {
    score: number;
    level: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    estimatedRPM: number;
    revenueRanges: {
      views1K: string;
      views10K: string;
      views100K: string;
      views1M: string;
    };
  };
  insights: string[];
  recommendations: string[];
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&#?]*)/,
    /youtube\.com\/v\/([^&#?]*)/,
    /youtube\.com\/.*[?&]v=([^&#?]*)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

// Extract channel identifier from YouTube URL
function extractChannelInfo(url: string): { type: string; id: string } | null {
  const patterns = [
    { pattern: /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/, type: 'channelId' },
    { pattern: /youtube\.com\/c\/([a-zA-Z0-9_-]+)/, type: 'customUrl' },
    { pattern: /youtube\.com\/@([a-zA-Z0-9_-]+)/, type: 'handle' },
    { pattern: /youtube\.com\/user\/([a-zA-Z0-9_-]+)/, type: 'username' }
  ];

  for (const { pattern, type } of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { type, id: match[1] };
    }
  }

  return null;
}

// OpenAI-powered niche detection with search keywords - 100% accurate for ANY content
async function detectNiche(input: string, videoData?: any): Promise<NicheHierarchy & { searchKeywords: string[] }> {
  const title = videoData?.title || input;
  const description = videoData?.description || '';
  
  console.log(`🤖 OpenAI-powered niche detection for: "${title}"`);
  
  try {
    // Use OpenAI to detect the perfect niche and search keywords
    const detectedNiche = await openAINicheDetector(title, description);
    return detectedNiche;
  } catch (error) {
    console.log(`⚠️ OpenAI failed, using fallback:`, error);
    // Fallback to simple detection if OpenAI fails
    return {
      mainNiche: 'general',
      subNiche: 'general',
      displayName: 'General',
      searchKeywords: ['general', 'tutorial', 'how to']
    };
  }
}

// OpenAI-powered niche detector with specific search keywords - perfect accuracy for ANY content
async function openAINicheDetector(title: string, description: string): Promise<NicheHierarchy & { searchKeywords: string[] }> {
  // Trim description to save tokens - first 100 chars are usually enough
  const trimmedDesc = description.length > 100 ? description.substring(0, 100) + '...' : description;
  
  const prompt = `Title: "${title}"
Desc: "${trimmedDesc}"

Classify into niche + sub-niche + 4 search keywords.

Niches: finance(crypto,trading,investing,dropshipping,side-hustle), tech(programming,ai,web-dev,app-dev), sports(cricket,football,basketball), gaming, education, fitness, cooking, entertainment, travel, lifestyle, business, general

JSON only:
{"mainNiche":"tech","subNiche":"programming","displayName":"Programming (Tech)","searchKeywords":["term1","term2","term3","term4"]}`;

  try {
    console.log(`🤖 Calling OpenAI for: "${title}"`);
    
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Classify YouTube videos. Return JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 80,
      temperature: 0.1
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) {
      throw new Error('No response from OpenAI');
    }

    // Parse OpenAI response
    const nicheData = JSON.parse(result);
    
    console.log(`✨ OpenAI detected: ${nicheData.displayName}`);
    console.log(`🔍 Search keywords: ${nicheData.searchKeywords?.join(', ')}`);
    
    // Validate the response structure
    if (!nicheData.mainNiche || !nicheData.subNiche || !nicheData.displayName) {
      throw new Error('Invalid OpenAI response structure');
    }

    return {
      mainNiche: nicheData.mainNiche.toLowerCase(),
      subNiche: nicheData.subNiche.toLowerCase(),
      displayName: nicheData.displayName,
      searchKeywords: nicheData.searchKeywords || [nicheData.subNiche, nicheData.mainNiche]
    };
    
  } catch (error) {
    console.error('OpenAI niche detection failed:', error);
    throw error;
  }
}

// Universal niche detector - works for ANY content without manual patterns
function universalNicheDetector(title: string, content: string): NicheHierarchy {
  // Define all possible niches with their characteristics and sub-niches
  const nicheDatabase = {
    'finance': {
      keywords: ['money', 'earn', 'income', 'profit', 'business', 'investment', 'trading', 'crypto', 'bitcoin', 'stock', 'wealth', 'rich', 'millionaire', 'entrepreneur', 'startup', 'revenue', 'passive', 'financial', 'budget', 'debt', 'credit', 'dropshipping', 'ecommerce', 'affiliate', 'freelance', 'real estate', 'property', 'roi', 'portfolio', 'dividend', 'cash', 'dollar', 'bank', 'loan', 'mortgage'],
      subNiches: {
        'cryptocurrency': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'altcoin', 'binance', 'coinbase'],
        'trading': ['trading', 'forex', 'stocks', 'shares', 'options', 'day trading', 'swing trading'],
        'real-estate': ['real estate', 'property', 'house', 'apartment', 'rent', 'mortgage', 'rental', 'landlord'],
        'dropshipping': ['dropshipping', 'shopify', 'amazon fba', 'ecommerce', 'online store'],
        'investing': ['investing', 'investment', 'portfolio', 'compound', 'index fund', 'mutual fund'],
        'online-business': ['online business', 'digital business', 'internet business', 'make money online']
      },
      rpm: 4.5
    },
    'technology': {
      keywords: ['tech', 'programming', 'coding', 'software', 'development', 'app', 'website', 'computer', 'ai', 'artificial intelligence', 'machine learning', 'plugin', 'javascript', 'python', 'html', 'css', 'react', 'nodejs', 'github', 'code', 'developer', 'programmer', 'backend', 'frontend', 'database', 'api', 'framework', 'library', 'algorithm', 'data', 'system', 'platform', 'digital', 'innovation', 'startup', 'saas'],
      subNiches: {
        'programming': ['programming', 'coding', 'javascript', 'python', 'java', 'react', 'nodejs', 'php', 'c++', 'swift', 'kotlin', 'ruby', 'go'],
        'artificial-intelligence': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'chatgpt', 'openai'],
        'web-development': ['web development', 'website', 'html', 'css', 'frontend', 'backend', 'fullstack'],
        'app-development': ['app development', 'mobile app', 'android', 'ios', 'flutter', 'react native'],
        'cybersecurity': ['cybersecurity', 'hacking', 'security', 'penetration testing', 'ethical hacking']
      },
      rpm: 3.2
    },
    'sports': {
      keywords: ['sport', 'game', 'match', 'tournament', 'championship', 'league', 'team', 'player', 'score', 'goal', 'win', 'highlights', 'athletic', 'olympics', 'final', 'semifinal', 'playoff', 'season', 'coach', 'training', 'fitness', 'exercise', 'workout'],
      subNiches: {
        'cricket': ['cricket', 'bat', 'ball', 'wicket', 'over', 'innings', 't20', 'odi', 'test', 'ipl'],
        'football': ['football', 'soccer', 'goal', 'penalty', 'fifa', 'premier league', 'champions league'],
        'basketball': ['basketball', 'nba', 'dunk', 'three pointer', 'lebron', 'curry'],
        'tennis': ['tennis', 'wimbledon', 'serve', 'ace', 'grand slam', 'federer', 'nadal'],
        'baseball': ['baseball', 'mlb', 'home run', 'pitcher', 'world series'],
        'golf': ['golf', 'pga', 'masters', 'tiger woods', 'hole in one']
      },
      rpm: 2.5
    },
    'gaming': {
      keywords: ['gaming', 'game', 'gameplay', 'gamer', 'esports', 'stream', 'play', 'xbox', 'playstation', 'nintendo', 'pc', 'console', 'multiplayer', 'rpg', 'fps', 'battle', 'level', 'character', 'quest', 'minecraft', 'fortnite', 'gta', 'pubg', 'valorant', 'call of duty', 'among us', 'roblox'],
      subNiches: {},
      rpm: 1.8
    },
    'education': {
      keywords: ['tutorial', 'learning', 'education', 'course', 'lesson', 'teaching', 'study', 'knowledge', 'skill', 'learn', 'explain', 'guide', 'training', 'workshop', 'class', 'school', 'university', 'student', 'teacher', 'professor', 'how to', 'step by step'],
      subNiches: {},
      rpm: 2.8
    },
    'fitness': {
      keywords: ['fitness', 'workout', 'exercise', 'health', 'diet', 'nutrition', 'weight', 'muscle', 'gym', 'training', 'bodybuilding', 'cardio', 'strength', 'yoga', 'running', 'marathon', 'athlete', 'protein', 'calories'],
      subNiches: {},
      rpm: 2.2
    },
    'cooking': {
      keywords: ['cooking', 'recipe', 'food', 'kitchen', 'chef', 'baking', 'meal', 'ingredient', 'cuisine', 'restaurant', 'dish', 'taste', 'flavor', 'cook', 'delicious', 'dinner', 'lunch', 'breakfast'],
      subNiches: {},
      rpm: 2.0
    },
    'entertainment': {
      keywords: ['funny', 'comedy', 'entertainment', 'humor', 'viral', 'challenge', 'reaction', 'meme', 'prank', 'celebrity', 'movie', 'film', 'music', 'song', 'dance', 'show', 'performance'],
      subNiches: {},
      rpm: 1.5
    },
    'travel': {
      keywords: ['travel', 'vacation', 'trip', 'destination', 'adventure', 'explore', 'journey', 'tourism', 'hotel', 'flight', 'country', 'city', 'culture', 'backpack', 'visa', 'passport'],
      subNiches: {},
      rpm: 2.1
    },
    'lifestyle': {
      keywords: ['lifestyle', 'vlog', 'daily', 'routine', 'life', 'personal', 'story', 'experience', 'motivation', 'productivity', 'habits', 'mindset', 'goals', 'inspiration', 'wellness', 'balance'],
      subNiches: {},
      rpm: 2.0
    },
    'business': {
      keywords: ['business', 'entrepreneur', 'startup', 'marketing', 'sales', 'company', 'success', 'leadership', 'management', 'strategy', 'growth', 'customer', 'brand', 'market', 'competition', 'innovation'],
      subNiches: {},
      rpm: 3.8
    }
  };
  
  // Smart scoring system to find the best matching niche
  const nicheScores: { [key: string]: { score: number, subNiche: string, subScore: number } } = {};
  
  // Analyze content against each niche
  for (const [nicheName, nicheData] of Object.entries(nicheDatabase)) {
    let score = 0;
    let bestSubNiche = nicheName;
    let bestSubScore = 0;
    
    // Check main niche keywords
    for (const keyword of nicheData.keywords) {
      if (content.includes(keyword)) {
        // Weight longer keywords more heavily
        const weight = keyword.length > 8 ? 3 : keyword.length > 5 ? 2 : 1;
        score += weight;
        
        // Bonus for keywords in title vs content
        if (title.toLowerCase().includes(keyword)) {
          score += weight * 2; // Title matches are more important
        }
      }
    }
    
    // Check sub-niche keywords for better specificity
    for (const [subNicheName, subKeywords] of Object.entries(nicheData.subNiches)) {
      let subScore = 0;
      for (const keyword of subKeywords) {
        if (content.includes(keyword)) {
          const weight = keyword.length > 8 ? 4 : keyword.length > 5 ? 3 : 2;
          subScore += weight;
          
          if (title.toLowerCase().includes(keyword)) {
            subScore += weight * 3; // Sub-niche title matches are very important
          }
        }
      }
      
      if (subScore > bestSubScore) {
        bestSubScore = subScore;
        bestSubNiche = subNicheName;
      }
    }
    
    // Add sub-niche score to main score
    score += bestSubScore;
    
    nicheScores[nicheName] = {
      score,
      subNiche: bestSubNiche,
      subScore: bestSubScore
    };
  }
  
  // Find the best matching niche
  let bestNiche = 'general';
  let bestScore = 0;
  let bestSubNiche = 'general';
  
  for (const [nicheName, data] of Object.entries(nicheScores)) {
    if (data.score > bestScore) {
      bestScore = data.score;
      bestNiche = nicheName;
      bestSubNiche = data.subNiche;
    }
  }
  
  // If no strong match found, try to infer from context
  if (bestScore < 3) {
    console.log(`🤔 Low confidence (${bestScore}), trying contextual analysis...`);
    
    // Check for dollar amounts (finance)
    if (/\$[0-9,]+/g.test(content) || /[0-9]+k/gi.test(content)) {
      bestNiche = 'finance';
      bestSubNiche = 'online-business';
      console.log(`💰 Dollar amount detected -> Finance`);
    }
    // Check for vs pattern (sports)
    else if (title.includes(' vs ') || title.includes(' v ')) {
      bestNiche = 'sports';
      bestSubNiche = 'sports';
      console.log(`🏆 "vs" pattern detected -> Sports`);
    }
    // Check for tutorial pattern (education or tech)
    else if (title.includes('tutorial') || title.includes('how to') || title.includes('course')) {
      // If tech-related tutorial, classify as technology
      if (content.includes('programming') || content.includes('coding') || content.includes('development') || content.includes('plugin')) {
        bestNiche = 'technology';
        bestSubNiche = 'programming';
        console.log(`💻 Tech tutorial detected -> Technology`);
      } else {
        bestNiche = 'education';
        bestSubNiche = 'education';
        console.log(`🎓 General tutorial detected -> Education`);
      }
    }
  }
  
  // Create niche hierarchy with proper display names
  const displayName = bestSubNiche !== bestNiche && bestSubNiche !== 'general'
    ? `${bestSubNiche.charAt(0).toUpperCase() + bestSubNiche.slice(1).replace('-', ' ')} (${bestNiche.charAt(0).toUpperCase() + bestNiche.slice(1)})`
    : bestNiche.charAt(0).toUpperCase() + bestNiche.slice(1);
  
  console.log(`🎯 Final detection: ${displayName} (score: ${bestScore})`);
  
  return {
    mainNiche: bestNiche,
    subNiche: bestSubNiche,
    displayName: displayName
  };
}

// This function is now replaced by the universal detector - keeping for compatibility
function analyzeContentForNiche(content: string, title: string): string | NicheHierarchy {
  // Direct call to universal detector - no complex analysis needed
  return universalNicheDetector(title, content);
}

// Check if a word is a stop word (common words to ignore)
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
    'how', 'what', 'when', 'where', 'why', 'who', 'this', 'that', 'these', 'those',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
    'youtube', 'video', 'channel', 'subscribe', 'like', 'comment', 'watch', 'new', 'best', 'top'
  ]);
  return stopWords.has(word);
}

// Advanced contextual analysis with intelligent title parsing
function classifyContentByPatterns(content: string, topWords: string[], title: string): string | NicheHierarchy {
  const contentLower = content.toLowerCase();
  const titleLower = title.toLowerCase();
  
  console.log(`🔎 Analyzing complete title: "${title}"`);
  
  // First, do comprehensive contextual analysis
  const contextualAnalysis = analyzeCompleteContext(titleLower, contentLower, topWords);
  if (contextualAnalysis) {
    console.log(`🎯 Contextual analysis result: ${contextualAnalysis.displayName}`);
    return contextualAnalysis;
  }
  
  // Sports patterns with sub-niche detection
  if (hasSportsPatterns(contentLower, titleLower, topWords)) {
    const sportsSubNiche = detectSportsSubNiche(contentLower, titleLower, topWords);
    if (sportsSubNiche !== 'sports') {
      return {
        mainNiche: 'sports',
        subNiche: sportsSubNiche,
        displayName: `${sportsSubNiche.charAt(0).toUpperCase() + sportsSubNiche.slice(1)} (Sports)`
      };
    }
    return 'sports';
  }
  
  // Finance patterns with sub-niche detection
  if (hasFinancePatterns(contentLower, topWords)) {
    const financeSubNiche = detectFinanceSubNiche(contentLower, topWords);
    if (financeSubNiche !== 'finance') {
      return {
        mainNiche: 'finance',
        subNiche: financeSubNiche,
        displayName: `${financeSubNiche.charAt(0).toUpperCase() + financeSubNiche.slice(1)} (Finance)`
      };
    }
    return 'finance';
  }
  
  // Technology patterns with sub-niche detection - CHECK FIRST before education!
  if (hasTechPatterns(contentLower, topWords)) {
    console.log(`💻 Technology pattern detected!`);
    const techSubNiche = detectTechSubNiche(contentLower, topWords);
    if (techSubNiche !== 'technology') {
      return {
        mainNiche: 'technology',
        subNiche: techSubNiche,
        displayName: `${techSubNiche.charAt(0).toUpperCase() + techSubNiche.slice(1)} (Tech)`
      };
    }
    return 'technology';
  }
  
  // Gaming patterns
  if (hasGamingPatterns(contentLower, topWords)) {
    return 'gaming';
  }
  
  // Education patterns - MOVED AFTER technology to avoid catching programming courses
  if (hasEducationPatterns(contentLower, titleLower, topWords)) {
    // Special check: if it's programming/tech education, classify as technology instead
    const hasTechTerms = contentLower.includes('programming') || contentLower.includes('coding') || 
                        contentLower.includes('development') || contentLower.includes('plugin') ||
                        topWords.includes('programming') || topWords.includes('coding') ||
                        topWords.includes('development') || topWords.includes('plugin');
    
    if (hasTechTerms) {
      console.log(`💻 Tech education detected - routing to technology instead of education`);
      return 'technology';
    }
    
    return 'education';
  }
  
  // Health/Fitness patterns
  if (hasFitnessPatterns(contentLower, topWords)) {
    return 'fitness';
  }
  
  // Food/Cooking patterns
  if (hasCookingPatterns(contentLower, topWords)) {
    return 'cooking';
  }
  
  // Entertainment patterns
  if (hasEntertainmentPatterns(contentLower, topWords)) {
    return 'entertainment';
  }
  
  // Business patterns
  if (hasBusinessPatterns(contentLower, topWords)) {
    return 'business';
  }
  
  // Travel patterns
  if (hasTravelPatterns(contentLower, topWords)) {
    return 'travel';
  }
  
  // Lifestyle patterns
  if (hasLifestylePatterns(contentLower, topWords)) {
    return 'lifestyle';
  }
  
  // If no specific pattern matches, analyze title for any meaningful niche indicators
  const titleAnalysis = analyzeGeneralTitle(titleLower, contentLower);
  if (titleAnalysis) {
    console.log(`🎯 General title analysis: ${titleAnalysis.displayName}`);
    return titleAnalysis;
  }
  
  return 'general';
}

// Comprehensive contextual analysis of complete titles
function analyzeCompleteContext(titleLower: string, contentLower: string, topWords: string[]): NicheHierarchy | null {
  // Business/Finance Context Analysis
  const businessContexts = [
    {
      patterns: ['dropshipping', 'drop shipping', 'amazon dropship', 'shopify dropship'],
      mainNiche: 'finance',
      subNiche: 'dropshipping',
      displayName: 'Dropshipping (Finance)'
    },
    {
      patterns: ['affiliate marketing', 'affiliate', 'commission', 'promote products'],
      mainNiche: 'finance', 
      subNiche: 'affiliate-marketing',
      displayName: 'Affiliate Marketing (Finance)'
    },
    {
      patterns: ['ecommerce', 'e-commerce', 'online store', 'shopify', 'amazon fba'],
      mainNiche: 'finance',
      subNiche: 'ecommerce', 
      displayName: 'E-commerce (Finance)'
    },
    {
      patterns: ['freelancing', 'freelance', 'upwork', 'fiverr', 'gig work'],
      mainNiche: 'finance',
      subNiche: 'freelancing',
      displayName: 'Freelancing (Finance)'
    },
    {
      patterns: ['youtube automation', 'faceless youtube', 'youtube cash cow'],
      mainNiche: 'finance',
      subNiche: 'youtube-automation',
      displayName: 'YouTube Automation (Finance)'
    },
    {
      patterns: ['print on demand', 'pod', 'tshirt business', 'merch'],
      mainNiche: 'finance',
      subNiche: 'print-on-demand',
      displayName: 'Print on Demand (Finance)'
    },
    {
      patterns: ['real estate', 'property investment', 'house flipping', 'rental income'],
      mainNiche: 'finance',
      subNiche: 'real-estate',
      displayName: 'Real Estate (Finance)'
    },
    {
      patterns: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'trading'],
      mainNiche: 'finance',
      subNiche: 'cryptocurrency',
      displayName: 'Cryptocurrency (Finance)'
    },
    {
      patterns: ['online business', 'make money online', 'digital business', 'internet business'],
      mainNiche: 'finance',
      subNiche: 'online-business',
      displayName: 'Online Business (Finance)'
    },
    {
      patterns: ['side hustle', 'side income', 'extra income', 'multiple income streams'],
      mainNiche: 'finance',
      subNiche: 'side-hustle',
      displayName: 'Side Hustle (Finance)'
    }
  ];
  
  // Check for business/finance contexts with intent keywords
  const moneyIntentKeywords = [
    'make money', 'earn', 'income', 'profit', 'cash', 'rich', 'wealthy', 
    'financial freedom', 'passive income', 'start', 'business', 'opportunity', 
    'chance', 'made', 'earned', 'dollars', 'millionaire', 'success', 
    'entrepreneur', 'startup', 'revenue', 'monetize', 'zero audience',
    'no experience', 'beginner', 'from scratch', 'side hustle'
  ];
  const hasMoneyIntent = moneyIntentKeywords.some(keyword => titleLower.includes(keyword) || contentLower.includes(keyword));
  
  // Also check for dollar amount patterns
  const dollarPattern = /\$[0-9,]+[kmb]?/gi;
  const hasDollarAmount = dollarPattern.test(titleLower) || dollarPattern.test(contentLower);
  
  if (hasDollarAmount) {
    console.log(`💰 Dollar amount detected in content`);
  }
  
  if (hasMoneyIntent || hasDollarAmount) {
    for (const context of businessContexts) {
      for (const pattern of context.patterns) {
        if (titleLower.includes(pattern) || contentLower.includes(pattern)) {
          console.log(`💰 Detected finance context: ${context.subNiche} (found: ${pattern})`);
          return {
            mainNiche: context.mainNiche,
            subNiche: context.subNiche, 
            displayName: context.displayName
          };
        }
      }
    }
  }
  
  // Tech Context Analysis with comprehensive design tools and contexts
  const techContexts = [
    {
      patterns: ['figma', 'sketch', 'adobe xd', 'ui design', 'ux design', 'user interface', 'user experience', 'prototyping', 'wireframe', 'design system', 'design tool'],
      mainNiche: 'technology',
      subNiche: 'ui-ux-design',
      displayName: 'UI/UX Design (Tech)'
    },
    {
      patterns: ['app development', 'mobile app', 'ios development', 'android development', 'flutter', 'react native', 'swift', 'kotlin'],
      mainNiche: 'technology',
      subNiche: 'app-development',
      displayName: 'App Development (Tech)'
    },
    {
      patterns: ['web development', 'website development', 'html', 'css', 'javascript', 'react', 'vue', 'angular', 'nodejs', 'frontend', 'backend'],
      mainNiche: 'technology',
      subNiche: 'web-development', 
      displayName: 'Web Development (Tech)'
    },
    {
      patterns: ['artificial intelligence', 'machine learning', 'deep learning', 'ai tutorial', 'chatgpt', 'openai', 'neural network', 'data science'],
      mainNiche: 'technology',
      subNiche: 'artificial-intelligence',
      displayName: 'Artificial Intelligence (Tech)'
    },
    {
      patterns: ['cybersecurity', 'ethical hacking', 'penetration testing', 'network security', 'information security', 'cyber defense'],
      mainNiche: 'technology',
      subNiche: 'cybersecurity',
      displayName: 'Cybersecurity (Tech)'
    },
    {
      patterns: ['graphic design', 'logo design', 'brand design', 'photoshop', 'illustrator', 'canva', 'design tutorial', 'visual design'],
      mainNiche: 'technology',
      subNiche: 'graphic-design',
      displayName: 'Graphic Design (Tech)'
    },
    {
      patterns: ['video editing', 'after effects', 'premiere pro', 'final cut', 'davinci resolve', 'motion graphics', 'video production'],
      mainNiche: 'technology', 
      subNiche: 'video-editing',
      displayName: 'Video Editing (Tech)'
    },
    {
      patterns: ['plugin development', 'wordpress plugin', 'plugin', 'programming', 'coding', 'software development', 'code'],
      mainNiche: 'technology',
      subNiche: 'programming',
      displayName: 'Programming (Tech)'
    },
    {
      patterns: ['programming course', 'coding course', 'development course', 'tech course', 'learn programming', 'learn coding'],
      mainNiche: 'technology',
      subNiche: 'programming',
      displayName: 'Programming (Tech)'
    }
  ];
  
  const techIntentKeywords = ['learn', 'tutorial', 'course', 'guide', 'build', 'create', 'develop', 'review', 'vs', 'comparison', 'new', 'best', 'tool', 'app', 'software'];
  const hasTechIntent = techIntentKeywords.some(keyword => titleLower.includes(keyword));
  
  if (hasTechIntent) {
    for (const context of techContexts) {
      for (const pattern of context.patterns) {
        if (titleLower.includes(pattern) || contentLower.includes(pattern)) {
          console.log(`💻 Detected tech context: ${context.subNiche} (found: ${pattern})`);
          return {
            mainNiche: context.mainNiche,
            subNiche: context.subNiche,
            displayName: context.displayName
          };
        }
      }
    }
  }
  
  return null;
}

// Analyze general titles when specific patterns don't match
function analyzeGeneralTitle(titleLower: string, contentLower: string): NicheHierarchy | null {
  // Look for general topic indicators in titles
  const generalPatterns = [
    {
      keywords: ['tutorial', 'how to', 'learn', 'guide', 'course', 'lesson', 'teach'],
      topicKeywords: {
        'design': { mainNiche: 'technology', subNiche: 'design', displayName: 'Design (Tech)' },
        'ui': { mainNiche: 'technology', subNiche: 'ui-ux-design', displayName: 'UI/UX Design (Tech)' },
        'ux': { mainNiche: 'technology', subNiche: 'ui-ux-design', displayName: 'UI/UX Design (Tech)' },
        'coding': { mainNiche: 'technology', subNiche: 'programming', displayName: 'Programming (Tech)' },
        'programming': { mainNiche: 'technology', subNiche: 'programming', displayName: 'Programming (Tech)' },
        'development': { mainNiche: 'technology', subNiche: 'programming', displayName: 'Programming (Tech)' },
        'plugin': { mainNiche: 'technology', subNiche: 'programming', displayName: 'Programming (Tech)' },
        'photoshop': { mainNiche: 'technology', subNiche: 'graphic-design', displayName: 'Graphic Design (Tech)' },
        'editing': { mainNiche: 'technology', subNiche: 'video-editing', displayName: 'Video Editing (Tech)' }
      }
    },
    {
      keywords: ['review', 'vs', 'comparison', 'best', 'top'],
      topicKeywords: {
        'tool': { mainNiche: 'technology', subNiche: 'tech-tools', displayName: 'Tech Tools (Tech)' },
        'app': { mainNiche: 'technology', subNiche: 'app-review', displayName: 'App Reviews (Tech)' },
        'software': { mainNiche: 'technology', subNiche: 'software-review', displayName: 'Software Reviews (Tech)' },
        'design': { mainNiche: 'technology', subNiche: 'design-tools', displayName: 'Design Tools (Tech)' }
      }
    },
    {
      keywords: ['make money', 'earn', 'profit', 'income', 'business'],
      topicKeywords: {
        'online': { mainNiche: 'finance', subNiche: 'online-business', displayName: 'Online Business (Finance)' },
        'youtube': { mainNiche: 'finance', subNiche: 'youtube-monetization', displayName: 'YouTube Monetization (Finance)' },
        'social media': { mainNiche: 'finance', subNiche: 'social-media-marketing', displayName: 'Social Media Marketing (Finance)' }
      }
    }
  ];
  
  for (const pattern of generalPatterns) {
    const hasContextKeyword = pattern.keywords.some(keyword => titleLower.includes(keyword) || contentLower.includes(keyword));
    
    if (hasContextKeyword) {
      for (const [topicKeyword, result] of Object.entries(pattern.topicKeywords)) {
        if (titleLower.includes(topicKeyword) || contentLower.includes(topicKeyword)) {
          console.log(`🔎 Found general pattern: ${pattern.keywords.find(k => titleLower.includes(k) || contentLower.includes(k))} + ${topicKeyword}`);
          return result;
        }
      }
    }
  }
  
  return null;
}

// Create niche hierarchy from simple niche name
function createNicheHierarchy(niche: string, content: string, title: string): NicheHierarchy {
  if (niche === 'sports') {
    const subNiche = detectSportsSubNiche(content, title.toLowerCase(), []);
    if (subNiche !== 'sports') {
      return {
        mainNiche: 'sports',
        subNiche: subNiche,
        displayName: `${subNiche.charAt(0).toUpperCase() + subNiche.slice(1)} (Sports)`
      };
    }
  } else if (niche === 'finance') {
    const subNiche = detectFinanceSubNiche(content, []);
    if (subNiche !== 'finance') {
      return {
        mainNiche: 'finance',
        subNiche: subNiche,
        displayName: `${subNiche.charAt(0).toUpperCase() + subNiche.slice(1)} (Finance)`
      };
    }
  }
  
  return {
    mainNiche: niche,
    subNiche: niche,
    displayName: niche.charAt(0).toUpperCase() + niche.slice(1)
  };
}

// Detect sports sub-niches
function detectSportsSubNiche(content: string, title: string, topWords: string[]): string {
  const sportsSubNiches = {
    'cricket': ['cricket', 'bat', 'ball', 'wicket', 'over', 'innings', 't20', 'odi', 'test', 'ipl', 'bbl', 'psl'],
    'football': ['football', 'soccer', 'goal', 'penalty', 'fifa', 'premier league', 'champions league', 'world cup'],
    'basketball': ['basketball', 'nba', 'dunk', 'three pointer', 'lebron', 'curry', 'lakers', 'warriors'],
    'tennis': ['tennis', 'wimbledon', 'open', 'serve', 'ace', 'grand slam', 'federer', 'nadal', 'djokovic'],
    'baseball': ['baseball', 'mlb', 'home run', 'pitcher', 'batter', 'world series', 'yankees', 'dodgers'],
    'hockey': ['hockey', 'nhl', 'puck', 'stick', 'goal', 'stanley cup', 'ice hockey', 'field hockey'],
    'golf': ['golf', 'pga', 'masters', 'tiger woods', 'hole in one', 'birdie', 'eagle', 'par'],
    'rugby': ['rugby', 'try', 'scrum', 'lineout', 'world cup rugby', 'all blacks', 'six nations']
  };
  
  for (const [sport, keywords] of Object.entries(sportsSubNiches)) {
    for (const keyword of keywords) {
      if (content.includes(keyword) || title.includes(keyword) || topWords.includes(keyword)) {
        console.log(`🏆 Sports sub-niche detected: ${sport} (keyword: ${keyword})`);
        return sport;
      }
    }
  }
  
  return 'sports';
}

// Detect finance sub-niches with enhanced patterns
function detectFinanceSubNiche(content: string, topWords: string[]): string {
  const financeSubNiches = {
    'dropshipping': [
      'dropshipping', 'drop shipping', 'amazon dropship', 'shopify dropship', 
      'dropship business', 'ecom dropship', 'dropship store', 'dropship product',
      'oberlo', 'spocket', 'aliexpress dropship'
    ],
    'ecommerce': [
      'ecommerce', 'e-commerce', 'online store', 'shopify', 'amazon fba', 
      'fba business', 'amazon seller', 'ecom store', 'online business',
      'digital commerce', 'etsy business'
    ],
    'affiliate-marketing': [
      'affiliate marketing', 'affiliate', 'commission', 'promote products',
      'clickbank', 'amazon associates', 'affiliate program', 'referral income',
      'affiliate sales', 'promote affiliate'
    ],
    'cryptocurrency': [
      'crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'altcoin', 
      'crypto trading', 'bitcoin investment', 'cryptocurrency', 'binance', 'coinbase'
    ],
    'stock-trading': [
      'stocks', 'shares', 'trading', 'nasdaq', 'dow jones', 'sp500', 'options', 
      'day trading', 'swing trading', 'stock market', 'penny stocks', 'robinhood'
    ],
    'real-estate': [
      'real estate', 'property', 'house', 'apartment', 'rent', 'mortgage', 
      'investment property', 'rental income', 'house flipping', 'airbnb', 'landlord'
    ],
    'freelancing': [
      'freelancing', 'freelance', 'upwork', 'fiverr', 'gig work', 'remote work',
      'freelancer', 'contract work', 'consulting', 'service business'
    ],
    'youtube-automation': [
      'youtube automation', 'faceless youtube', 'youtube cash cow', 'youtube business',
      'youtube channel', 'youtube monetization', 'youtube income', 'faceless channel'
    ],
    'print-on-demand': [
      'print on demand', 'pod', 'tshirt business', 'merch', 'teespring', 'printful',
      'custom products', 'merch by amazon', 'etsy pod'
    ],
    'personal-finance': [
      'budget', 'savings', 'debt', 'credit score', 'financial planning', 'emergency fund',
      'personal finance', 'money management', 'frugal living'
    ],
    'investing': [
      'investing', 'portfolio', 'diversification', 'roi', 'compound interest', 'index funds',
      'mutual funds', 'etf', 'dividend investing', 'passive investing'
    ]
  };
  
  // Check with higher priority for specific business models
  const priorityOrder = ['dropshipping', 'ecommerce', 'affiliate-marketing', 'youtube-automation', 'freelancing', 'cryptocurrency', 'real-estate', 'stock-trading', 'print-on-demand', 'investing', 'personal-finance'];
  
  for (const subNiche of priorityOrder) {
    const keywords = financeSubNiches[subNiche as keyof typeof financeSubNiches];
    for (const keyword of keywords) {
      if (content.includes(keyword) || topWords.includes(keyword)) {
        console.log(`💰 Finance sub-niche detected: ${subNiche} (keyword: ${keyword})`);
        return subNiche;
      }
    }
  }
  
  return 'finance';
}

// Detect technology sub-niches
function detectTechSubNiche(content: string, topWords: string[]): string {
  const techSubNiches = {
    'programming': ['programming', 'coding', 'python', 'javascript', 'java', 'react', 'nodejs', 'api'],
    'artificial-intelligence': ['ai', 'machine learning', 'deep learning', 'neural network', 'chatgpt', 'llm'],
    'web-development': ['web development', 'frontend', 'backend', 'html', 'css', 'website', 'responsive'],
    'mobile-development': ['mobile app', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'],
    'cybersecurity': ['cybersecurity', 'hacking', 'security', 'encryption', 'firewall', 'malware', 'phishing']
  };
  
  for (const [subNiche, keywords] of Object.entries(techSubNiches)) {
    for (const keyword of keywords) {
      if (content.includes(keyword) || topWords.includes(keyword)) {
        console.log(`💻 Tech sub-niche detected: ${subNiche} (keyword: ${keyword})`);
        return subNiche;
      }
    }
  }
  
  return 'technology';
}

// Pattern detection functions
function hasFinancePatterns(content: string, topWords: string[]): boolean {
  const financeIndicators = [
    'money', 'finance', 'investing', 'stocks', 'trading', 'wealth', 'income', 'earn',
    'profit', 'revenue', 'budget', 'debt', 'credit', 'rich', 'millionaire', 'business',
    'passive', 'financial', 'investment', 'roi', 'portfolio', 'dividend', 'made',
    'earning', 'dollars', 'cash', 'wealthy', 'success', 'entrepreneur', 'startup',
    'online business', 'side hustle', 'freelance', 'crypto', 'bitcoin', 'trading',
    'ecommerce', 'dropshipping', 'affiliate', 'monetize', 'revenue', 'sales'
  ];
  
  // Special patterns for finance content
  const financePatterns = [
    /\$[0-9,]+/g,  // Dollar amounts like $65K, $1000
    /[0-9]+k/gi,   // Numbers with K like 65K
    /made.*money/gi, // "made money" patterns
    /earn.*income/gi // "earn income" patterns
  ];
  
  // Check for dollar amounts or financial patterns
  for (const pattern of financePatterns) {
    if (pattern.test(content)) {
      console.log(`💰 Finance pattern detected: ${pattern}`);
      return true;
    }
  }
  
  return hasPatternMatch(content, topWords, financeIndicators, 1); // Reduced threshold to 1
}

function hasSportsPatterns(content: string, title: string, topWords: string[]): boolean {
  const sportsIndicators = [
    'cricket', 'football', 'soccer', 'basketball', 'tennis', 'baseball', 'hockey',
    'golf', 'rugby', 'match', 'tournament', 'championship', 'league', 'team',
    'player', 'score', 'goal', 'win', 'highlights', 'sport', 'athletic', 'olympics',
    'game', 'final', 'semifinal', 'playoff', 'season', 'coach', 'vs'
  ];
  
  // Special check for "vs" pattern in title (very strong sports indicator)
  if (title.includes(' vs ') || title.includes(' v ')) {
    console.log(`🏆 Strong sports pattern detected: "vs" in title`);
    return true;
  }
  
  return hasPatternMatch(content, topWords, sportsIndicators, 2);
}

function hasTechPatterns(content: string, topWords: string[]): boolean {
  const techIndicators = [
    'tech', 'software', 'programming', 'coding', 'computer', 'ai', 'artificial',
    'intelligence', 'app', 'website', 'development', 'data', 'algorithm', 'startup',
    'digital', 'internet', 'online', 'platform', 'system', 'innovation'
  ];
  
  // Strong technology/programming patterns that should be detected immediately
  const strongTechPatterns = [
    'plugin development', 'web development', 'app development', 'software development',
    'programming course', 'coding course', 'development course', 'tech course',
    'javascript', 'python', 'java', 'react', 'nodejs', 'html', 'css', 'php',
    'wordpress', 'plugin', 'api', 'database', 'framework', 'library', 'github',
    'code', 'developer', 'programmer', 'backend', 'frontend', 'fullstack'
  ];
  
  // Check for strong tech patterns first (immediate detection)
  for (const pattern of strongTechPatterns) {
    if (content.includes(pattern) || topWords.includes(pattern)) {
      console.log(`💻 Strong tech pattern detected: ${pattern}`);
      return true;
    }
  }
  
  return hasPatternMatch(content, topWords, techIndicators, 2);
}

function hasGamingPatterns(content: string, topWords: string[]): boolean {
  const gamingIndicators = [
    'gaming', 'game', 'gameplay', 'gamer', 'esports', 'stream', 'play', 'xbox',
    'playstation', 'nintendo', 'pc', 'console', 'multiplayer', 'rpg', 'fps',
    'mmorpg', 'battle', 'level', 'character', 'quest'
  ];
  
  // Specific popular games that should be detected as gaming
  const popularGames = [
    'minecraft', 'fortnite', 'gta', 'call of duty', 'pubg', 'valorant', 'league of legends',
    'among us', 'roblox', 'fall guys', 'apex legends', 'overwatch', 'fifa', 'madden',
    'cyberpunk', 'witcher', 'pokemon', 'mario', 'zelda', 'halo', 'counter strike',
    'csgo', 'dota', 'world of warcraft', 'wow', 'destiny', 'cod', 'battlefield'
  ];
  
  // Check for popular game names first (strong gaming indicators)
  for (const game of popularGames) {
    if (content.includes(game) || topWords.includes(game)) {
      console.log(`🎮 Strong gaming pattern detected: ${game}`);
      return true;
    }
  }
  
  return hasPatternMatch(content, topWords, gamingIndicators, 2);
}

function hasEducationPatterns(content: string, title: string, topWords: string[]): boolean {
  const educationIndicators = [
    'tutorial', 'learning', 'education', 'course', 'lesson', 'teaching', 'study',
    'knowledge', 'skill', 'learn', 'explain', 'guide', 'training', 'workshop',
    'class', 'school', 'university', 'student', 'teacher', 'professor'
  ];
  
  // Strong education patterns in title
  if (title.includes('how to') || title.includes('tutorial') || title.includes('learn')) {
    return true;
  }
  
  return hasPatternMatch(content, topWords, educationIndicators, 2);
}

function hasFitnessPatterns(content: string, topWords: string[]): boolean {
  const fitnessIndicators = [
    'fitness', 'workout', 'exercise', 'health', 'diet', 'nutrition', 'weight',
    'muscle', 'gym', 'training', 'bodybuilding', 'cardio', 'strength', 'yoga',
    'running', 'marathon', 'athlete', 'protein', 'calories', 'healthy'
  ];
  return hasPatternMatch(content, topWords, fitnessIndicators, 2);
}

function hasCookingPatterns(content: string, topWords: string[]): boolean {
  const cookingIndicators = [
    'cooking', 'recipe', 'food', 'kitchen', 'chef', 'baking', 'meal', 'ingredient',
    'cuisine', 'restaurant', 'dish', 'taste', 'flavor', 'cook', 'preparation',
    'delicious', 'eat', 'dinner', 'lunch', 'breakfast'
  ];
  return hasPatternMatch(content, topWords, cookingIndicators, 2);
}

function hasEntertainmentPatterns(content: string, topWords: string[]): boolean {
  const entertainmentIndicators = [
    'funny', 'comedy', 'entertainment', 'humor', 'viral', 'challenge', 'reaction',
    'meme', 'prank', 'celebrity', 'movie', 'film', 'music', 'song', 'dance',
    'show', 'performance', 'actor', 'actress', 'concert'
  ];
  return hasPatternMatch(content, topWords, entertainmentIndicators, 2);
}

function hasBusinessPatterns(content: string, topWords: string[]): boolean {
  const businessIndicators = [
    'business', 'entrepreneur', 'startup', 'marketing', 'sales', 'company',
    'success', 'leadership', 'management', 'strategy', 'growth', 'profit',
    'customer', 'brand', 'market', 'competition', 'innovation', 'productivity',
    'scale', 'revenue', 'income', 'monetize', 'hustle', 'opportunity', 'venture',
    'empire', 'empire building', 'mogul', 'tycoon', 'ceo', 'founder'
  ];
  
  // Business success patterns
  const businessPatterns = [
    /built.*business/gi,
    /started.*company/gi,
    /made.*millions/gi,
    /from.*zero.*to/gi,
    /success.*story/gi
  ];
  
  // Check for business success patterns
  for (const pattern of businessPatterns) {
    if (pattern.test(content)) {
      console.log(`🏢 Business pattern detected: ${pattern}`);
      return true;
    }
  }
  
  return hasPatternMatch(content, topWords, businessIndicators, 2);
}

function hasTravelPatterns(content: string, topWords: string[]): boolean {
  const travelIndicators = [
    'travel', 'vacation', 'trip', 'destination', 'adventure', 'explore', 'journey',
    'tourism', 'hotel', 'flight', 'country', 'city', 'culture', 'backpack',
    'road trip', 'sightseeing', 'visa', 'passport', 'budget travel'
  ];
  return hasPatternMatch(content, topWords, travelIndicators, 2);
}

function hasLifestylePatterns(content: string, topWords: string[]): boolean {
  const lifestyleIndicators = [
    'lifestyle', 'vlog', 'daily', 'routine', 'life', 'personal', 'story',
    'experience', 'motivation', 'productivity', 'habits', 'mindset', 'goals',
    'inspiration', 'self improvement', 'wellness', 'balance', 'happiness'
  ];
  return hasPatternMatch(content, topWords, lifestyleIndicators, 2);
}

// Helper function to check pattern matches
function hasPatternMatch(content: string, topWords: string[], indicators: string[], threshold: number): boolean {
  let matches = 0;
  
  for (const indicator of indicators) {
    if (content.includes(indicator) || topWords.includes(indicator)) {
      matches++;
      if (matches >= threshold) {
        console.log(`✅ Pattern match found: ${indicator} (${matches}/${threshold})`);
        return true;
      }
    }
  }
  
  return false;
}

// Extract niche from the most frequent words
function extractNicheFromTopWords(topWords: string[]): string {
  // If we have meaningful content words, use the most relevant one as niche
  for (const word of topWords) {
    if (word.length > 3 && !['video', 'youtube', 'channel', 'subscribe'].includes(word)) {
      // Return the first meaningful word as the niche
      console.log(`📝 Using extracted niche: ${word}`);
      return word.toLowerCase();
    }
  }
  
  return 'general';
}

// Format numbers for display
function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Generate highly specific search queries based on niche hierarchy
function generateSearchQueries(niche: string): string[] {
  // Specific sub-niche queries for better targeting
  const specificSubNicheQueries: { [key: string]: string[] } = {
    // Finance sub-niches
    'dropshipping': [
      'dropshipping tutorial',
      'shopify dropshipping',
      'amazon dropshipping', 
      'dropshipping business',
      'how to start dropshipping',
      'dropshipping tips',
      'dropshipping strategy',
      'dropshipping 2024',
      'dropshipping guide',
      'profitable dropshipping'
    ],
    'affiliate-marketing': [
      'affiliate marketing',
      'affiliate marketing tutorial',
      'how to make money affiliate marketing',
      'affiliate marketing tips',
      'best affiliate programs',
      'affiliate marketing strategy',
      'passive income affiliate',
      'affiliate marketing guide'
    ],
    'ecommerce': [
      'ecommerce business',
      'online store',
      'shopify tutorial',
      'amazon fba',
      'ecommerce tips',
      'online business',
      'sell online',
      'ecommerce strategy'
    ],
    'cryptocurrency': [
      'crypto trading',
      'bitcoin investment',
      'crypto tutorial',
      'how to buy crypto',
      'crypto analysis',
      'defi explained',
      'crypto strategy',
      'altcoin investing'
    ],
    'real-estate': [
      'real estate investing',
      'property investment',
      'house flipping',
      'rental property',
      'real estate tips',
      'property analysis',
      'real estate strategy',
      'real estate business'
    ],
    'freelancing': [
      'freelancing tips',
      'upwork tutorial',
      'fiverr success',
      'freelance business',
      'how to freelance',
      'freelancing guide',
      'remote work',
      'gig economy'
    ],
    // Sports sub-niches  
    'cricket': [
      'cricket highlights',
      'cricket match',
      'cricket analysis',
      'cricket tutorial',
      'cricket tips',
      'cricket strategy',
      'cricket training',
      'cricket skills'
    ],
    'football': [
      'football highlights',
      'football match',
      'football analysis', 
      'football training',
      'football skills',
      'football tactics',
      'football tutorial',
      'football tips'
    ],
    // Tech sub-niches
    'ui-ux-design': [
      'figma tutorial',
      'ui design',
      'ux design', 
      'user interface design',
      'user experience design',
      'prototyping',
      'wireframing',
      'design system',
      'figma tips',
      'adobe xd tutorial'
    ],
    'design-tools': [
      'design tool comparison',
      'figma vs sketch',
      'design software',
      'ui design tools',
      'prototyping tools',
      'design app review',
      'best design tools',
      'design workflow'
    ],
    'programming': [
      'programming tutorial',
      'coding tutorial',
      'learn programming',
      'programming tips',
      'coding guide',
      'software development',
      'programming course',
      'coding bootcamp'
    ],
    'web-development': [
      'web development',
      'html css tutorial',
      'javascript tutorial',
      'react tutorial',
      'frontend development',
      'backend development',
      'web dev tips',
      'responsive design'
    ],
    'graphic-design': [
      'graphic design tutorial',
      'photoshop tutorial',
      'logo design',
      'brand design',
      'visual design',
      'design inspiration',
      'adobe illustrator',
      'canva tutorial'
    ],
    'video-editing': [
      'video editing tutorial',
      'after effects tutorial', 
      'premiere pro tutorial',
      'video editing tips',
      'motion graphics',
      'video production',
      'editing techniques',
      'final cut pro'
    ]
  };
  
  // If we have specific queries for this sub-niche, use them
  if (specificSubNicheQueries[niche]) {
    console.log(`🎯 Using specific queries for ${niche}`);
    return specificSubNicheQueries[niche];
  }
  
  // Legacy broad niche queries
  const broadNicheQueries: { [key: string]: string[] } = {
    'finance': [
      'make money online',
      'wealth creation', 
      'passive income',
      'investing tips',
      'financial freedom',
      'business opportunity',
      'side hustle',
      'money making'
    ],
    'sports': [
      'sports highlights',
      'match analysis',
      'game recap', 
      'tournament',
      'championship',
      'sports news',
      'athlete training'
    ],
    'technology': [
      'tech review',
      'programming tutorial',
      'software development',
      'coding tips',
      'tech news',
      'technology guide',
      'tech tutorial'
    ]
  };
  
  // Use broad queries if available
  if (broadNicheQueries[niche]) {
    return broadNicheQueries[niche];
  }
  
  // Generic fallback queries
  return [
    niche,
    `${niche} tutorial`,
    `${niche} tips`,
    `how to ${niche}`,
    `best ${niche}`,
    `${niche} guide`,
    `${niche} explained`,
    `${niche} strategy`
  ];
}

// Get real competitor data from YouTube search with recent video filtering using AI keywords
async function getRealCompetitorData(nicheHierarchy: (NicheHierarchy & { searchKeywords?: string[] }) | string, limit: number = 50): Promise<RealVideo[]> {
  try {
    const searchNiche = typeof nicheHierarchy === 'object' ? nicheHierarchy.subNiche : nicheHierarchy;
    
    // Use AI-provided search keywords if available, otherwise fall back to old method
    let searchQueries: string[];
    if (typeof nicheHierarchy === 'object' && nicheHierarchy.searchKeywords && nicheHierarchy.searchKeywords.length > 0) {
      searchQueries = nicheHierarchy.searchKeywords;
      console.log(`🤖 Using AI-powered search keywords: ${searchQueries.join(', ')}`);
    } else {
      console.log(`🔍 Searching for "${searchNiche}" content on YouTube...`);
      searchQueries = generateSearchQueries(searchNiche);
      console.log(`⚠️ Using fallback search queries: ${searchQueries.join(', ')}`);
    }

    const allVideos: RealVideo[] = [];
    
    for (const query of searchQueries) {
      try {
        // Get more videos per query to ensure we hit the target after filtering
        const videosPerQuery = Math.min(25, Math.ceil(limit / searchQueries.length * 2.5));
        
        // Make search query more specific by adding quotes for exact phrases
        let searchQuery = query;
        if (query.includes(' ') && !query.includes('"')) {
          // Add quotes for multi-word phrases to get more precise results
          searchQuery = `"${query}"`;
        }
        
        console.log(`🎯 Searching with precise query: ${searchQuery}`);
        
        const searchResults = await youtubeSearch.search(searchQuery, { 
          limit: videosPerQuery, 
          type: 'video' 
        });
        
        console.log(`🔍 Query: "${query}" - Found ${searchResults.length} videos`);
        
        for (const video of searchResults) {
          if (video && video.id && video.title && video.uploadedAt && isVideoRecent(video.uploadedAt)) {
            // Check if video is actually relevant to our search keywords
            const isRelevant = isVideoRelevantToTopic(video, searchQueries, query);
            
            if (isRelevant) {
              const realVideo: RealVideo = {
                id: video.id,
                title: video.title,
                views: video.views || 0,
                uploadedAt: video.uploadedAt || 'Unknown',
                duration: video.duration?.toString() || '0:00',
                thumbnail: video.thumbnail?.url || '',
                channelName: video.channel?.name || 'Unknown Channel',
                channelId: video.channel?.id || '',
                channelSubscribers: typeof video.channel?.subscribers === 'number' ? video.channel.subscribers : (parseInt(video.channel?.subscribers as string) || 0),
                channelVerified: video.channel?.verified || false
              };
              allVideos.push(realVideo);
            } else {
              console.log(`❌ Filtered out irrelevant video: "${video.title}"`);
            }
          }
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (searchError) {
        console.log(`Search failed for "${query}":`, searchError);
      }
    }

    // Remove duplicates, filter by recency, and sort by views
    const uniqueVideos = allVideos
      .filter((video, index, self) => 
        index === self.findIndex(v => v.id === video.id)
      )
      .filter(video => isVideoRecent(video.uploadedAt))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    console.log(`✅ Found ${uniqueVideos.length} recent videos for analysis`);
    return uniqueVideos;
    
  } catch (error) {
    console.error('Error fetching competitor data:', error);
    return [];
  }
}

// Check if video content is actually relevant to our search topic
function isVideoRelevantToTopic(video: any, searchKeywords: string[], currentQuery: string): boolean {
  const title = video.title?.toLowerCase() || '';
  const description = video.description?.toLowerCase() || '';
  const channelName = video.channel?.name?.toLowerCase() || '';
  const content = `${title} ${description} ${channelName}`;
  
  // First check for completely irrelevant content patterns
  const blacklistPatterns = [
    'music video', 'song', 'album', 'concert', 'live performance', 'karaoke',
    'movie trailer', 'movie review', 'film', 'cinema', 'hollywood',
    'funny moments', 'compilation', 'memes', 'tiktok', 'vine',
    'kids', 'children', 'cartoon', 'animation', 'disney',
    'celebrity gossip', 'drama', 'scandal', 'news anchor', 'weather',
    'unboxing', 'haul', 'shopping', 'fashion', 'makeup',
    'recipe', 'cooking', 'food review', 'restaurant', 'chef'
  ];
  
  // If video matches blacklist patterns and doesn't match our keywords, filter it out
  for (const pattern of blacklistPatterns) {
    if (content.includes(pattern)) {
      // Check if it also contains our relevant terms - if not, filter out
      const hasRelevantTerms = searchKeywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      if (!hasRelevantTerms) {
        console.log(`⛔ Filtered out blacklisted content: "${video.title}" (matched: ${pattern})`);
        return false;
      }
    }
  }
  
  // Extract key terms from our search keywords to check relevance
  const relevantTerms = [];
  
  // Add terms from all search keywords
  for (const keyword of searchKeywords) {
    const terms = keyword.toLowerCase().split(' ').filter(term => 
      term.length > 2 && 
      !['the', 'and', 'or', 'with', 'for', 'how', 'to', 'a', 'an', 'is', 'are', 'was', 'were'].includes(term)
    );
    relevantTerms.push(...terms);
  }
  
  // Add terms from current query
  const queryTerms = currentQuery.toLowerCase().split(' ').filter(term => 
    term.length > 2 && 
    !['the', 'and', 'or', 'with', 'for', 'how', 'to', 'a', 'an', 'is', 'are', 'was', 'were'].includes(term)
  );
  relevantTerms.push(...queryTerms);
  
  // Remove duplicates
  const uniqueTerms = [...new Set(relevantTerms)];
  
  // Count how many relevant terms appear in the video content
  let matchCount = 0;
  for (const term of uniqueTerms) {
    if (content.includes(term)) {
      matchCount++;
    }
  }
  
  // Calculate relevance score (percentage of terms that match)
  const relevanceScore = matchCount / Math.max(uniqueTerms.length, 1);
  
  // Video is relevant if at least 30% of terms match, or if it has at least 2 strong matches
  const isRelevant = relevanceScore >= 0.3 || matchCount >= 2;
  
  if (!isRelevant) {
    console.log(`🔍 Relevance check: "${video.title}" - Score: ${(relevanceScore * 100).toFixed(1)}% (${matchCount}/${uniqueTerms.length} terms)`);
  }
  
  return isRelevant;
}

// Check if video is recent (within 1 year)
function isVideoRecent(uploadedAt: string): boolean {
  if (!uploadedAt || uploadedAt === 'Unknown') return true; // Include if we can't determine
  
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    // Handle different date formats from YouTube
    if (uploadedAt.includes('ago')) {
      // Parse "X days ago", "X months ago", "X years ago"
      const match = uploadedAt.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        
        if (unit === 'year' && amount >= 1) {
          console.log(`⏰ Filtering out old video: ${uploadedAt}`);
          return false;
        }
        if (unit === 'month' && amount > 12) {
          console.log(`⏰ Filtering out old video: ${uploadedAt}`);
          return false;
        }
      }
      return true; // If it's in "ago" format and not too old, include it
    }
    
    // Try to parse as a date
    const uploadDate = new Date(uploadedAt);
    const isRecent = uploadDate >= oneYearAgo;
    
    if (!isRecent) {
      console.log(`⏰ Filtering out old video: ${uploadedAt}`);
    }
    
    return isRecent;
  } catch (error) {
    console.log(`⚠️ Could not parse date: ${uploadedAt}, including video`);
    return true; // Include if we can't parse the date
  }
}

// Calculate real market metrics from actual data
function calculateRealMarketMetrics(videos: RealVideo[], niche: string | NicheHierarchy) {
  if (videos.length === 0) {
    return {
      score: 30,
      level: 'Low' as const,
      totalViews: 0,
      videoCount: 0,
      avgViewsPerVideo: 0
    };
  }

  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const avgViews = Math.floor(totalViews / videos.length);
  const videoCount = videos.length;

  // Calculate score based on real metrics
  let score = 40; // Base score
  
  // Boost score based on average views
  if (avgViews > 1000000) score += 30;
  else if (avgViews > 500000) score += 25;
  else if (avgViews > 100000) score += 20;
  else if (avgViews > 50000) score += 15;
  else if (avgViews > 10000) score += 10;
  else if (avgViews > 1000) score += 5;

  // Boost score based on video count (market activity)
  if (videoCount > 40) score += 15;
  else if (videoCount > 30) score += 10;
  else if (videoCount > 20) score += 5;

  // Cap the score
  score = Math.min(100, score);

  let level: 'Low' | 'Medium' | 'High' | 'Excellent';
  if (score >= 80) level = 'Excellent';
  else if (score >= 65) level = 'High';
  else if (score >= 45) level = 'Medium';
  else level = 'Low';

  return {
    score,
    level,
    totalViews,
    videoCount,
    avgViewsPerVideo: avgViews
  };
}

// Calculate competition metrics from real data
function calculateRealCompetition(videos: RealVideo[]) {
  if (videos.length === 0) {
    return {
      score: 50,
      level: 'Medium' as const,
      topChannels: 0,
      averageSubscribers: 0,
      competitionIntensity: 'Unknown competition level'
    };
  }

  // Get unique channels and their stats
  const channels = new Map();
  videos.forEach(video => {
    if (!channels.has(video.channelId)) {
      channels.set(video.channelId, {
        name: video.channelName,
        subscribers: video.channelSubscribers,
        verified: video.channelVerified,
        videoCount: 1,
        totalViews: video.views
      });
    } else {
      const channel = channels.get(video.channelId);
      channel.videoCount++;
      channel.totalViews += video.views;
    }
  });

  const channelArray = Array.from(channels.values());
  const avgSubscribers = channelArray.reduce((sum, ch) => sum + ch.subscribers, 0) / channelArray.length;
  const verifiedChannels = channelArray.filter(ch => ch.verified).length;
  const bigChannels = channelArray.filter(ch => ch.subscribers > 100000).length;

  // Calculate competition score
  let score = 30; // Base score
  
  if (avgSubscribers > 1000000) score += 30;
  else if (avgSubscribers > 500000) score += 25;
  else if (avgSubscribers > 100000) score += 20;
  else if (avgSubscribers > 50000) score += 15;
  else if (avgSubscribers > 10000) score += 10;

  score += (verifiedChannels / channelArray.length) * 20;
  score += (bigChannels / channelArray.length) * 15;

  score = Math.min(100, score);

  let level: 'Low' | 'Medium' | 'High' | 'Saturated';
  let intensity: string;

  if (score >= 80) {
    level = 'Saturated';
    intensity = 'Very high competition with established creators dominating';
  } else if (score >= 60) {
    level = 'High';
    intensity = 'High competition, requires unique positioning';
  } else if (score >= 40) {
    level = 'Medium';
    intensity = 'Moderate competition with growth opportunities';
  } else {
    level = 'Low';
    intensity = 'Low competition, good entry opportunity';
  }

  return {
    score,
    level,
    topChannels: channelArray.length,
    averageSubscribers: Math.floor(avgSubscribers),
    competitionIntensity: intensity
  };
}

// Calculate monetization potential based on niche and real data
function calculateRealMonetization(niche: string | NicheHierarchy, videos: RealVideo[]) {
  // Dynamic RPM calculation based on niche characteristics
  const rpm = calculateDynamicRPM(niche, videos);
  const avgViews = videos.length > 0 ? 
    videos.reduce((sum, v) => sum + v.views, 0) / videos.length : 0;

  let score = 30; // Base score

  // Score based on RPM
  if (rpm >= 4.0) score += 35;
  else if (rpm >= 3.0) score += 25;
  else if (rpm >= 2.5) score += 20;
  else if (rpm >= 2.0) score += 15;
  else score += 10;

  // Boost score based on average views (engagement indicates monetization potential)
  if (avgViews > 500000) score += 20;
  else if (avgViews > 100000) score += 15;
  else if (avgViews > 50000) score += 10;
  else if (avgViews > 10000) score += 5;

  score = Math.min(100, score);

  let level: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  if (score >= 80) level = 'Excellent';
  else if (score >= 65) level = 'Good';
  else if (score >= 45) level = 'Fair';
  else level = 'Poor';

  return {
    score,
    level,
    estimatedRPM: rpm,
    revenueRanges: {
      views1K: `$${(rpm * 1).toFixed(2)}`,
      views10K: `$${(rpm * 10).toFixed(2)}`,
      views100K: `$${(rpm * 100).toFixed(2)}`,
      views1M: `$${(rpm * 1000).toFixed(2)}`
    }
  };
}

// Generate insights based on real data analysis
function generateRealInsights(analysis: Omit<NicheAnalysis, 'insights' | 'recommendations'>): { insights: string[], recommendations: string[] } {
  const insights: string[] = [];
  const recommendations: string[] = [];

  // Market size insights
  if (analysis.marketSize.level === 'Excellent') {
    insights.push(`🚀 Excellent market opportunity with ${formatNumber(analysis.marketSize.totalViews)} total views analyzed`);
    insights.push(`📊 Average ${formatNumber(analysis.marketSize.avgViewsPerVideo)} views per video shows strong audience demand`);
    recommendations.push('Focus on high-quality content to capture this large engaged audience');
  } else if (analysis.marketSize.level === 'Low') {
    insights.push(`⚠️ Limited market size with ${analysis.marketSize.videoCount} videos analyzed`);
    recommendations.push('Consider expanding to related sub-niches to increase market reach');
  }

  // Competition insights
  if (analysis.competition.level === 'Saturated') {
    insights.push(`🔥 Highly saturated market with ${analysis.competition.topChannels} active channels`);
    insights.push(`📈 Average competitor has ${formatNumber(analysis.competition.averageSubscribers)} subscribers`);
    recommendations.push('Develop a unique angle or target specific sub-audiences to stand out');
    recommendations.push('Study top performers and identify content gaps you can fill');
  } else if (analysis.competition.level === 'Low') {
    insights.push(`✅ Low competition environment with growth opportunities`);
    recommendations.push('Move quickly to establish authority before more competitors enter');
  }

  // Monetization insights
  if (analysis.monetization.level === 'Excellent') {
    insights.push(`💰 Excellent monetization potential with $${analysis.monetization.estimatedRPM} RPM`);
    recommendations.push('Prioritize ad revenue optimization and consider premium content offerings');
  } else if (analysis.monetization.level === 'Poor') {
    insights.push(`💸 Limited ad revenue potential in this niche`);
    recommendations.push('Focus on alternative monetization: sponsorships, affiliate marketing, products');
  }

  // Video performance insights
  if (analysis.topVideos.length > 0) {
    const topVideo = analysis.topVideos[0];
    insights.push(`🎥 Top performing video: "${topVideo.title.substring(0, 50)}..." with ${formatNumber(topVideo.views)} views`);
    
    const recentVideos = analysis.topVideos.filter(v => 
      v.uploadedAt !== 'Unknown' && v.uploadedAt.includes('month') || v.uploadedAt.includes('week')
    );
    
    if (recentVideos.length > 5) {
      insights.push(`📅 ${recentVideos.length} recent high-performing videos show active, engaged audience`);
      recommendations.push('Maintain consistent posting schedule - audience is actively consuming content');
    }
  }

  return { insights, recommendations };
}

// Universal RPM calculation using the niche database
function calculateDynamicRPM(niche: string | NicheHierarchy, videos: RealVideo[]): number {
  // Universal niche RPM database - matches the universal detector
  const universalRPMDatabase: { [key: string]: number } = {
    'finance': 4.5,
    'technology': 3.2,
    'business': 3.8,
    'education': 2.8,
    'sports': 2.5,
    'fitness': 2.2,
    'cooking': 2.0,
    'travel': 2.1,
    'gaming': 1.8,
    'entertainment': 1.5,
    'lifestyle': 2.0,
    'general': 2.0,
    
    // Finance sub-niches (high RPM)
    'cryptocurrency': 5.2,
    'trading': 4.8,
    'real-estate': 4.2,
    'dropshipping': 4.2,
    'investing': 4.4,
    'online-business': 4.0,
    'side-hustle': 3.9,
    
    // Technology sub-niches
    'artificial-intelligence': 3.8,
    'programming': 3.4,
    'web-development': 3.0,
    'app-development': 3.2,
    'cybersecurity': 3.6,
    
    // Sports sub-niches
    'cricket': 2.8,
    'football': 2.6,
    'basketball': 2.4,
    'tennis': 2.3,
    'baseball': 2.4,
    'golf': 2.7
  };
  
  let targetNiche = 'general';
  let targetSubNiche = 'general';
  
  // Extract niche information
  if (typeof niche === 'object') {
    targetNiche = niche.mainNiche.toLowerCase();
    targetSubNiche = niche.subNiche.toLowerCase();
    console.log(`🔍 Universal RPM lookup - Main: "${targetNiche}", Sub: "${targetSubNiche}"`);
  } else {
    targetNiche = niche.toLowerCase();
    targetSubNiche = niche.toLowerCase();
    console.log(`🔍 Universal RPM lookup - Niche: "${targetNiche}"`);
  }
  
  // Priority order: sub-niche -> main niche -> default
  if (universalRPMDatabase[targetSubNiche] && targetSubNiche !== targetNiche) {
    console.log(`💰 Sub-niche RPM: ${targetSubNiche} -> $${universalRPMDatabase[targetSubNiche]}`);
    return universalRPMDatabase[targetSubNiche];
  }
  
  if (universalRPMDatabase[targetNiche]) {
    console.log(`📊 Main niche RPM: ${targetNiche} -> $${universalRPMDatabase[targetNiche]}`);
    return universalRPMDatabase[targetNiche];
  }
  
  // For unknown niches, calculate based on content characteristics
  let estimatedRPM = 2.0; // Base rate
  
  // Analyze the niche name and content for value indicators
  const nicheString = typeof niche === 'object' ? niche.subNiche : niche;
  const nicheLower = nicheString.toLowerCase();
  
  // High-value indicators that suggest higher RPM
  const highValueIndicators = [
    'money', 'investment', 'crypto', 'stock', 'trading', 'real estate',
    'business', 'marketing', 'sales', 'professional', 'career', 'job',
    'software', 'programming', 'tech', 'ai', 'data', 'analytics',
    'health', 'medical', 'insurance', 'legal', 'finance', 'tax'
  ];
  
  // Medium-value indicators
  const mediumValueIndicators = [
    'education', 'learning', 'course', 'tutorial', 'skill', 'training',
    'productivity', 'lifestyle', 'home', 'design', 'fashion', 'beauty',
    'food', 'cooking', 'recipe', 'travel', 'adventure', 'culture'
  ];
  
  // Lower-value indicators
  const lowerValueIndicators = [
    'gaming', 'entertainment', 'funny', 'meme', 'viral', 'challenge',
    'music', 'dance', 'celebrity', 'gossip', 'kids', 'cartoon'
  ];
  
  // Check for high-value indicators
  for (const indicator of highValueIndicators) {
    if (nicheLower.includes(indicator)) {
      estimatedRPM = Math.max(estimatedRPM, 3.5);
      console.log(`💰 High-value niche detected: ${indicator} -> RPM: ${estimatedRPM}`);
      break;
    }
  }
  
  // Check for medium-value indicators
  if (estimatedRPM <= 2.5) {
    for (const indicator of mediumValueIndicators) {
      if (nicheLower.includes(indicator)) {
        estimatedRPM = Math.max(estimatedRPM, 2.3);
        console.log(`📈 Medium-value niche detected: ${indicator} -> RPM: ${estimatedRPM}`);
        break;
      }
    }
  }
  
  // Check for lower-value indicators
  for (const indicator of lowerValueIndicators) {
    if (nicheLower.includes(indicator)) {
      estimatedRPM = Math.min(estimatedRPM, 1.8);
      console.log(`📉 Lower-value niche detected: ${indicator} -> RPM: ${estimatedRPM}`);
      break;
    }
  }
  
  // Analyze video performance to refine RPM estimate
  if (videos.length > 0) {
    const avgViews = videos.reduce((sum, video) => sum + video.views, 0) / videos.length;
    const avgSubscribers = videos.reduce((sum, video) => sum + video.channelSubscribers, 0) / videos.length;
    
    // Higher average views and subscribers suggest better monetization
    if (avgViews > 1000000 && avgSubscribers > 500000) {
      estimatedRPM *= 1.2; // Boost RPM for high-performing content
    } else if (avgViews < 50000 && avgSubscribers < 50000) {
      estimatedRPM *= 0.8; // Reduce RPM for lower-performing content
    }
  }
  
  // Cap the RPM within reasonable bounds
  estimatedRPM = Math.max(0.5, Math.min(6.0, estimatedRPM));
  
  console.log(`🎯 Dynamic RPM calculated for "${nicheString}": $${estimatedRPM.toFixed(2)}`);
  return Number(estimatedRPM.toFixed(2));
}

// Main analysis function with hierarchical niche detection and recent video filtering
async function analyzeNicheWithRealData(input: string): Promise<NicheAnalysis> {
  console.log(`🎯 Starting comprehensive analysis for: ${input}`);
  
  // Detect niche hierarchy from input using OpenAI
  let nicheHierarchy = await detectNiche(input);
  let sourceVideoData = null;

  // If input is a URL, try to get specific video/channel data for better detection
  const videoId = extractVideoId(input);
  if (videoId) {
    try {
      console.log(`🎥 Analyzing source video: ${videoId}`);
      // Try multiple approaches to get video data
      let videoData = null;
      
      // Method 1: Try youtube-sr getVideo
      try {
        videoData = await youtubeSearch.getVideo(videoId);
      } catch (getVideoError) {
        console.log(`getVideo failed, trying search: ${getVideoError instanceof Error ? getVideoError.message : 'Unknown error'}`);
        // Method 2: Search for the video by ID
        try {
          const searchResults = await youtubeSearch.search(videoId, { limit: 1, type: 'video' });
          if (searchResults && searchResults.length > 0) {
            videoData = searchResults[0];
          }
        } catch (searchError) {
          console.log(`Search by ID also failed: ${searchError instanceof Error ? searchError.message : 'Unknown error'}`);
        }
      }
      
      if (videoData && videoData.title) {
        sourceVideoData = {
          title: videoData.title,
          description: videoData.description || '',
          author: videoData.channel?.name || ''
        };
        console.log(`🎥 Got video title: "${videoData.title}"`);
        
        // Re-analyze with video data for better niche detection using OpenAI
        const betterNicheHierarchy = await detectNiche(`${input} ${videoData.title} ${videoData.description || ''}`, sourceVideoData);
        if (betterNicheHierarchy.mainNiche !== 'general') {
          nicheHierarchy = betterNicheHierarchy;
          console.log(`📊 Enhanced OpenAI niche detection: ${nicheHierarchy.displayName}`);
        }
      }
    } catch (error) {
      console.log('Could not fetch source video data:', error);
    }
  }

  // Get real competitor data using the hierarchy - analyze 100+ videos for better insights
  const competitorVideos = await getRealCompetitorData(nicheHierarchy, 120);
  
  if (competitorVideos.length === 0) {
    throw new Error('Unable to fetch recent YouTube data for analysis. Please try a different niche or check your internet connection.');
  }

  // Calculate real metrics using the sub-niche for more accurate analysis
  const marketSize = calculateRealMarketMetrics(competitorVideos, nicheHierarchy);
  const competition = calculateRealCompetition(competitorVideos);
  const monetization = calculateRealMonetization(nicheHierarchy, competitorVideos);

  // Get top 10 videos for display
  const topVideos = competitorVideos
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Create analysis object
  const analysisBase = {
    niche: nicheHierarchy.displayName,
    nicheHierarchy: nicheHierarchy,
    totalChannels: competition.topChannels,
    totalVideos: competitorVideos.length,
    averageViews: marketSize.avgViewsPerVideo,
    topVideos,
    marketSize,
    competition,
    monetization
  };

  // Generate insights based on real data
  const { insights, recommendations } = generateRealInsights(analysisBase);

  const finalAnalysis: NicheAnalysis = {
    ...analysisBase,
    insights,
    recommendations
  };

  console.log(`✅ Analysis complete for ${nicheHierarchy.displayName}: ${competitorVideos.length} recent videos analyzed`);
  return finalAnalysis;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const limited = await guard(ip);
  if (limited) return NextResponse.json(limited, { status: limited.status });

  try {
    const body = await req.json();
    const { input } = body;

    if (!input || typeof input !== 'string') {
      return NextResponse.json({
        error: 'Invalid input',
        message: 'Please provide a YouTube URL or niche keywords'
      }, { status: 400 });
    }

    const cleanInput = input.trim();
    if (cleanInput.length < 2) {
      return NextResponse.json({
        error: 'Invalid input',
        message: 'Input must be at least 2 characters long'
      }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `real_niche_analysis:${cleanInput.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
    const cached = getC(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    // Perform real data analysis
    const analysis = await analyzeNicheWithRealData(cleanInput);

    // Cache for 2 hours (shorter due to real-time data)
    setC(cacheKey, analysis, 1000 * 60 * 60 * 2);

    return NextResponse.json({
      ...analysis,
      timestamp: new Date().toISOString(),
      dataSource: 'realtime'
    });

  } catch (error: any) {
    console.error('Real niche analysis error:', error);
    return NextResponse.json({
      error: 'Analysis failed',
      detail: error.message || 'Failed to fetch real YouTube data',
      suggestion: 'Try a different niche or check if YouTube is accessible'
    }, { status: 500 });
  }
}