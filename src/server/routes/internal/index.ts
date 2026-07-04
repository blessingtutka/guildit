import { Hono } from 'hono';

import { forms } from './forms';
import { menu } from './menu';
import { triggers } from './triggers';

export const internal = new Hono();

internal.route('/menu', menu);
internal.route('/form', forms);
internal.route('/triggers', triggers);
