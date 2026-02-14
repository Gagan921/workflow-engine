# Deployment Guide

This guide covers deploying the Workflow Engine to various cloud platforms.

## Prerequisites

1. Node.js 20+ installed locally
2. A postgres database (can use cloud providers like PlanetScale, AWS RDS, or Railway)
3. Git repository pushed to GitHub

## Environment Setup

Create a `.env` file in `apps/api/` with:

```env
DATABASE_URL="postgres://user:password@host:3306/workflow_engine"
NODE_ENV=production
PORT=3001
```

## Option 1: Render (Recommended)

### Step 1: Create Render Account
Sign up at [render.com](https://render.com)

### Step 2: Create Blueprint
1. In your Render dashboard, click "Blueprints"
2. Click "New Blueprint Instance"
3. Connect your GitHub repository
4. Render will read the `render.yaml` file and create services automatically

### Step 3: Manual Setup (Alternative)

#### Create Web Service for API
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: workflow-engine-api
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `cd apps/api && npm start`
   - **Plan**: Free

4. Add Environment Variables:
   - `DATABASE_URL`: Your postgres connection string
   - `NODE_ENV`: production
   - `PORT`: 10000

#### Create Static Site for Frontend
1. Click "New +" → "Static Site"
2. Connect your GitHub repo
3. Configure:
   - **Name**: workflow-engine-web
   - **Build Command**: `cd apps/web && npm install && npm run build`
   - **Publish Directory**: `apps/web/dist`

4. Add Environment Variables:
   - `VITE_API_URL`: URL of your API service

#### Create Postgres Database
1. Click "New +" → "Postgres"
2. Choose plan (Free tier available)
3. Copy the internal connection string

## Database Migration

After deployment, run migrations:

```bash
# Local
npm run db:migrate

# Production (Render/Railway)
# Use the platform's CLI or dashboard to run:
npm run db:deploy
```

## Verification

1. Check health endpoint:
   ```bash
   curl https://your-api-url/health
   ```

2. Create a test workflow via the frontend

3. Trigger the workflow:
   ```bash
   curl -X POST https://your-api-url/t/YOUR_TRIGGER_PATH \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format: `postgres://user:pass@host:3306/dbname`
- Check firewall rules allow connections from your server IP
- Ensure postgres user has proper permissions

### Build Failures
- Check Node.js version (requires 20+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check build logs for TypeScript errors

### Runtime Errors
- Check logs: `pm2 logs` (if using PM2)
- Verify environment variables are set
- Ensure database migrations have run

## Security Considerations

1. **Authentication**: The current implementation has no auth. Add JWT or API keys for production.

2. **HTTPS**: Always use HTTPS in production. Render/Railway provide this automatically.

3. **Secrets**: Never commit `.env` files. Use platform secret management.

4. **CORS**: Configure `FRONTEND_URL` to only allow your frontend domain.

5. **Rate Limiting**: Add rate limiting to prevent abuse:
   ```bash
   npm install express-rate-limit
   ```

## Monitoring

### Logs
- Render: Dashboard → Service → Logs
- Railway: Dashboard → Service → Deployments → Logs
- PM2: `pm2 logs`

### Health Checks
Set up monitoring for `/health` endpoint using:
- UptimeRobot (free)
- Pingdom
- Datadog

## Scaling

### Horizontal Scaling
For high traffic, consider:
1. Using Redis for session storage
2. Implementing a message queue (Bull/Redis) for async processing
3. Load balancing across multiple instances

### Database Scaling
- Use read replicas for heavy read workloads
- Consider connection pooling (Prisma handles this)
- Monitor slow queries with RDS Performance Insights

## Cost Estimates

| Platform | Database | Compute | Monthly Cost |
|----------|----------|---------|--------------|
| Render | Free | Free | $0 |
*Free tiers have limitations. Check each platform's pricing page for details.*
