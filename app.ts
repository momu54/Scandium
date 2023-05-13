/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import 'dotenv/config';
import './utils/env.ts';
import './utils/modules.ts';
import { Client, Partials, IntentsBitField } from 'discord.js';
import { init } from '@sentry/node';

init({
	dsn: process.env.sentrydsn!,
	environment: process.env.environment!,
	tracesSampleRate: 1.0,
});

export const client = new Client({
	intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.DirectMessages],
	partials: [Partials.Channel],
});

await client.login(process.env.token);
