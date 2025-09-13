/**
 * PSE Platform Data Bridge Lambda Function
 * Phase 2, Item 7 - Cross-system data integration
 *
 * This Lambda provides read-only access to Content-AI tables and
 * read-write access to PSE Platform tables.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand, ScanCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-west-2' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION || 'us-west-2'
});

// Table configurations
const CONTENT_AI_TABLES = {
    BLOG_CONTENT: 'blog-content-pipeline',
    POST_TRACKING: 'post-publish-tracking',
    ARTICLE_LOCKS: 'article-publishing-locks'
};

const PSE_TABLES = {
    KEYWORDS: process.env.KEYWORDS_TABLE || 'pse-keyword-intelligence-production',
    CAMPAIGNS: process.env.CAMPAIGNS_TABLE || 'pse-campaigns-production',
    METRICS: process.env.METRICS_TABLE || 'pse-performance-metrics-production',
    REVENUE: process.env.REVENUE_TABLE || 'pse-revenue-attribution-production',
    CONTENT_MAP: process.env.CONTENT_MAP_TABLE || 'pse-content-mapping-production'
};

// Bedrock configuration
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-opus-4-1-20250805-v1:0';

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));

    try {
        const { operation, parameters = {} } = event;

        if (!operation) {
            return createResponse(400, { error: 'Operation is required' });
        }

        let result;

        switch (operation) {
            case 'getPublishedContent':
                result = await getPublishedContent(parameters);
                break;

            case 'analyzeContentForCampaigns':
                result = await analyzeContentForCampaigns(parameters);
                break;

            case 'syncContentToKeywords':
                result = await syncContentToKeywords(parameters);
                break;

            case 'getPerformanceMetrics':
                result = await getPerformanceMetrics(parameters);
                break;

            case 'correlateRevenueData':
                result = await correlateRevenueData(parameters);
                break;

            case 'findHighValueContent':
                result = await findHighValueContent(parameters);
                break;

            case 'updateContentMapping':
                result = await updateContentMapping(parameters);
                break;

            case 'healthCheck':
                result = await healthCheck();
                break;

            default:
                return createResponse(400, { error: `Unknown operation: ${operation}` });
        }

        return createResponse(200, result);

    } catch (error) {
        console.error('Error processing request:', error);
        return createResponse(500, {
            error: 'Internal server error',
            message: error.message
        });
    }
};

/**
 * Get published content from Content-AI system
 */
async function getPublishedContent(params) {
    const { status = 'published', limit = 100 } = params;

    try {
        const response = await docClient.send(new ScanCommand({
            TableName: CONTENT_AI_TABLES.POST_TRACKING,
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status
            },
            Limit: limit
        }));

        return {
            success: true,
            count: response.Items.length,
            items: response.Items
        };
    } catch (error) {
        console.error('Error getting published content:', error);
        throw error;
    }
}

/**
 * Analyze content for campaign potential using AI
 */
async function analyzeContentForCampaigns(params) {
    const { contentId, content, keywords = [] } = params;

    if (!contentId && !content) {
        throw new Error('Either contentId or content is required');
    }

    let contentText = content;

    // Fetch content if only ID provided
    if (contentId && !content) {
        const response = await docClient.send(new GetCommand({
            TableName: CONTENT_AI_TABLES.BLOG_CONTENT,
            Key: { contentId }
        }));

        if (!response.Item) {
            throw new Error(`Content not found: ${contentId}`);
        }

        contentText = response.Item.content;
    }

    // Prepare AI prompt
    const prompt = `Analyze this content for Google Ads campaign potential:

Content: ${contentText.substring(0, 2000)}
Keywords: ${keywords.join(', ')}

Provide analysis in JSON format with:
1. campaign_potential (0-100 score)
2. suggested_keywords (array of high-CPC keywords)
3. estimated_cpc_range (min and max in GBP)
4. campaign_type (search/display/both)
5. targeting_suggestions (demographics, interests)
6. ad_copy_suggestions (3 headline ideas)`;

    // Call Bedrock
    const command = new InvokeModelCommand({
        modelId: BEDROCK_MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            messages: [{
                role: "user",
                content: prompt
            }]
        })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Parse AI response
    let analysis;
    try {
        const content = responseBody.content[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (e) {
        console.error('Error parsing AI response:', e);
        analysis = { error: 'Failed to parse AI response' };
    }

    return {
        success: true,
        contentId,
        analysis,
        timestamp: new Date().toISOString()
    };
}

/**
 * Sync existing content to keyword opportunities
 */
async function syncContentToKeywords(params) {
    const { dryRun = false } = params;

    // Get all published content
    const contentResponse = await docClient.send(new ScanCommand({
        TableName: CONTENT_AI_TABLES.POST_TRACKING,
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': 'published' }
    }));

    // Get all keywords
    const keywordsResponse = await docClient.send(new ScanCommand({
        TableName: PSE_TABLES.KEYWORDS
    }));

    const matches = [];

    // Match content to keywords
    for (const content of contentResponse.Items) {
        for (const keyword of keywordsResponse.Items) {
            const matchScore = calculateMatchScore(content, keyword);

            if (matchScore > 70) {
                matches.push({
                    contentId: content.contentId,
                    keywordId: keyword.keywordId,
                    matchScore,
                    content: content.title,
                    keyword: keyword.keyword
                });

                // Update mapping if not dry run
                if (!dryRun) {
                    await docClient.send(new PutCommand({
                        TableName: PSE_TABLES.CONTENT_MAP,
                        Item: {
                            mappingId: `${content.contentId}-${keyword.keywordId}`,
                            contentId: content.contentId,
                            keywordId: keyword.keywordId,
                            matchScore,
                            createdAt: new Date().toISOString(),
                            status: 'active'
                        }
                    }));
                }
            }
        }
    }

    return {
        success: true,
        dryRun,
        contentCount: contentResponse.Items.length,
        keywordCount: keywordsResponse.Items.length,
        matchesFound: matches.length,
        matches: matches.slice(0, 10) // Return first 10 matches
    };
}

/**
 * Get aggregated performance metrics
 */
async function getPerformanceMetrics(params) {
    const { startDate, endDate, entityType = 'content' } = params;

    if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required');
    }

    const response = await docClient.send(new QueryCommand({
        TableName: PSE_TABLES.METRICS,
        KeyConditionExpression: 'entityType = :type AND #date BETWEEN :start AND :end',
        ExpressionAttributeNames: {
            '#date': 'date'
        },
        ExpressionAttributeValues: {
            ':type': entityType,
            ':start': startDate,
            ':end': endDate
        }
    }));

    // Aggregate metrics
    const aggregated = response.Items.reduce((acc, item) => {
        acc.impressions += item.impressions || 0;
        acc.clicks += item.clicks || 0;
        acc.conversions += item.conversions || 0;
        acc.revenue += item.revenue || 0;
        acc.cost += item.cost || 0;
        return acc;
    }, {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        cost: 0
    });

    // Calculate derived metrics
    aggregated.ctr = aggregated.impressions > 0 ?
        (aggregated.clicks / aggregated.impressions * 100).toFixed(2) : 0;
    aggregated.conversionRate = aggregated.clicks > 0 ?
        (aggregated.conversions / aggregated.clicks * 100).toFixed(2) : 0;
    aggregated.roi = aggregated.cost > 0 ?
        ((aggregated.revenue - aggregated.cost) / aggregated.cost * 100).toFixed(2) : 0;

    return {
        success: true,
        period: { startDate, endDate },
        metrics: aggregated,
        dataPoints: response.Items.length
    };
}

/**
 * Correlate revenue across different sources
 */
async function correlateRevenueData(params) {
    const { date, source = 'all' } = params;

    if (!date) {
        throw new Error('Date is required');
    }

    const response = await docClient.send(new QueryCommand({
        TableName: PSE_TABLES.REVENUE,
        KeyConditionExpression: '#date = :date',
        ExpressionAttributeNames: {
            '#date': 'date'
        },
        ExpressionAttributeValues: {
            ':date': date
        }
    }));

    let items = response.Items;

    // Filter by source if specified
    if (source !== 'all') {
        items = items.filter(item => item.source === source);
    }

    // Group by source
    const bySource = items.reduce((acc, item) => {
        if (!acc[item.source]) {
            acc[item.source] = {
                revenue: 0,
                transactions: 0,
                items: []
            };
        }
        acc[item.source].revenue += item.revenue || 0;
        acc[item.source].transactions += 1;
        acc[item.source].items.push(item);
        return acc;
    }, {});

    return {
        success: true,
        date,
        totalRevenue: items.reduce((sum, item) => sum + (item.revenue || 0), 0),
        sources: bySource,
        correlations: analyzeCorrelations(items)
    };
}

/**
 * Find high-value content based on ROI
 */
async function findHighValueContent(params) {
    const { minROI = 100, limit = 20 } = params;

    // Get content mappings
    const mappings = await docClient.send(new ScanCommand({
        TableName: PSE_TABLES.CONTENT_MAP
    }));

    // Get performance metrics for each content
    const contentMetrics = [];

    for (const mapping of mappings.Items) {
        const metrics = await docClient.send(new QueryCommand({
            TableName: PSE_TABLES.METRICS,
            KeyConditionExpression: 'entityId = :id',
            ExpressionAttributeValues: {
                ':id': mapping.contentId
            },
            Limit: 30 // Last 30 days
        }));

        if (metrics.Items.length > 0) {
            const aggregated = metrics.Items.reduce((acc, item) => {
                acc.revenue += item.revenue || 0;
                acc.cost += item.cost || 0;
                acc.clicks += item.clicks || 0;
                return acc;
            }, { revenue: 0, cost: 0, clicks: 0 });

            const roi = aggregated.cost > 0 ?
                ((aggregated.revenue - aggregated.cost) / aggregated.cost * 100) : 0;

            if (roi >= minROI) {
                contentMetrics.push({
                    contentId: mapping.contentId,
                    roi: roi.toFixed(2),
                    revenue: aggregated.revenue,
                    cost: aggregated.cost,
                    clicks: aggregated.clicks
                });
            }
        }
    }

    // Sort by ROI descending
    contentMetrics.sort((a, b) => b.roi - a.roi);

    return {
        success: true,
        minROI,
        count: contentMetrics.length,
        items: contentMetrics.slice(0, limit)
    };
}

/**
 * Update content-to-campaign mapping
 */
async function updateContentMapping(params) {
    const { contentId, mappingType, campaignId, matchScore } = params;

    if (!contentId || !mappingType) {
        throw new Error('contentId and mappingType are required');
    }

    const item = {
        mappingId: `${contentId}-${campaignId || 'manual'}`,
        contentId,
        mappingType,
        matchScore: matchScore || 0,
        updatedAt: new Date().toISOString(),
        status: 'active'
    };

    if (campaignId) {
        item.campaignId = campaignId;
    }

    await docClient.send(new PutCommand({
        TableName: PSE_TABLES.CONTENT_MAP,
        Item: item
    }));

    return {
        success: true,
        mapping: item
    };
}

/**
 * Health check operation
 */
async function healthCheck() {
    const checks = {
        dynamodb: false,
        bedrock: false,
        tables: {}
    };

    // Check DynamoDB access
    try {
        await docClient.send(new ScanCommand({
            TableName: CONTENT_AI_TABLES.BLOG_CONTENT,
            Limit: 1
        }));
        checks.dynamodb = true;
    } catch (error) {
        console.error('DynamoDB check failed:', error);
    }

    // Check table access
    for (const [name, tableName] of Object.entries({ ...CONTENT_AI_TABLES, ...PSE_TABLES })) {
        try {
            await docClient.send(new ScanCommand({
                TableName: tableName,
                Limit: 1
            }));
            checks.tables[tableName] = true;
        } catch (error) {
            checks.tables[tableName] = false;
        }
    }

    // Check Bedrock access
    try {
        const command = new InvokeModelCommand({
            modelId: BEDROCK_MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 10,
                messages: [{
                    role: "user",
                    content: "test"
                }]
            })
        });
        await bedrockClient.send(command);
        checks.bedrock = true;
    } catch (error) {
        console.error('Bedrock check failed:', error);
    }

    return {
        success: true,
        healthy: checks.dynamodb && checks.bedrock,
        checks,
        environment: {
            region: process.env.AWS_REGION || 'eu-west-2',
            bedrockRegion: process.env.BEDROCK_REGION || 'us-west-2',
            bedrockModel: BEDROCK_MODEL_ID
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * Helper function to calculate match score between content and keyword
 */
function calculateMatchScore(content, keyword) {
    const contentText = `${content.title} ${content.description || ''}`.toLowerCase();
    const keywordText = keyword.keyword.toLowerCase();

    // Simple scoring algorithm
    let score = 0;

    // Exact match in title
    if (content.title && content.title.toLowerCase().includes(keywordText)) {
        score += 50;
    }

    // Partial matches
    const keywordWords = keywordText.split(' ');
    for (const word of keywordWords) {
        if (contentText.includes(word)) {
            score += 10;
        }
    }

    // Category match
    if (content.category && keyword.category &&
        content.category.toLowerCase() === keyword.category.toLowerCase()) {
        score += 20;
    }

    return Math.min(score, 100);
}

/**
 * Helper function to analyze correlations in revenue data
 */
function analyzeCorrelations(items) {
    // Simple correlation analysis
    const correlations = {
        topSource: null,
        averageRevenue: 0,
        peakHour: null
    };

    if (items.length === 0) return correlations;

    // Find top revenue source
    const sourceRevenue = {};
    items.forEach(item => {
        sourceRevenue[item.source] = (sourceRevenue[item.source] || 0) + item.revenue;
    });

    correlations.topSource = Object.entries(sourceRevenue)
        .sort((a, b) => b[1] - a[1])[0];

    // Calculate average
    correlations.averageRevenue = items.reduce((sum, item) => sum + item.revenue, 0) / items.length;

    return correlations;
}

/**
 * Helper function to create standardized responses
 */
function createResponse(statusCode, body) {
    return {
        statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
}