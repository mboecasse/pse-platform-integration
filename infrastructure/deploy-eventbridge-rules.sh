#!/bin/bash

# PSE Platform EventBridge Rules Deployment Script
# Phase 2, Item 8

set -e

REGION="eu-west-2"
LAMBDA_ARN="arn:aws:lambda:${REGION}:329599649426:function:pse-platform-data-bridge"

echo "🚀 Deploying PSE Platform EventBridge Rules"
echo "=========================================="

# Function to create or update a rule
create_rule() {
    local RULE_NAME=$1
    local DESCRIPTION=$2
    local SCHEDULE=$3
    local INPUT_JSON=$4

    echo ""
    echo "Creating rule: $RULE_NAME"

    # Create or update the rule
    aws events put-rule \
        --name "$RULE_NAME" \
        --description "$DESCRIPTION" \
        --schedule-expression "$SCHEDULE" \
        --state ENABLED \
        --region $REGION

    # Add Lambda target
    aws events put-targets \
        --rule "$RULE_NAME" \
        --targets "Id=1,Arn=$LAMBDA_ARN,Input='$INPUT_JSON'" \
        --region $REGION

    # Add Lambda permission for EventBridge to invoke
    aws lambda add-permission \
        --function-name pse-platform-data-bridge \
        --statement-id "eventbridge-$RULE_NAME" \
        --action lambda:InvokeFunction \
        --principal events.amazonaws.com \
        --source-arn "arn:aws:events:$REGION:329599649426:rule/$RULE_NAME" \
        --region $REGION 2>/dev/null || echo "Permission already exists"

    echo "✅ Rule $RULE_NAME created/updated"
}

# Rule 1: Daily Content Sync
create_rule \
    "pse-daily-content-sync" \
    "Daily sync of content to keywords at 2 AM UTC" \
    "cron(0 2 * * ? *)" \
    '{"operation":"syncContentToKeywords","parameters":{"dryRun":false}}'

# Rule 2: Hourly Metrics Collection
# Note: Using static dates for now, can be enhanced with Lambda to calculate dynamic dates
TODAY=$(date -u +%Y-%m-%d)
# macOS compatible date calculation
if [[ "$OSTYPE" == "darwin"* ]]; then
    YESTERDAY=$(date -u -v-1d +%Y-%m-%d)
else
    YESTERDAY=$(date -u -d "yesterday" +%Y-%m-%d)
fi
create_rule \
    "pse-hourly-metrics-collection" \
    "Collect performance metrics every hour" \
    "rate(1 hour)" \
    "{\"operation\":\"getPerformanceMetrics\",\"parameters\":{\"startDate\":\"$YESTERDAY\",\"endDate\":\"$TODAY\",\"entityType\":\"content\"}}"

# Rule 3: Daily Revenue Correlation
create_rule \
    "pse-daily-revenue-correlation" \
    "Correlate revenue data daily at 3 AM UTC" \
    "cron(0 3 * * ? *)" \
    "{\"operation\":\"correlateRevenueData\",\"parameters\":{\"date\":\"$YESTERDAY\",\"source\":\"all\"}}"

# Rule 4: Weekly High-Value Content Finder
create_rule \
    "pse-weekly-high-value-finder" \
    "Find high-value content every Monday at 4 AM UTC" \
    "cron(0 4 ? * MON *)" \
    '{"operation":"findHighValueContent","parameters":{"minROI":100,"limit":50}}'

# Rule 5: Daily Health Check
create_rule \
    "pse-daily-health-check" \
    "Daily health check at midnight UTC" \
    "cron(0 0 * * ? *)" \
    '{"operation":"healthCheck"}'

echo ""
echo "=========================================="
echo "✅ All EventBridge rules deployed!"
echo ""
echo "Verification Commands:"
echo "  aws events list-rules --region $REGION | grep pse-"
echo "  aws events list-targets-by-rule --rule pse-daily-health-check --region $REGION"
echo ""
echo "Test a rule manually:"
echo "  aws events put-events --entries '[{\"Source\":\"test\",\"DetailType\":\"test\",\"Detail\":\"{}\"}]' --region $REGION"
echo ""
echo "Disable a rule (if needed):"
echo "  aws events disable-rule --name RULE_NAME --region $REGION"
echo "=========================================="