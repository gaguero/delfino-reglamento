# Railway Deployment Guide

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository already created: https://github.com/gaguero/delfino-reglamento

## Step-by-Step Deployment

### 1. Create New Project in Railway

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`gaguero/delfino-reglamento`**
5. Click **"Deploy Now"**

Railway will automatically:
- Detect it's a Next.js project
- Start building the application
- Deploy to a temporary URL

### 2. Add PostgreSQL Database

1. In your Railway project dashboard
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. PostgreSQL will be provisioned automatically
5. DATABASE_URL will be auto-linked to your Next.js service

### 3. Configure Environment Variables

In your Railway project settings → Variables tab, add:

```env
# Database (auto-configured by Railway PostgreSQL)
DATABASE_URL=<automatically set>

# Auth.js Configuration
NEXTAUTH_URL=<your-railway-app-url>
NEXTAUTH_SECRET=<generate-new-secret>

# Environment
NODE_ENV=production
```

#### Generate NEXTAUTH_SECRET

Run locally:
```bash
openssl rand -base64 32
```

Or use any secure random string generator (32+ characters).

#### Get Your Railway App URL

After deployment, Railway provides a URL like:
`https://delfino-reglamento-production.up.railway.app`

Use this for `NEXTAUTH_URL`.

### 4. Run Database Migrations

#### Option A: Using Railway CLI (Recommended)

```bash
# In your local project directory
cd delfino-reglamento

# Link to Railway project
railway link

# Run migrations
railway run npx prisma migrate deploy

# Seed the database
railway run npx prisma db seed
```

#### Option B: Via Railway Dashboard

1. Go to your service in Railway dashboard
2. Click on **"Deployments"** tab
3. Click **"..."** on latest deployment
4. Select **"Deploy Again"** with custom command:
   ```
   npx prisma migrate deploy && npx prisma db seed && npm run build && npm start
   ```

### 5. Verify Deployment

1. Visit your Railway app URL
2. You should see the homepage with articles
3. Navigate to `/admin/login`
4. Login with:
   - Email: `gagueromesen@gmail.com`
   - Password: `ChangeMe2024!`
5. **IMPORTANT**: Change password immediately!

### 6. Configure Custom Domain (Optional)

1. In Railway project → Service → Settings
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** for a railway.app subdomain
4. Or add your custom domain:
   - Add domain in Railway settings
   - Update DNS records (CNAME)
   - Update `NEXTAUTH_URL` environment variable

### 7. Enable GitHub Auto-Deploy

Railway automatically sets this up, but verify:

1. Go to Service Settings → GitHub
2. Ensure **"Auto-deploy"** is enabled
3. Set branch to `master`
4. Every push to master will trigger automatic deployment

## Post-Deployment Tasks

### 1. Change Master Password

```sql
-- Connect to Railway PostgreSQL
-- Via Railway CLI:
railway connect postgres

-- Or use connection string from Railway dashboard

-- Update password (generate hash first with bcrypt)
UPDATE users
SET password_hash = '$2a$12$<new-bcrypt-hash>'
WHERE email = 'gagueromesen@gmail.com';
```

Or login and change via UI (when feature is implemented).

### 2. Create Additional Users

1. Login to admin panel
2. Go to **Users** → **New User**
3. Create users with @delfino.cr emails

### 3. Import Real Data

See `DATA_MIGRATION.md` for importing data from `reglamentoasambleacr.html`

## Monitoring & Maintenance

### View Logs

```bash
railway logs
```

Or in Railway dashboard → Deployments → View Logs

### Database Management

```bash
# Open Prisma Studio on Railway database
railway run npx prisma studio
```

### Restart Service

In Railway dashboard → Service → Restart

### Monitor Usage

Railway dashboard → Project → Usage tab
- Track database size
- Monitor bandwidth
- Check build minutes

## Cost Optimization

### Current Plan: Hobby ($5/month)

Includes:
- 500 hours runtime
- 5GB storage
- 100GB bandwidth

### Tips to Stay Within Limits:

1. **Enable caching**: Next.js static pages
2. **Optimize images**: Use Next.js Image component
3. **Database indexing**: Already configured in schema
4. **Connection pooling**: Prisma handles this

### Upgrade if Needed

If traffic increases:
- Pro Plan: $20/month
- Dedicated PostgreSQL: Better performance

## Troubleshooting

### Build Failures

**Error**: `Prisma Client not generated`
**Solution**: Railway should run `prisma generate` automatically. If not, add to package.json:
```json
"scripts": {
  "build": "prisma generate && next build"
}
```

**Error**: `Database connection failed`
**Solution**: Ensure PostgreSQL service is running and DATABASE_URL is set

### Runtime Errors

**Error**: `NEXTAUTH_URL not configured`
**Solution**: Set NEXTAUTH_URL in Railway environment variables

**Error**: `Unauthorized` on admin pages
**Solution**: Clear browser cookies and login again

### Database Issues

**Error**: `Migration failed`
**Solution**:
```bash
railway run npx prisma migrate reset
railway run npx prisma db seed
```

## Environment Variables Checklist

- [ ] `DATABASE_URL` (auto-configured)
- [ ] `NEXTAUTH_URL` (your Railway URL)
- [ ] `NEXTAUTH_SECRET` (random 32+ char string)
- [ ] `NODE_ENV=production`

## Deployment Commands Reference

```bash
# Link local project to Railway
railway link

# View environment variables
railway variables

# Run command on Railway
railway run <command>

# Open Railway dashboard
railway open

# Check deployment status
railway status

# View logs
railway logs

# Connect to PostgreSQL
railway connect postgres
```

## Security Checklist

- [ ] Changed master password
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] DATABASE_URL is not exposed publicly
- [ ] Railway project is set to private (if applicable)
- [ ] SSL/HTTPS is enabled (Railway default)
- [ ] Email domain restriction is enforced

## Next Steps After Deployment

1. **Test all functionality**:
   - Public article viewing
   - Admin login
   - User management
   - Annotation editing

2. **Import production data**:
   - Parse reglamentoasambleacr.html
   - Run migration script
   - Verify data integrity

3. **Set up monitoring**:
   - Railway alerts
   - Error tracking (optional: Sentry)
   - Uptime monitoring

4. **Documentation for team**:
   - User guide for editors
   - Admin workflows
   - Content guidelines

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/gaguero/delfino-reglamento/issues
