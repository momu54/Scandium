import { ChannelType, codeBlock } from 'discord.js';
import { client } from '../app.js';

client.on('messageCreate', async (msg) => {
	if (
		msg.author.id != process.env.admin ||
		msg.channel.type != ChannelType.DM ||
		!msg.mentions.users.has(client.user!.id) ||
		!msg.content.includes('run') ||
		!msg.content.includes('```js\n')
	)
		return;
	const code = msg.content.split('```js')[1].replace('```', '');
	const codefn = new Function('msg', code);
	try {
		codefn(msg);
	} catch (err) {
		await msg.reply({ content: codeBlock('js', (err as Error).stack!) });
	}
});
