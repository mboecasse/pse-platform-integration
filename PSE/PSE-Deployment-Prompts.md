# PSE Platform Deployment & Testing Prompts

## 🚀 Updated Session Prompts (With Deployment Focus)

### First Session (Starting Fresh):
```
Read PSE-Platform-Progress.md in the current directory. Check the AWS Setup section and run verification commands. Start working on Phase 1, Item 1. Update the progress file as you complete the task.
```

### Every Subsequent Session (UPDATED):
```
Read PSE-Platform-Progress.md and check:
1. What was last completed?
2. Check the Deployment Status section - is anything marked complete but not deployed?
3. If yes, deploy those items first using the DEPLOY commands in the Phase Progress Tracker
4. If no, continue with the next uncompleted item
5. After any new work, deploy and test before marking complete
6. Update both the Phase Progress and Deployment Status sections
7. Commit changes to git when done
```

### 🆕 Deployment Catch-up Session:
```
Read PSE-Platform-Progress.md and check the Deployment Status section. Deploy any items where Deployed = "❌ No" by:
1. Running the DEPLOY command shown in the Phase Progress Tracker for that item
2. Running the VERIFY command to confirm deployment
3. Running the TEST command with sample data
4. Updating the Deployment Status table
5. Only proceed to new items after all existing work is deployed
```

### 🆕 Testing Session:
```
Read PSE-Platform-Progress.md and focus on testing:
1. Run all Deployment Verification Commands
2. For each deployed resource, create and run test cases
3. Check CloudWatch logs for any errors
4. Update the Tested column in Deployment Status
5. Document any issues found in Session Notes
```

### 🆕 Daily Health Check:
```
Run a full system health check:
1. Execute all commands in "Deployment Verification Commands" section
2. Count resources and compare to Deployment Status table
3. Check CloudWatch for any errors in last 24 hours
4. Test one sample operation end-to-end
5. Report status: GREEN (all good), YELLOW (minor issues), RED (critical issues)
```

### If Something Broke (UPDATED):
```
Read PSE-Platform-Progress.md and check the last session notes. Something went wrong with [describe issue]. 
1. Check the Deployment Status table for the affected resource
2. Find its rollback command
3. Decide: fix forward or rollback?
4. If rollback, run the command and update Deployment Status
5. Document the issue and resolution in Session Notes
```

### If You Want to Review Progress (UPDATED):
```
Read PSE-Platform-Progress.md and give me a summary of:
1. What percentage is complete overall?
2. What's actually deployed vs just coded (check Deployment Status)?
3. What AWS resources are live and tested?
4. What's working and what's not?
5. What are the next 5 tasks, including any deployment catch-up needed?
```

## 🎯 The Golden Rule

**Nothing is "complete" until it's:**
1. ✅ Coded
2. ✅ Deployed to AWS
3. ✅ Verified to exist
4. ✅ Tested with real data
5. ✅ Documented in Deployment Status table

## 📝 Example Correct Workflow

```
WRONG ❌:
1. Create DynamoDB schema → Mark complete → Move to next item

RIGHT ✅:
1. Create DynamoDB schema
2. Deploy CloudFormation stack
3. Verify tables exist
4. Test with sample data
5. Update Deployment Status table
6. THEN mark complete and move on
```

## 🚨 Critical Deployment Commands Reference

### DynamoDB Deployment (Item 6):
```bash
# Deploy
aws cloudformation create-stack \
  --stack-name pse-dynamodb-tables \
  --template-body file://infrastructure/pse-dynamodb-tables.yaml \
  --region eu-west-2

# Verify
aws dynamodb list-tables --region eu-west-2 | grep pse-

# Test
aws dynamodb put-item \
  --table-name pse-content-mappings \
  --item '{"contentId":{"S":"test-1"},"wpId":{"N":"1"}}' \
  --region eu-west-2
```

### Lambda Deployment (Item 7):
```bash
# Deploy
cd lambda-functions/pse-platform-data-bridge
npm install
./deploy.sh

# Verify
aws lambda get-function \
  --function-name pse-platform-data-bridge \
  --region eu-west-2

# Test
aws lambda invoke \
  --function-name pse-platform-data-bridge \
  --payload '{"operation":"healthCheck"}' \
  response.json \
  --region eu-west-2
```

## 📊 Success Metrics

A session is successful when:
- ✅ At least one item is deployed AND tested
- ✅ Deployment Status table is updated
- ✅ No resources are left in "coded but not deployed" state
- ✅ All verification commands pass
- ✅ Changes are committed to GitHub

## 🔄 Your New Daily Workflow

1. **Start**: Load context from PSE-Platform-Progress.md
2. **Check**: Any items need deployment?
3. **Deploy**: Deploy pending items first
4. **Test**: Verify deployments work
5. **Build**: Work on new items
6. **Deploy Again**: Deploy what you just built
7. **Document**: Update all tracking sections
8. **Commit**: Push to GitHub

Remember: **If it's not deployed, it doesn't exist!**