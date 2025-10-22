# Supabase Email Verification Debug Checklist

## 1. Authentication Settings to Check

### In Supabase Dashboard → Authentication → Settings:

**Email Confirmation:**
- [ ] "Enable email confirmations" = ON
- [ ] "Enable automatic reconfirmation" = OFF (usually)
- [ ] "Double confirm email changes" = OFF (usually)

**URL Configuration:**
- [ ] Site URL = `http://localhost:3000`
- [ ] Redirect URLs = `http://localhost:3000/auth/verify`

**Email Rate Limits:**
- [ ] Check if you've hit rate limits (usually 30-60 emails per hour for free tier)

## 2. Email Provider Settings

### Check if you're using:

**A. Default Supabase SMTP (Limited)**
- Only works for development
- Has strict rate limits
- May not work reliably

**B. Custom SMTP Provider**
- Need to configure: SendGrid, Mailgun, AWS SES, etc.
- More reliable for production

## 3. Common Issues

**Issue 1: Rate Limits**
- Free tier: ~30 emails/hour
- Check Authentication → Logs for rate limit errors

**Issue 2: Email in Spam/Junk**
- Check spam folder
- Default Supabase emails often get flagged

**Issue 3: Invalid Redirect URL**
- Email links won't work if redirect URL is wrong
- Must exactly match configured URLs

**Issue 4: Email Template Issues**
- Check Authentication → Email Templates
- Ensure templates are properly configured

## 4. Testing Steps

1. **Check Supabase Logs:**
   - Go to Logs → Authentication
   - Look for email sending errors

2. **Test with Different Email:**
   - Try gmail, outlook, etc.
   - Some email providers block more aggressively

3. **Check Network Tab:**
   - Open browser dev tools
   - Watch for signup API response
   - Should show successful user creation

4. **Verify User Created:**
   - Go to Authentication → Users
   - Check if user appears (even unconfirmed)

## 5. Quick Fixes

**Fix 1: Add localhost to redirect URLs**
```
http://localhost:3000/auth/verify
http://localhost:3000/auth/callback
http://localhost:3000
```

**Fix 2: Reset email templates**
- Go to Authentication → Email Templates
- Reset to default if customized

**Fix 3: Check email provider**
- Consider setting up custom SMTP for reliability