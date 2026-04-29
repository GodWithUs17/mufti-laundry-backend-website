# Render Backend Deployment Guide

## Prerequisites

- Render account (https://render.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- PostgreSQL database (Render provides free tier)
- Backend code with proper environment variables

## Step 1: Prepare Your Repository

### 1.1 Create `.env.example` (Already Done ✅)
This file documents all required environment variables without exposing secrets.

### 1.2 Add to .gitignore
```bash
# Already configured - check .gitignore
```

### 1.3 Commit Changes
```bash
cd laundry-website-backend
git add .
git commit -m "Setup Render deployment configuration"
git push origin main
```

## Step 2: Create Render Account & Connect Repository

1. Go to [https://render.com](https://render.com)
2. Sign up or log in
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Select: `laundry-website-backend` folder

## Step 3: Configure Web Service on Render

### 3.1 Basic Settings
- **Name**: `laundry-backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npx prisma migrate deploy`
- **Start Command**: `node server.js`
- **Plan**: Free (or Starter for production)

### 3.2 Environment Variables
Click **Environment** → **Add Environment Variable**:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `10000` | Render assigns dynamic port |
| `JWT_SECRET` | `your-secret-key` | Generate a strong random key |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Your Vercel frontend URL |
| `DATABASE_URL` | From PostgreSQL service | Copy from database connection |

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Connect PostgreSQL Database
1. In Render dashboard, create a **PostgreSQL Database**
   - Name: `laundry-db`
   - Plan: Free
2. Once created, copy the Internal Database URL
3. Paste into `DATABASE_URL` environment variable in Web Service

## Step 4: Deploy

1. Render auto-detects `.git` pushes
2. Any push to your main branch triggers automatic deployment
3. View **Logs** to monitor build progress

## Step 5: Verify Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-backend.onrender.com/

# Test API
curl https://your-backend.onrender.com/api/auth/login
```

## Important Notes

### Database Migrations
The build command includes:
```bash
npx prisma migrate deploy
```

This automatically runs pending migrations on the PostgreSQL database. Make sure your `prisma.schema` is committed to git.

### Force Database Reset (Development Only)
If you need to reset the database:
```bash
npx prisma migrate reset
```

⚠️ **WARNING**: This deletes all data. Only use in development.

### Seed Database (Optional)
Create a postbuild script in `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

Then in Render build command:
```bash
npm install && npx prisma migrate deploy && npm run prisma:seed
```

## Troubleshooting

### Build Fails
- Check **Logs** tab in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct dependencies

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure IP whitelist allows Render's IP (usually auto-enabled)

### Migrations Fail
```bash
# Rollback migrations locally
npx prisma migrate resolve --rolled-back

# Push corrected migration
git commit -am "Fix migration"
git push origin main
```

### Cannot Connect from Frontend
- Verify `CORS_ORIGIN` matches your frontend domain
- Check CORS is enabled in `app.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

## Production Checklist

- [ ] `NODE_ENV=production` set in Render
- [ ] `JWT_SECRET` is a random 32+ character string
- [ ] `CORS_ORIGIN` points to production frontend
- [ ] Database backups enabled (Render settings)
- [ ] API key/secrets stored as environment variables (never in code)
- [ ] `.env` file is in `.gitignore`
- [ ] All database migrations are tested locally
- [ ] Health check endpoint working (`GET /`)

## Updating Backend Code

Simply push to main branch:
```bash
git add .
git commit -m "Update API endpoints"
git push origin main
```

Render will automatically rebuild and deploy within 1-2 minutes.

## Monitoring & Logs

View logs in Render dashboard:
1. Select your service
2. Click **Logs** tab
3. See real-time deployment and runtime logs

## Next Steps

1. Update `CORS_ORIGIN` in Render with your Vercel frontend URL
2. Update frontend's `VITE_API_BASE_URL` to your Render backend URL
3. Test API calls from frontend
4. Monitor logs for any issues

## Support

- Render Docs: https://render.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Contact Render Support: https://render.com/support
