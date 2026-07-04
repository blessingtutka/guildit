import { Hono } from 'hono';
import * as playerController from '../controllers/player.controller';

export const player = new Hono();

player.post('/', playerController.getOrCreatePlayer);
player.get('/:userId', playerController.getPlayer);
player.post('/class', playerController.setPlayerClass);
player.post('/points', playerController.addPoints);
player.get('/reclass/preview', playerController.getReclassPreview);
player.post('/reclass', playerController.reclassPlayer);
