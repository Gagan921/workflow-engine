/**
 * Trigger Routes
 * 
 * Defines webhook trigger endpoints for workflow execution.
 */

import { Router } from 'express';
import { triggerController } from '@/controllers/workflowController';

const router = Router();

// Webhook trigger endpoint
// Note: This is mounted at /t in the main app, so the path here is just :path
router.post('/:path', triggerController.trigger);

export default router;