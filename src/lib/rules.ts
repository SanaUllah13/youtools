// Common stopwords to filter out
const STOP = new Set(['the','a','an','and','or','to','of','in','on','for','with','from','by','at','is','it','this','that','are','be','as','was','were','will','you','your','we','our']);

// Tokenize text and filter stopwords
export const tokens = (s = '') => 
  s.toLowerCase()
   .replace(/[^a-z0-9\s]/g,' ')
   .split(/\s+/)
   .filter(w => w && !STOP.has(w));

// Get top N most frequent words
export const topN = (arr: string[], n = 25) => {
  const m = new Map<string,number>(); 
  arr.forEach(w => m.set(w, (m.get(w) || 0) + 1));
  return [...m.entries()]
    .sort((a,b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

// Generate tags from title and description
export const tagsFrom = (t: string, d: string, n = 25) => 
  topN(tokens(`${t} ${d}`), n)
    .map(w => w.replace(/\s+/g, '-'));

// Generate hashtags from title and niche
export const hashFrom = (t: string, niche: string, n = 25) => {
  const baseTokens = tokens(`${t} ${niche}`);
  const hashtags: string[] = [];
  
  // Add tokens from title and niche
  topN(baseTokens, n).forEach(w => {
    hashtags.push(`#${w.replace(/\s+/g, '')}`);
  });
  
  // Add common hashtags for the niche
  const commonByNiche: { [key: string]: string[] } = {
    horror: ['#scary', '#creepy', '#nightmare', '#spooky', '#thriller', '#dark', '#fear', '#suspense'],
    gaming: ['#gaming', '#gamer', '#gameplay', '#streamer', '#twitch', '#youtube', '#live'],
    tech: ['#technology', '#tech', '#gadgets', '#innovation', '#digital', '#software'],
    cooking: ['#cooking', '#recipe', '#food', '#chef', '#kitchen', '#delicious'],
    fitness: ['#fitness', '#workout', '#gym', '#health', '#training', '#exercise'],
    travel: ['#travel', '#adventure', '#explore', '#vacation', '#wanderlust'],
    music: ['#music', '#song', '#artist', '#musician', '#beats', '#sound'],
    fashion: ['#fashion', '#style', '#outfit', '#trendy', '#look', '#ootd'],
    art: ['#art', '#artist', '#creative', '#drawing', '#painting', '#design']
  };
  
  // Add niche-specific hashtags
  const nicheKey = niche.toLowerCase();
  if (commonByNiche[nicheKey]) {
    commonByNiche[nicheKey].forEach(tag => {
      if (!hashtags.includes(tag)) {
        hashtags.push(tag);
      }
    });
  }
  
  // Add generic popular hashtags to reach the count
  const generic = ['#viral', '#trending', '#new', '#best', '#top', '#amazing', '#cool', '#awesome', '#epic', '#must', '#watch', '#see', '#check', '#follow', '#like', '#share', '#subscribe', '#content', '#creator', '#video'];
  generic.forEach(tag => {
    if (hashtags.length < n && !hashtags.includes(tag)) {
      hashtags.push(tag);
    }
  });
  
  return hashtags.slice(0, n);
};

// Rule-based title variations with topic awareness
export const titleRB = (text: string) => {
  const lowerText = text.toLowerCase();
  
  // Horror content
  if (lowerText.includes('horror') || lowerText.includes('scary') || lowerText.includes('ghost')) {
    return [
      `👻 The Terrifying ${text}`,
      `${text}: A Horror Story 💀`,
      `🌙 ${text} - You Won't Sleep Tonight`,
      `The Haunting ${text} 🔮`,
      `👁️ ${text}: Real Horror Experience`
    ];
  }
  
  // Romance content
  if (lowerText.includes('love') || lowerText.includes('romance') || lowerText.includes('heart')) {
    return [
      `💕 The Beautiful ${text}`,
      `${text}: A Love Story 💖`,
      `🌹 ${text} - Pure Romance`,
      `The Perfect ${text} 💐`,
      `✨ ${text}: Heart-Melting Moments`
    ];
  }
  
  // Mystery content
  if (lowerText.includes('mystery') || lowerText.includes('secret') || lowerText.includes('hidden')) {
    return [
      `🔍 The ${text} Mystery Solved`,
      `${text}: Secrets Revealed 🗝️`,
      `👁️ ${text} - What They Don't Want You to Know`,
      `The Hidden Truth About ${text} 🔮`,
      `⚡ ${text}: Mystery Finally Exposed`
    ];
  }
  
  // Educational content
  if (lowerText.includes('how to') || lowerText.includes('tutorial') || lowerText.includes('guide') || lowerText.includes('learn')) {
    return [
      `💡 How to ${text.replace(/^how to\s*/i, '')}`,
      `${text}: Complete Guide 📚`,
      `⚙️ Master ${text} Quickly`,
      `${text}: Step-by-Step Tutorial 🚀`,
      `🔧 ${text} - Pro Tips`
    ];
  }
  
  // General engaging titles
  return [
    `🔥 ${text} - Must See!`,
    `${text}: You Won't Believe This ✨`,
    `🚀 Amazing ${text}`,
    `${text}: This Changes Everything 💥`,
    `🌟 ${text} - Viral Content`
  ];
};

// Rule-based description template
export const descriptionRB = (title: string, bullets: string[] = []) => {
  let desc = `In this video, we dive deep into ${title.toLowerCase()}. `;
  desc += "This comprehensive guide covers everything you need to know.\n\n";
  
  if (bullets.length > 0) {
    desc += "What you'll learn:\n";
    bullets.forEach(bullet => desc += `• ${bullet}\n`);
    desc += "\n";
  }
  
  desc += "Don't forget to like and subscribe for more content like this!\n\n";
  desc += `#${title.split(' ').join('')} #tutorial #guide #howto #tips`;
  
  return desc;
};

// Rule-based video script template
export const videoScriptRB = (topic: string, outline?: string) => {
  let script = `**${topic.toUpperCase()} - VIDEO SCRIPT**\n\n`;
  
  script += "**HOOK (0-15 seconds)**\n";
  script += `Did you know that ${topic.toLowerCase()} can completely change your perspective? In the next few minutes, I'll show you exactly how.\n\n`;
  
  script += "**INTRODUCTION (15-45 seconds)**\n";
  script += `Welcome back to the channel! Today we're diving deep into ${topic}. If you're new here, make sure to subscribe and hit the notification bell.\n\n`;
  
  if (outline) {
    script += "**MAIN CONTENT**\n";
    script += outline + "\n\n";
  } else {
    script += "**MAIN CONTENT (1-8 minutes)**\n";
    script += `Let's break down ${topic} into digestible parts:\n`;
    script += "• First, we'll cover the basics\n";
    script += "• Then, we'll look at practical examples\n";
    script += "• Finally, we'll discuss advanced techniques\n\n";
  }
  
  script += "**CALL TO ACTION (8-9 minutes)**\n";
  script += "If you found this helpful, smash that like button and subscribe for more content like this. What's your experience with this topic? Let me know in the comments below!\n\n";
  
  script += "**END SCREEN (9-10 minutes)**\n";
  script += "Thanks for watching! Check out this related video, and I'll see you in the next one!";
  
  return script;
};

// Rule-based keyword suggestions
export const keywordSuggestRB = (seed: string, max = 25) => {
  const prefixes = ['best', 'top', 'how to', 'free', 'cheap', 'online', 'guide to', 'tips for'];
  const suffixes = ['tutorial', 'guide', 'tips', 'tricks', 'course', 'training', 'near me', '2024', 'review'];
  
  const suggestions: string[] = [];
  
  // Add original seed
  suggestions.push(seed);
  
  // Add prefixed versions
  prefixes.forEach(prefix => {
    suggestions.push(`${prefix} ${seed}`);
  });
  
  // Add suffixed versions
  suffixes.forEach(suffix => {
    suggestions.push(`${seed} ${suffix}`);
  });
  
  // Add combined versions
  prefixes.slice(0, 3).forEach(prefix => {
    suffixes.slice(0, 3).forEach(suffix => {
      suggestions.push(`${prefix} ${seed} ${suffix}`);
    });
  });
  
  return suggestions.slice(0, max);
};

// Rule-based article rewriter (simple paraphrase)
export const articleRewriteRB = (text: string) => {
  return text
    .replace(/\bthe\b/g, 'a')
    .replace(/\bvery\b/g, 'extremely')
    .replace(/\bgood\b/g, 'excellent')
    .replace(/\bbad\b/g, 'poor')
    .replace(/\bbig\b/g, 'large')
    .replace(/\bsmall\b/g, 'little')
    .replace(/\bimportant\b/g, 'crucial')
    .replace(/\bhelp\b/g, 'assist')
    .replace(/\bstart\b/g, 'begin')
    .replace(/\bend\b/g, 'finish');
};

// Calculate keyword density
export const calculateKeywordDensity = (text: string, customStopwords: string[] = []) => {
  const stopwords = new Set([...STOP, ...customStopwords]);
  const words = tokens(text).filter(w => !stopwords.has(w));
  const totalWords = words.length;
  
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  
  return [...frequency.entries()]
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / totalWords) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
};