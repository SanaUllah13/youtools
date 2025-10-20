# YouTools - Free YouTube & SEO Tools

A comprehensive Next.js 14 application providing 30+ free tools for YouTube creators, SEO professionals, and content marketers. Built with TypeScript, Tailwind CSS, and modern API routes.

## 🚀 Features

### YouTube Tools (21 tools)
- **YouTube Video Info** - Extract detailed video information
- **YouTube Tag Extractor** - Extract tags from any video
- **YouTube Tag Generator** - Generate SEO-optimized tags (AI & rule-based)
- **YouTube Hashtag Extractor** - Extract hashtags from video descriptions
- **YouTube Hashtag Generator** - Generate topical hashtags
- **YouTube Title Extractor** - Get video titles
- **YouTube Title Generator** - Generate catchy video titles
- **YouTube Description Extractor** - Extract video descriptions
- **YouTube Description Generator** - Create compelling descriptions
- **YouTube Embed Code Generator** - Generate iframe embed codes
- **YouTube Channel ID Finder** - Find channel IDs from handles/URLs
- **YouTube Video Statistics** - Get comprehensive video stats
- **YouTube Channel Statistics** - Analyze channel performance
- **YouTube Money Calculator** - Estimate earnings from views
- **YouTube Region Restriction Checker** - Check video availability by country
- **YouTube Channel Logo Downloader** - Download channel avatars
- **YouTube Channel Banner Downloader** - Download channel banners
- **YouTube Channel Search** - Search for channels
- **YouTube Video Generator** - Generate video scripts
- **YouTube Trending Videos** - Get trending videos by country
- And more...

### SEO & Content Tools (9 tools)
- **Keyword Density Checker** - Analyze keyword frequency
- **Meta Tag Generator** - Generate SEO meta tags
- **Meta Tags Analyzer** - Analyze existing meta tags
- **AdSense Calculator** - Calculate potential ad revenue
- **Keywords Suggestion Tool** - Generate keyword ideas
- **Article Rewriter** - Rewrite content (AI & rule-based)
- **Text Compare** - Compare text differences
- **FAQ Schema Generator** - Create structured data
- **AI Image Generator** - Generate images from prompts

### Utility Tools
- **Backwards Text Generator** - Reverse text strings
- **Text to Hashtags** - Convert text to hashtags

## 🛠️ Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Caching:** LRU Cache (in-memory)
- **Rate Limiting:** rate-limiter-flexible
- **YouTube Data:** ytdl-core, yt-channel-info, youtube-sr
- **AI Integration:** OpenAI API (optional)
- **Text Processing:** diff library

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd youtools
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# OpenAI API Key (optional - tools work in rule-based mode without it)
OPENAI_API_KEY=your_openai_api_key_here

# YouTube downloader timeout in milliseconds
YTDL_TIMEOUT_MS=12000

# CORS origin for development
ORIGIN_ALLOW=*
```

4. **Run the development server**
```bash
npm run dev
```
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the APIs

### YouTube Video Info
```bash
curl 'http://localhost:3000/api/youtube/info?input=https://youtu.be/dQw4w9WgXcQ'
```

### Extract YouTube Tags
```bash
curl 'http://localhost:3000/api/youtube/tags?input=https://youtu.be/dQw4w9WgXcQ'
```

### Generate YouTube Tags (Rule-based)
```bash
curl -X POST 'http://localhost:3000/api/youtube/tags/generate' \
  -H 'content-type: application/json' \
  -d '{"title":"How to grow on YouTube","description":"tips and tricks","mode":"rb","max":20}'
```

### Generate YouTube Tags (AI-powered)
```bash
curl -X POST 'http://localhost:3000/api/youtube/tags/generate' \
  -H 'content-type: application/json' \
  -d '{"title":"How to grow on YouTube","description":"tips and tricks","mode":"ai","max":20}'
```

### YouTube Region Check
```bash
curl 'http://localhost:3000/api/youtube/region-check?input=https://youtu.be/dQw4w9WgXcQ&country=US'
```

### YouTube Money Calculator
```bash
curl -X POST 'http://localhost:3000/api/youtube/money' \
  -H 'content-type: application/json' \
  -d '{"views":100000,"rpmLow":1.0,"rpmHigh":3.5}'
```

### Keyword Density Checker
```bash
curl -X POST 'http://localhost:3000/api/seo/keyword-density' \
  -H 'content-type: application/json' \
  -d '{"text":"This is a sample text for keyword density analysis. This text contains several keywords that repeat."}'
```

### AdSense Revenue Calculator
```bash
curl -X POST 'http://localhost:3000/api/seo/adsense' \
  -H 'content-type: application/json' \
  -d '{"pageViews":10000,"ctr":0.02,"cpc":0.5}'
```

### Backwards Text Generator
```bash
curl -X POST 'http://localhost:3000/api/tools/backwards' \
  -H 'content-type: application/json' \
  -d '{"text":"Hello World"}'
```

## 📚 API Documentation

### Rate Limiting
- **Limit:** 120 requests per 5 minutes per IP address
- **Headers:** Rate limit information is returned in response headers
- **Error:** 429 status code when limit exceeded

### Caching
- **Video Info:** 10 minutes
- **Tags:** 30 minutes  
- **Channel Info:** 6 hours
- **Trending:** 30 minutes

### Error Handling
All APIs return standardized error responses:
```json
{
  "error": "Error description",
  "detail": "Detailed error message",
  "status": 400
}
```

### Mode Parameter
Many endpoints support both rule-based and AI-powered generation:
- `"mode": "rb"` - Rule-based (fast, free, always available)
- `"mode": "ai"` - AI-powered (requires OpenAI API key, more creative)

### AI Cost Optimization 💰

The application uses **GPT-3.5 Turbo** for cost-effective AI generation:

- **20x cheaper** than GPT-4 (~$0.002 per 1K tokens)
- **Optimized token limits**: 150 tokens for lists, 200-250 for text
- **Lower temperature settings**: 0.3-0.5 for focused, consistent results
- **Built-in fallbacks**: Rule-based generation when AI fails
- **Usage tracking**: Monitor costs via `/api/admin/ai-usage`

**Estimated costs per operation:**
- Tag generation: ~$0.0003 per request
- Hashtag generation: ~$0.0003 per request  
- Title generation: ~$0.0004 per request
- Description generation: ~$0.0005 per request

**Monitor your AI usage:**
```bash
curl 'http://localhost:3000/api/admin/ai-usage'
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
```

Deploy to Vercel with environment variables configured.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
OPENAI_API_KEY=your_production_openai_key
YTDL_TIMEOUT_MS=12000
ORIGIN_ALLOW=https://yourdomain.com
```

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── (site)/           # Site pages (grouped routes)
│   ├── api/              # API routes
│   │   ├── youtube/      # YouTube tools APIs
│   │   ├── seo/          # SEO tools APIs
│   │   └── tools/        # Utility tools APIs
│   ├── demo/             # Demo/testing page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components
└── lib/                  # Utilities and helpers
    ├── ai.ts            # OpenAI integration
    ├── cache.ts         # LRU caching
    ├── limit.ts         # Rate limiting
    ├── rules.ts         # Rule-based generators
    ├── validators.ts    # Zod schemas
    └── youtube.ts       # YouTube utilities
```

### Adding New Tools

1. **Create validator schema** in `src/lib/validators.ts`
2. **Add rule-based logic** in `src/lib/rules.ts` (if applicable)
3. **Create API route** in appropriate `src/app/api/` directory
4. **Add to homepage** tool list in `src/app/page.tsx`
5. **Create tool page** in `src/app/(site)/` directory

### Code Quality
```bash
npm run lint    # ESLint
npm run build   # Type checking
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **GitHub Issues:** For bug reports and feature requests
- **Documentation:** Check this README and code comments
- **Demo:** Visit `/demo` page for API testing

## 🔮 Roadmap

- [ ] Add more YouTube analytics tools
- [ ] Implement Redis caching option
- [ ] Add user authentication and usage tracking  
- [ ] Create Chrome extension
- [ ] Add bulk processing capabilities
- [ ] Implement webhook support for automation
- [ ] Add more AI-powered content generation tools

---

**Built with ❤️ for content creators and SEO professionals**
