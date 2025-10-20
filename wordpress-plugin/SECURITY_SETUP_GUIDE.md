# 🔒 API Security Setup Guide

## The Problem
Your Railway API URL is visible in browser developer tools when using HTML tools.

## The Solution
Use a **PHP proxy** on YOUR server to hide the real API URL.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Upload the Proxy
1. Upload `api-proxy.php` to your WordPress root directory
2. Make sure it's accessible at: `https://yoursite.com/api-proxy.php`

### Step 2: Configure Allowed Domains
Edit `api-proxy.php` line 16-20:
```php
$allowed_origins = [
    'https://yoursite.com',          // Add YOUR domain
    'https://www.yoursite.com',      // Add www version
    'http://localhost',              // Keep for testing
];
```

### Step 3: Test the Proxy
Visit: `https://yoursite.com/api-proxy.php?endpoint=/api/youtube/info&input=https://www.youtube.com/watch?v=dQw4w9WgXcQ`

You should see JSON response!

### Step 4: Use Secure HTML Tools
Use the secure versions (`-secure.html`) instead of regular ones:
- `youtube-video-info-secure.html` ✅ (API hidden)
- `youtube-video-info.html` ❌ (API visible)

---

## 🔐 How It Works

### Before (Insecure):
```
Browser → Railway API (visible in DevTools)
```

### After (Secure):
```
Browser → YOUR Proxy → Railway API (hidden!)
```

Users only see `api-proxy.php` - they NEVER see your Railway URL!

---

## ⚡ What You Get

✅ **API URL Completely Hidden** - Users can't see Railway URL
✅ **Rate Limiting Built-in** - 50 requests per 15 minutes per IP
✅ **Domain Whitelist** - Only YOUR sites can use it
✅ **Endpoint Validation** - Only allowed endpoints work
✅ **Error Handling** - Proper error messages

---

## 📝 Customization

### Change Rate Limit
Edit `api-proxy.php` line 46-47:
```php
$window = 900;        // 15 minutes (in seconds)
$max_requests = 50;   // Max requests per window
```

### Add More Endpoints
Edit `api-proxy.php` line 86-99:
```php
$allowed_endpoints = [
    '/api/youtube/info',
    '/api/your-new-endpoint',  // Add here
];
```

---

## 🎯 Alternative: Update All Existing HTML Tools

Want to secure ALL your tools? Just change one line in each:

### Find (around line 44-66):
```javascript
const API_URL = 'https://youtools-production.up.railway.app/api/youtube/info';
```

### Replace with:
```javascript
const PROXY_URL = '/api-proxy.php';
// Then in fetch:
const response = await fetch(`${PROXY_URL}?endpoint=/api/youtube/info&input=${videoUrl}`);
```

---

## 🛡️ Security Checklist

- [ ] Uploaded `api-proxy.php` to WordPress root
- [ ] Updated `$allowed_origins` with YOUR domains
- [ ] Tested proxy URL in browser
- [ ] Switched to `-secure.html` versions
- [ ] API URL no longer visible in DevTools!

---

## ⚠️ Important Notes

1. **Rate Limiting Uses /tmp** - If your server clears /tmp frequently, you may need to adjust the cache location in line 38:
   ```php
   $cache_dir = sys_get_temp_dir() . '/youtools_rate_limit';
   // Change to:
   $cache_dir = '/home/youruser/rate_limit_cache';
   ```

2. **HTTPS Recommended** - Make sure your site uses HTTPS for security

3. **Environment Variable (Optional)** - For extra security, store API URL in environment variable instead of hardcoding it

---

## 🔥 Pro Tip: Environment Variable

**Instead of hardcoding the API URL in api-proxy.php:**

1. Add to your server's environment or `.htaccess`:
   ```apache
   SetEnv YOUTOOLS_API_URL "https://youtools-production.up.railway.app"
   ```

2. The proxy will automatically use it (line 80):
   ```php
   $API_BASE_URL = getenv('YOUTOOLS_API_URL') ?: 'https://youtools-production.up.railway.app';
   ```

Now your API URL is NEVER in any file!

---

## 🧪 Testing

### Test 1: Proxy Works
```bash
curl "https://yoursite.com/api-proxy.php?endpoint=/api/youtube/info&input=VIDEO_URL"
```

### Test 2: Rate Limiting Works
Run the above 51 times quickly - 51st should fail with "Rate limit exceeded"

### Test 3: Wrong Domain Blocked
Try from different domain - should fail CORS

---

## ❓ Troubleshooting

### "Not allowed by CORS"
- Add your domain to `$allowed_origins` in api-proxy.php

### "Invalid endpoint"
- Check endpoint is in `$allowed_endpoints` array

### Rate limit not working
- Make sure your server can write to `/tmp` directory
- Check PHP error logs

### 500 Error
- Check if curl is enabled in PHP
- Check PHP error logs

---

## 📊 Comparison

| Feature | Without Proxy | With Proxy |
|---------|--------------|------------|
| API URL Visible | ✅ Yes | ❌ No |
| Can Be Stolen | ✅ Yes | ❌ No |
| Rate Limited | ❌ No | ✅ Yes |
| Domain Restricted | ❌ No | ✅ Yes |
| Setup Time | 0 min | 5 min |

---

**Your API is now SECURE! 🎉**

Users can try to inspect all they want - they'll NEVER see your Railway URL!
