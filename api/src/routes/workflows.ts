/**
 * Workflow Routes
 * 
 * Defines API endpoints for workflow management.
 */

import { Router } from 'express';
import { workflowController } from '@/controllers/workflowController';

const router = Router();

// Workflow CRUD endpoints
router.get('/', workflowController.list);
router.post('/', workflowController.create);
router.get('/:id', workflowController.get);
router.put('/:id', workflowController.update);
router.patch('/:id', workflowController.update);
router.delete('/:id', workflowController.delete);

// Workflow runs
router.get('/:id/runs', workflowController.getRuns);

export default router;