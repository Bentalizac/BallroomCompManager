# Deployment Guide

This guide covers deploying the BallroomCompManager application using Vercel (client) and Render (server).

## Prerequisites

- GitHub repository with your code
- Supabase project with credentials
- Domain name for custom subdomain
- Accounts on Vercel and Render (both free tier available)

## Architecture Overview

- **Client (Next.js)**: Deployed on Vercel
- **Server (Express + tRPC)**: Deployed on Render using Docker
- **Database**: Supabase (already hosted)

## Part 1: Deploy Server to Render

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub with the following files:
- `Dockerfile` (at project root)
- `.dockerignore` (at project root)
- Updated `server/src/server.ts` with CORS environment variable support

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ballroom-api` (or your preference)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave blank (Dockerfile is at root)
   - **Runtime**: Docker
   - **Instance Type**: Free

### Step 3: Configure Environment Variables

In the Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
CORS_ORIGIN=https://ballroom.yourdomain.com
```

**Note**: You can add multiple origins comma-separated: `https://ballroom.yourdomain.com,https://www.ballroom.yourdomain.com`

### Step 4: Deploy

Click **"Create Web Service"**. Render will:
1. Pull your code from GitHub
2. Build the Docker image
3. Deploy your server

Note your server URL (e.g., `https://ballroom-api.onrender.com`)

### Step 5: Verify Deployment

Test the health endpoint:
```bash
curl https://your-app.onrender.com/health
```

You should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Part 2: Deploy Client to Vercel

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Create Production Environment File

In the `client/` directory, create `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_API_URL=https://ballroom-api.onrender.com
```

Replace `ballroom-api.onrender.com` with your actual Render URL.

### Step 3: Deploy to Vercel

From the `client/` directory:

```bash
vercel
```

Follow the prompts:
- Link to existing project or create new one
- Accept the default settings
- Vercel will detect Next.js automatically

### Step 4: Configure Custom Domain

1. In the Vercel dashboard, go to your project
2. Navigate to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your subdomain: `ballroom.yourdomain.com`
5. Vercel will provide a CNAME target (e.g., `cname.vercel-dns.com`)

### Step 5: Set Environment Variables in Vercel

1. Go to **Settings** → **Environment Variables**
2. Add each variable from `.env.production`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
3. Select **"Production"** for each variable

### Step 6: Deploy to Production

```bash
vercel --prod
```

## Part 3: Configure DNS

### For AWS Route 53 (or your DNS provider)

1. Go to your hosted zone for `yourdomain.com`
2. Click **"Create record"**
3. Configure:
   - **Record name**: `ballroom`
   - **Record type**: `CNAME`
   - **Value**: The CNAME target from Vercel (e.g., `cname.vercel-dns.com`)
   - **TTL**: 300 (or default)
4. Click **"Create records"**

### DNS Propagation

- DNS changes can take 5-60 minutes to propagate
- You can check status with: `dig ballroom.yourdomain.com`
- Or use online tools like [whatsmydns.net](https://www.whatsmydns.net)

## Part 4: Update CORS After DNS Propagates

Once your domain is live:

1. Go to Render dashboard
2. Navigate to your web service
3. Go to **Environment** tab
4. Update `CORS_ORIGIN` to use your actual domain:
   ```
   CORS_ORIGIN=https://ballroom.yourdomain.com
   ```
5. Save changes (this will trigger a redeploy)

## Verification Checklist

### Server (Render)
- [ ] Health check works: `https://your-app.onrender.com/health`
- [ ] Environment variables are set
- [ ] Logs show no errors
- [ ] CORS origins are configured correctly

### Client (Vercel)
- [ ] Site loads at `https://ballroom.yourdomain.com`
- [ ] No console errors in browser
- [ ] Environment variables are set in Vercel dashboard
- [ ] Custom domain is properly configured

### Integration
- [ ] Client can communicate with server (check Network tab)
- [ ] Authentication works (Supabase login)
- [ ] No CORS errors in browser console
- [ ] API calls succeed

## Troubleshooting

### CORS Errors

**Problem**: Browser shows CORS policy errors

**Solution**:
1. Verify `CORS_ORIGIN` in Render matches your Vercel domain exactly
2. Include the protocol: `https://ballroom.yourdomain.com` (no trailing slash)
3. Check server logs in Render to see which origin is being rejected
4. For development, you can temporarily add `http://localhost:3000` to test

### Server Not Responding

**Problem**: API calls timeout or fail

**Solution**:
1. Check Render logs for errors
2. Verify health endpoint works
3. **Free tier note**: Render free services sleep after 15 minutes of inactivity
   - First request takes ~30 seconds to wake up
   - This is expected behavior on free tier

### Build Failures

**Problem**: Docker build fails on Render

**Solution**:
1. Check Render build logs for specific error
2. Common issues:
   - Missing dependencies in `package.json`
   - TypeScript compilation errors
   - Incorrect file paths in Dockerfile
3. Test Docker build locally:
   ```bash
   docker build -t ballroom-server .
   docker run -p 3001:3001 ballroom-server
   ```

### Environment Variables Not Working

**Problem**: App can't connect to Supabase or API

**Solution**:
1. Verify all required environment variables are set
2. In Vercel, ensure variables are set for "Production" environment
3. Check for typos in variable names (they're case-sensitive)
4. Redeploy after adding new variables

### Custom Domain Not Working

**Problem**: Domain doesn't resolve or shows "Not Found"

**Solution**:
1. Verify CNAME record is correct in DNS
2. Wait for DNS propagation (up to 1 hour)
3. Check with `dig ballroom.yourdomain.com`
4. Ensure domain is added and verified in Vercel dashboard
5. Check for conflicting A records

## Cost Information

### Free Tier Limits

**Render Free Tier**:
- 750 hours/month
- Services sleep after 15 minutes of inactivity
- 512 MB RAM
- Shared CPU

**Vercel Hobby Tier**:
- Unlimited personal projects
- 100 GB bandwidth/month
- Automatic HTTPS
- Global CDN

**Supabase Free Tier**:
- 500 MB database
- 50,000 monthly active users
- 1 GB file storage
- 2 GB bandwidth

**Total Monthly Cost**: $0

### When You Might Need to Upgrade

- **Render**: If your app needs to be always-on (no sleep)
- **Vercel**: If you exceed bandwidth limits (unlikely for class project)
- **Supabase**: If you exceed database or user limits (unlikely for class project)

## Monitoring Your Deployment

### Render Dashboard
- View server logs in real-time
- Monitor resource usage
- Check deployment history

### Vercel Dashboard
- View deployment logs
- Monitor bandwidth usage
- Track function execution times

### Supabase Dashboard
- Monitor database usage
- View authentication logs
- Check API request counts

## Continuous Deployment

Both Render and Vercel support automatic deployments:

### Automatic Deployments
- Push to `main` branch → Automatic deploy to production
- Push to other branches → Preview deployments (Vercel only)

### Manual Deployments
- **Render**: Click "Manual Deploy" in dashboard
- **Vercel**: Run `vercel --prod` from client directory

## Rollback Procedure

### Render
1. Go to dashboard → Your service
2. Click "Deploys" tab
3. Find previous successful deploy
4. Click "Redeploy"

### Vercel
1. Go to dashboard → Your project
2. Click "Deployments" tab
3. Find previous deployment
4. Click three dots → "Promote to Production"

## Next Steps

After successful deployment:

1. **Test thoroughly**: Click through all features
2. **Monitor logs**: Watch for errors in first 24 hours
3. **Set up alerts**: Configure Render/Vercel notifications
4. **Document your URLs**: Save them for your class submission
5. **Consider backups**: Set up database backups in Supabase

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment

## Questions?

If you encounter issues not covered here:
1. Check the service-specific documentation
2. Review server and client logs
3. Test each component independently (server health, client build, database connection)
4. Verify all environment variables are correct