# Deployment Guide

This guide covers deploying the Workflow Engine to various cloud platforms.

## Prerequisites

1. Node.js 20+ installed locally
2. A MySQL database (can use cloud providers like PlanetScale, AWS RDS, or Railway)
3. Git repository pushed to GitHub

## Environment Setup

Create a `.env` file in `apps/api/` with:

```env
DATABASE_URL="mysql://user:password@host:3306/workflow_engine"
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
   - `DATABASE_URL`: Your MySQL connection string
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

#### Create MySQL Database
1. Click "New +" → "MySQL"
2. Choose plan (Free tier available)
3. Copy the internal connection string

## Option 2: Railway

### Step 1: Create Railway Account
Sign up at [railway.app](https://railway.app)

### Step 2: Deploy from GitHub
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### Step 3: Add MySQL Database
1. Click "New" → "Database" → "Add MySQL"
2. Railway will automatically add the `DATABASE_URL` to your service

### Step 4: Configure Service
1. Select your service
2. Go to "Settings" → "Build"
3. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `cd apps/api && npm start`

### Step 5: Add Frontend Service (Optional)
1. Click "New" → "Empty Service"
2. Connect to same repo
3. Set:
   - **Build Command**: `cd apps/web && npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`

## Option 3: Heroku

### Step 1: Create Heroku Account
Sign up at [heroku.com](https://heroku.com)

### Step 2: Install Heroku CLI
```bash
npm install -g heroku
```

### Step 3: Create App
```bash
heroku create your-workflow-engine
```

### Step 4: Add MySQL
```bash
heroku addons:create jawsdb:kitefin
```

### Step 5: Deploy
```bash
git push heroku main
```

### Step 6: Run Migrations
```bash
heroku run npm run db:deploy
```

## Option 4: AWS (EC2 + RDS)

### Step 1: Create RDS MySQL Database
1. Go to AWS RDS Console
2. Create MySQL 8.0 instance
3. Note the endpoint, username, and password

### Step 2: Create EC2 Instance
1. Launch Ubuntu 22.04 instance
2. SSH into the instance

### Step 3: Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone <your-repo>
cd workflow-engine

# Install dependencies
npm install

# Build
npm run build

# Run migrations
npm run db:deploy

# Start with PM2
pm2 start apps/api/dist/index.js --name workflow-api
```

### Step 4: Configure Nginx (Optional)
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/workflow-engine
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/workflow-engine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

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
- Verify `DATABASE_URL` format: `mysql://user:pass@host:3306/dbname`
- Check firewall rules allow connections from your server IP
- Ensure MySQL user has proper permissions

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
| Railway | Free | Free | $0 (limited) |
| Heroku | Mini | Eco | ~$16 |
| AWS RDS | db.t3.micro | t3.micro | ~$25 |

*Free tiers have limitations. Check each platform's pricing page for details.*