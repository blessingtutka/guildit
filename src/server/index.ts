import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort } from '@devvit/web/server';
import { internal } from './routes/internal';
import { player } from './routes/player.route';
import { guild } from './routes/guild.route';
import { action } from './routes/action.route';
import { leaderboard } from './routes/leaderboard.route';
import { duel } from './routes/duel.route';

const app = new Hono();

// Devvit-platform routes (menu actions, post creation, etc.)
app.route('/internal', internal);

//  Webview REST API
app.route('/api/player', player);
app.route('/api/guild', guild);
app.route('/api/action', action);
app.route('/api/leaderboard', leaderboard);

// Game
app.route('/api/duel', duel);

serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});
