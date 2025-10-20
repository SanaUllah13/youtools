(function($) {
    'use strict';

    // API endpoint mappings
    const API_ENDPOINTS = {
        'video-info': '/api/youtube/info',
        'tag-extractor': '/api/youtube/tags',
        'tag-generator': '/api/youtube/tags/generate',
        'hashtag-extractor': '/api/youtube/hashtags',
        'hashtag-generator': '/api/youtube/hashtags/generate',
        'title-generator': '/api/youtube/title/generate',
        'description-generator': '/api/youtube/description/generate',
        'channel-id-finder': '/api/youtube/channel-id',
        'video-statistics': '/api/youtube/stats',
        'money-calculator': '/api/youtube/money',
        'transcript-extractor': '/api/youtube/transcript',
        'keyword-density': '/api/seo/keyword-density',
        'meta-generator': '/api/seo/meta-tags',
        'meta-analyzer': '/api/seo/meta-analyzer',
        'adsense-calculator': '/api/seo/adsense',
        'keyword-suggestions': '/api/seo/keywords',
        'article-rewriter': '/api/seo/rewrite',
        'text-compare': '/api/tools/compare',
        'backwards-text': '/api/tools/backwards',
        'text-to-hashtags': '/api/tools/hashtags'
    };

    // Initialize all tools
    $(document).ready(function() {
        $('.youtools-container').each(function() {
            initializeTool($(this));
        });
    });

    function initializeTool($container) {
        const $form = $container.find('.youtools-form');
        const tool = $container.data('tool');

        $form.on('submit', function(e) {
            e.preventDefault();
            handleSubmit($container, tool);
        });
    }

    function handleSubmit($container, tool) {
        const $form = $container.find('.youtools-form');
        const $result = $container.find('.youtools-result');
        const $error = $container.find('.youtools-error');
        const $submitBtn = $container.find('.youtools-submit');
        const $submitText = $submitBtn.find('.youtools-submit-text');
        const $spinner = $submitBtn.find('.youtools-spinner');

        // Get form data
        const formData = {};
        $form.serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        // Show loading state
        $submitBtn.prop('disabled', true);
        $submitText.hide();
        $spinner.show();
        $result.hide();
        $error.hide();

        // Make API call
        const endpoint = API_ENDPOINTS[tool];
        const apiUrl = youtools_config.api_url + endpoint;
        
        // Determine request method and data format based on endpoint
        const method = determineMethod(tool);
        const requestData = formatRequestData(tool, formData);

        makeApiCall(apiUrl, method, requestData)
            .then(data => {
                console.log('API Response for', tool, ':', data);
                displayResult($result, data, tool);
                $result.slideDown();
            })
            .catch(error => {
                displayError($error, error);
                $error.slideDown();
            })
            .finally(() => {
                $submitBtn.prop('disabled', false);
                $submitText.show();
                $spinner.hide();
            });
    }

    function determineMethod(tool) {
        // GET requests for extractors
        const getTools = ['video-info', 'tag-extractor', 'hashtag-extractor', 'channel-id-finder', 'video-statistics', 'meta-analyzer'];
        return getTools.includes(tool) ? 'GET' : 'POST';
    }

    function formatRequestData(tool, formData) {
        // Tool-specific data formatting
        switch(tool) {
            case 'video-info':
            case 'tag-extractor':
            case 'hashtag-extractor':
            case 'video-statistics':
                return { input: formData.video_url };
            
            case 'channel-id-finder':
                return { input: formData.channel_url };
            
            case 'tag-generator':
                return {
                    title: formData.title,
                    description: formData.description || '',
                    mode: formData.mode || 'rb',
                    max: parseInt(formData.max_tags) || 20
                };
            
            case 'hashtag-generator':
                return {
                    topic: formData.topic,
                    max: parseInt(formData.max_hashtags) || 15
                };
            
            case 'title-generator':
                return {
                    topic: formData.topic,
                    mode: formData.mode || 'rb'
                };
            
            case 'description-generator':
                return {
                    title: formData.title,
                    keywords: formData.keywords || '',
                    mode: formData.mode || 'rb'
                };
            
            case 'money-calculator':
                return {
                    views: parseInt(formData.views),
                    rpmLow: parseFloat(formData.rpm_low) || 1.0,
                    rpmHigh: parseFloat(formData.rpm_high) || 3.5
                };
            
            case 'transcript-extractor':
                return {
                    videoUrl: formData.video_url,
                    language: formData.language || undefined,
                    mergeSegments: true,
                    includePlainText: true
                };
            
            case 'keyword-density':
                return { text: formData.text };
            
            case 'meta-generator':
                return {
                    title: formData.title,
                    description: formData.description,
                    keywords: formData.keywords || ''
                };
            
            case 'meta-analyzer':
                return { url: formData.url };
            
            case 'adsense-calculator':
                return {
                    pageViews: parseInt(formData.page_views),
                    ctr: parseFloat(formData.ctr) / 100 || 0.02,
                    cpc: parseFloat(formData.cpc) || 0.5
                };
            
            case 'keyword-suggestions':
                return { keyword: formData.keyword };
            
            case 'article-rewriter':
                return {
                    text: formData.text,
                    mode: formData.mode || 'rb'
                };
            
            case 'text-compare':
                return {
                    text1: formData.text1,
                    text2: formData.text2
                };
            
            case 'backwards-text':
                return { text: formData.text };
            
            case 'text-to-hashtags':
                return { text: formData.text };
            
            default:
                return formData;
        }
    }

    function makeApiCall(url, method, data) {
        if (method === 'GET') {
            // For GET requests, append data as query params
            const params = new URLSearchParams(data).toString();
            url = `${url}?${params}`;
            
            return fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => response.json());
        } else {
            // For POST requests
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => response.json());
        }
    }

    function displayResult($result, data, tool) {
        $result.empty();

        // Handle different response formats
        if (data.error) {
            throw new Error(data.error);
        }

        // Tool-specific result rendering
        switch(tool) {
            case 'video-info':
                renderVideoInfo($result, data);
                break;
            
            case 'tag-extractor':
            case 'tag-generator':
                renderTags($result, data);
                break;
            
            case 'hashtag-extractor':
            case 'hashtag-generator':
                renderHashtags($result, data);
                break;
            
            case 'title-generator':
                renderTitles($result, data);
                break;
            
            case 'description-generator':
                renderDescription($result, data);
                break;
            
            case 'channel-id-finder':
                renderChannelId($result, data);
                break;
            
            case 'video-statistics':
                renderStatistics($result, data);
                break;
            
            case 'money-calculator':
                renderMoneyCalculation($result, data);
                break;
            
            case 'transcript-extractor':
                renderTranscript($result, data);
                break;
            
            case 'keyword-density':
                renderKeywordDensity($result, data);
                break;
            
            case 'meta-generator':
                renderMetaTags($result, data);
                break;
            
            case 'meta-analyzer':
                renderMetaAnalysis($result, data);
                break;
            
            case 'adsense-calculator':
                renderAdSenseCalculation($result, data);
                break;
            
            case 'keyword-suggestions':
                renderKeywordSuggestions($result, data);
                break;
            
            case 'article-rewriter':
                renderRewrittenText($result, data);
                break;
            
            case 'text-compare':
                renderTextComparison($result, data);
                break;
            
            case 'backwards-text':
                renderBackwardsText($result, data);
                break;
            
            case 'text-to-hashtags':
                renderHashtagsFromText($result, data);
                break;
            
            default:
                renderGenericResult($result, data);
        }
    }

    function displayError($error, error) {
        $error.html(`
            <div class="youtools-error-box">
                <strong>Error:</strong> ${error.message || 'An error occurred. Please try again.'}
            </div>
        `);
    }

    // Result rendering functions
    function renderVideoInfo($result, data) {
        // Handle nested data structure
        const videoData = data.data || data;
        
        // Format duration from seconds
        const formatDuration = (seconds) => {
            if (!seconds) return 'N/A';
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };
        
        const duration = videoData.lengthSeconds ? formatDuration(videoData.lengthSeconds) : (videoData.duration || 'N/A');
        
        $result.html(`
            <div class="youtools-info-grid">
                <div class="youtools-info-item"><strong>Title:</strong> ${escapeHtml(videoData.title || 'N/A')}</div>
                <div class="youtools-info-item"><strong>Channel:</strong> ${escapeHtml(videoData.channel || videoData.channelName || videoData.author || 'N/A')}</div>
                <div class="youtools-info-item"><strong>Views:</strong> ${formatNumber(videoData.views || videoData.viewCount || 0)}</div>
                <div class="youtools-info-item"><strong>Likes:</strong> ${formatNumber(videoData.likes || videoData.likeCount || 0)}</div>
                <div class="youtools-info-item"><strong>Comments:</strong> ${formatNumber(videoData.comments || videoData.commentCount || 0)}</div>
                <div class="youtools-info-item"><strong>Duration:</strong> ${duration}</div>
                <div class="youtools-info-item"><strong>Published:</strong> ${videoData.publishDate || videoData.uploadDate || videoData.uploaded || videoData.uploadedAt || 'N/A'}</div>
                ${videoData.description ? `<div class="youtools-info-item youtools-full-width"><strong>Description:</strong><br><div style="max-height: 200px; overflow-y: auto;">${escapeHtml(videoData.description)}</div></div>` : ''}
            </div>
        `);
    }

    function renderTags($result, data) {
        const tags = data.tags || data.data?.tags || [];
        $result.html(`
            <div class="youtools-tags-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, '${tags.join(', ')}')">📋 Copy All</button>
                <div class="youtools-tags">
                    ${tags.map(tag => `<span class="youtools-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `);
    }

    function renderHashtags($result, data) {
        const hashtags = data.hashtags || data.data?.hashtags || [];
        $result.html(`
            <div class="youtools-tags-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, '${hashtags.join(' ')}')">📋 Copy All</button>
                <div class="youtools-tags">
                    ${hashtags.map(tag => `<span class="youtools-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `);
    }

    function renderTitles($result, data) {
        const titles = data.titles || data.data?.titles || [];
        $result.html(`
            <div class="youtools-list">
                ${titles.map(title => `<div class="youtools-list-item">${escapeHtml(title)}</div>`).join('')}
            </div>
        `);
    }

    function renderDescription($result, data) {
        const description = data.description || data.data?.description || '';
        $result.html(`
            <div class="youtools-text-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, \`${description.replace(/`/g, '\\`')}\`)">📋 Copy</button>
                <div class="youtools-text-content">${escapeHtml(description)}</div>
            </div>
        `);
    }

    function renderChannelId($result, data) {
        const channelId = data.channelId || data.data?.channelId || '';
        $result.html(`
            <div class="youtools-info-box">
                <strong>Channel ID:</strong> <code>${escapeHtml(channelId)}</code>
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, '${channelId}')">📋 Copy</button>
            </div>
        `);
    }

    function renderStatistics($result, data) {
        $result.html(`
            <div class="youtools-stats-grid">
                <div class="youtools-stat-card">
                    <div class="youtools-stat-value">${formatNumber(data.views)}</div>
                    <div class="youtools-stat-label">Views</div>
                </div>
                <div class="youtools-stat-card">
                    <div class="youtools-stat-value">${formatNumber(data.likes)}</div>
                    <div class="youtools-stat-label">Likes</div>
                </div>
                <div class="youtools-stat-card">
                    <div class="youtools-stat-value">${formatNumber(data.comments)}</div>
                    <div class="youtools-stat-label">Comments</div>
                </div>
            </div>
        `);
    }

    function renderMoneyCalculation($result, data) {
        $result.html(`
            <div class="youtools-money-result">
                <h4>Estimated Earnings</h4>
                <div class="youtools-money-range">
                    <div class="youtools-money-item">
                        <span class="youtools-money-label">Low Estimate:</span>
                        <span class="youtools-money-value">$${data.low?.toFixed(2) || data.data?.low?.toFixed(2)}</span>
                    </div>
                    <div class="youtools-money-item">
                        <span class="youtools-money-label">High Estimate:</span>
                        <span class="youtools-money-value">$${data.high?.toFixed(2) || data.data?.high?.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `);
    }

    function renderTranscript($result, data) {
        const transcript = data.data?.plainText || data.plainText || '';
        $result.html(`
            <div class="youtools-text-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, \`${transcript.replace(/`/g, '\\`')}\`)">📋 Copy</button>
                <div class="youtools-text-content youtools-transcript">${escapeHtml(transcript)}</div>
            </div>
        `);
    }

    function renderKeywordDensity($result, data) {
        const keywords = data.data?.keywords || data.keywords || [];
        $result.html(`
            <table class="youtools-table">
                <thead>
                    <tr>
                        <th>Keyword</th>
                        <th>Count</th>
                        <th>Density</th>
                    </tr>
                </thead>
                <tbody>
                    ${keywords.slice(0, 20).map(kw => `
                        <tr>
                            <td>${escapeHtml(kw.word)}</td>
                            <td>${kw.count}</td>
                            <td>${(kw.density * 100).toFixed(2)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `);
    }

    function renderMetaTags($result, data) {
        const meta = data.data || data;
        $result.html(`
            <div class="youtools-code-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, \`${meta.html?.replace(/`/g, '\\`')}\`)">📋 Copy HTML</button>
                <pre><code>${escapeHtml(meta.html || '')}</code></pre>
            </div>
        `);
    }

    function renderMetaAnalysis($result, data) {
        const analysis = data.data || data;
        $result.html(`
            <div class="youtools-analysis">
                <h4>Meta Tags Analysis</h4>
                ${analysis.title ? `<p><strong>Title:</strong> ${escapeHtml(analysis.title)} (${analysis.title.length} chars)</p>` : ''}
                ${analysis.description ? `<p><strong>Description:</strong> ${escapeHtml(analysis.description)} (${analysis.description.length} chars)</p>` : ''}
                ${analysis.keywords ? `<p><strong>Keywords:</strong> ${escapeHtml(analysis.keywords)}</p>` : ''}
            </div>
        `);
    }

    function renderAdSenseCalculation($result, data) {
        $result.html(`
            <div class="youtools-money-result">
                <h4>Estimated Monthly Revenue</h4>
                <div class="youtools-money-value-large">$${data.revenue?.toFixed(2) || data.data?.revenue?.toFixed(2)}</div>
                <p class="youtools-note">Based on ${formatNumber(data.clicks || data.data?.clicks)} estimated clicks</p>
            </div>
        `);
    }

    function renderKeywordSuggestions($result, data) {
        const suggestions = data.suggestions || data.data?.suggestions || [];
        $result.html(`
            <div class="youtools-list">
                ${suggestions.map(kw => `<div class="youtools-list-item">${escapeHtml(kw)}</div>`).join('')}
            </div>
        `);
    }

    function renderRewrittenText($result, data) {
        const rewritten = data.rewritten || data.data?.rewritten || '';
        $result.html(`
            <div class="youtools-text-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, \`${rewritten.replace(/`/g, '\\`')}\`)">📋 Copy</button>
                <div class="youtools-text-content">${escapeHtml(rewritten)}</div>
            </div>
        `);
    }

    function renderTextComparison($result, data) {
        $result.html(`
            <div class="youtools-diff">
                <h4>Differences:</h4>
                <pre>${data.diff || data.data?.diff || 'No differences found'}</pre>
            </div>
        `);
    }

    function renderBackwardsText($result, data) {
        const reversed = data.reversed || data.data?.reversed || '';
        $result.html(`
            <div class="youtools-text-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, '${reversed}')">📋 Copy</button>
                <div class="youtools-text-content youtools-reversed">${escapeHtml(reversed)}</div>
            </div>
        `);
    }

    function renderHashtagsFromText($result, data) {
        const hashtags = data.hashtags || data.data?.hashtags || [];
        $result.html(`
            <div class="youtools-tags-box">
                <button class="youtools-copy-btn" onclick="copyToClipboard(this, '${hashtags.join(' ')}')">📋 Copy All</button>
                <div class="youtools-tags">
                    ${hashtags.map(tag => `<span class="youtools-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `);
    }

    function renderGenericResult($result, data) {
        $result.html(`
            <pre class="youtools-json">${JSON.stringify(data, null, 2)}</pre>
        `);
    }

    // Utility functions
    function formatNumber(num) {
        if (!num) return '0';
        return parseInt(num).toLocaleString();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Global copy function
    window.copyToClipboard = function(button, text) {
        navigator.clipboard.writeText(text).then(() => {
            const $btn = $(button);
            const originalText = $btn.text();
            $btn.text('✓ Copied!');
            setTimeout(() => {
                $btn.text(originalText);
            }, 2000);
        });
    };

})(jQuery);
