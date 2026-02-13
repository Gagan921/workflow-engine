/**
 * Workflow Runs Component
 * 
 * Displays the execution history for a workflow.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  SkipForward, 
  Activity, 
  Clock,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { WorkflowRun, WorkflowRunStatus, StepResult } from '@/types';
import { workflowApi, ApiError } from '@/api/client';

interface WorkflowRunsProps {
  workflowId: string;
}

function getStatusIcon(status: WorkflowRunStatus, className = 'h-4 w-4') {
  switch (status) {
    case 'success':
      return <CheckCircle2 className={`${className} text-green-500`} />;
    case 'failed':
      return <XCircle className={`${className} text-red-500`} />;
    case 'skipped':
      return <SkipForward className={`${className} text-yellow-500`} />;
    case 'running':
      return <Activity className={`${className} text-blue-500 animate-pulse`} />;
    default:
      return <Clock className={`${className} text-gray-400`} />;
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

function StepResultItem({ result, isExpanded, onToggle }: { 
  result: StepResult; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(result.status)}
          <span className="font-medium">Step {result.stepIndex + 1}</span>
          <Badge variant="outline" className="text-xs">
            {result.stepType}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {result.durationMs}ms
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 border-t bg-muted/30">
          <div className="pt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-mono">{result.stepType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{result.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>{result.durationMs}ms</span>
            </div>
            {result.error && (
              <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
                {result.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RunItem({ run }: { run: WorkflowRun }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepIndex: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepIndex)) {
      newExpanded.delete(stepIndex);
    } else {
      newExpanded.add(stepIndex);
    }
    setExpandedSteps(newExpanded);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(run.status, 'h-5 w-5')}
          <div className="text-left">
            <div className="font-medium">Run {run.id.slice(0, 8)}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(run.startedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(run.status)}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t bg-muted/30">
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Started:</span>
                <div>{new Date(run.startedAt).toLocaleString()}</div>
              </div>
              {run.completedAt && (
                <div>
                  <span className="text-muted-foreground">Completed:</span>
                  <div>{new Date(run.completedAt).toLocaleString()}</div>
                </div>
              )}
            </div>

            {run.error && (
              <div className="p-3 bg-destructive/10 rounded text-destructive text-sm">
                <strong>Error:</strong> {run.error}
              </div>
            )}

            {run.stepResults && run.stepResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Step Results</h4>
                <div className="space-y-2">
                  {run.stepResults.map((result) => (
                    <StepResultItem
                      key={result.stepIndex}
                      result={result}
                      isExpanded={expandedSteps.has(result.stepIndex)}
                      onToggle={() => toggleStep(result.stepIndex)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowRuns({ workflowId }: WorkflowRunsProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowApi.getRuns(workflowId);
      setRuns(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch runs';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
        <Button variant="outline" onClick={fetchRuns} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {runs.length} run{runs.length !== 1 ? 's' : ''} found
        </p>
        <Button variant="outline" size="sm" onClick={fetchRuns}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-3 pr-4">
          {runs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No runs yet</p>
              <p className="text-sm">Trigger this workflow to see runs here</p>
            </div>
          ) : (
            runs.map((run) => <RunItem key={run.id} run={run} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}