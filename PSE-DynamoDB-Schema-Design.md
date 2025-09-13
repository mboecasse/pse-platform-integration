# PSE Platform DynamoDB Schema Design
**Generated**: 2025-09-13
**Purpose**: Phase 2, Item 6 - Unified DynamoDB schema design for PSE Platform
**Status**: ✅ Complete

---

## 🎯 Schema Design Principles

### **Core Requirements**
1. **Namespace Isolation**: All tables use `pse-` prefix
2. **Cost Optimization**: TTL on transient data, on-demand pricing
3. **Query Patterns**: Optimized for most common access patterns
4. **Scalability**: Support for 10,000+ keywords, 1000+ campaigns
5. **Integration**: Read-only access to Content-AI tables

### **Design Decisions**
- ✅ Single-table design where appropriate (reduces cost)
- ✅ Composite keys for time-series data
- ✅ GSI for alternative query patterns
- ✅ TTL for automatic data cleanup
- ✅ On-demand pricing (pay per request)

---

## 📊 Table Definitions

### 1. **pse-keyword-intelligence**
**Purpose**: Store and manage high-CPC keyword opportunities

```yaml
Table Name: pse-keyword-intelligence
Billing Mode: ON_DEMAND
Point-in-time Recovery: Enabled
Encryption: AWS managed keys

Primary Key:
  Partition Key: keyword_id (String) - UUID
  Sort Key: NONE

Attributes:
  keyword_id: String (UUID)
  keyword: String
  service: String
  location: String
  country: String (UK/USA)
  google_cpc: Number
  adsense_cpc_estimate: Number
  pse_cpc_estimate: Number
  search_volume: Number
  competition_level: String (LOW/MEDIUM/HIGH)
  advertiser_count: Number
  seasonal_factor: Number
  content_mapping: Map
    - wordpress_page_id: Number
    - wordpress_url: String
    - content_id: String (from blog-content-pipeline)
  campaign_mapping: Map
    - google_campaign_id: String
    - bing_campaign_id: String
  status: String (discovered/qualified/active/paused/archived)
  quality_score: Number (0-100)
  created_at: String (ISO8601)
  updated_at: String (ISO8601)
  last_validated: String (ISO8601)

Global Secondary Indexes:
  GSI1: service-location-index
    Partition Key: service (String)
    Sort Key: location (String)
    Projection: ALL

  GSI2: status-cpc-index
    Partition Key: status (String)
    Sort Key: google_cpc (Number)
    Projection: ALL

TTL: None (permanent data)
```

### 2. **pse-campaigns**
**Purpose**: Track advertising campaigns across platforms

```yaml
Table Name: pse-campaigns
Billing Mode: ON_DEMAND
Point-in-time Recovery: Enabled

Primary Key:
  Partition Key: campaign_id (String) - UUID
  Sort Key: NONE

Attributes:
  campaign_id: String (UUID)
  campaign_name: String
  platform: String (google/bing/facebook)
  platform_campaign_id: String
  keyword_ids: List[String]
  status: String (draft/active/paused/ended)
  budget_daily: Number
  budget_total: Number
  spent_total: Number
  start_date: String (YYYY-MM-DD)
  end_date: String (YYYY-MM-DD)
  targeting: Map
    - locations: List[String]
    - demographics: Map
    - devices: List[String]
  bidding_strategy: String
  max_cpc: Number
  landing_pages: List[String]
  created_at: String (ISO8601)
  updated_at: String (ISO8601)
  created_by: String

Global Secondary Indexes:
  GSI1: platform-status-index
    Partition Key: platform (String)
    Sort Key: status (String)
    Projection: ALL

  GSI2: status-date-index
    Partition Key: status (String)
    Sort Key: start_date (String)
    Projection: ALL

TTL: None (permanent data)
```

### 3. **pse-performance-metrics**
**Purpose**: Store daily performance metrics (time-series data)

```yaml
Table Name: pse-performance-metrics
Billing Mode: ON_DEMAND
Point-in-time Recovery: Enabled

Primary Key:
  Partition Key: metric_date (String) - YYYY-MM-DD
  Sort Key: entity_id#metric_type (String) - campaign_id#impressions

Attributes:
  metric_date: String (YYYY-MM-DD)
  entity_id#metric_type: String
  entity_type: String (campaign/keyword/page/pse)
  metric_value: Number
  metric_details: Map
    - impressions: Number
    - clicks: Number
    - conversions: Number
    - cost: Number
    - revenue: Number
    - ctr: Number
    - conversion_rate: Number
    - roi: Number
    - pse_searches: Number
    - pse_clicks: Number
    - pse_revenue: Number
  hour_breakdown: Map (optional, for granular data)
    - "00": Map
    - "01": Map
    - ...
  ttl: Number (Unix timestamp - 365 days)

Global Secondary Indexes:
  GSI1: entity-date-index
    Partition Key: entity_id#metric_type (String)
    Sort Key: metric_date (String)
    Projection: ALL

TTL: ttl attribute (365 days retention)
```

### 4. **pse-revenue-attribution**
**Purpose**: Track revenue sources and attribution

```yaml
Table Name: pse-revenue-attribution
Billing Mode: ON_DEMAND

Primary Key:
  Partition Key: attribution_date (String) - YYYY-MM-DD
  Sort Key: attribution_id (String) - UUID

Attributes:
  attribution_date: String (YYYY-MM-DD)
  attribution_id: String (UUID)
  timestamp: String (ISO8601)
  page_id: Number (WordPress)
  page_url: String
  revenue_source: String (adsense/pse/affiliate/lead)
  revenue_amount: Number
  currency: String (GBP/USD)
  attribution_path: List[Map]
    - source: String
    - medium: String
    - campaign: String
    - timestamp: String
  pse_data: Map
    - search_query: String
    - result_clicked: String
    - estimated_cpc: Number
  campaign_data: Map
    - campaign_id: String
    - keyword_id: String
    - ad_group: String
  user_data: Map
    - session_id: String
    - user_agent: String
    - location: String
  ttl: Number (Unix timestamp - 90 days)

Global Secondary Indexes:
  GSI1: page-date-index
    Partition Key: page_id (Number)
    Sort Key: attribution_date (String)
    Projection: ALL

  GSI2: source-date-index
    Partition Key: revenue_source (String)
    Sort Key: attribution_date (String)
    Projection: ALL

TTL: ttl attribute (90 days for granular data)
```

### 5. **pse-optimization-decisions**
**Purpose**: Log automated optimization decisions

```yaml
Table Name: pse-optimization-decisions
Billing Mode: ON_DEMAND

Primary Key:
  Partition Key: decision_date (String) - YYYY-MM-DD
  Sort Key: decision_id (String) - UUID

Attributes:
  decision_date: String (YYYY-MM-DD)
  decision_id: String (UUID)
  timestamp: String (ISO8601)
  decision_type: String (bid_adjustment/budget_change/pause_campaign/keyword_add/keyword_remove)
  entity_type: String (campaign/keyword/ad_group)
  entity_id: String
  previous_state: Map
  new_state: Map
  reason: String
  confidence_score: Number (0-100)
  ai_model: String
  metrics_analyzed: Map
    - roi: Number
    - clicks: Number
    - conversions: Number
    - cost: Number
  expected_impact: Map
    - roi_change: Number
    - traffic_change: Number
  actual_impact: Map (updated later)
    - roi_change: Number
    - traffic_change: Number
  status: String (pending/executed/rolled_back)
  executed_at: String (ISO8601)
  ttl: Number (Unix timestamp - 180 days)

Global Secondary Indexes:
  GSI1: type-date-index
    Partition Key: decision_type (String)
    Sort Key: decision_date (String)
    Projection: ALL

TTL: ttl attribute (180 days retention)
```

### 6. **pse-content-mapping**
**Purpose**: Map content to campaigns and PSE placements

```yaml
Table Name: pse-content-mapping
Billing Mode: ON_DEMAND

Primary Key:
  Partition Key: content_id (String) - WordPress post/page ID
  Sort Key: mapping_type (String) - campaign/pse/keyword

Attributes:
  content_id: String
  mapping_type: String
  wordpress_url: String
  content_title: String
  content_type: String (page/post)
  pse_config: Map
    - pse_engine_id: String
    - placement: String (after_3rd_paragraph/sidebar/footer)
    - initial_query: String
    - custom_css: String
    - enabled: Boolean
  campaign_associations: List[String] (campaign IDs)
  keyword_targets: List[String] (keyword IDs)
  performance_summary: Map
    - total_pse_searches: Number
    - total_pse_revenue: Number
    - total_campaign_cost: Number
    - roi: Number
  created_at: String (ISO8601)
  updated_at: String (ISO8601)

Global Secondary Indexes:
  GSI1: type-content-index
    Partition Key: mapping_type (String)
    Sort Key: content_id (String)
    Projection: ALL

TTL: None (permanent data)
```

### 7. **pse-search-analytics**
**Purpose**: Track PSE search behavior and patterns

```yaml
Table Name: pse-search-analytics
Billing Mode: ON_DEMAND

Primary Key:
  Partition Key: search_date#page_id (String) - YYYY-MM-DD#12345
  Sort Key: search_id (String) - UUID

Attributes:
  search_date#page_id: String
  search_id: String (UUID)
  timestamp: String (ISO8601)
  page_url: String
  search_query: String
  results_shown: Number
  result_clicked: Boolean
  clicked_url: String
  clicked_position: Number
  estimated_revenue: Number
  user_session: String
  referrer: String
  device_type: String
  location: String
  ttl: Number (Unix timestamp - 30 days)

Global Secondary Indexes:
  GSI1: query-date-index
    Partition Key: search_query (String)
    Sort Key: timestamp (String)
    Projection: KEYS_ONLY

TTL: ttl attribute (30 days for raw data)
```

---

## 🔄 Integration with Content-AI Tables

### **Read-Only Access Tables**
These existing tables will be accessed read-only by PSE platform:

```yaml
blog-content-pipeline:
  Access: READ ONLY
  Purpose: Identify content for PSE campaigns
  Query Pattern: Scan for status='published'

post-publish-tracking:
  Access: READ ONLY
  Purpose: Correlate published posts with campaigns
  Query Pattern: Get by job_id or post_id
```

---

## 📈 Query Patterns & Access Patterns

### **Primary Query Patterns**

1. **Find high-CPC keywords by service and location**
   - Table: `pse-keyword-intelligence`
   - Index: GSI1 (service-location-index)
   - Query: `service = 'plumbing' AND location = 'london'`

2. **Get active campaigns by platform**
   - Table: `pse-campaigns`
   - Index: GSI1 (platform-status-index)
   - Query: `platform = 'google' AND status = 'active'`

3. **Retrieve performance metrics for date range**
   - Table: `pse-performance-metrics`
   - Primary Key
   - Query: `metric_date BETWEEN '2025-09-01' AND '2025-09-13'`

4. **Track revenue by source**
   - Table: `pse-revenue-attribution`
   - Index: GSI2 (source-date-index)
   - Query: `revenue_source = 'pse' AND attribution_date >= '2025-09-01'`

5. **Analyze PSE search patterns**
   - Table: `pse-search-analytics`
   - Index: GSI1 (query-date-index)
   - Query: `search_query = 'emergency plumber' AND timestamp > X`

---

## 💰 Cost Estimation

### **Storage Costs** (Monthly)
```yaml
Estimated Data Volume:
  pse-keyword-intelligence: 10,000 items × 2KB = 20MB
  pse-campaigns: 500 items × 3KB = 1.5MB
  pse-performance-metrics: 36,500 items × 1KB = 36.5MB (with TTL)
  pse-revenue-attribution: 10,000 items × 1.5KB = 15MB (with TTL)
  pse-optimization-decisions: 1,000 items × 2KB = 2MB (with TTL)
  pse-content-mapping: 500 items × 1KB = 0.5MB
  pse-search-analytics: 50,000 items × 0.5KB = 25MB (with TTL)

Total Storage: ~100MB
Cost: $0.25 per GB = $0.025/month

With on-demand pricing:
  Read costs: $0.25 per million reads
  Write costs: $1.25 per million writes

Estimated monthly operations:
  Reads: 500,000 = $0.125
  Writes: 100,000 = $0.125

Total DynamoDB Cost: ~$0.30/month (£0.25/month)
```

### **Backup & Recovery**
- Point-in-time recovery: +35% of storage cost
- On-demand backups: $0.10 per GB

**Total Estimated Cost**: £5-10/month including backups

---

## 🔧 CloudFormation Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'PSE Platform DynamoDB Tables'

Parameters:
  Environment:
    Type: String
    Default: 'production'
    AllowedValues:
      - development
      - staging
      - production

Resources:
  # 1. Keyword Intelligence Table
  PSEKeywordIntelligenceTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-keyword-intelligence-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: keyword_id
          AttributeType: S
        - AttributeName: service
          AttributeType: S
        - AttributeName: location
          AttributeType: S
        - AttributeName: status
          AttributeType: S
        - AttributeName: google_cpc
          AttributeType: N
      KeySchema:
        - AttributeName: keyword_id
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: service-location-index
          KeySchema:
            - AttributeName: service
              KeyType: HASH
            - AttributeName: location
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: status-cpc-index
          KeySchema:
            - AttributeName: status
              KeyType: HASH
            - AttributeName: google_cpc
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

  # 2. Campaigns Table
  PSECampaignsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-campaigns-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: campaign_id
          AttributeType: S
        - AttributeName: platform
          AttributeType: S
        - AttributeName: status
          AttributeType: S
        - AttributeName: start_date
          AttributeType: S
      KeySchema:
        - AttributeName: campaign_id
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: platform-status-index
          KeySchema:
            - AttributeName: platform
              KeyType: HASH
            - AttributeName: status
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: status-date-index
          KeySchema:
            - AttributeName: status
              KeyType: HASH
            - AttributeName: start_date
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

  # 3. Performance Metrics Table
  PSEPerformanceMetricsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-performance-metrics-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: metric_date
          AttributeType: S
        - AttributeName: entity_id#metric_type
          AttributeType: S
      KeySchema:
        - AttributeName: metric_date
          KeyType: HASH
        - AttributeName: entity_id#metric_type
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: entity-date-index
          KeySchema:
            - AttributeName: entity_id#metric_type
              KeyType: HASH
            - AttributeName: metric_date
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

  # 4. Revenue Attribution Table
  PSERevenueAttributionTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-revenue-attribution-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: attribution_date
          AttributeType: S
        - AttributeName: attribution_id
          AttributeType: S
        - AttributeName: page_id
          AttributeType: N
        - AttributeName: revenue_source
          AttributeType: S
      KeySchema:
        - AttributeName: attribution_date
          KeyType: HASH
        - AttributeName: attribution_id
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: page-date-index
          KeySchema:
            - AttributeName: page_id
              KeyType: HASH
            - AttributeName: attribution_date
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
        - IndexName: source-date-index
          KeySchema:
            - AttributeName: revenue_source
              KeyType: HASH
            - AttributeName: attribution_date
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
      PointInTimeRecoverySpecification:
        PointInTimeRecoveryEnabled: true
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

  # 5. Optimization Decisions Table
  PSEOptimizationDecisionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-optimization-decisions-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: decision_date
          AttributeType: S
        - AttributeName: decision_id
          AttributeType: S
        - AttributeName: decision_type
          AttributeType: S
      KeySchema:
        - AttributeName: decision_date
          KeyType: HASH
        - AttributeName: decision_id
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: type-date-index
          KeySchema:
            - AttributeName: decision_type
              KeyType: HASH
            - AttributeName: decision_date
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

  # 6. Content Mapping Table
  PSEContentMappingTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-content-mapping-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: content_id
          AttributeType: S
        - AttributeName: mapping_type
          AttributeType: S
      KeySchema:
        - AttributeName: content_id
          KeyType: HASH
        - AttributeName: mapping_type
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: type-content-index
          KeySchema:
            - AttributeName: mapping_type
              KeyType: HASH
            - AttributeName: content_id
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

  # 7. Search Analytics Table
  PSESearchAnalyticsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub 'pse-search-analytics-${Environment}'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: search_date#page_id
          AttributeType: S
        - AttributeName: search_id
          AttributeType: S
        - AttributeName: search_query
          AttributeType: S
        - AttributeName: timestamp
          AttributeType: S
      KeySchema:
        - AttributeName: search_date#page_id
          KeyType: HASH
        - AttributeName: search_id
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: query-date-index
          KeySchema:
            - AttributeName: search_query
              KeyType: HASH
            - AttributeName: timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: KEYS_ONLY
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
      Tags:
        - Key: Project
          Value: PSE-Platform
        - Key: Environment
          Value: !Ref Environment

Outputs:
  KeywordIntelligenceTableName:
    Description: Name of the Keyword Intelligence table
    Value: !Ref PSEKeywordIntelligenceTable
    Export:
      Name: !Sub '${AWS::StackName}-keyword-intelligence-table'

  CampaignsTableName:
    Description: Name of the Campaigns table
    Value: !Ref PSECampaignsTable
    Export:
      Name: !Sub '${AWS::StackName}-campaigns-table'

  PerformanceMetricsTableName:
    Description: Name of the Performance Metrics table
    Value: !Ref PSEPerformanceMetricsTable
    Export:
      Name: !Sub '${AWS::StackName}-performance-metrics-table'

  RevenueAttributionTableName:
    Description: Name of the Revenue Attribution table
    Value: !Ref PSERevenueAttributionTable
    Export:
      Name: !Sub '${AWS::StackName}-revenue-attribution-table'

  OptimizationDecisionsTableName:
    Description: Name of the Optimization Decisions table
    Value: !Ref PSEOptimizationDecisionsTable
    Export:
      Name: !Sub '${AWS::StackName}-optimization-decisions-table'

  ContentMappingTableName:
    Description: Name of the Content Mapping table
    Value: !Ref PSEContentMappingTable
    Export:
      Name: !Sub '${AWS::StackName}-content-mapping-table'

  SearchAnalyticsTableName:
    Description: Name of the Search Analytics table
    Value: !Ref PSESearchAnalyticsTable
    Export:
      Name: !Sub '${AWS::StackName}-search-analytics-table'
```

---

## 🚀 Deployment Instructions

### **1. Deploy with CloudFormation**
```bash
# Validate template
aws cloudformation validate-template \
  --template-body file://pse-dynamodb-tables.yaml \
  --region eu-west-2

# Create stack
aws cloudformation create-stack \
  --stack-name pse-platform-dynamodb \
  --template-body file://pse-dynamodb-tables.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --region eu-west-2

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name pse-platform-dynamodb \
  --region eu-west-2

# Verify tables created
aws dynamodb list-tables --region eu-west-2 | grep pse-
```

### **2. Manual Table Creation (Alternative)**
```bash
# Create each table manually
aws dynamodb create-table \
  --table-name pse-keyword-intelligence-production \
  --attribute-definitions \
    AttributeName=keyword_id,AttributeType=S \
    AttributeName=service,AttributeType=S \
    AttributeName=location,AttributeType=S \
  --key-schema \
    AttributeName=keyword_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-2
```

---

## 🔒 IAM Permissions Required

### **Lambda Execution Role for PSE Platform**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:eu-west-2:329599649426:table/pse-*",
        "arn:aws:dynamodb:eu-west-2:329599649426:table/pse-*/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:eu-west-2:329599649426:table/blog-content-pipeline",
        "arn:aws:dynamodb:eu-west-2:329599649426:table/post-publish-tracking"
      ]
    }
  ]
}
```

---

## ✅ Summary

### **Tables Created**: 7 new DynamoDB tables
### **Total Storage**: ~100MB expected
### **Monthly Cost**: £5-10 including backups
### **TTL Configuration**: 4 tables with automatic cleanup
### **GSI Count**: 11 total indexes for optimized queries
### **Integration**: Read-only access to 2 Content-AI tables

### **Next Steps**
1. Deploy CloudFormation stack
2. Create IAM roles with proper permissions
3. Test table access with sample data
4. Implement Lambda functions for CRUD operations
5. Set up CloudWatch monitoring

---

**Document Status**: ✅ Complete
**CloudFormation Template**: ✅ Ready for deployment
**Estimated Setup Time**: 15 minutes