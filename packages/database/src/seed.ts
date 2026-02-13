/**
 * Database Seed Script
 * 
 * Seeds the database with sample workflows for testing.
 */

import { prisma } from './index';

async function seed() {
  console.log('Seeding database...');

  // Create a sample Slack notification workflow
  const slackWorkflow = await prisma.workflow.create({
    data: {
      name: 'Slack Unlock Alert',
      enabled: true,
      trigger: {
        type: 'http',
        path: '/t/sample1234567890123456789012345678',
      },
      steps: [
        {
          type: 'filter',
          conditions: [
            { path: 'type', op: 'eq', value: 'lock.unlock' },
          ],
        },
        {
          type: 'transform',
          ops: [
            { op: 'default', path: 'actor_name', value: 'Unknown' },
            { op: 'template', to: 'message', template: 'Door unlocked by {{actor_name}}' },
          ],
        },
        {
          type: 'http_request',
          method: 'POST',
          url: 'https://httpbin.org/post',
          headers: { 'Content-Type': 'application/json' },
          body: { mode: 'custom', value: { text: '{{message}}' } },
          timeoutMs: 5000,
          retries: 3,
        },
      ],
    },
  });

  console.log(`Created workflow: ${slackWorkflow.id}`);

  // Create a test workflow
  const testWorkflow = await prisma.workflow.create({
    data: {
      name: 'Test Workflow',
      enabled: true,
      trigger: {
        type: 'http',
        path: '/t/test123456789012345678901234567890',
      },
      steps: [
        {
          type: 'transform',
          ops: [
            { op: 'default', path: 'message', value: 'Hello World' },
            { op: 'template', to: 'output', template: 'Received: {{message}}' },
          ],
        },
        {
          type: 'http_request',
          method: 'POST',
          url: 'https://httpbin.org/post',
          headers: { 'Content-Type': 'application/json' },
          body: { mode: 'ctx' },
          timeoutMs: 3000,
          retries: 1,
        },
      ],
    },
  });

  console.log(`Created workflow: ${testWorkflow.id}`);
  console.log('Seeding completed!');
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });