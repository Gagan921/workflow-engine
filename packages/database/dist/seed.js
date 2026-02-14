"use strict";
/**
 * Database Seed Script
 *
 * Seeds the database with sample workflows for testing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
async function seed() {
    console.log('Seeding database...');
    // Create a sample Slack notification workflow
    const slackWorkflow = await index_1.prisma.workflow.create({
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
    const testWorkflow = await index_1.prisma.workflow.create({
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
    await index_1.prisma.$disconnect();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOztBQUVILG1DQUFpQztBQUVqQyxLQUFLLFVBQVUsSUFBSTtJQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFbkMsOENBQThDO0lBQzlDLE1BQU0sYUFBYSxHQUFHLE1BQU0sY0FBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDakQsSUFBSSxFQUFFO1lBQ0osSUFBSSxFQUFFLG9CQUFvQjtZQUMxQixPQUFPLEVBQUUsSUFBSTtZQUNiLE9BQU8sRUFBRTtnQkFDUCxJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsdUNBQXVDO2FBQzlDO1lBQ0QsS0FBSyxFQUFFO2dCQUNMO29CQUNFLElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRTt3QkFDVixFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFO3FCQUNqRDtpQkFDRjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsV0FBVztvQkFDakIsR0FBRyxFQUFFO3dCQUNILEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7d0JBQ3ZELEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxpQ0FBaUMsRUFBRTtxQkFDL0U7aUJBQ0Y7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLGNBQWM7b0JBQ3BCLE1BQU0sRUFBRSxNQUFNO29CQUNkLEdBQUcsRUFBRSwwQkFBMEI7b0JBQy9CLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtvQkFDL0MsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEVBQUU7b0JBQ3hELFNBQVMsRUFBRSxJQUFJO29CQUNmLE9BQU8sRUFBRSxDQUFDO2lCQUNYO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLGFBQWEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXJELHlCQUF5QjtJQUN6QixNQUFNLFlBQVksR0FBRyxNQUFNLGNBQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ2hELElBQUksRUFBRTtZQUNKLElBQUksRUFBRSxlQUFlO1lBQ3JCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFO2dCQUNQLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSx1Q0FBdUM7YUFDOUM7WUFDRCxLQUFLLEVBQUU7Z0JBQ0w7b0JBQ0UsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLEdBQUcsRUFBRTt3QkFDSCxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFO3dCQUN4RCxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLEVBQUU7cUJBQ3BFO2lCQUNGO2dCQUNEO29CQUNFLElBQUksRUFBRSxjQUFjO29CQUNwQixNQUFNLEVBQUUsTUFBTTtvQkFDZCxHQUFHLEVBQUUsMEJBQTBCO29CQUMvQixPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUU7b0JBQy9DLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7b0JBQ3JCLFNBQVMsRUFBRSxJQUFJO29CQUNmLE9BQU8sRUFBRSxDQUFDO2lCQUNYO2FBQ0Y7U0FDRjtLQUNGLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsSUFBSSxFQUFFO0tBQ0gsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDO0tBQ0QsT0FBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sY0FBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzdCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEYXRhYmFzZSBTZWVkIFNjcmlwdFxuICogXG4gKiBTZWVkcyB0aGUgZGF0YWJhc2Ugd2l0aCBzYW1wbGUgd29ya2Zsb3dzIGZvciB0ZXN0aW5nLlxuICovXG5cbmltcG9ydCB7IHByaXNtYSB9IGZyb20gJy4vaW5kZXgnO1xuXG5hc3luYyBmdW5jdGlvbiBzZWVkKCkge1xuICBjb25zb2xlLmxvZygnU2VlZGluZyBkYXRhYmFzZS4uLicpO1xuXG4gIC8vIENyZWF0ZSBhIHNhbXBsZSBTbGFjayBub3RpZmljYXRpb24gd29ya2Zsb3dcbiAgY29uc3Qgc2xhY2tXb3JrZmxvdyA9IGF3YWl0IHByaXNtYS53b3JrZmxvdy5jcmVhdGUoe1xuICAgIGRhdGE6IHtcbiAgICAgIG5hbWU6ICdTbGFjayBVbmxvY2sgQWxlcnQnLFxuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHRyaWdnZXI6IHtcbiAgICAgICAgdHlwZTogJ2h0dHAnLFxuICAgICAgICBwYXRoOiAnL3Qvc2FtcGxlMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3OCcsXG4gICAgICB9LFxuICAgICAgc3RlcHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdmaWx0ZXInLFxuICAgICAgICAgIGNvbmRpdGlvbnM6IFtcbiAgICAgICAgICAgIHsgcGF0aDogJ3R5cGUnLCBvcDogJ2VxJywgdmFsdWU6ICdsb2NrLnVubG9jaycgfSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ3RyYW5zZm9ybScsXG4gICAgICAgICAgb3BzOiBbXG4gICAgICAgICAgICB7IG9wOiAnZGVmYXVsdCcsIHBhdGg6ICdhY3Rvcl9uYW1lJywgdmFsdWU6ICdVbmtub3duJyB9LFxuICAgICAgICAgICAgeyBvcDogJ3RlbXBsYXRlJywgdG86ICdtZXNzYWdlJywgdGVtcGxhdGU6ICdEb29yIHVubG9ja2VkIGJ5IHt7YWN0b3JfbmFtZX19JyB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnaHR0cF9yZXF1ZXN0JyxcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICB1cmw6ICdodHRwczovL2h0dHBiaW4ub3JnL3Bvc3QnLFxuICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICAgIGJvZHk6IHsgbW9kZTogJ2N1c3RvbScsIHZhbHVlOiB7IHRleHQ6ICd7e21lc3NhZ2V9fScgfSB9LFxuICAgICAgICAgIHRpbWVvdXRNczogNTAwMCxcbiAgICAgICAgICByZXRyaWVzOiAzLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICB9KTtcblxuICBjb25zb2xlLmxvZyhgQ3JlYXRlZCB3b3JrZmxvdzogJHtzbGFja1dvcmtmbG93LmlkfWApO1xuXG4gIC8vIENyZWF0ZSBhIHRlc3Qgd29ya2Zsb3dcbiAgY29uc3QgdGVzdFdvcmtmbG93ID0gYXdhaXQgcHJpc21hLndvcmtmbG93LmNyZWF0ZSh7XG4gICAgZGF0YToge1xuICAgICAgbmFtZTogJ1Rlc3QgV29ya2Zsb3cnLFxuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHRyaWdnZXI6IHtcbiAgICAgICAgdHlwZTogJ2h0dHAnLFxuICAgICAgICBwYXRoOiAnL3QvdGVzdDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MCcsXG4gICAgICB9LFxuICAgICAgc3RlcHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nLFxuICAgICAgICAgIG9wczogW1xuICAgICAgICAgICAgeyBvcDogJ2RlZmF1bHQnLCBwYXRoOiAnbWVzc2FnZScsIHZhbHVlOiAnSGVsbG8gV29ybGQnIH0sXG4gICAgICAgICAgICB7IG9wOiAndGVtcGxhdGUnLCB0bzogJ291dHB1dCcsIHRlbXBsYXRlOiAnUmVjZWl2ZWQ6IHt7bWVzc2FnZX19JyB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnaHR0cF9yZXF1ZXN0JyxcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICB1cmw6ICdodHRwczovL2h0dHBiaW4ub3JnL3Bvc3QnLFxuICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgICAgICAgIGJvZHk6IHsgbW9kZTogJ2N0eCcgfSxcbiAgICAgICAgICB0aW1lb3V0TXM6IDMwMDAsXG4gICAgICAgICAgcmV0cmllczogMSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgfSk7XG5cbiAgY29uc29sZS5sb2coYENyZWF0ZWQgd29ya2Zsb3c6ICR7dGVzdFdvcmtmbG93LmlkfWApO1xuICBjb25zb2xlLmxvZygnU2VlZGluZyBjb21wbGV0ZWQhJyk7XG59XG5cbnNlZWQoKVxuICAuY2F0Y2goKGUpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKCdTZWVkaW5nIGZhaWxlZDonLCBlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH0pXG4gIC5maW5hbGx5KGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBwcmlzbWEuJGRpc2Nvbm5lY3QoKTtcbiAgfSk7Il19