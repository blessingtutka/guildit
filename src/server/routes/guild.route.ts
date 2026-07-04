import { Hono } from 'hono';
import * as guildController from '../controllers/guild.controller';

export const guild = new Hono();

guild.get('/', guildController.listGuilds);
guild.post('/', guildController.createGuild);
guild.post('/leave', guildController.leaveGuild);
guild.get('/:guildId', guildController.getGuildStatus);
guild.post('/:guildId/join', guildController.joinGuild);
