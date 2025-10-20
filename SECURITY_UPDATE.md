# API Security Implementation Guide

## Problem
Frontend code (HTML tools) exposes API URL in browser developer tools.

## Reality Check ✅
- **Frontend code is ALWAYS visible** - There's NO way to truly hide JavaScript in browsers
- The solution is to **secure the API backend**, not hide the frontend

## Solutions (Ranked by Effectiveness)

### 🥇 Solution 1: Rate Limiting (BEST - Easy to Implement)

**Install in your project:**
```bash
npm install express-rate-limit
```

**Add to your main API file (e.g., src/app/api/[...]/route.ts or server file):**

```typescript
import rateLimit from 'express-rate-limit';

// Create rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use('/api/', limiter);

// Or specific routes only
app.use('/api/youtube/info', limiter);
```

**Benefits:**
- ✅ Prevents API abuse
- ✅ Stops people from hammering your API
- ✅ Easy to implement (5 minutes)
- ✅ Works immediately

---

### 🥈 Solution 2: Domain Whitelisting with CORS

**Only allow requests from YOUR domains:**

```typescript
const allowedOrigins = [
  'https://yoursite.com',
  'https://www.yoursite.com',
  'http://localhost:3000', // for development
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

**Benefits:**
- ✅ Only YOUR websites can call the API
- ✅ Blocks direct API access from other sites
- ⚠️ Can still be bypassed with proxies (but stops casual copying)

---

### 🥉 Solution 3: API Key System

**Add simple API key authentication:**

```typescript
// Middleware
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKey = process.env.API_KEY; // Set in Railway env vars
  
  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply to routes
app.use('/api/', apiKeyAuth);
```

**In your HTML tools:**
```javascript
const response = await fetch(API_URL, {
  headers: {
    'X-API-Key': 'your-secret-key-here'
  }
});
```

**Benefits:**
- ✅ Adds authentication layer
- ⚠️ Key still visible in frontend (but harder to find)
- ✅ Can rotate keys if compromised

---

### 🛡️ Solution 4: Backend Proxy (MOST SECURE)

**Create a WordPress/PHP backend proxy that hides the real API:**

```php
<?php
// proxy.php on YOUR server
$apiUrl = getenv('YOUTOOLS_API_URL'); // Store in environment variable
$endpoint = $_GET['endpoint'];
$fullUrl = $apiUrl . $endpoint;

// Forward request
$ch = curl_init($fullUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
?>
```

**In your HTML tools:**
```javascript
const API_URL = '/proxy.php?endpoint=/api/youtube/info'; // Now uses YOUR server
```

**Benefits:**
- ✅✅✅ **BEST SECURITY** - Real API URL completely hidden
- ✅ Full control over access
- ✅ Can add authentication, logging, rate limiting
- ⚠️ Requires PHP/backend on your hosting

---

### 💡 Solution 5: Code Obfuscation (Cosmetic Only)

**Make code harder to read (but NOT secure):**

```bash
# Install obfuscator
npm install -g javascript-obfuscator

# Obfuscate files
javascript-obfuscator youtube-video-info.html --output youtube-video-info.min.html
```

**⚠️ WARNING:** This is **security theater** - anyone can de-obfuscate it!

---

## 🎯 **Recommended Solution for You:**

### **Option A: Quick & Easy (5 minutes)**
1. Add **Rate Limiting** to Railway API
2. Add **CORS domain whitelisting**
3. Deploy to Railway

### **Option B: Maximum Security (30 minutes)**
1. Create **PHP proxy** on your hosting
2. Add **Rate Limiting** to proxy
3. Hide real API URL completely

---

## 📊 Comparison Table

| Solution | Security Level | Ease | API Hidden? |
|----------|----------------|------|-------------|
| Rate Limiting | ⭐⭐⭐ | ✅ Easy | ❌ No |
| CORS Whitelist | ⭐⭐⭐ | ✅ Easy | ❌ No |
| API Key | ⭐⭐⭐⭐ | ✅ Easy | ⚠️ Partially |
| Backend Proxy | ⭐⭐⭐⭐⭐ | ⚠️ Medium | ✅ Yes |
| Obfuscation | ⭐ | ✅ Easy | ❌ No |

---

## 🚀 Quick Implementation (Copy-Paste Ready)

I can create the rate limiting + CORS code for your Railway app right now.
Just let me know if you want me to add it!

---

## 💭 Final Thoughts

**Truth:** If someone really wants to steal your tools, they will.
**Reality:** 99% of people won't bother if you add basic protections.
**Best Practice:** Rate limiting + CORS = Good enough for most cases.

The goal isn't to make it **impossible** to steal (that's impossible).
The goal is to make it **annoying enough** that people give up.
