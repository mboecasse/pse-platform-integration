# SOP-100: AWS Configuration Master Guide
**Document ID**: SOP-100  
**System**: PSE Revenue Engine - AWS Infrastructure  
**Last Updated**: September 9, 2025  
**Status**: ✅ CRITICAL - AWS REGION CONFIGURATION  

---

## 🚨 **CRITICAL AWS REGION CONFIGURATION**

### **IMPORTANT: Different AWS Services Use Different Regions!**

```yaml
AWS_REGIONS:
  # Bedrock (AI Models)
  bedrock:
    region: "us-west-2"
    model_id: "us.anthropic.claude-opus-4-1-20250805-v1:0"
    reason: "Claude Opus 4.1 only available in us-west-2"
    
  # Secret Manager (API Keys, Credentials)
  secrets:
    region: "eu-west-2"
    reason: "Original setup region for secrets"
    
  # Lambda Functions (Main Processing)
  lambda:
    region: "eu-west-2"
    reason: "Same region as secrets for minimal latency"
    
  # WordPress Infrastructure
  wordpress:
    region: "us-east-2"
    ip: "3.130.93.14"
    url: "http://3.130.93.14"
    reason: "AWS Lightsail instance location"
```

---

## 🔑 **CRITICAL CREDENTIALS & ENDPOINTS**

### **WordPress Integration**
```javascript
// HomeServiceDeals.pro Configuration
const WORDPRESS_CONFIG = {
  base_url: "http://3.130.93.14",
  admin_url: "http://3.130.93.14/wp-admin",
  api_key: "58c861f54c51a08cd40132c938eddb72288bda1680db2fd96e86202ad260514c",
  region: "us-east-2"
};
```

### **AWS Bedrock Configuration**
```javascript
// Bedrock Claude Opus 4.1 Setup
const BEDROCK_CONFIG = {
  region: "us-west-2",                    // ⚠️ DIFFERENT from other services!
  model_id: "us.anthropic.claude-opus-4-1-20250805-v1:0",
  endpoint: `https://bedrock-runtime.us-west-2.amazonaws.com`,
  fallback_model: "gpt-5-2025-08-07"
};
```

### **Secret Manager Configuration**
```javascript
// Secret Manager (Different Region!)
const SECRETS_CONFIG = {
  region: "eu-west-2",                    // ⚠️ DIFFERENT from Bedrock!
  secret_names: {
    wp_api_key: "manager-bot-secrets:WP_API_KEY",
    slack_webhook: "manager-bot-secrets:SLACK_WEBHOOK_URL",
    google_ads_api: "manager-bot-secrets:GOOGLE_ADS_API_KEY"
  }
};
```

---

## 🏗️ **LAMBDA FUNCTION CONFIGURATION**

### **Environment Variables Template**
```bash
# PSE Revenue Engine Lambda Environment Variables
MODEL_PROVIDER=bedrock
BEDROCK_REGION=us-west-2
BEDROCK_MODEL_ID=us.anthropic.claude-opus-4-1-20250805-v1:0
SECRETS_REGION=eu-west-2
WORDPRESS_REGION=us-east-2
WORDPRESS_BASE_URL=http://3.130.93.14
```

### **IAM Permissions Required**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-*"
    },
    {
      "Effect": "Allow", 
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:eu-west-2:*:secret:manager-bot-secrets*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream", 
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:eu-west-2:*:*"
    }
  ]
}
```

---

## 🛠️ **CROSS-REGION SETUP COMMANDS**

### **1. Setup Bedrock Access (us-west-2)**
```bash
# Enable Bedrock model access in us-west-2
aws bedrock list-foundation-models --region us-west-2
aws bedrock get-model-invocation-logging-configuration --region us-west-2
```

### **2. Setup Secret Manager (eu-west-2)**
```bash
# Create secrets in eu-west-2
aws secretsmanager create-secret \
  --name "manager-bot-secrets" \
  --description "PSE Revenue Engine API Keys" \
  --secret-string '{"WP_API_KEY":"58c861f54c51a08cd40132c938eddb72288bda1680db2fd96e86202ad260514c"}' \
  --region eu-west-2
```

### **3. Deploy Lambda (eu-west-2)**
```bash
# Deploy PSE services to eu-west-2
cd services/high-cpc-keyword-hunter
aws lambda create-function \
  --function-name pse-keyword-hunter \
  --runtime nodejs18.x \
  --role arn:aws:iam::ACCOUNT:role/pse-lambda-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --region eu-west-2
```

---

## 🔍 **TESTING CROSS-REGION CONNECTIVITY**

### **Test Bedrock Connection**
```javascript
// Test Bedrock from eu-west-2 Lambda
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ 
  region: "us-west-2"  // Cross-region call
});

const testBedrock = async () => {
  try {
    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-opus-4-1-20250805-v1:0",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        messages: [{ role: "user", content: "Test connection" }],
        max_tokens: 100
      })
    });
    
    const response = await client.send(command);
    console.log("✅ Bedrock connection successful");
    return response;
  } catch (error) {
    console.error("❌ Bedrock connection failed:", error);
  }
};
```

### **Test Secret Manager Connection**
```javascript
// Test Secret Manager from same region
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secretsClient = new SecretsManagerClient({ 
  region: "eu-west-2"  // Same region = fast
});

const testSecrets = async () => {
  try {
    const command = new GetSecretValueCommand({
      SecretId: "manager-bot-secrets"
    });
    
    const response = await secretsClient.send(command);
    console.log("✅ Secret Manager connection successful");
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("❌ Secret Manager connection failed:", error);
  }
};
```

---

## 📊 **MONITORING CROSS-REGION PERFORMANCE**

### **CloudWatch Metrics to Monitor**
```bash
# Monitor cross-region latency
aws logs tail /aws/lambda/pse-keyword-hunter --follow --region eu-west-2 | grep -E "(Bedrock|duration)"

# Expected output:
# "Bedrock call duration: 2.3s"  # Cross-region call to us-west-2
# "Secret fetch duration: 0.1s"  # Same-region call in eu-west-2
```

### **Performance Expectations**
```yaml
performance_benchmarks:
  bedrock_call: "2-5 seconds"     # Cross-region us-west-2 ← eu-west-2
  secrets_call: "0.1-0.3 seconds" # Same-region eu-west-2 
  wordpress_call: "0.5-2 seconds" # Cross-region us-east-2 ← eu-west-2
  
alerts:
  bedrock_timeout: "> 10 seconds"
  secrets_timeout: "> 1 second"
  wordpress_timeout: "> 5 seconds"
```

---

## 🚨 **TROUBLESHOOTING REGIONAL ISSUES**

### **Common Cross-Region Problems**

#### **Problem 1: Bedrock Model Not Available**
```bash
# Error: "The model anthropic.claude-opus-4-1 is not available in region eu-west-2"
# Solution: Ensure Bedrock client uses us-west-2
const client = new BedrockRuntimeClient({ region: "us-west-2" });
```

#### **Problem 2: Secret Not Found**
```bash
# Error: "Secrets Manager can't find the specified secret"
# Solution: Ensure secret exists in eu-west-2
aws secretsmanager describe-secret --secret-id manager-bot-secrets --region eu-west-2
```

#### **Problem 3: Cross-Region IAM Issues**
```json
// Ensure IAM role has permissions for all regions
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": "arn:aws:bedrock:us-west-2::foundation-model/*"
}
```

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment Verification**
- [ ] Bedrock model access enabled in us-west-2
- [ ] Secrets created in eu-west-2  
- [ ] IAM role has cross-region permissions
- [ ] WordPress API key tested from 3.130.93.14
- [ ] Lambda functions deployed to eu-west-2

### **Post-Deployment Testing**
- [ ] Bedrock call from eu-west-2 → us-west-2 works
- [ ] Secret retrieval in eu-west-2 works
- [ ] WordPress API calls to us-east-2 work
- [ ] End-to-end PSE workflow completes successfully

---

**🚨 CRITICAL REMINDER: ALWAYS USE THE CORRECT REGIONS FOR EACH SERVICE!**
- **Bedrock**: us-west-2
- **Secrets**: eu-west-2  
- **Lambda**: eu-west-2
- **WordPress**: us-east-2