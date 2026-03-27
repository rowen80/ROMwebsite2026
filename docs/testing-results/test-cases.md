# ROM Invoice Testing - Test Cases

## Phase 1 Baseline Testing - Test Data

### TC-001: Single Job, Simple Calculation
- **Customer:** Faraday, Bardo
- **Email:** bardo.faraday+tc001@gmail.com
- **Company:** TC001 Properties LLC
- **Address:** 123 Test St, Ocean City, MD 21842
- **Service:** Photography
- **Total:** $295
- **Deposit:** $0
- **PhotoLink:** https://example.com/tc001/photos
- **Expected:** Invoice generated, email sent, calculations correct

### TC-002: Single Job with Deposit
- **Customer:** Smith, Alice
- **Email:** bardo.faraday+tc002@gmail.com
- **Company:** TC002 Realty
- **Address:** 456 Beach Ave, Ocean City, MD 21842
- **Service:** Photography + Video
- **Total:** $595
- **Deposit:** $200
- **PhotoLink:** https://example.com/tc002/photos
- **VideoLink:** https://example.com/tc002/video
- **Expected:** Invoice shows deposit, balance due correct

### TC-003: Multiple Jobs for Same Customer
- **Customer:** Jones, Bob (3 properties)
- **Email:** bardo.faraday+tc003@gmail.com
- **Company:** TC003 Investments
- **Addresses:** 
  - 789 Bay Dr, Ocean City, MD 21842
  - 101 Coastal Way, Ocean City, MD 21842
  - 202 Harbor Ln, Ocean City, MD 21842
- **Service:** Photography (all)
- **Total per property:** $295
- **Combined Total:** $885
- **Deposit:** $0
- **Expected:** Single invoice with 3 line items

### TC-004: Zero Deposit Scenario
- **Customer:** Davis, Carol
- **Email:** bardo.faraday+tc004@gmail.com
- **Company:** TC004 LLC
- **Address:** 303 Sunset Blvd, Ocean City, MD 21842
- **Service:** Photography
- **Total:** $395
- **Deposit:** $0
- **PhotoLink:** https://example.com/tc004/photos
- **Expected:** Full balance due

### TC-005: Large Invoice ($5,000+)
- **Customer:** Wilson, David
- **Email:** bardo.faraday+tc005@gmail.com
- **Company:** TC005 Development
- **Address:** 404 Grand Ave, Ocean City, MD 21842
- **Service:** Commercial Photography + Video + Drone + Editing
- **Total:** $5,450
- **Deposit:** $1,500
- **PhotoLink:** https://example.com/tc005/photos
- **VideoLink:** https://example.com/tc005/video
- **Expected:** Large invoice handled correctly, calculations accurate

## Test Execution Log

Timestamp: 2026-03-26 19:14 EDT
Tester: Leo (ROM automation agent)
Environment: Staging Sheet (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)

---

### Test Results Template

| Test ID | Status | Invoice # | PDF Generated | Email Sent | Calcs Correct | Notes |
|---------|--------|-----------|---------------|------------|---------------|-------|
| TC-001  |        |           |               |            |               |       |
| TC-002  |        |           |               |            |               |       |
| TC-003  |        |           |               |            |               |       |
| TC-004  |        |           |               |            |               |       |
| TC-005  |        |           |               |            |               |       |
