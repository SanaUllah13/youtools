# YouTools WordPress Plugin - Installation Guide

Complete step-by-step guide to integrate all YouTools into your WordPress website using shortcodes.

## 📋 Prerequisites

Before starting, make sure you have:
- WordPress website (self-hosted or hosting with plugin support)
- FTP/cPanel access or WordPress admin access to upload plugins
- Your Next.js YouTools API running (on localhost or deployed server)
- Basic WordPress knowledge

---

## 🚀 Step 1: Prepare Your Next.js API

### Option A: Run Locally (Development)

1. **Start your Next.js app:**
   ```bash
   cd /Users/sanaullah/Desktop/youtools
   npm run dev
   ```
   
   The API will run at: `http://localhost:3000`

2. **Make it accessible from WordPress:**
   - If WordPress is on the same machine: Use `http://localhost:3000`
   - If WordPress is on different machine: Use your computer's local IP (e.g., `http://192.168.1.100:3000`)

### Option B: Deploy to Production (Recommended)

Deploy your Next.js app to a hosting service:

**Vercel (Recommended - Free):**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables (OPENAI_API_KEY, etc.)
5. Deploy
6. Your API URL will be: `https://your-app.vercel.app`

**Other Options:**
- Netlify
- Railway
- Render
- DigitalOcean
- AWS/Google Cloud

---

## 📦 Step 2: Install WordPress Plugin

### Method 1: Manual Upload (Recommended)

1. **Prepare the plugin folder:**
   ```bash
   cd /Users/sanaullah/Desktop/youtools/wordpress-plugin
   ```

2. **Create a ZIP file:**
   ```bash
   zip -r youtools-plugin.zip youtools-all-in-one.php assets/
   ```

3. **Upload to WordPress:**
   - Log in to WordPress Admin
   - Go to **Plugins → Add New**
   - Click **Upload Plugin**
   - Choose `youtools-plugin.zip`
   - Click **Install Now**
   - Click **Activate Plugin**

### Method 2: FTP/cPanel Upload

1. **Connect via FTP or File Manager**

2. **Navigate to WordPress plugins directory:**
   ```
   /public_html/wp-content/plugins/
   ```

3. **Create folder:**
   ```
   /public_html/wp-content/plugins/youtools/
   ```

4. **Upload these files:**
   - `youtools-all-in-one.php`
   - `assets/youtools.js`
   - `assets/youtools.css`

5. **Activate in WordPress:**
   - Go to **Plugins** in WordPress admin
   - Find "YouTools - All-in-One YouTube & SEO Tools"
   - Click **Activate**

---

## ⚙️ Step 3: Configure Plugin Settings

1. **Go to WordPress Admin**

2. **Navigate to Settings → YouTools**

3. **Configure API URL:**
   - **For Local Development:** `http://localhost:3000`
   - **For Production:** `https://your-app.vercel.app`
   - **Important:** No trailing slash!

4. **Save Settings**

---

## 🎯 Step 4: Use Shortcodes in Your Website

### Adding Tools to Pages/Posts

1. **Edit any Page or Post** in WordPress

2. **Add a shortcode** in the content editor:
   ```
   [youtools_video_info]
   ```

3. **Publish or Update**

4. **View the page** - the tool will appear!

---

## 📝 Available Shortcodes

### YouTube Tools

#### Video Information
```
[youtools_video_info]
```
Extract detailed information from YouTube videos.

#### Tag Extractor
```
[youtools_tag_extractor]
```
Extract all tags from YouTube videos.

#### Tag Generator
```
[youtools_tag_generator]
```
Generate SEO-optimized tags for videos.

#### Hashtag Extractor
```
[youtools_hashtag_extractor]
```
Extract hashtags from video descriptions.

#### Hashtag Generator
```
[youtools_hashtag_generator]
```
Generate relevant hashtags for videos.

#### Title Generator
```
[youtools_title_generator]
```
Generate catchy video titles.

#### Description Generator
```
[youtools_description_generator]
```
Create compelling video descriptions.

#### Channel ID Finder
```
[youtools_channel_id_finder]
```
Find YouTube channel IDs.

#### Video Statistics
```
[youtools_video_statistics]
```
Get comprehensive video stats.

#### Money Calculator
```
[youtools_money_calculator]
```
Calculate potential YouTube earnings.

#### Transcript Extractor
```
[youtools_transcript_extractor]
```
Extract video transcripts.

---

### SEO Tools

#### Keyword Density Checker
```
[youtools_keyword_density]
```
Analyze keyword frequency in content.

#### Meta Tag Generator
```
[youtools_meta_generator]
```
Generate SEO meta tags.

#### Meta Tags Analyzer
```
[youtools_meta_analyzer]
```
Analyze website meta tags.

#### AdSense Calculator
```
[youtools_adsense_calculator]
```
Calculate AdSense revenue estimates.

#### Keyword Suggestions
```
[youtools_keyword_suggestions]
```
Get keyword ideas.

#### Article Rewriter
```
[youtools_article_rewriter]
```
Rewrite content while keeping meaning.

---

### Utility Tools

#### Text Compare
```
[youtools_text_compare]
```
Compare two texts and see differences.

#### Backwards Text
```
[youtools_backwards_text]
```
Reverse text strings.

#### Text to Hashtags
```
[youtools_text_to_hashtags]
```
Convert text to hashtags.

---

## 💡 Usage Examples

### Example 1: Create a YouTube Tools Page

1. Create new page: **YouTube Tools**
2. Add shortcodes:

```
<h2>YouTube Video Info Extractor</h2>
[youtools_video_info]

<h2>YouTube Tag Generator</h2>
[youtools_tag_generator]

<h2>YouTube Money Calculator</h2>
[youtools_money_calculator]
```

3. Publish and share!

### Example 2: Create SEO Tools Page

```
<h2>Keyword Density Checker</h2>
[youtools_keyword_density]

<h2>Meta Tag Generator</h2>
[youtools_meta_generator]

<h2>AdSense Calculator</h2>
[youtools_adsense_calculator]
```

### Example 3: Individual Tool Pages

Create separate pages for each tool:
- `/youtube-tag-extractor/` → `[youtools_tag_extractor]`
- `/keyword-density-checker/` → `[youtools_keyword_density]`
- `/youtube-money-calculator/` → `[youtools_money_calculator]`

---

## 🎨 Customization

### Custom Styling

Add custom CSS in **Appearance → Customize → Additional CSS**:

```css
/* Change primary color */
.youtools-submit {
    background: #your-color !important;
}

/* Adjust container width */
.youtools-container {
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

/* Custom font */
.youtools-title {
    font-family: 'Your Font', sans-serif;
}
```

### Sidebar Widgets

Add tools to sidebar:
1. Go to **Appearance → Widgets**
2. Add **Custom HTML** widget
3. Paste shortcode: `[youtools_money_calculator]`

---

## 🔧 Troubleshooting

### Tool Not Showing

**Problem:** Shortcode appears as text
- **Solution:** Make sure plugin is activated
- Check: **Plugins → Installed Plugins**

### API Connection Error

**Problem:** "API request failed" or CORS errors

**Solutions:**

1. **Check API URL in Settings**
   - Go to **Settings → YouTools**
   - Verify URL is correct
   - No trailing slash

2. **Enable CORS on Next.js**
   
   Edit your Next.js API route to add CORS headers:
   ```typescript
   // In your API routes
   export async function GET(request: Request) {
     const response = NextResponse.json(data);
     response.headers.set('Access-Control-Allow-Origin', '*');
     response.headers.set('Access-Control-Allow-Methods', 'GET, POST');
     return response;
   }
   ```

3. **For Localhost:**
   - Make sure Next.js is running (`npm run dev`)
   - Check port number (default: 3000)

4. **For Production:**
   - Make sure your deployed app is accessible
   - Test API directly in browser

### Tools Loading Slowly

**Solutions:**
- Use production deployment instead of localhost
- Enable caching in Next.js API
- Use a CDN for static assets

### Styling Issues

**Problem:** Tools look broken or unstyled

**Solutions:**
1. Clear WordPress cache (if using cache plugin)
2. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for CSS errors
4. Verify `youtools.css` was uploaded correctly

---

## 🚀 Performance Tips

### 1. Use a Caching Plugin
Install caching plugin like:
- WP Super Cache
- W3 Total Cache
- WP Rocket

### 2. Deploy Next.js to Production
Don't use `localhost` for production WordPress sites.

### 3. Use a CDN
For faster global access:
- Cloudflare
- StackPath
- BunnyCDN

### 4. Optimize WordPress
- Use lightweight theme
- Minimize plugins
- Enable gzip compression

---

## 🔒 Security Considerations

### API Rate Limiting
Your Next.js API includes rate limiting (120 requests per 5 minutes).

### API Key Protection
Never expose your OpenAI API key in frontend code - it's only used in Next.js backend.

### HTTPS
Always use HTTPS for production WordPress and API.

---

## 📊 Monetization Ideas

### Ways to Monetize Your Tools Site:

1. **Google AdSense**
   - Add ads between tools
   - Sidebar ads

2. **Affiliate Links**
   - YouTube courses
   - SEO tools
   - Hosting services

3. **Premium Features**
   - AI-powered tools (with API key)
   - Bulk processing
   - API access

4. **Sponsored Content**
   - Tool reviews
   - Tutorials
   - Case studies

---

## 🆘 Getting Help

### Check Logs
1. **WordPress Debug:**
   - Edit `wp-config.php`
   - Set `define('WP_DEBUG', true);`
   - Check `/wp-content/debug.log`

2. **Browser Console:**
   - Press F12
   - Check Console tab for errors

3. **Network Tab:**
   - Press F12 → Network tab
   - Check API requests

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "undefined" errors | Update API URL in settings |
| Tools don't load | Check Next.js is running |
| CORS errors | Add CORS headers to API |
| Styling broken | Clear cache and hard refresh |
| Shortcode shows as text | Activate plugin |

---

## 📚 Next Steps

### Enhance Your Site:

1. **Create Landing Pages**
   - Add SEO-optimized descriptions
   - Use proper headings
   - Add call-to-actions

2. **Add Blog Content**
   - "How to use YouTube tags"
   - "Best SEO practices"
   - "YouTube money calculator explained"

3. **Social Sharing**
   - Add social share buttons
   - Create Pinterest pins
   - Share on Twitter/Facebook

4. **Email Capture**
   - Add newsletter signup
   - Offer free guides
   - Build email list

5. **Analytics**
   - Install Google Analytics
   - Track tool usage
   - Monitor conversions

---

## ✅ Checklist

- [ ] Next.js API deployed and accessible
- [ ] WordPress plugin uploaded and activated
- [ ] API URL configured in Settings → YouTools
- [ ] Test shortcode on a page
- [ ] Tools working correctly
- [ ] Custom styling applied (optional)
- [ ] HTTPS enabled for production
- [ ] Caching plugin installed
- [ ] Analytics tracking added

---

## 🎉 You're Done!

Your WordPress website now has 20+ powerful tools accessible via simple shortcodes!

**Need More Tools?**
You can easily add more tools by:
1. Creating new API endpoints in Next.js
2. Adding new shortcodes in the plugin
3. Following the existing patterns

**Questions?**
Check the README.md in the main project folder for API documentation and development guide.

---

## 📝 Quick Reference Card

```
YouTube Tools:
[youtools_video_info]         → Video information
[youtools_tag_extractor]      → Extract tags
[youtools_tag_generator]      → Generate tags
[youtools_money_calculator]   → Earnings calculator
[youtools_transcript_extractor] → Get transcripts

SEO Tools:
[youtools_keyword_density]    → Keyword density
[youtools_meta_generator]     → Generate meta tags
[youtools_adsense_calculator] → AdSense calculator
[youtools_article_rewriter]   → Rewrite articles

Utility:
[youtools_text_compare]       → Compare texts
[youtools_backwards_text]     → Reverse text
[youtools_text_to_hashtags]   → Convert to hashtags
```

Save this guide for future reference! 🚀
