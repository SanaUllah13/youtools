<?php
/**
 * Plugin Name: YouTube Transcript Extractor
 * Plugin URI: https://github.com/yourusername/youtube-transcript-extractor
 * Description: Extract clean transcripts from YouTube videos with advanced repetition removal. Supports timestamped and plain text formats.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: youtube-transcript-extractor
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('YTE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('YTE_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('YTE_VERSION', '1.0.0');

class YouTubeTranscriptExtractor {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        add_action('wp_ajax_yte_extract_transcript', array($this, 'ajax_extract_transcript'));
        add_action('wp_ajax_nopriv_yte_extract_transcript', array($this, 'ajax_extract_transcript'));
        add_shortcode('youtube_transcript', array($this, 'shortcode_handler'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('yte-main', YTE_PLUGIN_URL . 'assets/youtube-transcript.js', array('jquery'), YTE_VERSION, true);
        wp_enqueue_style('yte-style', YTE_PLUGIN_URL . 'assets/youtube-transcript.css', array(), YTE_VERSION);
        
        wp_localize_script('yte-main', 'yte_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('yte_nonce'),
        ));
    }
    
    public function admin_menu() {
        add_options_page(
            'YouTube Transcript Extractor',
            'YT Transcript',
            'manage_options',
            'youtube-transcript-extractor',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>YouTube Transcript Extractor Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('yte_settings');
                do_settings_sections('yte_settings');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">API Endpoint</th>
                        <td>
                            <input type="text" name="yte_api_endpoint" value="<?php echo esc_attr(get_option('yte_api_endpoint', 'http://localhost:3001/api/youtube/transcript')); ?>" class="regular-text" />
                            <p class="description">URL to your Node.js API endpoint</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Default Language</th>
                        <td>
                            <select name="yte_default_language">
                                <option value="">Auto-detect</option>
                                <option value="en" <?php selected(get_option('yte_default_language'), 'en'); ?>>English</option>
                                <option value="es" <?php selected(get_option('yte_default_language'), 'es'); ?>>Spanish</option>
                                <option value="fr" <?php selected(get_option('yte_default_language'), 'fr'); ?>>French</option>
                                <option value="de" <?php selected(get_option('yte_default_language'), 'de'); ?>>German</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Default Format</th>
                        <td>
                            <label>
                                <input type="radio" name="yte_default_format" value="merged" <?php checked(get_option('yte_default_format', 'merged'), 'merged'); ?> />
                                Complete Sentences (Recommended)
                            </label><br>
                            <label>
                                <input type="radio" name="yte_default_format" value="segments" <?php checked(get_option('yte_default_format'), 'segments'); ?> />
                                Individual Segments
                            </label>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <hr>
            
            <h2>Usage</h2>
            <p>Use the shortcode <code>[youtube_transcript url="YOUTUBE_URL"]</code> in your posts or pages.</p>
            <p><strong>Example:</strong> <code>[youtube_transcript url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"]</code></p>
            
            <h3>Shortcode Parameters:</h3>
            <ul>
                <li><code>url</code> - YouTube video URL (required)</li>
                <li><code>format</code> - "merged" or "segments" (optional)</li>
                <li><code>language</code> - Language code like "en", "es" (optional)</li>
                <li><code>show_timestamps</code> - "true" or "false" (default: true)</li>
                <li><code>show_plain_text</code> - "true" or "false" (default: false)</li>
            </ul>
        </div>
        <?php
    }
    
    public function shortcode_handler($atts) {
        $atts = shortcode_atts(array(
            'url' => '',
            'format' => get_option('yte_default_format', 'merged'),
            'language' => get_option('yte_default_language', ''),
            'show_timestamps' => 'true',
            'show_plain_text' => 'false',
        ), $atts, 'youtube_transcript');
        
        if (empty($atts['url'])) {
            return '<p class="yte-error">Error: YouTube URL is required.</p>';
        }
        
        $unique_id = 'yte-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo $unique_id; ?>" class="youtube-transcript-extractor">
            <div class="yte-controls">
                <button class="yte-extract-btn" data-url="<?php echo esc_attr($atts['url']); ?>" 
                        data-format="<?php echo esc_attr($atts['format']); ?>"
                        data-language="<?php echo esc_attr($atts['language']); ?>"
                        data-timestamps="<?php echo esc_attr($atts['show_timestamps']); ?>"
                        data-plain-text="<?php echo esc_attr($atts['show_plain_text']); ?>">
                    📋 Extract Transcript
                </button>
                <div class="yte-loading" style="display: none;">
                    <span class="yte-spinner"></span> Extracting transcript...
                </div>
            </div>
            
            <div class="yte-result" style="display: none;"></div>
            <div class="yte-error" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function ajax_extract_transcript() {
        check_ajax_referer('yte_nonce', 'nonce');
        
        $video_url = sanitize_text_field($_POST['video_url']);
        $format = sanitize_text_field($_POST['format']);
        $language = sanitize_text_field($_POST['language']);
        
        if (empty($video_url)) {
            wp_send_json_error('Video URL is required');
        }
        
        $api_endpoint = get_option('yte_api_endpoint', 'http://localhost:3001/api/youtube/transcript');
        
        $request_data = array(
            'videoUrl' => $video_url,
            'mergeSegments' => ($format === 'merged'),
            'includePlainText' => true,
        );
        
        if (!empty($language)) {
            $request_data['language'] = $language;
        }
        
        $response = wp_remote_post($api_endpoint, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($request_data),
            'timeout' => 30,
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error('API request failed: ' . $response->get_error_message());
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (!$data || !$data['success']) {
            wp_send_json_error($data['error'] ?? 'Unknown error occurred');
        }
        
        wp_send_json_success($data['data']);
    }
}

// Initialize the plugin
new YouTubeTranscriptExtractor();

// Register settings
add_action('admin_init', function() {
    register_setting('yte_settings', 'yte_api_endpoint');
    register_setting('yte_settings', 'yte_default_language');
    register_setting('yte_settings', 'yte_default_format');
});
?>