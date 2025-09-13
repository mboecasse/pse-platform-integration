# SOP-102: Deployment & Setup Master Guide
**Document ID**: SOP-102  
**System**: PSE Revenue Engine - Complete Deployment  
**Last Updated**: September 9, 2025  
**Status**: ✅ CRITICAL - STEP-BY-STEP DEPLOYMENT  

---

## 🚀 **COMPLETE DEPLOYMENT SEQUENCE**

### **Phase 1: Foundation Setup (Day 1-3)**

#### **Step 1: Database Setup**
```bash
# Deploy PostgreSQL schema
cd /Users/mbo/Desktop/arbitrage-automation/data-platform
psql -h your-rds-endpoint -U postgres -f schemas/003_pse_revenue_schema.sql

# Verify tables created
psql -h your-rds-endpoint -U postgres -c "\dt" arbitrage_db
```

#### **Step 2: AWS Services Configuration**
```bash
# 1. Setup Bedrock access (us-west-2)
aws bedrock list-foundation-models --region us-west-2
aws bedrock get-foundation-model --model-identifier anthropic.claude-opus-4-1 --region us-west-2

# 2. Create/verify secrets (eu-west-2)  
aws secretsmanager get-secret-value --secret-id manager-bot-secrets --region eu-west-2

# 3. Setup IAM role for cross-region access
aws iam create-role --role-name pse-lambda-execution-role --assume-role-policy-document file://trust-policy.json
```

#### **Step 3: WordPress PSE Plugin Installation**
```bash
# 1. Connect to WordPress via SSH
ssh -i your-key.pem bitnami@3.130.93.14

# 2. Create plugin directory  
sudo mkdir -p /opt/bitnami/wordpress/wp-content/plugins/pse-revenue-engine

# 3. Upload plugin files
scp -i your-key.pem /Users/mbo/Desktop/arbitrage-automation/publishers/homeservicedeals/wordpress-pse-plugin/* bitnami@3.130.93.14:/tmp/

# 4. Move files to plugin directory
sudo cp /tmp/pse-revenue-engine.php /opt/bitnami/wordpress/wp-content/plugins/pse-revenue-engine/

# 5. Set permissions
sudo chown -R bitnami:daemon /opt/bitnami/wordpress/wp-content/plugins/pse-revenue-engine/
sudo chmod 755 /opt/bitnami/wordpress/wp-content/plugins/pse-revenue-engine/
```

---

## 🛠️ **MICROSERVICES DEPLOYMENT**

### **Deploy Core PSE Services**
```bash
# Navigate to services directory
cd /Users/mbo/Desktop/arbitrage-automation/services

# Deploy high-cpc-keyword-hunter
cd high-cpc-keyword-hunter
npm install
zip -r function.zip .
aws lambda create-function \
  --function-name pse-high-cpc-keyword-hunter \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/pse-lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 300 \
  --memory-size 1024 \
  --region eu-west-2

# Deploy pse-content-analyzer  
cd ../pse-content-analyzer
npm install
zip -r function.zip .
aws lambda create-function \
  --function-name pse-content-analyzer \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/pse-lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 600 \
  --memory-size 1536 \
  --region eu-west-2

# Deploy remaining services...
```

### **Configure Environment Variables**
```bash
# Set environment variables for all Lambda functions
for function in pse-high-cpc-keyword-hunter pse-content-analyzer pse-analytics-engine; do
  aws lambda update-function-configuration \
    --function-name $function \
    --environment Variables='{
      "MODEL_PROVIDER":"bedrock",
      "BEDROCK_REGION":"us-west-2", 
      "BEDROCK_MODEL_ID":"us.anthropic.claude-opus-4-1-20250805-v1:0",
      "SECRETS_REGION":"eu-west-2",
      "WORDPRESS_BASE_URL":"http://3.130.93.14",
      "DATABASE_HOST":"your-rds-endpoint",
      "DATABASE_NAME":"arbitrage_db"
    }' \
    --region eu-west-2
done
```

---

## 📊 **PSE ANALYTICS SETUP**

### **Deploy Analytics Infrastructure**
```bash
# Create EventBridge for PSE events
aws events create-event-bus --name pse-events --region eu-west-2

# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "PSE-Revenue-Dashboard" \
  --dashboard-body file://pse-dashboard-config.json \
  --region eu-west-2

# Setup real-time PSE tracking
aws kinesis create-stream \
  --stream-name pse-interactions \
  --shard-count 1 \
  --region eu-west-2
```

### **Configure PSE Monitoring**
```yaml
# CloudWatch Alarms for PSE Performance
pse_revenue_alerts:
  - alarm_name: "PSE-Low-Usage-Rate"
    metric_name: "PSE_Usage_Rate"
    threshold: 0.30
    comparison: "LessThanThreshold"
    action: "optimize_pse_placement"
    
  - alarm_name: "PSE-High-Revenue"  
    metric_name: "PSE_Revenue_Per_Hour"
    threshold: 50
    comparison: "GreaterThanThreshold"
    action: "scale_up_campaigns"
```

---

## 🎯 **HOMESERVICEDEALS INTEGRATION**

### **WordPress Configuration**
```bash
# 1. Activate PSE Plugin
# Via WordPress Admin: http://3.130.93.14/wp-admin
# Plugins → PSE Revenue Engine → Activate

# 2. Configure PSE Settings
# Settings → PSE Revenue Engine
# CSE ID: [Your Google Custom Search Engine ID]
# High CPC Threshold: 5.00
# Revenue Attribution: Enabled

# 3. Configure Google Custom Search
# Create CSE at: https://cse.google.com/cse/
# Configure for HomeServiceDeals.pro domain
# Enable AdSense monetization
```

### **Initial Content Analysis**
```bash
# Trigger content scan via API
curl -X POST https://your-api-gateway/dev/analyze-content \
  -H "Content-Type: application/json" \
  -d '{
    "publisher_id": "homeservicedeals",
    "scan_all_content": true,
    "min_cpc_threshold": 5.00
  }'

# Check analysis results
curl -X GET https://your-api-gateway/dev/content-analysis/homeservicedeals
```

---

## 📈 **FIRST PSE CAMPAIGNS SETUP**

### **Campaign Creation Process**
```bash
# 1. Extract high-CPC keywords from analysis
curl -X GET https://your-api-gateway/dev/keywords/high-cpc \
  -H "Authorization: Bearer your-token"

# 2. Create first PSE-optimized campaign
curl -X POST https://your-api-gateway/dev/campaigns/create \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_name": "PSE-Plumber-London-HighCPC",
    "keywords": [
      {
        "term": "emergency plumber london",
        "cpc": 8.50,
        "landing_page": "/emergency-plumber-london"
      }
    ],
    "budget_daily": 50.00,
    "bid_strategy": "pse_revenue_maximization"
  }'
```

### **PSE Page Optimization**
```bash
# Optimize existing high-potential pages
curl -X POST https://your-api-gateway/dev/pse/optimize-page \
  -H "Content-Type: application/json" \
  -d '{
    "wp_post_id": 123,
    "url": "/emergency-plumber-london",
    "pse_placement": "hero_prominent",
    "search_suggestions": [
      "emergency plumber london",
      "24 hour plumber london",
      "urgent plumber london"
    ],
    "utm_integration": true
  }'
```

---

## ✅ **DEPLOYMENT VALIDATION CHECKLIST**

### **Infrastructure Validation**
```bash
# Test Bedrock connectivity
aws bedrock invoke-model \
  --model-id us.anthropic.claude-opus-4-1-20250805-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","messages":[{"role":"user","content":"test"}],"max_tokens":100}' \
  --region us-west-2 \
  --cli-binary-format raw-in-base64-out

# Test Secret Manager  
aws secretsmanager get-secret-value --secret-id manager-bot-secrets --region eu-west-2

# Test WordPress API
curl -X GET http://3.130.93.14/wp-json/wp/v2/posts?per_page=1 \
  -H "Authorization: Bearer your-wp-api-key"
```

### **PSE Functionality Tests**
```bash
# Test PSE keyword extraction
curl -X POST https://your-api-gateway/dev/test/keyword-extraction \
  -d '{"content": "Emergency plumber services in London for boiler repairs"}'

# Test PSE revenue calculation
curl -X POST https://your-api-gateway/dev/test/pse-revenue \
  -d '{"keyword": "emergency plumber london", "searches": 3, "clicks": 1}'

# Test end-to-end PSE workflow  
curl -X POST https://your-api-gateway/dev/test/pse-workflow \
  -d '{"utm_term": "emergency-plumber-london", "page_url": "/emergency-plumber-london"}'
```

---

## 🔍 **MONITORING & TROUBLESHOOTING**

### **Real-Time Monitoring Commands**
```bash
# Monitor Lambda logs
aws logs tail /aws/lambda/pse-high-cpc-keyword-hunter --follow --region eu-west-2

# Monitor PSE interactions
aws logs tail /aws/lambda/pse-analytics-engine --follow --region eu-west-2 | grep "PSE"

# Check PSE performance metrics
aws cloudwatch get-metric-statistics \
  --namespace "PSE/Revenue" \
  --metric-name "RevenuePerVisitor" \
  --start-time 2025-09-09T00:00:00Z \
  --end-time 2025-09-09T23:59:59Z \
  --period 3600 \
  --statistics Average \
  --region eu-west-2
```

### **Common Issues & Solutions**
```yaml
issue_troubleshooting:
  
  bedrock_timeout:
    symptoms: "Lambda timeout after 15 minutes"
    solution: "Increase Lambda timeout to 15 minutes, check us-west-2 connectivity"
    command: "aws lambda update-function-configuration --timeout 900"
    
  pse_not_loading:
    symptoms: "PSE search box not appearing on pages"
    solution: "Check Google CSE ID, verify JavaScript loading"
    debug: "Check browser console for errors"
    
  revenue_attribution_missing:
    symptoms: "PSE clicks not being tracked"
    solution: "Verify Analytics tracking code, check event firing"
    debug: "Monitor CloudWatch logs for tracking events"
    
  cross_region_latency:
    symptoms: "Slow Bedrock responses"
    expected: "2-5 seconds for cross-region calls"
    optimization: "Cache common responses, batch requests"
```

---

## 🎯 **SUCCESS MILESTONES TRACKING**

### **Week 1 Targets**
```bash
# Verify these metrics after Week 1
curl -X GET https://your-api-gateway/dev/metrics/weekly \
  -H "Authorization: Bearer your-token"

# Expected results:
# - PSE loads on 100% of pages: ✅
# - UTM extraction working: ✅  
# - 10+ pages identified for PSE: ✅
# - 50+ high-CPC keywords discovered: ✅
```

### **Month 1 Targets**
```yaml
month_1_validation:
  pse_revenue: "£5000+"
  pse_usage_rate: "50%+"  
  searches_per_visitor: "2.0+"
  pse_roi: "85%+"
  
validation_queries:
  - "SELECT SUM(total_pse_revenue) FROM pse_performance_daily WHERE date >= NOW() - INTERVAL '30 days'"
  - "SELECT AVG(pse_usage_rate) FROM pse_performance_daily WHERE date >= NOW() - INTERVAL '30 days'"
```

---

## 🔄 **ONGOING MAINTENANCE**

### **Daily Operations**
```bash
# Automated daily tasks (setup as cron/EventBridge)
0 1 * * * /usr/local/bin/run-pse-keyword-hunter.sh
0 2 * * * /usr/local/bin/run-pse-content-analysis.sh  
0 3 * * * /usr/local/bin/run-pse-performance-analysis.sh
0 4 * * * /usr/local/bin/run-campaign-optimization.sh
```

### **Weekly Reviews**
```bash
# Generate weekly PSE performance report
curl -X POST https://your-api-gateway/dev/reports/weekly-pse \
  -d '{"start_date": "2025-09-02", "end_date": "2025-09-08"}'

# Review top performing keywords
curl -X GET https://your-api-gateway/dev/analytics/top-keywords?period=7d
```

---

**🚀 DEPLOYMENT SUCCESS CRITERIA: PSE Revenue Engine operational with 50%+ usage rate, £5K+ monthly revenue, and 85%+ ROI within 30 days.**