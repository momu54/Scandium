/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { ScandiumCommand } from '../utils/register.ts';
import { APIEmbed, codeBlock } from 'discord.js';
import { AsyncExec } from '../utils/exec.ts';

new ScandiumCommand(
	{
		name: 'pull',
		description: 'Pull the code from Github',
	},
	async (interaction) => {
		await interaction.deferReply();

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
	true
);
