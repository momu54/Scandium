/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { Logger } from './logger.ts';
const logger = new Logger('env');

const REQUIRED_LIST = [
	'token',
	'supportguild',
	'clientid',
	'clientsecret',
	'callbackurl',
	'callbackport',
	'intaiwan',
	'sentrydsn',
	'environment',
];

function CheckEnv() {
	for (const name of REQUIRED_LIST) {
		if (!process.env[name]) {
			console.clear();
			logger.error('Missing environment variables');
			logger.info('You can use .env.example as a template');
			logger.info(
				'Please add missing environment variables to .env file and press [Enter] to continue'
			);
			process.exit(-1);
		}
	}
}

CheckEnv();
