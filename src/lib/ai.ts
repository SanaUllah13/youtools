// FREE GENERATION SYSTEM - No external APIs required
const keywordExtractor = require('keyword-extractor');

// Free generation is always available
export const hasAI = false;
export const oai = null;

// Configuration for free methods
export const FREE_CONFIG = {
  MAX_TAGS: 25,
  MAX_TITLES: 5,
  MAX_HASHTAGS: 25,
  MAX_KEYWORDS: 50,
  // Cache for performance
  CACHE_DURATION_HOURS: 1, // Shorter cache for free methods
};

// Simple caching for free methods
const freeCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = FREE_CONFIG.CACHE_DURATION_HOURS * 60 * 60 * 1000;

function getCacheKey(input: string, type: string): string {
  return `${type}_${input.replace(/\s+/g, '_').substring(0, 50)}`;
}

function getCachedResult(key: string): any | null {
  const cached = freeCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.result;
  }
  return null;
}

function setCachedResult(key: string, result: any): void {
  if (freeCache.size > 100) { // Smaller cache for free methods
    const oldestKey = freeCache.keys().next().value;
    if (oldestKey) {
      freeCache.delete(oldestKey);
    }
  }
  freeCache.set(key, { result, timestamp: Date.now() });
}

export function getFreeUsageStats() {
  return {
    method: 'FREE',
    cost: 0,
    cacheSize: freeCache.size,
    cacheHitRate: '100%', // Free methods benefit from caching
    apiCalls: 0
  };
}

// FREE TAG GENERATION using keyword extraction
export function freeTagsFrom(text: string, max: number = FREE_CONFIG.MAX_TAGS): string[] {
  const cacheKey = getCacheKey(text, 'tags');
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;
  
  try {
    // Extract keywords using keyword-extractor
    const words = keywordExtractor.extract(text, { 
      language: 'english', 
      remove_digits: false, 
      return_changed_case: true,
      remove_duplicates: true
    });
    
    // Build frequency map
    const freq = new Map<string, number>();
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2) {
        freq.set(clean, (freq.get(clean) || 0) + 1);
      }
    }
    
    // Get ranked single words
    const ranked = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w.replace(/\s+/g, '-'));
    
    // Add some long-tail combos
    const combos: string[] = [];
    for (let i = 0; i < ranked.length - 1 && combos.length < 10; i++) {
      const combo = `${ranked[i]}-${ranked[i + 1]}`.slice(0, 40);
      if (combo.length > 5) combos.push(combo);
    }
    
    // Combine and dedupe
    const unique = [...new Set([...ranked, ...combos])];
    const result = unique.slice(0, max);
    
    setCachedResult(cacheKey, result);
    console.log(`🆓 Generated ${result.length} tags for free`);
    return result;
  } catch (error) {
    console.error('Free tag generation failed:', error);
    return [];
  }
}

// INTELLIGENT CREATIVE TITLE GENERATION - Like top competitors
export function freeTitlesFrom(seed: string, max: number = FREE_CONFIG.MAX_TITLES): string[] {
  const year = new Date().getFullYear();
  const base = seed.trim().replace(/\.$/, '');
  const baseLower = base.toLowerCase();
  
  // Generate creative, diverse titles using multiple approaches
  const titles = [];
  
  // Approach 1: Topic-specific creative variations
  const creativeVariations = generateCreativeVariations(base, baseLower);
  titles.push(...creativeVariations);
  
  // Approach 2: Trending/viral style titles
  const viralTitles = generateViralStyleTitles(base, baseLower);
  titles.push(...viralTitles);
  
  // Approach 3: Emotion/engagement focused
  const engagementTitles = generateEngagementTitles(base, baseLower);
  titles.push(...engagementTitles);
  
  // Approach 4: Specific/niche content
  const nicheTitles = generateNicheTitles(base, baseLower);
  titles.push(...nicheTitles);
  
  // Approach 5: Question/curiosity based
  const curiosityTitles = generateCuriosityTitles(base, baseLower);
  titles.push(...curiosityTitles);
  
  // Remove duplicates and ensure good variety
  const uniqueTitles = [...new Set(titles)]
    .filter(title => title.length <= 70)
    .filter(title => title.toLowerCase() !== base.toLowerCase())
    .slice(0, max * 3); // Get more options to choose from
  
  // Select diverse set ensuring no similar patterns
  const finalTitles = selectDiverseTitles(uniqueTitles, max);
  
  console.log(`🆓 Generated ${finalTitles.length} creative titles for "${base}"`);
  return finalTitles;
}

// Intelligent content analysis
function analyzeContent(text: string) {
  const words = text.toLowerCase().split(/\s+/);
  const keywords: string[] = [];
  const context = {
    isComparison: false,
    isHighlights: false,
    isMatch: false,
    isTutorial: false,
    isReview: false,
    isNews: false,
    isReaction: false,
    isList: false,
    isChallenge: false,
    isLive: false
  };
  
  // Extract meaningful keywords (not stopwords)
  const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'vs']);
  words.forEach(word => {
    if (word.length > 2 && !stopwords.has(word) && !word.match(/^\d+$/)) {
      keywords.push(word);
    }
  });
  
  // Detect context patterns
  if (text.includes('vs ') || text.includes(' vs') || text.includes(' v ')) context.isComparison = true;
  if (text.includes('highlights') || text.includes('best moments') || text.includes('compilation')) context.isHighlights = true;
  if (text.includes('match') || text.includes('game') || text.includes('final') || context.isComparison) context.isMatch = true;
  if (text.includes('how to') || text.includes('tutorial') || text.includes('guide') || text.includes('learn')) context.isTutorial = true;
  if (text.includes('review') || text.includes('honest') || text.includes('experience')) context.isReview = true;
  if (text.includes('news') || text.includes('breaking') || text.includes('latest') || text.includes('update')) context.isNews = true;
  if (text.includes('reaction') || text.includes('reacting') || text.includes('react')) context.isReaction = true;
  if (text.includes('top ') || text.includes('best ') || text.includes('list') || text.match(/\d+\s+\w/)) context.isList = true;
  if (text.includes('challenge') || text.includes('dare') || text.includes('attempt') || text.match(/\d+\s*hour.*challenge/i)) context.isChallenge = true;
  if (text.includes('live') || text.includes('stream') || text.includes('streaming')) context.isLive = true;
  
  // Determine primary content type (order matters for priority)
  let contentType = 'general';
  if (context.isTutorial) contentType = 'tutorial';
  else if (context.isReview) contentType = 'review';
  else if (context.isComparison) contentType = 'comparison';  // Check comparison BEFORE highlights
  else if (context.isChallenge) contentType = 'challenge';  // Check challenge BEFORE list/highlights
  else if (context.isHighlights || context.isMatch) contentType = 'highlights';
  else if (context.isNews) contentType = 'news';
  else if (context.isReaction) contentType = 'reaction';
  else if (context.isList) contentType = 'list';
  else if (context.isLive) contentType = 'live';
  
  // Detect emotional/engagement words
  const emotions = [];
  if (text.includes('amazing') || text.includes('incredible') || text.includes('awesome')) emotions.push('positive');
  if (text.includes('shocking') || text.includes('unbelievable') || text.includes('crazy')) emotions.push('intense');
  if (text.includes('funny') || text.includes('hilarious') || text.includes('comedy')) emotions.push('humor');
  if (text.includes('epic') || text.includes('legendary') || text.includes('insane')) emotions.push('epic');
  
  // Detect action words
  const actions = [];
  if (text.includes('win') || text.includes('victory') || text.includes('champion')) actions.push('winning');
  if (text.includes('fail') || text.includes('mistake') || text.includes('wrong')) actions.push('failing');
  if (text.includes('trick') || text.includes('skill') || text.includes('technique')) actions.push('skill');
  
  return { contentType, keywords, context, emotions, actions };
}

// Get contextual emojis based on content
function getContextualEmojis(keywords: string[], contentType: string) {
  const emojiSets: {[key: string]: string[]} = {
    sports: ['⚽', '🏏', '🏆', '🥇', '⚡', '🔥', '💥'],
    gaming: ['🎮', '🕹️', '🏆', '⚔️', '🎯', '🔥', '⚡'],
    music: ['🎵', '🎶', '🎤', '🎧', '🔥', '✨', '🌟'],
    food: ['🍳', '🍽️', '👨‍🍳', '🔥', '✨', '😋', '💯'],
    tech: ['💻', '📱', '⚙️', '🔧', '⚡', '🚀', '💡'],
    news: ['📺', '📰', '⚡', '🔥', '💥', '🚨', '📢'],
    reaction: ['😱', '🤯', '😂', '🔥', '💯', '⚡', '✨'],
    general: ['🔥', '⚡', '✨', '💯', '🚀', '💥', '🎯']
  };
  
  // Detect topic from keywords
  const keywordStr = keywords.join(' ');
  if (keywordStr.includes('cricket') || keywordStr.includes('football') || keywordStr.includes('match') || keywordStr.includes('sport')) {
    return emojiSets.sports;
  }
  if (keywordStr.includes('game') || keywordStr.includes('gaming') || keywordStr.includes('player')) {
    return emojiSets.gaming;
  }
  if (keywordStr.includes('song') || keywordStr.includes('music') || keywordStr.includes('band')) {
    return emojiSets.music;
  }
  if (keywordStr.includes('recipe') || keywordStr.includes('cooking') || keywordStr.includes('food')) {
    return emojiSets.food;
  }
  if (keywordStr.includes('tech') || keywordStr.includes('coding') || keywordStr.includes('programming')) {
    return emojiSets.tech;
  }
  if (contentType === 'news') return emojiSets.news;
  if (contentType === 'reaction') return emojiSets.reaction;
  
  return emojiSets.general;
}

// Generate contextual templates based on analysis
function generateContextualTemplates(base: string, contentType: string, keywords: string[], context: any, year: number, randomEmoji: () => string) {
  const templates: string[] = [];
  const intensifiers = ['Epic', 'Incredible', 'Amazing', 'Insane', 'Unbelievable', 'Mind-Blowing'];
  const descriptors = ['Best', 'Top', 'Ultimate', 'Perfect', 'Complete', 'Full'];
  
  // Content-type specific templates
  switch (contentType) {
    case 'highlights':
      templates.push(
        `${randomEmoji()} ${descriptors[Math.floor(Math.random() * descriptors.length)]} ${base}`,
        `${intensifiers[Math.floor(Math.random() * intensifiers.length)]} ${base} ${randomEmoji()}`,
        `${randomEmoji()} ${base} - All the Best Moments`,
        `${base}: You Have to See This ${randomEmoji()}`,
        `${randomEmoji()} ${base} [HD Highlights]`,
        `${base} - ${intensifiers[Math.floor(Math.random() * intensifiers.length)]} Compilation ${randomEmoji()}`,
        `${randomEmoji()} ${base}: Every Amazing Moment`,
        `${base} That Broke the Internet ${randomEmoji()}`
      );
      break;
      
    case 'comparison':
      templates.push(
        `${randomEmoji()} ${base}: The Ultimate Showdown`,
        `${base} - Who's Better? ${randomEmoji()}`,
        `${randomEmoji()} ${base}: Head to Head Battle`,
        `${base}: The Final Verdict ${randomEmoji()}`,
        `${randomEmoji()} ${base} - Epic Face-Off`,
        `${base}: Battle of the Champions ${randomEmoji()}`,
        `${randomEmoji()} ${base} [Complete Analysis]`,
        `${base} - The Truth Revealed ${randomEmoji()}`
      );
      break;
      
    case 'tutorial':
      templates.push(
        `${randomEmoji()} How to ${base.replace(/^how to /i, '')} [Complete Guide]`,
        `${base}: Step-by-Step Tutorial ${randomEmoji()}`,
        `${randomEmoji()} ${base} - Master it in Minutes`,
        `${base} for Beginners ${randomEmoji()}`,
        `${randomEmoji()} ${base}: Pro Tips & Tricks`,
        `${base} - Everything You Need to Know ${randomEmoji()}`,
        `${randomEmoji()} ${base} Made Simple`,
        `${base}: From Zero to Hero ${randomEmoji()}`
      );
      break;
      
    case 'review':
      templates.push(
        `${randomEmoji()} ${base}: Honest Review`,
        `${base} - Is It Worth It? ${randomEmoji()}`,
        `${randomEmoji()} ${base}: My Real Experience`,
        `${base}: The Good, Bad & Ugly ${randomEmoji()}`,
        `${randomEmoji()} ${base} - Before You Buy`,
        `${base}: Complete Breakdown ${randomEmoji()}`,
        `${randomEmoji()} ${base} Review [2025]`,
        `${base} - What They Don't Tell You ${randomEmoji()}`
      );
      break;
      
    case 'news':
      templates.push(
        `${randomEmoji()} ${base}: Breaking News`,
        `${base} - Latest Update ${randomEmoji()}`,
        `${randomEmoji()} ${base}: What Just Happened`,
        `${base}: Live Coverage ${randomEmoji()}`,
        `${randomEmoji()} ${base} - Full Story`,
        `${base}: Emergency Update ${randomEmoji()}`,
        `${randomEmoji()} ${base} [Live Report]`,
        `${base} - This Just In ${randomEmoji()}`
      );
      break;
      
    case 'reaction':
      templates.push(
        `${randomEmoji()} Reacting to ${base}`,
        `${base}: My Honest Reaction ${randomEmoji()}`,
        `${randomEmoji()} ${base} - I Can't Believe This`,
        `${base} Reaction [Emotional] ${randomEmoji()}`,
        `${randomEmoji()} Watching ${base} for the First Time`,
        `${base}: Live Reaction ${randomEmoji()}`,
        `${randomEmoji()} ${base} - My Mind is Blown`,
        `${base} Reaction - This is ${intensifiers[Math.floor(Math.random() * intensifiers.length)]} ${randomEmoji()}`
      );
      break;
      
    case 'list':
      templates.push(
        `${randomEmoji()} ${descriptors[Math.floor(Math.random() * descriptors.length)]} ${base}`,
        `${base} - Ranked & Explained ${randomEmoji()}`,
        `${randomEmoji()} ${base} [Complete List]`,
        `${base}: The Definitive Ranking ${randomEmoji()}`,
        `${randomEmoji()} ${base} You Must Know`,
        `${base} - From Worst to Best ${randomEmoji()}`,
        `${randomEmoji()} ${base} [${year} Edition]`,
        `${base}: The Ultimate Collection ${randomEmoji()}`
      );
      break;
      
    case 'challenge':
      templates.push(
        `${randomEmoji()} ${base} Challenge`,
        `${base}: Can I Do It? ${randomEmoji()}`,
        `${randomEmoji()} Attempting ${base}`,
        `${base} - Will I Survive? ${randomEmoji()}`,
        `${randomEmoji()} ${base} Gone Wrong`,
        `${base}: The Ultimate Test ${randomEmoji()}`,
        `${randomEmoji()} ${base} [Epic Attempt]`,
        `${base} - This Was ${intensifiers[Math.floor(Math.random() * intensifiers.length)]} ${randomEmoji()}`
      );
      break;
      
    case 'live':
      templates.push(
        `${randomEmoji()} ${base} - LIVE`,
        `${base}: Live Stream ${randomEmoji()}`,
        `${randomEmoji()} LIVE: ${base}`,
        `${base} - Join Me Live ${randomEmoji()}`,
        `${randomEmoji()} ${base} [Live Stream]`,
        `${base}: Streaming Now ${randomEmoji()}`,
        `${randomEmoji()} LIVE ${base} Session`,
        `${base} - Come Hang Out ${randomEmoji()}`
      );
      break;
      
    default:
      // General engaging templates
      templates.push(
        `${randomEmoji()} ${intensifiers[Math.floor(Math.random() * intensifiers.length)]} ${base}`,
        `${base}: You Won't Believe This ${randomEmoji()}`,
        `${randomEmoji()} ${base} - Must Watch`,
        `${base} That Changed Everything ${randomEmoji()}`,
        `${randomEmoji()} ${base} [Viral Video]`,
        `${base}: This is ${intensifiers[Math.floor(Math.random() * intensifiers.length)]} ${randomEmoji()}`,
        `${randomEmoji()} ${base} - Everyone's Talking About It`,
        `${base}: The ${descriptors[Math.floor(Math.random() * descriptors.length)]} Experience ${randomEmoji()}`
      );
  }
  
  return templates;
}

// CREATIVE TITLE GENERATION FUNCTIONS

// Generate topic-specific creative variations
function generateCreativeVariations(base: string, baseLower: string): string[] {
  const variations = [];
  
  // Horror-specific creative titles
  if (baseLower.includes('horror')) {
    variations.push(
      `That ONE Thing in Every ${base.replace('horror', 'Horror')} Movie 😱`,
      `POV: You're Watching ${base.replace('horror', 'Horror')} Alone 💀`,
      `${base.replace('horror', 'Horror')} Movies That Actually Happened 😰`,
      `Why ${base.replace('horror', 'Horror')} Movies Hit Different at 3AM`,
      `${base.replace('horror', 'Horror')} Fans Will Understand This 🔥`,
      `Ranking ${base.replace('horror', 'Horror')} Movies by How Scary They Are`,
      `${base.replace('horror', 'Horror')} Movie Mistakes You Never Noticed`,
      `The Psychology Behind ${base.replace('horror', 'Horror')} Movies`
    );
  }
  
  // Coding/Programming creative titles
  else if (baseLower.includes('coding') || baseLower.includes('programming') || baseLower.includes('code')) {
    variations.push(
      `${base} Explained in 60 Seconds 🚀`,
      `Why ${base} is Taking Over the World`,
      `${base} vs Reality: Expectations vs Truth 😂`,
      `Things Nobody Tells You About ${base}`,
      `${base} in 2025: What's Changed?`,
      `${base} Memes That Are Too Real 💯`,
      `The Dark Side of ${base} Nobody Talks About`,
      `${base}: Beginner Mistakes Everyone Makes`
    );
  }
  
  // Gaming creative titles
  else if (baseLower.includes('gaming') || baseLower.includes('game')) {
    variations.push(
      `${base} Moments That Broke the Internet 🔥`,
      `POV: You're Playing ${base} for the First Time`,
      `${base} Players Can Relate to This 😂`,
      `${base} Secrets Pro Players Don't Share`,
      `Why ${base} is Actually Genius`,
      `${base} Physics That Make No Sense`,
      `${base} Glitches That Are Better Than the Game`,
      `The Evolution of ${base} Over the Years`
    );
  }
  
  // Sports creative titles
  else if (baseLower.includes('match') || baseLower.includes('vs') || baseLower.includes('football') || baseLower.includes('cricket')) {
    variations.push(
      `${base} Moments That Made History 🏆`,
      `The ${base} Everyone's Still Talking About`,
      `${base}: What Really Happened Behind the Scenes`,
      `${base} Reactions That Went Viral 😱`,
      `${base}: The Moment That Changed Everything`,
      `Why ${base} is Legendary`,
      `${base} Analysis: Frame by Frame Breakdown`,
      `The Story Behind ${base} You Never Knew`
    );
  }
  
  // General creative variations for any topic
  else {
    variations.push(
      `${base}: The Truth Nobody Talks About`,
      `Why Everyone's Obsessed with ${base}`,
      `${base} That Hit Different 💯`,
      `The ${base} Phenomenon Explained`,
      `${base}: Behind the Scenes Reality`,
      `Things You Didn't Know About ${base}`,
      `${base} That Aged Like Fine Wine`,
      `The Science Behind ${base}`
    );
  }
  
  return variations;
}

// Generate viral/trending style titles
function generateViralStyleTitles(base: string, baseLower: string): string[] {
  const viralTitles = [];
  const emojis = ['🔥', '💯', '😱', '🤯', '✨', '⚡', '💥', '🚀'];
  const trendingPhrases = [
    'POV:', 'This is why', 'Nobody:', 'Meanwhile:', 'Plot twist:', 'Fun fact:', 'Real talk:', 'Unpopular opinion:'
  ];
  
  trendingPhrases.forEach(phrase => {
    if (phrase === 'POV:') {
      viralTitles.push(`${phrase} ${base} ${emojis[Math.floor(Math.random() * emojis.length)]}`);
    } else if (phrase === 'Nobody:') {
      viralTitles.push(`${phrase} Me with ${base}: ${emojis[Math.floor(Math.random() * emojis.length)]}`);
    } else {
      viralTitles.push(`${phrase} ${base} is actually insane ${emojis[Math.floor(Math.random() * emojis.length)]}`);
    }
  });
  
  // Add more viral patterns
  viralTitles.push(
    `${base} but make it ✨aesthetic✨`,
    `When ${base} hits different ${emojis[Math.floor(Math.random() * emojis.length)]}`,
    `${base} energy is unmatched 💯`,
    `Not me getting obsessed with ${base} ${emojis[Math.floor(Math.random() * emojis.length)]}`,
    `${base} just hits different at 2AM 🌙`
  );
  
  return viralTitles;
}

// Generate engagement-focused titles
function generateEngagementTitles(base: string, baseLower: string): string[] {
  const engagementTitles = [
    `Is ${base} Worth the Hype? (My Honest Opinion)`,
    `${base}: Expectations vs Reality 😅`,
    `Rating ${base} from 1-10 (You'll Be Surprised)`,
    `${base} Red Flags You Should Know About 🚩`,
    `${base}: What They Don't Want You to Know`,
    `I Tried ${base} for 30 Days (Results)`,
    `${base}: The Good, Bad, and Ugly Truth`,
    `${base} Tier List (Controversial Takes)`,
    `Reacting to ${base} for the First Time`,
    `${base}: Am I the Only One Who Thinks This?`
  ];
  
  return engagementTitles;
}

// Generate niche/specific content titles
function generateNicheTitles(base: string, baseLower: string): string[] {
  const nicheTitles = [];
  const currentYear = new Date().getFullYear();
  
  // Add current trends and references
  if (baseLower.includes('ai') || baseLower.includes('artificial')) {
    nicheTitles.push(
      `${base} in ${currentYear}: The AI Revolution`,
      `How ${base} Will Change Everything by 2030`,
      `${base} vs Human: Who Wins?`
    );
  } else if (baseLower.includes('crypto') || baseLower.includes('bitcoin')) {
    nicheTitles.push(
      `${base}: The Future of Money?`,
      `Why ${base} is Either Genius or Stupid`,
      `${base} Millionaires Share Their Secrets`
    );
  } else {
    // General niche approaches
    nicheTitles.push(
      `${base}: A Deep Dive Analysis`,
      `The ${base} Industry Doesn't Want You to See This`,
      `${base} in ${currentYear}: Complete Breakdown`,
      `${base}: The Underground Scene You've Never Heard Of`,
      `${base} From an Insider's Perspective`
    );
  }
  
  return nicheTitles;
}

// Generate curiosity/question-based titles
function generateCuriosityTitles(base: string, baseLower: string): string[] {
  const curiosityTitles = [
    `What if ${base} Never Existed?`,
    `How ${base} Actually Works (Mind-Blown)`,
    `Why Does ${base} Make Us Feel This Way?`,
    `What ${base} Teaches Us About Human Nature`,
    `How Many People Actually Know About ${base}?`,
    `What Happens When ${base} Goes Wrong?`,
    `Why Is ${base} So Addictive?`,
    `What Makes ${base} So Special?`,
    `How Did ${base} Become So Popular?`,
    `What's the Real Story Behind ${base}?`
  ];
  
  return curiosityTitles;
}

// Select diverse titles avoiding similar patterns
function selectDiverseTitles(titles: string[], max: number): string[] {
  const selected = [];
  const usedPatterns = new Set();
  
  for (const title of titles) {
    if (selected.length >= max) break;
    
    // Extract pattern (first few words)
    const pattern = title.split(' ').slice(0, 2).join(' ').toLowerCase();
    const startWord = title.split(' ')[0].toLowerCase();
    
    // Avoid similar patterns and starting words
    if (!usedPatterns.has(pattern) && !usedPatterns.has(startWord)) {
      selected.push(title);
      usedPatterns.add(pattern);
      usedPatterns.add(startWord);
    }
  }
  
  // If we don't have enough diverse titles, fill with remaining
  if (selected.length < max) {
    for (const title of titles) {
      if (selected.length >= max) break;
      if (!selected.includes(title)) {
        selected.push(title);
      }
    }
  }
  
  return selected;
}

// Helper functions to detect content type
function detectContentType(text: string): string {
  // Check for specific content types first (more specific matches)
  if (text.includes('horror') || text.includes('scary') || text.includes('ghost') || text.includes('nightmare') || text.includes('haunted') || text.includes('creepy') || text.includes('terrifying')) {
    return 'horror';
  }
  if (text.includes('love') || text.includes('romance') || text.includes('dating') || text.includes('relationship') || text.includes('heart') || text.includes('couple') || text.includes('wedding')) {
    return 'romance';
  }
  if (text.includes('mystery') || text.includes('unsolved') || text.includes('conspiracy') || text.includes('secret') || text.includes('hidden') || text.includes('investigation')) {
    return 'mystery';
  }
  if (text.includes('adventure') || text.includes('journey') || text.includes('expedition') || text.includes('quest') || text.includes('explore')) {
    return 'adventure';
  }
  // General story detection (less specific, check last)
  if (text.includes('story') && !text.includes('how to') && !text.includes('tutorial')) {
    return 'story';
  }
  return 'general';
}

function detectTopicCategory(text: string): string {
  if (text.includes('javascript') || text.includes('coding') || text.includes('programming') || text.includes('tech') || text.includes('software') ||
      text.includes('code') || text.includes('developer') || text.includes('python') || text.includes('react') || text.includes('html') ||
      text.includes('css') || text.includes('node') || text.includes('web dev') || text.includes('frontend') || text.includes('backend') ||
      text.includes('algorithm') || text.includes('data structure') || text.includes('api') || text.includes('framework') || text.includes('library') ||
      text.includes('vibe') || text.includes('syntax') || text.includes('function') || text.includes('variable') || text.includes('array')) {
    return 'tech';
  }
  if (text.includes('game') || text.includes('gaming') || text.includes('player') || text.includes('console')) {
    return 'gaming';
  }
  if (text.includes('cook') || text.includes('recipe') || text.includes('food') || text.includes('meal') || text.includes('dish')) {
    return 'cooking';
  }
  if (text.includes('workout') || text.includes('exercise') || text.includes('fitness') || text.includes('gym') || text.includes('health')) {
    return 'fitness';
  }
  if (text.includes('money') || text.includes('earn') || text.includes('income') || text.includes('invest') || text.includes('finance')) {
    return 'money';
  }
  if (text.includes('travel') || text.includes('vacation') || text.includes('trip') || text.includes('destination')) {
    return 'travel';
  }
  if (text.includes('business') || text.includes('entrepreneur') || text.includes('startup') || text.includes('company')) {
    return 'business';
  }
  return 'default';
}

function isEducationalContent(text: string): boolean {
  return text.includes('how to') || text.includes('tutorial') || text.includes('guide') || 
         text.includes('learn') || text.includes('course') || text.includes('lesson') ||
         text.includes('tips') || text.includes('tricks') || text.includes('hacks') ||
         text.includes('step by step') || text.includes('beginner') || text.includes('advanced');
}

function isReviewContent(text: string): boolean {
  return text.includes('review') || text.includes('unboxing') || text.includes('vs') ||
         text.includes('comparison') || text.includes('test') || text.includes('opinion') ||
         text.includes('experience') || text.includes('worth it') || text.includes('should you buy');
}

// FREE HASHTAG GENERATION from text
export function freeHashtagsFrom(text: string, niche: string = '', max: number = FREE_CONFIG.MAX_HASHTAGS): string[] {
  const cacheKey = getCacheKey(`${text}_${niche}`, 'hashtags');
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;
  
  const words = Array.from(new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2)
  ));
  
  // Convert to hashtags
  const hashtags: string[] = [];
  words.forEach(w => {
    if (w.length > 2 && w.length < 20) {
      hashtags.push(`#${w}`);
    }
  });
  
  // Add niche-specific hashtags
  const nicheHashtags: { [key: string]: string[] } = {
    tech: ['#technology', '#coding', '#programming', '#software', '#developer'],
    gaming: ['#gaming', '#gamer', '#gameplay', '#esports', '#streaming'],
    cooking: ['#cooking', '#recipe', '#food', '#chef', '#kitchen'],
    fitness: ['#fitness', '#workout', '#health', '#gym', '#training'],
    travel: ['#travel', '#adventure', '#vacation', '#wanderlust', '#explore'],
    music: ['#music', '#musician', '#song', '#beats', '#audio'],
    fashion: ['#fashion', '#style', '#outfit', '#trendy', '#ootd'],
    art: ['#art', '#creative', '#design', '#artist', '#drawing']
  };
  
  const nicheKey = niche.toLowerCase();
  if (nicheHashtags[nicheKey]) {
    nicheHashtags[nicheKey].forEach(tag => {
      if (!hashtags.includes(tag)) hashtags.push(tag);
    });
  }
  
  // Add relevant contextual hashtags based on content analysis
  const contextualHashtags = [];
  const lowerText = text.toLowerCase();
  
  // Content type detection
  if (lowerText.includes('tutorial') || lowerText.includes('how to') || lowerText.includes('guide')) {
    contextualHashtags.push('#tutorial', '#howto', '#guide', '#learn', '#stepbystep');
  }
  if (lowerText.includes('review') || lowerText.includes('unbox')) {
    contextualHashtags.push('#review', '#unboxing', '#honest', '#detailed');
  }
  if (lowerText.includes('vs') || lowerText.includes('compare')) {
    contextualHashtags.push('#comparison', '#versus', '#whichisbetter');
  }
  if (lowerText.includes('2024') || lowerText.includes('2025') || lowerText.includes('new')) {
    contextualHashtags.push('#2024', '#latest', '#new', '#updated');
  }
  if (lowerText.includes('free') || lowerText.includes('budget')) {
    contextualHashtags.push('#free', '#budget', '#cheap', '#affordable');
  }
  if (lowerText.includes('best') || lowerText.includes('top')) {
    contextualHashtags.push('#best', '#top', '#recommended');
  }
  if (lowerText.includes('beginner') || lowerText.includes('start')) {
    contextualHashtags.push('#beginner', '#starter', '#basics', '#introduction');
  }
  if (lowerText.includes('advanced') || lowerText.includes('pro')) {
    contextualHashtags.push('#advanced', '#pro', '#expert', '#professional');
  }
  if (lowerText.includes('tip') || lowerText.includes('hack') || lowerText.includes('trick')) {
    contextualHashtags.push('#tips', '#hacks', '#tricks', '#secrets');
  }
  
  // Add contextual hashtags
  contextualHashtags.forEach(tag => {
    if (hashtags.length < max && !hashtags.includes(tag)) {
      hashtags.push(tag);
    }
  });
  
  // Only add generic hashtags if we still need more
  if (hashtags.length < max) {
    const genericFallback = ['#viral', '#trending', '#content', '#creator', '#youtube'];
    genericFallback.forEach(tag => {
      if (hashtags.length < max && !hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    });
  }
  
  const result = hashtags.slice(0, max);
  setCachedResult(cacheKey, result);
  console.log(`🆓 Generated ${result.length} hashtags for free`);
  return result;
}

// FREE DESCRIPTION GENERATION with templates
export function freeDescriptionFrom(topic: string, bullets: string[] = [], links: any[] = []): string {
  const cacheKey = getCacheKey(`${topic}_${bullets.join('_')}`, 'description');
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;
  
  const hooks = [
    `Learn ${topic} with this clear, step-by-step guide.`,
    `Master ${topic} quickly with these proven techniques.`,
    `Everything you need to know about ${topic} in one place.`,
    `Get started with ${topic} using this complete walkthrough.`
  ];
  
  const first = hooks[Math.floor(Math.random() * hooks.length)];
  const pts = bullets.slice(0, 5).map(b => `• ${b}`).join('\n');
  const ls = links.slice(0, 3).map((l: any) => `🔗 ${l.title}: ${l.url}`).join('\n');
  
  let description = `${first}\n\n`;
  
  if (bullets.length > 0) {
    description += `What you'll learn:\n${pts}\n\n`;
  }
  
  if (links.length > 0) {
    description += `Resources:\n${ls}\n\n`;
  }
  
  description += `If this helped, like & subscribe for more!\n\n`;
  description += `#${topic.split(' ').join('')} #tutorial #guide #howto #tips`;
  
  setCachedResult(cacheKey, description);
  console.log(`🆓 Generated description for free`);
  return description;
}

// Compatibility functions to replace old AI functions
export async function aiList(prompt: string, maxTokens?: number, temperature?: number): Promise<string[]> {
  // Extract what we can from the prompt and use free generation
  if (prompt.includes('title')) {
    const match = prompt.match(/"([^"]+)"/); 
    return match ? freeTitlesFrom(match[1]) : [];
  }
  return [];
}

export async function aiText(prompt: string, maxTokens?: number, temperature?: number): Promise<string> {
  return ''; // Deprecated - use specific free functions
}

export async function aiImage(prompt: string, size?: string): Promise<string | null> {
  return null; // Image generation not supported in free version
}
