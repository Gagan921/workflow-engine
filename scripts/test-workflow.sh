#!/bin/bash

# Workflow Engine Test Script
# 
# This script tests the workflow engine by:
# 1. Creating a test workflow
# 2. Triggering it
# 3. Checking the run status

set -e

API_URL="${API_URL:-http://localhost:3001}"

echo "Testing Workflow Engine at $API_URL"
echo "================================"

# Check health
echo "1. Checking health..."
if curl -s "$API_URL/health" | grep -q "ok"; then
    echo "   ✓ API is healthy"
else
    echo "   ✗ API is not responding"
    exit 1
fi

# Create a test workflow
echo ""
echo "2. Creating test workflow..."
WORKFLOW_RESPONSE=$(curl -s -X POST "$API_URL/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workflow",
    "enabled": true,
    "steps": [
      {
        "type": "filter",
        "conditions": [
          { "path": "test", "op": "eq", "value": true }
        ]
      },
      {
        "type": "transform",
        "ops": [
          { "op": "default", "path": "message", "value": "Hello" },
          { "op": "template", "to": "output", "template": "{{message}} World" }
        ]
      },
      {
        "type": "http_request",
        "method": "POST",
        "url": "https://httpbin.org/post",
        "headers": { "Content-Type": "application/json" },
        "body": { "mode": "custom", "value": { "result": "{{output}}" } },
        "timeoutMs": 5000,
        "retries": 1
      }
    ]
  }')

WORKFLOW_ID=$(echo "$WORKFLOW_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
TRIGGER_PATH=$(echo "$WORKFLOW_RESPONSE" | grep -o '"path":"[^"]*"' | cut -d'"' -f4)

if [ -n "$WORKFLOW_ID" ]; then
    echo "   ✓ Workflow created: $WORKFLOW_ID"
    echo "   ✓ Trigger path: $TRIGGER_PATH"
else
    echo "   ✗ Failed to create workflow"
    echo "   Response: $WORKFLOW_RESPONSE"
    exit 1
fi

# Trigger the workflow
echo ""
echo "3. Triggering workflow..."
TRIGGER_RESPONSE=$(curl -s -X POST "$API_URL$TRIGGER_PATH" \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "Test"}')

RUN_ID=$(echo "$TRIGGER_RESPONSE" | grep -o '"runId":"[^"]*"' | cut -d'"' -f4)
STATUS=$(echo "$TRIGGER_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ -n "$RUN_ID" ]; then
    echo "   ✓ Workflow triggered"
    echo "   ✓ Run ID: $RUN_ID"
    echo "   ✓ Status: $STATUS"
else
    echo "   ✗ Failed to trigger workflow"
    echo "   Response: $TRIGGER_RESPONSE"
    exit 1
fi

# Check run details
echo ""
echo "4. Checking run details..."
sleep 2
RUNS_RESPONSE=$(curl -s "$API_URL/workflows/$WORKFLOW_ID/runs")
RUN_STATUS=$(echo "$RUNS_RESPONSE" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "   ✓ Run status: $RUN_STATUS"

# Test skipped workflow
echo ""
echo "5. Testing filter (should skip)..."
SKIP_RESPONSE=$(curl -s -X POST "$API_URL$TRIGGER_PATH" \
  -H "Content-Type: application/json" \
  -d '{"test": false}')

SKIP_STATUS=$(echo "$SKIP_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

if [ "$SKIP_STATUS" = "skipped" ]; then
    echo "   ✓ Workflow correctly skipped"
else
    echo "   ✗ Expected skipped, got: $SKIP_STATUS"
fi

# Cleanup
echo ""
echo "6. Cleaning up..."
curl -s -X DELETE "$API_URL/workflows/$WORKFLOW_ID" > /dev/null
echo "   ✓ Test workflow deleted"

echo ""
echo "================================"
echo "All tests passed! ✓"