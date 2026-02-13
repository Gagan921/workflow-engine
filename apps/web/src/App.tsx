/**
 * Workflow Engine Frontend
 * 
 * Main application component for managing workflows.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Play, 
  Edit2, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  SkipForward,
  Clock,
  Activity,
  Webhook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import { Workflow, WorkflowRun, WorkflowRunStatus } from '@/types';
import { workflowApi, triggerApi, ApiError } from '@/api/client';
import { WorkflowForm } from '@/components/workflows/WorkflowForm';
import { WorkflowRuns } from '@/components/workflows/WorkflowRuns';
import { JsonEditor } from '@/components/workflows/JsonEditor';

function getStatusIcon(status: WorkflowRunStatus) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'skipped':
      return <SkipForward className="h-4 w-4 text-yellow-500" />;
    case 'running':
      return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}

function getStatusBadge(status: WorkflowRunStatus) {
  const variants: Record<WorkflowRunStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    success: 'default',
    failed: 'destructive',
    skipped: 'secondary',
    running: 'default',
    pending: 'outline',
  };

  return (
    <Badge variant={variants[status]} className="flex items-center gap-1">
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

export default function App() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRunsDialogOpen, setIsRunsDialogOpen] = useState(false);
  const [isTriggerDialogOpen, setIsTriggerDialogOpen] = useState(false);
  const [triggerPayload, setTriggerPayload] = useState('{}');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowApi.getAll();
      setWorkflows(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch workflows';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleCreateWorkflow = async (data: { name: string; enabled: boolean; steps: string }) => {
    try {
      const steps = JSON.parse(data.steps);
      await workflowApi.create({
        name: data.name,
        enabled: data.enabled,
        steps,
      });
      toast.success('Workflow created successfully');
      setIsCreateDialogOpen(false);
      fetchWorkflows();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof SyntaxError ? 'Invalid JSON in steps' : 'Failed to create workflow';
      toast.error(message);
      throw err;
    }
  };

  const handleUpdateWorkflow = async (workflowData: { name: string; enabled: boolean; steps: string }) => {
    if (!selectedWorkflow) return;

    try {
      const steps = JSON.parse(workflowData.steps);
      await workflowApi.update(selectedWorkflow.id, {
        name: workflowData.name,
        enabled: workflowData.enabled,
        steps,
      });
      toast.success('Workflow updated successfully');
      setIsEditDialogOpen(false);
      fetchWorkflows();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof SyntaxError ? 'Invalid JSON in steps' : 'Failed to update workflow';
      toast.error(message);
      throw err;
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await workflowApi.delete(id);
      toast.success('Workflow deleted successfully');
      fetchWorkflows();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete workflow';
      toast.error(message);
    }
  };

  const handleTriggerWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const payload = JSON.parse(triggerPayload);
      const result = await triggerApi.trigger(selectedWorkflow.trigger.path, payload);
      toast.success(`Workflow triggered: ${result.status}`);
      setIsTriggerDialogOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof SyntaxError ? 'Invalid JSON payload' : 'Failed to trigger workflow';
      toast.error(message);
    }
  };

  const copyTriggerUrl = (path: string) => {
    const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    toast.success('Trigger URL copied to clipboard');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Workflow Engine</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Create Workflow</DialogTitle>
                  <DialogDescription>
                    Define your workflow steps using JSON. A unique trigger URL will be generated automatically.
                  </DialogDescription>
                </DialogHeader>
                <WorkflowForm onSubmit={handleCreateWorkflow} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No workflows yet</p>
                <p className="text-muted-foreground text-sm">Create your first workflow to get started</p>
              </CardContent>
            </Card>
          ) : (
            workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{workflow.name}</CardTitle>
                        <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                          {workflow.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {workflow.trigger.path}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyTriggerUrl(workflow.trigger.path)}
                          >
                            {copiedPath === workflow.trigger.path ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setIsTriggerDialogOpen(true);
                        }}
                        disabled={!workflow.enabled}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Trigger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setIsRunsDialogOpen(true);
                        }}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Runs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}
                    {' · '}
                    Last updated: {new Date(workflow.updatedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>
              Modify your workflow configuration.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <WorkflowForm
              workflow={selectedWorkflow}
              onSubmit={handleUpdateWorkflow}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Runs Dialog */}
      <Dialog open={isRunsDialogOpen} onOpenChange={setIsRunsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Workflow Runs</DialogTitle>
            <DialogDescription>
              Execution history for this workflow.
            </DialogDescription>
          </DialogHeader>
          {selectedWorkflow && <WorkflowRuns workflowId={selectedWorkflow.id} />}
        </DialogContent>
      </Dialog>

      {/* Trigger Dialog */}
      <Dialog open={isTriggerDialogOpen} onOpenChange={setIsTriggerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trigger Workflow</DialogTitle>
            <DialogDescription>
              Send a test payload to trigger this workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Payload (JSON)</label>
              <JsonEditor
                value={triggerPayload}
                onChange={setTriggerPayload}
                height="200px"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTriggerDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTriggerWorkflow}>
                <Play className="h-4 w-4 mr-2" />
                Trigger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}