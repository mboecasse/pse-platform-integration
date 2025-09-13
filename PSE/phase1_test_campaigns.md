# Phase 1 Test Campaign Setup Instructions
## Google Ads Campaign Configuration for PSE Testing

---

## 🎯 **CAMPAIGN STRUCTURE OVERVIEW**

We'll create 5 separate campaigns, each targeting one high-CPC keyword. This allows for individual budget control and performance tracking.

```
Account
├── Campaign 1: PSE-Emergency-Plumber-London
├── Campaign 2: PSE-Boiler-Repair-London  
├── Campaign 3: PSE-24Hr-Electrician-London
├── Campaign 4: PSE-Blocked-Drain-London
└── Campaign 5: PSE-Emergency-Electrician-London
```

---

## 📋 **CAMPAIGN 1: Emergency Plumber London**

### **Campaign Settings**
- **Campaign Name**: `PSE-Emergency-Plumber-London`
- **Campaign Type**: Search Network only
- **Networks**: Google Search only (no partners initially)
- **Budget**: £10/day
- **Bid Strategy**: Manual CPC
- **Location**: London, United Kingdom
- **Radius**: 25 miles around London
- **Language**: English
- **Ad Schedule**: 24/7 (gather data first)
- **Start Date**: Immediate
- **End Date**: None (manual monitoring)

### **Ad Group Setup**
- **Ad Group Name**: `Emergency-Exact`
- **Default Bid**: £4.00 (50% of £8.50 estimated CPC)

### **Keywords** (EXACT MATCH ONLY)
```
[emergency plumber london]
[emergency plumber in london]
[emergency plumbers london]
[london emergency plumber]
```

### **Negative Keywords**
```
-free
-diy
-how to
-jobs
-training
-course
-cheap
```

### **Ad Copy**
**Responsive Search Ad:**

**Headlines** (15 max, use at least 8):
1. Emergency Plumber London Search
2. Find Emergency Plumbers Now
3. London Emergency Plumbing
4. Search Local Plumbers Directory
5. 24/7 Plumber Search London
6. Emergency Plumbing Services
7. Find Plumbers Near You
8. London Plumber Directory
9. Compare Emergency Plumbers
10. Search Verified Plumbers

**Descriptions** (4 max, use all):
1. Search our directory of emergency plumbers in London. Find exactly what you need - 24/7 services, same day repairs, and more.
2. Complete plumber directory for London. Search by service type, location, and availability. Find your perfect match.
3. Browse emergency plumbing services in your area. Compare options, check availability, and find the right professional.
4. Comprehensive search tool for London plumbers. Emergency, routine, or planned services - find them all here.

**Final URL**: `https://homeservicedeals.pro/emergency-plumber-london/`
**Display URL Path**: `/emergency-plumber`

### **URL Parameters**
```
utm_source=google
utm_medium=cpc
utm_campaign=pse-emergency-plumber-london
utm_term={keyword}
utm_content=v1
```

**Complete Final URL**:
```
https://homeservicedeals.pro/emergency-plumber-london/?utm_source=google&utm_medium=cpc&utm_campaign=pse-emergency-plumber-london&utm_term={keyword}&utm_content=v1
```

---

## 📋 **CAMPAIGN 2: Boiler Repair London**

### **Campaign Settings**
- **Campaign Name**: `PSE-Boiler-Repair-London`
- **Budget**: £8/day
- **All other settings**: Same as Campaign 1

### **Ad Group Setup**
- **Ad Group Name**: `Boiler-Repair-Exact`
- **Default Bid**: £3.50 (50% of £6.80 estimated CPC)

### **Keywords**
```
[boiler repair london]
[london boiler repair]
[boiler repairs london]
[boiler repair service london]
```

### **Ad Copy Headlines**
1. Boiler Repair London Search
2. Find Boiler Engineers Now
3. London Boiler Repair Directory
4. Search Heating Engineers
5. Boiler Service Search London
6. Emergency Boiler Repairs
7. Find Local Boiler Experts
8. Compare Boiler Engineers
9. Heating Repair Directory
10. Search Verified Engineers

**Final URL**: `https://homeservicedeals.pro/boiler-repair-london/`

---

## 📋 **CAMPAIGN 3: 24 Hour Electrician London**

### **Campaign Settings**
- **Campaign Name**: `PSE-24Hr-Electrician-London`
- **Budget**: £8/day
- **All other settings**: Same as Campaign 1

### **Ad Group Setup**
- **Ad Group Name**: `24Hr-Electrician-Exact`
- **Default Bid**: £3.60 (50% of £7.20 estimated CPC)

### **Keywords**
```
[24 hour electrician london]
[24hr electrician london]
[24 7 electrician london]
[emergency electrician london 24 hours]
```

### **Ad Copy Headlines**
1. 24 Hour Electrician Search
2. Find Emergency Electricians
3. London Electrician Directory
4. Search 24/7 Electrical Services
5. Emergency Electrician Search
6. Find Local Electricians Now
7. Electrical Services Directory
8. Compare London Electricians
9. 24 Hour Electrical Help
10. Search Verified Electricians

**Final URL**: `https://homeservicedeals.pro/24-hour-electrician-london/`

---

## 📋 **CAMPAIGN 4: Blocked Drain London**

### **Campaign Settings**
- **Campaign Name**: `PSE-Blocked-Drain-London`
- **Budget**: £7/day
- **All other settings**: Same as Campaign 1

### **Ad Group Setup**
- **Ad Group Name**: `Blocked-Drain-Exact`
- **Default Bid**: £3.00 (50% of £5.90 estimated CPC)

### **Keywords**
```
[blocked drain london]
[blocked drains london]
[drain cleaning london]
[drain unblocking london]
```

### **Ad Copy Headlines**
1. Blocked Drain London Search
2. Find Drainage Experts Now
3. London Drain Services Directory
4. Search Drain Specialists
5. Emergency Drain Unblocking
6. Find Local Drainage Help
7. Drain Cleaning Directory
8. Compare Drainage Services
9. Blocked Drain Solutions
10. Search Verified Specialists

**Final URL**: `https://homeservicedeals.pro/blocked-drain-london/`

---

## 📋 **CAMPAIGN 5: Emergency Electrician London**

### **Campaign Settings**
- **Campaign Name**: `PSE-Emergency-Electrician-London`
- **Budget**: £7/day
- **All other settings**: Same as Campaign 1

### **Ad Group Setup**
- **Ad Group Name**: `Emergency-Electrician-Exact`
- **Default Bid**: £4.00 (50% of £7.90 estimated CPC)

### **Keywords**
```
[emergency electrician london]
[emergency electricians london]
[london emergency electrician]
[urgent electrician london]
```

### **Ad Copy Headlines**
1. Emergency Electrician Search
2. Find Urgent Electrical Help
3. London Emergency Electricians
4. Search Local Electricians
5. 24/7 Electrician Directory
6. Emergency Electrical Services
7. Find Electricians Fast
8. Electrical Emergency Search
9. Compare Emergency Services
10. Search Verified Professionals

**Final URL**: `https://homeservicedeals.pro/emergency-electrician-london/`

---

## 🚨 **IMPORTANT SETUP NOTES**

### **Before Launching**
1. ✅ Verify all landing pages load correctly
2. ✅ Confirm PSE is working on each page
3. ✅ Test UTM parameter passthrough
4. ✅ Set up conversion tracking (optional for Phase 1)
5. ✅ Enable auto-tagging for Google Analytics

### **Bid Adjustments** (Start Conservative)
- **Mobile**: -20% (PSE may perform differently)
- **Desktop**: 0% (baseline)
- **Tablet**: -30% (typically lower intent)

### **Daily Monitoring Required**
- Check spend every 2 hours on Day 1
- Pause any keyword spending >£15/day
- Monitor Quality Score (target 5+)
- Check for disapproved ads daily

### **Week 1 Optimization Rules**
- **Day 1-2**: Gather data, no changes
- **Day 3**: Pause keywords with 0% PSE usage
- **Day 4**: Reduce bids -20% if CTR <2%
- **Day 5**: Increase bids +20% if PSE usage >40%
- **Day 6-7**: Prepare week 1 analysis

---

## 📊 **TRACKING SETUP**

### **Google Analytics Goals** (Optional but Recommended)
Create these events as goals:
1. **PSE Loaded**: When PSE appears on page
2. **PSE Search**: When user performs search
3. **PSE Multiple Searches**: When user searches 2+ times
4. **Time on Page**: >60 seconds (engagement indicator)

### **UTM Parameter Testing**
Before launching, test each URL:
1. Click the final URL with parameters
2. Verify landing page loads
3. Check PSE search box is pre-filled with keyword
4. Confirm Google Analytics shows the campaign

---

## 💡 **PHASE 1 SUCCESS CRITERIA**

### **Individual Campaign Success**
✅ **Winner**: ROI > 0% after 5 days
⚠️ **Potential**: ROI -30% to 0%, PSE usage >30%
❌ **Loser**: ROI < -30%, PSE usage <20%

### **Overall Success (End of Week 1)**
- At least 2 campaigns showing positive signals
- Overall PSE usage rate >30%
- Learning which keywords/pages work best
- No account warnings or policy issues

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Low CTR (<1%)**
- Test different ad copy focusing on "search" and "find"
- Add more specific keywords
- Check search terms report for irrelevant queries

### **High CPC (>80% of estimate)**
- Lower bids by 20%
- Add more negative keywords
- Consider phrase match for broader reach

### **Low PSE Usage (<20%)**
- PSE placement too low on page
- PSE not loading properly
- Landing page not relevant to keyword

### **No Revenue Showing**
- Normal for first 2-3 days
- AdSense reporting delay (24-48 hours)
- Check PSE is showing ads (not just organic results)

---

**Remember**: Phase 1 is about learning, not profit. Focus on finding 2-3 keywords that show PSE revenue potential. Even -30% ROI is acceptable if PSE metrics are improving daily.