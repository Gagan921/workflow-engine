/**
 * Workflow Form Component
 * 
 * Form for creating and editing workflows with Monaco JSON editor.
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JsonEditor } from './JsonEditor';
import { Workflow } from '@/types';

interface WorkflowFormProps {
  workflow?: Workflow;
  onSubmit: (data: { name: string; enabled: boolean; steps: string }) => void;
}

const defaultSteps = `[
  {
    "type": "filter",
    "conditions": [
      { "path": "type", "op": "eq", "value": "test" }
    ]
  },
  {
    "type": "transform",
    "ops": [
      { "op": "default", "path": "message", "value": "Hello World" },
      { "op": "template", "to": "output", "template": "Message: {{message}}" }
    ]
  },
  {
    "type": "http_request",
    "method": "POST",
    "url": "https://httpbin.org/post",
    "headers": { "Content-Type": "application/json" },
    "body": { "mode": "custom", "value": { "text": "{{output}}" } },
    "timeoutMs": 5000,
    "retries": 3
  }
]`;

const sampleSlackWorkflow = `[
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
    "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
    "headers": { "Content-Type": "application/json" },
    "body": { "mode": "custom", "value": { "text": "{{title}}" } },
    "timeoutMs": 2000,
    "retries": 3
  }
]`;

export function WorkflowForm({ workflow, onSubmit }: WorkflowFormProps) {
  const [name, setName] = useState(workflow?.name || '');
  const [enabled, setEnabled] = useState(workflow?.enabled ?? true);
  const [steps, setSteps] = useState(
    workflow ? JSON.stringify(workflow.steps, null, 2) : defaultSteps
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate JSON
    try {
      JSON.parse(steps);
    } catch (err) {
      setError('Invalid JSON in steps: ' + (err as Error).message);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name, enabled, steps });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadTemplate = (template: string) => {
    if (confirm('This will replace your current steps. Continue?')) {
      setSteps(template);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Workflow Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Workflow"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Steps (JSON)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(defaultSteps)}
              >
                Load Default
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(sampleSlackWorkflow)}
              >
                Load Slack Example
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="editor" className="w-full">
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <JsonEditor
                value={steps}
                onChange={setSteps}
                height="400px"
              />
            </TabsContent>
            <TabsContent value="help">
              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Filter Step</h4>
                    <pre className="bg-muted p-2 rounded text-xs">
{`{
  "type": "filter",
  "conditions": [
    { "path": "field", "op": "eq", "value": "value" }
  ]
}`}
                    </pre>
                    <p className="text-muted-foreground mt-1">
                      Operators: <code>eq</code> (equals), <code>neq</code> (not equals)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Transform Step</h4>
                    <pre className="bg-muted p-2 rounded text-xs">
{`{
  "type": "transform",
  "ops": [
    { "op": "default", "path": "field", "value": "default" },
    { "op": "template", "to": "output", "template": "{{field}}" },
    { "op": "pick", "paths": ["field1", "field2"] }
  ]
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">HTTP Request Step</h4>
                    <pre className="bg-muted p-2 rounded text-xs">
{`{
  "type": "http_request",
  "method": "POST",
  "url": "https://api.example.com/webhook",
  "headers": { "Content-Type": "application/json" },
  "body": { "mode": "custom", "value": { "key": "{{variable}}" } },
  "timeoutMs": 5000,
  "retries": 3
}`}
                    </pre>
                    <p className="text-muted-foreground mt-1">
                      Body modes: <code>ctx</code> (send entire context), <code>custom</code> (send custom object)
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </div>
    </form>
  );
}