/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { fastify } from 'fastify';
import { readFile } from 'fs/promises';
import { Logger } from '../utils/logger.ts';
const logger = new Logger('server');

export const app = fastify({
	http2: true,
	https: {
		key: await readFile('./login/key.pem'),
		cert: await readFile('./login/cert.pem'),
	},
});

export async function Listen() {
	await app.listen({
		port: Number(process.env.callbackport),
		host: '::',
	});
	logger.info('Server started');
}
