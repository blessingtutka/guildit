import { Hono } from 'hono';
import * as duelController from '../controllers/duel.controller';

export const duel = new Hono();

// '/invite/*' registered before '/:duelId' so 'invite' isn't swallowed as a param
duel.post('/invite', duelController.sendInvite);
duel.get('/invite/incoming', duelController.getIncomingInvites);
duel.get('/invite/outgoing', duelController.getOutgoingInvites);
duel.post('/invite/:inviteId/accept', duelController.acceptInvite);
duel.post('/invite/:inviteId/decline', duelController.declineInvite);
duel.post('/invite/:inviteId/cancel', duelController.cancelInvite);

duel.get('/:duelId', duelController.getDuelResult);
