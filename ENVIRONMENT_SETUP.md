# 🔐 Environment Setup Guide

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Get your Supabase credentials:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to **Settings** → **API**

3. **Update `.env.local` with your actual values:**
   - Replace `https://your-project-ref.supabase.co` with your Supabase URL
   - Replace `your_supabase_anon_key_here` with your anon/public key
   - Replace `your_supabase_service_role_key_here` with your service role key
   - Replace `your_random_32_character_secret_key_here` with a secure secret

4. **Generate a secure NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

## 🔑 Required Environment Variables

### Supabase Configuration
- **`NEXT_PUBLIC_SUPABASE_URL`** - Your Supabase project URL
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** - Public key for client-side operations
- **`SUPABASE_SERVICE_ROLE_KEY`** - Secret key for admin operations (server-side only)

### Authentication
- **`NEXTAUTH_SECRET`** - Secret key for session encryption
- **`NEXTAUTH_URL`** - Your application's base URL

## 🛡️ Security Features

### Automatic Validation
The application includes automatic environment validation that will:
- ✅ Check if all required variables are present
- ✅ Detect placeholder values and provide helpful error messages
- ✅ Validate Supabase URL format
- ✅ Prevent admin client creation with invalid keys

### Error Messages
If you see validation errors, the console will show:
```
❌ Supabase Configuration Errors:
  - NEXT_PUBLIC_SUPABASE_URL appears to be a placeholder value
  
🔧 To fix this:
  1. Copy .env.example to .env.local
  2. Replace placeholder values with your actual credentials
  3. Get credentials from: https://app.supabase.com/project/[your-project]/settings/api
```

## 🚀 Deployment

### Development
- Use `.env.local` with your development Supabase project credentials
- Never commit `.env.local` to version control

### Production
Set environment variables in your hosting platform:

#### Vercel
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

#### Netlify
Add environment variables in your Netlify dashboard under Site Settings → Environment Variables

#### Other Platforms
Refer to your hosting platform's documentation for setting environment variables.

## ⚠️ Security Best Practices

### Do NOT:
- ❌ Commit `.env.local` or any file with real credentials
- ❌ Share your service role key publicly
- ❌ Use the same keys for development and production
- ❌ Hard-code credentials in your source code

### DO:
- ✅ Use different Supabase projects for development and production
- ✅ Regenerate keys immediately if they are ever exposed
- ✅ Use strong, randomly generated secrets
- ✅ Regularly rotate your keys
- ✅ Monitor your Supabase project for unauthorized access

## 🔧 Troubleshooting

### Common Issues

**"Supabase configuration is invalid"**
- Check that `.env.local` exists and has real values (not placeholders)
- Verify your Supabase URL format includes `.supabase.co`
- Ensure your keys are correctly copied from the Supabase dashboard

**Admin operations failing**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that the key has service role permissions
- Ensure you're using the key from the correct Supabase project

**Authentication not working**
- Verify `NEXTAUTH_SECRET` is set and is at least 32 characters
- Check that `NEXTAUTH_URL` matches your application's URL
- For production, ensure `NEXTAUTH_URL` uses HTTPS

### Getting Help

1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Review the automatic validation output in the console
4. Ensure all environment variables are properly set

## 📁 File Structure

```
.env.example          # Template with placeholder values (committed)
.env.local           # Your actual credentials (gitignored)
.env.local.backup    # Backup of previous .env.local (gitignored)
ENVIRONMENT_SETUP.md # This documentation (committed)
```

Remember: Only `.env.example` and this documentation should be committed to version control. All other environment files are automatically ignored by git for security.