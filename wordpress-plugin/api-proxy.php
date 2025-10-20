<?php
/**
 * YouTools API Proxy
 * 
 * This proxy hides your Railway API URL from users.
 * Upload this file to your WordPress root directory or hosting.
 * 
 * Usage: https://yoursite.com/api-proxy.php?endpoint=/api/youtube/info&input=VIDEO_URL
 */

// Security headers
header('Content-Type: application/json');
header('X-Powered-By: YouTools');

// CORS - Allow only YOUR domains
$allowed_origins = [
    'https://darkblue-baboon-552098.hostingersite.com',
    'http://localhost', // for testing
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rate limiting (simple file-based)
function checkRateLimit() {
    $ip = $_SERVER['REMOTE_ADDR'];
    $cache_dir = sys_get_temp_dir() . '/youtools_rate_limit';
    $cache_file = $cache_dir . '/' . md5($ip);
    
    if (!is_dir($cache_dir)) {
        mkdir($cache_dir, 0777, true);
    }
    
    $now = time();
    $window = 900; // 15 minutes
    $max_requests = 50; // 50 requests per 15 minutes
    
    if (file_exists($cache_file)) {
        $data = json_decode(file_get_contents($cache_file), true);
        
        // Reset if window expired
        if ($now - $data['timestamp'] > $window) {
            $data = ['timestamp' => $now, 'count' => 0];
        }
        
        // Check limit
        if ($data['count'] >= $max_requests) {
            http_response_code(429);
            echo json_encode(['error' => 'Rate limit exceeded. Try again in 15 minutes.']);
            exit;
        }
        
        $data['count']++;
    } else {
        $data = ['timestamp' => $now, 'count' => 1];
    }
    
    file_put_contents($cache_file, json_encode($data));
}

// Apply rate limiting
checkRateLimit();

// Your Railway API URL (KEEP THIS SECRET!)
// Option 1: Hardcode (not recommended)
// $API_BASE_URL = 'https://youtools-production.up.railway.app';

// Option 2: Environment variable (recommended)
$API_BASE_URL = getenv('YOUTOOLS_API_URL') ?: 'https://youtools-production.up.railway.app';

// Get endpoint from request
$endpoint = $_GET['endpoint'] ?? '';

// Validate endpoint
$allowed_endpoints = [
    '/api/youtube/info',
    '/api/youtube/tags',
    '/api/youtube/tags/generate',
    '/api/youtube/hashtags',
    '/api/youtube/hashtags/generate',
    '/api/youtube/title/generate',
    '/api/youtube/description/generate',
    '/api/youtube/channel-id',
    '/api/youtube/money',
    '/api/youtube/transcript',
    '/api/tools/hashtags',
    '/api/tools/backwards',
];

if (!in_array($endpoint, $allowed_endpoints)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid endpoint']);
    exit;
}

// Build full URL
$full_url = $API_BASE_URL . $endpoint;

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Forward query parameters
    unset($_GET['endpoint']); // Remove endpoint param
    if (!empty($_GET)) {
        $full_url .= '?' . http_build_query($_GET);
    }
    
    $ch = curl_init($full_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
}

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $post_data = file_get_contents('php://input');
    
    $ch = curl_init($full_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
}

// Execute request
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Handle errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'API request failed: ' . $error]);
    exit;
}

// Return response
http_response_code($http_code);
echo $response;
?>
