# 📋 Production Deployment Checklist

Use this checklist before deploying the Recharge App to production.

## 🔐 Security

- [ ] **Change JWT_SECRET**
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Update in `.env`

- [ ] **Razorpay Keys**
  - Replace test keys with production keys
  - Verify keys are in `.env` (not hardcoded)

- [ ] **Database Password**
  - Use strong password in `.env`
  - Store securely (not in version control)

- [ ] **CORS Configuration**
  - Update allowed origins in server.js
  - Don't allow all origins (*) in production

- [ ] **HTTPS Only**
  - Enable SSL/TLS certificates
  - Redirect HTTP to HTTPS
  - Set secure cookie flag if using cookies

- [ ] **API Rate Limiting**
  - Implement rate limiting on endpoints
  - Prevent brute force attacks

- [ ] **Input Validation**
  - Validate all user inputs
  - Sanitize email, phone, amounts

- [ ] **SQL Injection Prevention**
  - Verify all queries use prepared statements
  - Never concatenate user input in SQL

## 🗄️ Database

- [ ] **Backup Strategy**
  - Setup automated daily backups
  - Test restore procedure

- [ ] **Database Indexes**
  - Add indexes on frequently queried fields
  - Example: `CREATE INDEX idx_email ON users(email)`

- [ ] **User Constraints**
  - Unique constraint on email
  - Unique constraint on phone (if needed)

- [ ] **Foreign Keys**
  - Verify all foreign keys are set up
  - Test cascade deletes

## 🚀 Deployment

- [ ] **Environment Variables**
  - Create production .env file
  - Set NODE_ENV=production
  - Verify all required variables are set

- [ ] **Dependencies**
  - Run `npm audit` to check for vulnerabilities
  - Update packages if needed
  - Use `npm ci` instead of `npm install`

- [ ] **Build Optimization**
  - Build frontend: `npm run build`
  - Minify JavaScript and CSS
  - Optimize images

- [ ] **Server Configuration**
  - Set appropriate timeout values
  - Configure connection pooling
  - Set max file upload size

- [ ] **Logging & Monitoring**
  - Setup error logging service (e.g., Sentry)
  - Setup performance monitoring
  - Setup uptime monitoring
  - Configure alerts for critical errors

- [ ] **Database Migration**
  - Export production database backup
  - Test import procedure
  - Verify data integrity

## 👥 User Management

- [ ] **First Admin User**
  - Create initial admin user securely
  - Use strong temporary password
  - Force password change on first login

- [ ] **Default Roles**
  - Verify role assignments in database
  - Test admin access controls

- [ ] **Password Requirements**
  - Enforce minimum password length (8+ chars)
  - Require mix of uppercase, lowercase, numbers
  - Implement password expiry policy

## 💳 Payment

- [ ] **Razorpay Webhook**
  - Setup webhook for payment status updates
  - Verify webhook signature
  - Test with test transactions

- [ ] **Transaction Security**
  - Encrypt sensitive payment data
  - Verify payment verification logic
  - Store payment IDs correctly

- [ ] **Payment Testing**
  - Test successful transactions
  - Test failed transactions
  - Test refund process

- [ ] **PCI Compliance**
  - Don't store full card numbers
  - Use Razorpay hosted checkout
  - Implement security best practices

## 📧 Email Notifications (Optional)

- [ ] **Email Service**
  - Setup email provider (SendGrid, AWS SES, etc.)
  - Configure SMTP credentials

- [ ] **Email Templates**
  - Account activation email
  - KYC approval email
  - Payment confirmation email

- [ ] **Email Testing**
  - Test email delivery
  - Verify sender address
  - Test with real email

## 📊 Testing in Production

- [ ] **Smoke Testing**
  - Test user registration
  - Test KYC submission
  - Test admin approval
  - Test payment flow

- [ ] **Performance Testing**
  - Load test with concurrent users
  - Monitor response times
  - Check database query performance

- [ ] **Security Testing**
  - Test SQL injection prevention
  - Test CSRF protection
  - Test XSS prevention
  - Test authentication bypass

## 📱 Frontend

- [ ] **Build Verification**
  - Verify build completes without errors
  - Test in production build mode
  - Check bundle size

- [ ] **Browser Compatibility**
  - Test in Chrome, Firefox, Safari, Edge
  - Test on mobile browsers
  - Test responsive design

- [ ] **Performance**
  - Check Lighthouse score
  - Optimize Core Web Vitals
  - Test load times

## 🔄 CI/CD

- [ ] **Automated Testing**
  - Setup unit tests
  - Setup integration tests
  - Setup E2E tests

- [ ] **Deployment Pipeline**
  - Setup CI/CD (GitHub Actions, GitLab CI, etc.)
  - Automated build on commit
  - Automated tests before deployment
  - Approval step before production

## 📚 Documentation

- [ ] **API Documentation**
  - Document all endpoints
  - Include request/response examples
  - Document error codes

- [ ] **Deployment Guide**
  - Document deployment procedure
  - Document rollback procedure
  - Document maintenance schedule

- [ ] **Runbooks**
  - Create incident response runbooks
  - Create troubleshooting guides
  - Create escalation procedures

## 🆘 Disaster Recovery

- [ ] **Backup & Restore**
  - Test database backup
  - Test database restore
  - Verify backup integrity

- [ ] **Failover Plan**
  - Setup redundancy if possible
  - Document failover procedure
  - Test failover

- [ ] **Data Loss Prevention**
  - Regular backups (daily or more)
  - Redundant storage
  - Tested restore procedure

## 🚨 Post-Deployment

- [ ] **Monitor Logs**
  - Check application logs
  - Check error logs
  - Check access logs

- [ ] **Monitor Performance**
  - Check response times
  - Check error rates
  - Check database performance

- [ ] **User Feedback**
  - Collect user feedback
  - Monitor support tickets
  - Address issues promptly

- [ ] **Security Audit**
  - Run security scanner
  - Review access logs for suspicious activity
  - Monitor failed login attempts

## ✅ Final Sign-Off

- [ ] QA Approval
- [ ] Security Approval
- [ ] Performance Approval
- [ ] Operations Approval
- [ ] Product Owner Approval

---

## 🎯 Deployment Success Criteria

- ✅ All tests pass
- ✅ No high/critical vulnerabilities
- ✅ Performance metrics within targets
- ✅ All checklist items complete
- ✅ Team trained on procedures
- ✅ Monitoring and alerts active
- ✅ Backup and recovery tested

---

## 📞 Emergency Contacts

Document your emergency contacts:

| Role | Name | Phone | Email |
|------|------|-------|-------|
| DevOps Lead | | | |
| Database Admin | | | |
| Security Officer | | | |
| Ops Manager | | | |

---

**Last Updated**: November 12, 2025  
**Version**: 1.0

