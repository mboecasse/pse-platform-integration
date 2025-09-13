# Complete Deployment Template for All PSE Platform Phases

## Template for Each Item (Apply to All 50 Items)

```markdown
- [ ] Item X: [Description]
  - [ ] **PLAN/DESIGN**: [Define requirements and approach]
  - [ ] **CODE/CREATE**: [Build the solution]
  - [ ] **DEPLOY**: [Specific deployment command]
  - [ ] **VERIFY**: [Command to verify deployment]
  - [ ] **TEST**: [Test with real/sample data]
  - [ ] **UPDATE PROGRESS FILE**: [What sections to update]
```

## Phase 4: Bridge Lambda Functions (Items 16-20)
Each Lambda needs:
- **DEPLOY**: `cd lambda-functions/[name] && npm install && ./deploy.sh`
- **VERIFY**: `aws lambda get-function --function-name [name]`
- **TEST**: `aws lambda invoke --function-name [name] --payload '{test}' response.json`
- **UPDATE**: Add to Lambda Functions table, update Deployment Status

## Phase 5: Google Ads Integration (Items 21-25)
Each item needs:
- **DEPLOY**: API credentials to Secrets Manager
- **VERIFY**: Test API connection
- **TEST**: Create test campaign (paused)
- **UPDATE**: Add to Secrets Manager table, document API endpoints

## Phase 6: Intelligent Content Enhancement (Items 26-30)
Each enhancement needs:
- **DEPLOY**: Update existing Lambda functions
- **VERIFY**: Check new Lambda version
- **TEST**: Generate enhanced content samples
- **UPDATE**: Document Lambda version changes

## Phase 7: Automation & Orchestration (Items 31-35)
Each automation needs:
- **DEPLOY**: EventBridge rules and Step Functions
- **VERIFY**: Check workflows in AWS Console
- **TEST**: Run end-to-end workflow test
- **UPDATE**: Add to EventBridge Rules table

## Phase 8: Testing & Validation (Items 36-40)
Each test needs:
- **EXECUTE**: Run specific test scenarios
- **DOCUMENT**: Record test results
- **VERIFY**: All tests pass
- **UPDATE**: Create test results document

## Phase 9: Gradual Rollout (Items 41-45)
Each rollout stage needs:
- **DEPLOY**: Enable for specific pages/categories
- **MONITOR**: Track metrics for period
- **VERIFY**: Check performance metrics
- **UPDATE**: Document rollout progress and metrics

## Phase 10: Optimization & Scaling (Items 46-50)
Each optimization needs:
- **ANALYZE**: Review performance data
- **DEPLOY**: Optimization changes
- **MEASURE**: Compare before/after metrics
- **UPDATE**: Document improvements

## Critical Updates to Progress File

### After EVERY Item Completion:
1. **Deployment Status Table**: Mark resource as Deployed ✅
2. **System State Tables**: Add new resources with details
3. **Session History**: Document what was created
4. **Git Commit**: Include deployment details in commit message

### Example Update Pattern:
```markdown
#### Lambda Functions
| Function Name | Status | Created Session | Purpose |
|--------------|--------|-----------------|---------|
| pse-campaign-analyzer | ✅ Active | Session 8 | Analyzes content for campaign potential |

#### Deployment Status
| pse-campaign-analyzer | Direct Deploy | ✅ Yes | ✅ Yes | eu-west-2 | `aws lambda delete-function...` |
```

## Verification Checklist for Each Phase

### Phase Completion Criteria:
- [ ] All items have Deploy/Verify/Test checked
- [ ] Deployment Status table updated
- [ ] System State tables updated
- [ ] Session notes document what was deployed
- [ ] Git commit with deployment details
- [ ] Rollback commands documented

## Missing Updates from Previous Sessions

### Items that need retroactive updates:
1. **Phase 1 Items 1-5**: Mark as N/A for deployment (documentation only)
2. **Phase 2 Items 6-7**: Already deployed but needs verification
3. **ALL Future Items**: Must follow this template

## Recommended Progress File Sections to Add:

```markdown
### 📊 Deployment Metrics
- Total AWS Resources: X
- Resources Deployed: Y
- Resources Pending: Z
- Test Coverage: X%
- Rollback Points: X

### 🔍 Testing Log
| Date | Item | Test Type | Result | Issues |
|------|------|-----------|--------|---------|
| 2025-09-13 | Item 7 | Lambda invoke | ✅ Pass | Bedrock access denied |

### 💰 Cost Tracking
| Resource | Monthly Cost | Actual Usage |
|----------|--------------|--------------|
| DynamoDB | £5-10 | £0.02 |
| Lambda | £30-50 | £0.00 |
```

## The Golden Rules:
1. **Nothing is complete without deployment**
2. **Every deployment needs verification**
3. **Every verification needs testing**
4. **Every test needs documentation**
5. **Progress file MUST reflect reality**

Remember: If it's not in AWS and tested, it doesn't exist!