/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { ChannelType, codeBlock } from 'discord.js';
import { client } from '../app.ts';
import { AsyncFunction } from '../utils/function.ts';

client.on('messageCreate', async (msg) => {
	if (
		msg.author.id !== process.env.admin ||
		msg.channel.type !== ChannelType.DM ||
		!msg.content.startsWith('run') ||
		!msg.content.includes('```js\n')
	)
		return;
	const isasync = msg.content.includes('async');
	const code = msg.content.split('```js')[1].replace('```', '');
	const codefn = isasync ? AsyncFunction('msg', code) : new Function('msg', code);
	try {
		const execres = isasync ? await codefn(msg) : codefn(msg);
		let result: string;
		if (execres) {
			switch (typeof execres) {
				case 'object':
					result = codeBlock('js', JSON.stringify(execres));
					break;
				case 'string':
					result = codeBlock(execres);
					break;
				default:
					result = execres.toString();
			}
		} else {
			result = 'No result';
		}
		await msg.reply({ content: result });
	} catch (err) {
		await msg.reply({ content: codeBlock('js', (err as Error).stack!) });
	}
});
