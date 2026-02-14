# Workflow Engine

A full-stack workflow automation platform similar to Zapier, built with Node.js, TypeScript, React, and MySQL.

APP Link:- https://workflow-engine-1-i5f9.onrender.com/

## Features

- **Workflow Management**: Create, edit, delete, and list workflows
- **HTTP Triggers**: Each workflow gets a unique webhook URL
- **Step Types**:
  - **Filter**: Gate execution based on conditions (eq, neq operators)
  - **Transform**: Modify data with default values, templates, and field picking
  - **HTTP Request**: Call external APIs with timeout and retry support
- **Execution History**: View detailed run logs with step-by-step results
- **JSON Editor**: Monaco-powered editor for defining workflow steps

## Architecture

```
workflow-engine/
├── apps/
│   ├── api/              # Node.js + Express + TypeScript backend
│   └── web/              # React + TypeScript frontend
├── packages/
│   ├── shared-types/     # Shared TypeScript types
│   └── database/         # Prisma schema and client
├── docker-compose.yml    # Local MySQL setup
└── README.md
```

### Backend Architecture (Layered)

- **Routes**: HTTP layer, request routing
- **Controllers**: Request/response handling
- **Services**: Business logic, workflow engine
- **Repositories**: Database access (Prisma)
- **Executors**: Strategy pattern for step execution

### Design Patterns Used

1. **Dependency Injection**: Services and repositories are injectable for testability
2. **Strategy Pattern**: Step executors for different step types
3. **Repository Pattern**: Data access abstraction
4. **Template Method**: Workflow execution flow

## Tech Stack

### Backend
- Node.js 20+
- TypeScript 5.4+
- Express.js
- Prisma ORM
- MySQL 8.0
- Zod (validation)
- Winston (logging)

### Frontend
- React 19+
- TypeScript 5.4+
- Vite
- Tailwind CSS
- shadcn/ui components
- Monaco Editor
- React Query (via custom hooks)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local MySQL)
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo>
cd workflow-engine
npm install
```

### 2. Start MySQL

```bash
docker-compose up -d
```

This starts:
- MySQL on port 3306
- Adminer (DB UI) on port 8080

### 3. Setup Database

```bash
# Generate Prisma client
cd packages/database
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### 4. Start Backend

```bash
cd apps/api
cp .env.example .env
npm run dev
```

API will be available at `http://localhost:3001`

### 5. Start Frontend

```bash
cd apps/web
cp .env.example .env
npm run dev
```

Frontend will be available at `http://localhost:5173`

## API Endpoints

### Workflow Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workflows` | List all workflows |
| POST | `/workflows` | Create a new workflow |
| GET | `/workflows/:id` | Get workflow by ID |
| PATCH | `/workflows/:id` | Update workflow |
| DELETE | `/workflows/:id` | Delete workflow |
| GET | `/workflows/:id/runs` | Get workflow run history |

### Workflow Triggers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/t/:path` | Trigger workflow by path |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## Workflow Definition

### Example Workflow

```json
{
  "name": "Unlock Alert",
  "enabled": true,
  "steps": [
    {
      "type": "filter",
      "conditions": [
        { "path": "type", "op": "eq", "value": "lock.unlock" },
        { "path": "success", "op": "eq", "value": false }
      ]
    },
    {
      "type": "transform",
      "ops": [
        { "op": "default", "path": "actor_name", "value": "Unknown" },
        { "op": "template", "to": "title", "template": "Event {{type}} by {{actor_name}}" }
      ]
    },
    {
      "type": "http_request",
      "method": "POST",
      "url": "https://hooks.slack.com/services/XXX/YYY/ZZZ",
      "headers": { "Content-Type": "application/json" },
      "body": { "mode": "custom", "value": { "text": "{{title}}" } },
      "timeoutMs": 2000,
      "retries": 3
    }
  ]
}
```

### Step Types

#### Filter Step

Gates workflow execution based on conditions.

```json
{
  "type": "filter",
  "conditions": [
    { "path": "field", "op": "eq", "value": "value" }
  ]
}
```

**Operators:**
- `eq`: Equals
- `neq`: Not equals

If any condition fails, the workflow run is marked as `skipped`.

#### Transform Step

Modifies the execution context.

```json
{
  "type": "transform",
  "ops": [
    { "op": "default", "path": "field", "value": "default" },
    { "op": "template", "to": "output", "template": "{{field}}" },
    { "op": "pick", "paths": ["field1", "field2"] }
  ]
}
```

**Operations:**
- `default`: Set value if field is missing/null/empty
- `template`: Create string using `{{variable}}` placeholders
- `pick`: Keep only specified fields

#### HTTP Request Step

Calls external APIs.

```json
{
  "type": "http_request",
  "method": "POST",
  "url": "https://api.example.com/webhook",
  "headers": { "Content-Type": "application/json" },
  "body": { "mode": "custom", "value": { "key": "{{variable}}" } },
  "timeoutMs": 5000,
  "retries": 3
}
```

**Body Modes:**
- `ctx`: Send entire execution context
- `custom`: Send custom JSON object (supports templates)

**Retry Behavior:**
- Retries on network errors and 5xx responses
- Exponential backoff: 100ms, 200ms, 400ms, ...

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="mysql://workflow_user:workflow_pass@localhost:3306/workflow_engine"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
```

## Testing the Minimum Check

To demonstrate posting to Slack/Discord:

1. Create a workflow with an HTTP request step pointing to your Slack webhook
2. Copy the trigger URL from the workflow list
3. Send a test POST request:

```bash
curl -X POST http://localhost:3001/t/YOUR_TRIGGER_PATH \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "message": "Hello from Workflow Engine!"}'
```

## Assumptions & Trade-offs

### Assumptions

1. **Single Instance**: The current implementation assumes a single API instance. For horizontal scaling, a message queue (Redis/RabbitMQ) would be needed.

2. **Synchronous Execution**: Workflow triggers return synchronous responses. For long-running workflows, async processing with webhooks would be better.

3. **No Authentication**: The API is open. In production, JWT or API key authentication should be added.

4. **Local Template Engine**: A simple regex-based template engine is used. For complex use cases, a library like Handlebars could be integrated.

### Trade-offs

1. **Prisma JSON Fields**: Workflow steps and triggers are stored as JSON for flexibility. This trades some type safety for schema evolution ease.

2. **In-Memory Execution**: Workflow runs are executed in the same process. This is simpler but limits scalability.

3. **No Step Output Storage**: Only step results (status, duration, error) are stored, not the output data of each step. This reduces storage but limits debugging.

4. **Simple Retry Logic**: Exponential backoff is basic. More sophisticated retry strategies (jitter, circuit breaker) could be added.

## Deployment

### Render (Recommended)

1. Create a new Web Service
2. Connect your GitHub repo
3. Set build command: `npm install && npm run build`
4. Set start command: `cd apps/api && npm start`
5. Add environment variables
6. Create a MySQL database (or use Render PostgreSQL with minor changes)

### Railway

1. Connect your GitHub repo
2. Railway will auto-detect the Node.js app
3. Add a MySQL database
4. Set environment variables

### Manual Deployment

```bash
# Build all packages
npm run build

# Run migrations
cd packages/database
npx prisma migrate deploy

# Start API
cd apps/api
npm start
```

## Development

### Running Tests

```bash
# Backend tests
cd apps/api
npm test

# Frontend tests
cd apps/web
npm test
```

### Database Migrations

```bash
cd packages/database

# Create migration
npx prisma migrate dev --name your_migration_name

# Deploy migration
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

## License

MIT
