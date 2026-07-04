import { Hono } from 'hono';
import * as actionController from '../controllers/action.controller';

export const action = new Hono();

action.post('/', actionController.logAction);
action.get('/status', actionController.getActionStatus);
