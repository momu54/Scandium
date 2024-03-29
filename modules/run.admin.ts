/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { ChannelType, codeBlock } from 'discord.js';
import { client } from '../app.ts';
import { AsyncFunction } from '../utils/function.ts';
import { RunCodeFunction } from '../typing.ts';

client.on('messageCreate', async (msg) => {
	if (
		msg.author.id !== msg.client.application.owner?.id ||
		msg.channel.type !== ChannelType.DM ||
		!msg.content.startsWith('run') ||
		!msg.content.includes('```js\n')
	)
		return;
	const isasync = msg.content.includes('async');
	const code = msg.content.split('```js')[1].replace('```', '');
	const codefn = (
		isasync ? AsyncFunction('msg', code) : new Function('msg', code)
	) as RunCodeFunction;
	try {
		const execres = await codefn(msg);
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
