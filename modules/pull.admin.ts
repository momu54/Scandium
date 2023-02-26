/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { CreateCommand } from '../app.js';
import { APIEmbed, codeBlock } from 'discord.js';
import { AsyncExec } from '../utils/exec.js';

await CreateCommand(
	{
		name: 'pull',
		description: 'Pull the code from Github',
	},
	async (interaction, defer) => {
		await defer();

		const embed: APIEmbed = {
			title: 'Pull',
		};

		const output = await AsyncExec('git pull').catch((stderr) => {
			embed.color = 0xff0000;
			return stderr as string;
		});
		embed.color ||= 0x00ff00;
		embed.description = codeBlock(output);
		await interaction.editReply({ embeds: [embed] });
	},
	true,
);
