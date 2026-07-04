import { Hono } from 'hono';
import * as leaderboardController from '../controllers/leaderboard.controller';

export const leaderboard = new Hono();

leaderboard.get('/stats', leaderboardController.getStats);
leaderboard.get('/class/:class', leaderboardController.getClassLeaderboard);
leaderboard.get('/guilds', leaderboardController.getGuildLeaderboard);
