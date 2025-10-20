<?php
/**
 * Plugin Name: YouTools - All-in-One YouTube & SEO Tools
 * Plugin URI: https://youtools.com
 * Description: 30+ free tools for YouTube creators and SEO professionals. Includes video info, tags, analytics, keyword density, and more.
 * Version: 1.0.1
 * Author: YouTools
 * License: GPL v2 or later
 * Text Domain: youtools
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('YOUTOOLS_PLUGIN_URL', plugin_dir_url(__FILE__));
define('YOUTOOLS_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('YOUTOOLS_VERSION', '1.0.0');

class YouTools_Plugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'admin_menu'));
        
        // Register all shortcodes
        $this->register_shortcodes();
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        // Check if we're on a singular post/page
        if (!is_singular()) {
            return;
        }
        
        global $post;
        
        // Check if any YouTools shortcode exists in the content
        if ($post && (stripos($post->post_content, '[youtools_') !== false)) {
            wp_enqueue_script('youtools-main', YOUTOOLS_PLUGIN_URL . 'assets/youtools.js', array('jquery'), YOUTOOLS_VERSION, true);
            wp_enqueue_style('youtools-style', YOUTOOLS_PLUGIN_URL . 'assets/youtools.css', array(), YOUTOOLS_VERSION);
            
            wp_localize_script('youtools-main', 'youtools_config', array(
                'api_url' => get_option('youtools_api_url', 'https://youtools-production.up.railway.app'),
                'nonce' => wp_create_nonce('youtools_nonce'),
            ));
        }
    }
    
    public function admin_menu() {
        add_options_page(
            'YouTools Settings',
            'YouTools',
            'manage_options',
            'youtools-settings',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        if (isset($_POST['youtools_save_settings'])) {
            check_admin_referer('youtools_settings');
            update_option('youtools_api_url', sanitize_text_field($_POST['youtools_api_url']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        ?>
        <div class="wrap">
            <h1>YouTools Settings</h1>
            <form method="post" action="">
                <?php wp_nonce_field('youtools_settings'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">API URL</th>
                        <td>
                            <input type="text" name="youtools_api_url" value="<?php echo esc_attr(get_option('youtools_api_url', 'https://youtools-production.up.railway.app')); ?>" class="regular-text" />
                            <p class="description">Your Railway API URL (default: https://youtools-production.up.railway.app)</p>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <input type="submit" name="youtools_save_settings" class="button-primary" value="Save Settings" />
                </p>
            </form>
            
            <hr>
            
            <h2>Available Shortcodes</h2>
            
            <h3>YouTube Tools</h3>
            <ul>
                <li><code>[youtools_video_info]</code> - Extract video information</li>
                <li><code>[youtools_tag_extractor]</code> - Extract tags from videos</li>
                <li><code>[youtools_tag_generator]</code> - Generate SEO tags</li>
                <li><code>[youtools_hashtag_extractor]</code> - Extract hashtags</li>
                <li><code>[youtools_hashtag_generator]</code> - Generate hashtags</li>
                <li><code>[youtools_title_generator]</code> - Generate video titles</li>
                <li><code>[youtools_description_generator]</code> - Generate descriptions</li>
                <li><code>[youtools_channel_id_finder]</code> - Find channel IDs</li>
                <li><code>[youtools_video_statistics]</code> - Get video stats</li>
                <li><code>[youtools_money_calculator]</code> - Calculate YouTube earnings</li>
                <li><code>[youtools_transcript_extractor]</code> - Extract transcripts</li>
            </ul>
            
            <h3>SEO Tools</h3>
            <ul>
                <li><code>[youtools_keyword_density]</code> - Check keyword density</li>
                <li><code>[youtools_meta_generator]</code> - Generate meta tags</li>
                <li><code>[youtools_meta_analyzer]</code> - Analyze meta tags</li>
                <li><code>[youtools_adsense_calculator]</code> - Calculate AdSense revenue</li>
                <li><code>[youtools_keyword_suggestions]</code> - Get keyword ideas</li>
                <li><code>[youtools_article_rewriter]</code> - Rewrite content</li>
            </ul>
            
            <h3>Utility Tools</h3>
            <ul>
                <li><code>[youtools_text_compare]</code> - Compare text differences</li>
                <li><code>[youtools_backwards_text]</code> - Reverse text</li>
                <li><code>[youtools_text_to_hashtags]</code> - Convert text to hashtags</li>
            </ul>
        </div>
        <?php
    }
    
    public function register_shortcodes() {
        // YouTube Tools
        add_shortcode('youtools_video_info', array($this, 'render_video_info'));
        add_shortcode('youtools_tag_extractor', array($this, 'render_tag_extractor'));
        add_shortcode('youtools_tag_generator', array($this, 'render_tag_generator'));
        add_shortcode('youtools_hashtag_extractor', array($this, 'render_hashtag_extractor'));
        add_shortcode('youtools_hashtag_generator', array($this, 'render_hashtag_generator'));
        add_shortcode('youtools_title_generator', array($this, 'render_title_generator'));
        add_shortcode('youtools_description_generator', array($this, 'render_description_generator'));
        add_shortcode('youtools_channel_id_finder', array($this, 'render_channel_id_finder'));
        add_shortcode('youtools_video_statistics', array($this, 'render_video_statistics'));
        add_shortcode('youtools_money_calculator', array($this, 'render_money_calculator'));
        add_shortcode('youtools_transcript_extractor', array($this, 'render_transcript_extractor'));
        
        // SEO Tools
        add_shortcode('youtools_keyword_density', array($this, 'render_keyword_density'));
        add_shortcode('youtools_meta_generator', array($this, 'render_meta_generator'));
        add_shortcode('youtools_meta_analyzer', array($this, 'render_meta_analyzer'));
        add_shortcode('youtools_adsense_calculator', array($this, 'render_adsense_calculator'));
        add_shortcode('youtools_keyword_suggestions', array($this, 'render_keyword_suggestions'));
        add_shortcode('youtools_article_rewriter', array($this, 'render_article_rewriter'));
        
        // Utility Tools
        add_shortcode('youtools_text_compare', array($this, 'render_text_compare'));
        add_shortcode('youtools_backwards_text', array($this, 'render_backwards_text'));
        add_shortcode('youtools_text_to_hashtags', array($this, 'render_text_to_hashtags'));
    }
    
    // YouTube Tools Renderers
    public function render_video_info($atts) {
        return $this->render_tool('video-info', 'YouTube Video Info', array(
            array('name' => 'video_url', 'label' => 'YouTube Video URL', 'type' => 'url', 'placeholder' => 'https://www.youtube.com/watch?v=...', 'required' => true)
        ), 'Extract detailed information about any YouTube video including title, description, tags, views, likes, and more.');
    }
    
    public function render_tag_extractor($atts) {
        return $this->render_tool('tag-extractor', 'YouTube Tag Extractor', array(
            array('name' => 'video_url', 'label' => 'YouTube Video URL', 'type' => 'url', 'placeholder' => 'https://www.youtube.com/watch?v=...', 'required' => true)
        ), 'Extract all tags from any YouTube video to analyze competitors and improve your SEO.');
    }
    
    public function render_tag_generator($atts) {
        return $this->render_tool('tag-generator', 'YouTube Tag Generator', array(
            array('name' => 'title', 'label' => 'Video Title', 'type' => 'text', 'placeholder' => 'How to grow on YouTube', 'required' => true),
            array('name' => 'description', 'label' => 'Video Description', 'type' => 'textarea', 'placeholder' => 'Brief description...', 'required' => false),
            array('name' => 'max_tags', 'label' => 'Max Tags', 'type' => 'number', 'value' => '20', 'required' => false),
            array('name' => 'mode', 'label' => 'Mode', 'type' => 'select', 'options' => array('rb' => 'Rule-based (Fast)', 'ai' => 'AI-powered (Better)'), 'required' => false)
        ), 'Generate SEO-optimized tags for your YouTube videos using AI or rule-based algorithms.');
    }
    
    public function render_hashtag_extractor($atts) {
        return $this->render_tool('hashtag-extractor', 'YouTube Hashtag Extractor', array(
            array('name' => 'video_url', 'label' => 'YouTube Video URL', 'type' => 'url', 'placeholder' => 'https://www.youtube.com/watch?v=...', 'required' => true)
        ), 'Extract hashtags from YouTube video descriptions.');
    }
    
    public function render_hashtag_generator($atts) {
        return $this->render_tool('hashtag-generator', 'YouTube Hashtag Generator', array(
            array('name' => 'topic', 'label' => 'Video Topic', 'type' => 'text', 'placeholder' => 'gaming, cooking, travel...', 'required' => true),
            array('name' => 'max_hashtags', 'label' => 'Max Hashtags', 'type' => 'number', 'value' => '15', 'required' => false)
        ), 'Generate relevant hashtags for your YouTube videos based on topic.');
    }
    
    public function render_title_generator($atts) {
        return $this->render_tool('title-generator', 'YouTube Title Generator', array(
            array('name' => 'topic', 'label' => 'Video Topic', 'type' => 'text', 'placeholder' => 'How to grow on YouTube', 'required' => true),
            array('name' => 'mode', 'label' => 'Mode', 'type' => 'select', 'options' => array('rb' => 'Rule-based (Fast)', 'ai' => 'AI-powered (Better)'), 'required' => false)
        ), 'Generate catchy, SEO-optimized titles for your YouTube videos.');
    }
    
    public function render_description_generator($atts) {
        return $this->render_tool('description-generator', 'YouTube Description Generator', array(
            array('name' => 'title', 'label' => 'Video Title', 'type' => 'text', 'placeholder' => 'Your video title', 'required' => true),
            array('name' => 'keywords', 'label' => 'Keywords', 'type' => 'text', 'placeholder' => 'keyword1, keyword2, keyword3...', 'required' => false),
            array('name' => 'mode', 'label' => 'Mode', 'type' => 'select', 'options' => array('rb' => 'Rule-based (Fast)', 'ai' => 'AI-powered (Better)'), 'required' => false)
        ), 'Generate compelling descriptions for your YouTube videos with SEO optimization.');
    }
    
    public function render_channel_id_finder($atts) {
        return $this->render_tool('channel-id-finder', 'YouTube Channel ID Finder', array(
            array('name' => 'channel_url', 'label' => 'Channel URL or Handle', 'type' => 'text', 'placeholder' => '@username or channel URL', 'required' => true)
        ), 'Find the channel ID from a YouTube channel URL or handle.');
    }
    
    public function render_video_statistics($atts) {
        return $this->render_tool('video-statistics', 'YouTube Video Statistics', array(
            array('name' => 'video_url', 'label' => 'YouTube Video URL', 'type' => 'url', 'placeholder' => 'https://www.youtube.com/watch?v=...', 'required' => true)
        ), 'Get comprehensive statistics for any YouTube video.');
    }
    
    public function render_money_calculator($atts) {
        return $this->render_tool('money-calculator', 'YouTube Money Calculator', array(
            array('name' => 'views', 'label' => 'Total Views', 'type' => 'number', 'placeholder' => '100000', 'required' => true),
            array('name' => 'rpm_low', 'label' => 'RPM Low ($/1000 views)', 'type' => 'number', 'value' => '1.0', 'step' => '0.1', 'required' => false),
            array('name' => 'rpm_high', 'label' => 'RPM High ($/1000 views)', 'type' => 'number', 'value' => '3.5', 'step' => '0.1', 'required' => false)
        ), 'Calculate potential YouTube earnings based on views and RPM.');
    }
    
    public function render_transcript_extractor($atts) {
        return $this->render_tool('transcript-extractor', 'YouTube Transcript Extractor', array(
            array('name' => 'video_url', 'label' => 'YouTube Video URL', 'type' => 'url', 'placeholder' => 'https://www.youtube.com/watch?v=...', 'required' => true),
            array('name' => 'language', 'label' => 'Language (optional)', 'type' => 'text', 'placeholder' => 'en, es, fr...', 'required' => false)
        ), 'Extract clean transcripts from YouTube videos with timestamps.');
    }
    
    // SEO Tools Renderers
    public function render_keyword_density($atts) {
        return $this->render_tool('keyword-density', 'Keyword Density Checker', array(
            array('name' => 'text', 'label' => 'Your Content', 'type' => 'textarea', 'placeholder' => 'Paste your content here...', 'required' => true, 'rows' => 10)
        ), 'Analyze keyword frequency and density in your content for better SEO.');
    }
    
    public function render_meta_generator($atts) {
        return $this->render_tool('meta-generator', 'Meta Tag Generator', array(
            array('name' => 'title', 'label' => 'Page Title', 'type' => 'text', 'placeholder' => 'Your page title', 'required' => true),
            array('name' => 'description', 'label' => 'Page Description', 'type' => 'textarea', 'placeholder' => 'Your page description...', 'required' => true),
            array('name' => 'keywords', 'label' => 'Keywords', 'type' => 'text', 'placeholder' => 'keyword1, keyword2...', 'required' => false)
        ), 'Generate SEO-optimized meta tags for your web pages.');
    }
    
    public function render_meta_analyzer($atts) {
        return $this->render_tool('meta-analyzer', 'Meta Tags Analyzer', array(
            array('name' => 'url', 'label' => 'Website URL', 'type' => 'url', 'placeholder' => 'https://example.com', 'required' => true)
        ), 'Analyze and evaluate meta tags of any website for SEO optimization.');
    }
    
    public function render_adsense_calculator($atts) {
        return $this->render_tool('adsense-calculator', 'AdSense Revenue Calculator', array(
            array('name' => 'page_views', 'label' => 'Page Views per Month', 'type' => 'number', 'placeholder' => '10000', 'required' => true),
            array('name' => 'ctr', 'label' => 'Click-Through Rate (%)', 'type' => 'number', 'value' => '2', 'step' => '0.1', 'required' => false),
            array('name' => 'cpc', 'label' => 'Cost per Click ($)', 'type' => 'number', 'value' => '0.5', 'step' => '0.1', 'required' => false)
        ), 'Calculate potential AdSense earnings based on traffic and engagement.');
    }
    
    public function render_keyword_suggestions($atts) {
        return $this->render_tool('keyword-suggestions', 'Keywords Suggestion Tool', array(
            array('name' => 'keyword', 'label' => 'Seed Keyword', 'type' => 'text', 'placeholder' => 'digital marketing', 'required' => true)
        ), 'Generate keyword ideas and suggestions for your content strategy.');
    }
    
    public function render_article_rewriter($atts) {
        return $this->render_tool('article-rewriter', 'Article Rewriter', array(
            array('name' => 'text', 'label' => 'Original Text', 'type' => 'textarea', 'placeholder' => 'Paste your text here...', 'required' => true, 'rows' => 10),
            array('name' => 'mode', 'label' => 'Mode', 'type' => 'select', 'options' => array('rb' => 'Rule-based (Fast)', 'ai' => 'AI-powered (Better)'), 'required' => false)
        ), 'Rewrite articles and content while maintaining the original meaning.');
    }
    
    // Utility Tools Renderers
    public function render_text_compare($atts) {
        return $this->render_tool('text-compare', 'Text Compare', array(
            array('name' => 'text1', 'label' => 'Original Text', 'type' => 'textarea', 'placeholder' => 'Paste first text...', 'required' => true, 'rows' => 8),
            array('name' => 'text2', 'label' => 'Modified Text', 'type' => 'textarea', 'placeholder' => 'Paste second text...', 'required' => true, 'rows' => 8)
        ), 'Compare two texts and see the differences highlighted.');
    }
    
    public function render_backwards_text($atts) {
        return $this->render_tool('backwards-text', 'Backwards Text Generator', array(
            array('name' => 'text', 'label' => 'Your Text', 'type' => 'text', 'placeholder' => 'Enter text to reverse...', 'required' => true)
        ), 'Reverse any text string backwards.');
    }
    
    public function render_text_to_hashtags($atts) {
        return $this->render_tool('text-to-hashtags', 'Text to Hashtags', array(
            array('name' => 'text', 'label' => 'Your Text', 'type' => 'textarea', 'placeholder' => 'Enter text to convert to hashtags...', 'required' => true, 'rows' => 5)
        ), 'Convert text into hashtags automatically.');
    }
    
    // Generic tool renderer
    private function render_tool($tool_id, $title, $fields, $description) {
        $unique_id = 'youtools-' . $tool_id . '-' . uniqid();
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($unique_id); ?>" class="youtools-container" data-tool="<?php echo esc_attr($tool_id); ?>">
            <div class="youtools-header">
                <h3 class="youtools-title"><?php echo esc_html($title); ?></h3>
                <p class="youtools-description"><?php echo esc_html($description); ?></p>
            </div>
            
            <form class="youtools-form">
                <?php foreach ($fields as $field): ?>
                    <div class="youtools-field">
                        <label for="<?php echo esc_attr($unique_id . '-' . $field['name']); ?>"><?php echo esc_html($field['label']); ?></label>
                        
                        <?php if ($field['type'] === 'textarea'): ?>
                            <textarea 
                                id="<?php echo esc_attr($unique_id . '-' . $field['name']); ?>"
                                name="<?php echo esc_attr($field['name']); ?>"
                                placeholder="<?php echo esc_attr($field['placeholder'] ?? ''); ?>"
                                rows="<?php echo esc_attr($field['rows'] ?? 5); ?>"
                                <?php echo !empty($field['required']) ? 'required' : ''; ?>
                            ><?php echo esc_textarea($field['value'] ?? ''); ?></textarea>
                        
                        <?php elseif ($field['type'] === 'select'): ?>
                            <select 
                                id="<?php echo esc_attr($unique_id . '-' . $field['name']); ?>"
                                name="<?php echo esc_attr($field['name']); ?>"
                                <?php echo !empty($field['required']) ? 'required' : ''; ?>
                            >
                                <?php foreach ($field['options'] as $value => $label): ?>
                                    <option value="<?php echo esc_attr($value); ?>"><?php echo esc_html($label); ?></option>
                                <?php endforeach; ?>
                            </select>
                        
                        <?php else: ?>
                            <input 
                                type="<?php echo esc_attr($field['type']); ?>"
                                id="<?php echo esc_attr($unique_id . '-' . $field['name']); ?>"
                                name="<?php echo esc_attr($field['name']); ?>"
                                placeholder="<?php echo esc_attr($field['placeholder'] ?? ''); ?>"
                                value="<?php echo esc_attr($field['value'] ?? ''); ?>"
                                step="<?php echo esc_attr($field['step'] ?? 'any'); ?>"
                                <?php echo !empty($field['required']) ? 'required' : ''; ?>
                            />
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
                
                <button type="submit" class="youtools-submit">
                    <span class="youtools-submit-text">Generate</span>
                    <span class="youtools-spinner" style="display: none;">⏳</span>
                </button>
            </form>
            
            <div class="youtools-result" style="display: none;"></div>
            <div class="youtools-error" style="display: none;"></div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
new YouTools_Plugin();

// Register settings
add_action('admin_init', function() {
    register_setting('youtools_settings', 'youtools_api_url');
});
