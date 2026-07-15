import { Hono } from 'hono';
import * as actionController from '../controllers/action.controller';

export const action = new Hono();

action.get('/status/class', actionController.getClassActionStatus);
action.get('/status', actionController.getActionStatus);
action.post('/', actionController.logAction);
action.get('/challenge', actionController.getChallenge);
