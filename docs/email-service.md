# Email Service Configuration Guide

## Overview
The email service supports multiple free email providers and automatically falls back to development-friendly options when credentials are not provided.

## Free Email Service Providers (2025)

### 1. **Ethereal Email** (Development - Recommended)
- **Automatic setup**: No configuration needed
- **Preview**: View emails in browser
- **Free**: Unlimited for development
- **Setup**: Automatically configured when no credentials provided

### 2. **Gmail SMTP** (Production - Free)
- **Free tier**: 100 emails/day
- **Reliable**: Google's infrastructure
- **Easy setup**: Use App Passwords

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Setup Steps:**
1. Enable 2-factor authentication on Gmail
2. Generate App Password: Google Account > Security > App Passwords
3. Use the generated password in SMTP_PASSWORD

### 3. **SendGrid** (Production - Free)
- **Free tier**: 100 emails/day
- **Professional**: Delivery analytics
- **API + SMTP**: Both options available

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### 4. **Mailgun** (Production - Free)
- **Free tier**: 5,000 emails/month
- **Features**: Tracking, analytics
- **Reliable**: Rackspace infrastructure

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

### 5. **Postmark** (Production - Free)
- **Free tier**: 100 emails/month
- **Fast**: Optimized for transactional emails
- **High deliverability**: Excellent reputation

```env
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USERNAME=your-server-token
SMTP_PASSWORD=your-server-token
```

## Configuration

### Environment Variables
```env
# Required for production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Optional
SUPPORT_MAIL=support@yourapp.com
CLIENT_URL=https://yourapp.com
```

### Development Mode
If no email credentials are provided, the service automatically:
1. Creates Ethereal Email test account
2. Provides preview URLs in logs
3. Sends actual emails to Ethereal's inbox

### Production Mode
With proper credentials:
1. Sends real emails
2. Verifies SMTP connection on startup
3. Logs email delivery status

## Usage Examples

### Basic Email
```javascript
import emailService from './services/email.service.js';

const result = await emailService.sendEmail(
  'user@example.com',
  'Welcome!',
  'Plain text content',
  '<h1>HTML content</h1>'
);
```

### Pre-built Templates
```javascript
// Password reset
await emailService.sendResetPasswordEmail('user@example.com', 'reset-token');

// Email verification
await emailService.sendVerificationEmail('user@example.com', 'verify-token');

// Welcome email
await emailService.sendWelcomeEmail('user@example.com', 'John Doe');

// OTP email
await emailService.sendOtpEmail('user@example.com', '123456');
```

## Email Templates

The service includes responsive HTML templates for:
- Password reset
- Email verification
- Welcome messages
- OTP codes

Templates are mobile-friendly and follow email best practices.

## Error Handling

The service gracefully handles:
- Missing credentials (falls back to Ethereal)
- SMTP connection failures
- Invalid email addresses
- Rate limiting

## Monitoring

Logs include:
- Email delivery status
- Preview URLs (development)
- Error messages
- Performance metrics

## Security Best Practices

1. **Use App Passwords**: Never use main account passwords
2. **Environment Variables**: Store credentials securely
3. **Rate Limiting**: Implement sending limits
4. **Validation**: Validate email addresses
5. **Encryption**: Use TLS/SSL for SMTP

## Troubleshooting

### Common Issues

1. **Authentication failed**
   - Check username/password
   - Verify App Password for Gmail
   - Check 2FA settings

2. **Connection timeout**
   - Verify SMTP host/port
   - Check firewall settings
   - Try different ports (25, 465, 587)

3. **Emails not delivered**
   - Check spam folder
   - Verify sender reputation
   - Review email content

### Debug Mode
Enable detailed logging:
```javascript
// In development
NODE_ENV=development
```

## Recommendations

- **Development**: Use Ethereal Email (automatic)
- **Small projects**: Gmail SMTP (100 emails/day)
- **Growing apps**: SendGrid (100 emails/day)
- **High volume**: Mailgun (5,000 emails/month)
- **Enterprise**: Postmark (premium features)

## Migration Guide

To switch providers:
1. Update environment variables
2. Test with a single email
3. Monitor delivery rates
4. Update DNS records if needed (for custom domains)
