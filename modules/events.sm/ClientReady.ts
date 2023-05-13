/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { client } from '../../app.js';
import { Events } from 'discord.js';
import { Logger } from '../../utils/logger.ts';
const logger = new Logger('events:ClientReady');

client.on(Events.ClientReady, async (readiedclient) => {
	logger.info('Ready!');
	logger.info(`Logined with ${readiedclient.user.tag} (${readiedclient.user.id})`);
	await readiedclient.application.fetch();
});
