# 🚀 Deployment Guide

Complete guide for deploying your FinTech Wallet POS system to production.

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment](#vercel-deployment-recommended)
- [Netlify Deployment](#netlify-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Pre-Deployment Checklist

Before deploying, ensure you have:

### Required
- ✅ Tested application locally
- ✅ Paystack test payments working
- ✅ Supabase database configured
- ✅ Git repository set up
- ✅ Environment variables ready

### Recommended
- ✅ Custom domain ready
- ✅ Paystack live keys (if going live)
- ✅ SSL certificate (auto with Vercel/Netlify)
- ✅ Team members invited
- ✅ Backup strategy planned

### Optional
- ⬜ Custom logo/branding
- ⬜ Analytics tracking (Google Analytics)
- ⬜ Error monitoring (Sentry)
- ⬜ CDN configuration

## Vercel Deployment (Recommended)

### Why Vercel?
- ⚡ Lightning-fast global CDN
- 🔄 Automatic deployments from Git
- 🌐 Free SSL certificates
- 📊 Built-in analytics
- 🔧 Easy environment management

### Step-by-Step

#### 1. Prepare Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/fintech-pos.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Vercel CLI (Fast)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? fintech-pos
# - Directory? ./
# - Override settings? No
```

**Option B: Vercel Dashboard (Easier)**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

#### 3. Add Environment Variables

After deployment:

1. Go to Project Settings
2. Click "Environment Variables"
3. Add:

```
Name: VITE_PAYSTACK_PUBLIC_KEY
Value: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environment: Production
```

4. Click "Save"
5. Redeploy (Vercel → Deployments → Redeploy)

#### 4. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Wait for SSL (5-10 minutes)

### Vercel Configuration File

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Netlify Deployment

### Step-by-Step

#### 1. Build Locally

```bash
# Test production build
npm run build

# Check dist folder
ls dist/
```

#### 2. Deploy to Netlify

**Option A: Netlify CLI**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Drag & drop dist folder when prompted
```

**Option B: Netlify Dashboard**

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import existing project"
3. Connect to GitHub
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click "Deploy site"

#### 3. Configure Redirects

Create `netlify.toml` in root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 4. Add Environment Variables

1. Site Settings → Build & Deploy → Environment
2. Add variables:

```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Save and redeploy

## Environment Variables

### Required Variables

```bash
# Paystack Public Key (Required)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Test vs Live Keys

**Development/Staging:**
```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Production:**
```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### How to Add

**Vercel:**
- Dashboard → Settings → Environment Variables

**Netlify:**
- Site settings → Build & Deploy → Environment

**Manual (Not Recommended):**
- Never commit `.env` to Git
- Use hosting platform's environment management

## Post-Deployment

### 1. Verify Deployment

Check these features work:

- [ ] Login/Signup
- [ ] Dashboard loads
- [ ] POS works
- [ ] Payments process (test mode)
- [ ] Transactions save
- [ ] Analytics show

### 2. Test Payments

**Test Mode:**
1. Make a test sale
2. Use test card
3. Verify transaction completes
4. Check Paystack dashboard

**Live Mode (after verification):**
1. Make small test (GHS 1-5)
2. Use real card
3. Verify funds received
4. Test refund process

### 3. Set Up Monitoring

**Error Tracking (Sentry):**

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

**Analytics (Google Analytics):**

```bash
npm install react-ga4
```

```typescript
// src/main.tsx
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
```

### 4. Performance Optimization

**Enable Compression:**
- Already enabled on Vercel/Netlify

**CDN Benefits:**
- Automatic with Vercel/Netlify
- Global edge network
- Fast page loads

**Caching:**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Security Checklist

Before going live:

- [ ] All API keys in environment variables
- [ ] No sensitive data in code
- [ ] HTTPS enabled (automatic)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation working
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] Authentication working
- [ ] Role permissions correct

## Custom Domain Setup

### Vercel

1. **Add Domain:**
   - Settings → Domains
   - Add your domain
   - Choose primary domain

2. **Update DNS:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for SSL:**
   - Usually 5-10 minutes
   - Automatic Let's Encrypt

### Netlify

1. **Add Domain:**
   - Domain Settings → Add custom domain

2. **Update DNS:**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

## Troubleshooting

### Build Fails

**Problem:** Build errors in production

**Solutions:**
```bash
# Test build locally first
npm run build

# Check for TypeScript errors
npm run tsc --noEmit

# Check dependencies
npm install

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Working

**Problem:** Paystack or features not working

**Solutions:**
1. Verify variable names start with `VITE_`
2. Redeploy after adding variables
3. Check variable values (no quotes)
4. Verify environment (production/preview/development)

### 404 Errors on Routes

**Problem:** Page refresh gives 404

**Solutions:**

**Vercel:**
- Add `vercel.json` with redirects (see above)

**Netlify:**
- Add `netlify.toml` with redirects (see above)
- Or create `public/_redirects`:
  ```
  /*    /index.html   200
  ```

### Slow Loading

**Problem:** Pages load slowly

**Solutions:**
1. Enable CDN (automatic on Vercel/Netlify)
2. Optimize images
3. Use lazy loading
4. Enable caching
5. Minimize bundle size

### Payments Not Working

**Problem:** Paystack payments fail in production

**Solutions:**
1. Check public key is correct
2. Verify environment variable is set
3. Check browser console for errors
4. Test in incognito mode
5. Verify Paystack account status
6. Check payment method is enabled

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check transaction success rate
- Review Paystack dashboard

**Weekly:**
- Review analytics
- Check for updates
- Backup database
- Test key features

**Monthly:**
- Update dependencies
- Review security
- Optimize performance
- Plan new features

### Backup Strategy

**Database:**
- Supabase has automatic backups
- Download manual backups weekly
- Test restore process

**Code:**
- Git commits
- GitHub repository
- Regular tags/releases

## Rollback Plan

If deployment fails:

**Vercel:**
1. Go to Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

**Netlify:**
1. Go to Deploys
2. Find last working deploy
3. Click "Publish deploy"

## Support

Need help deploying?

- 📖 [Vercel Docs](https://vercel.com/docs)
- 📖 [Netlify Docs](https://docs.netlify.com)
- 📧 Email: support@example.com
- 💬 GitHub Issues

---

**Congratulations on deploying! 🎉**

Your FinTech POS system is now live and ready to process real transactions!
