/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import {
	APIEmbed,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	codeBlock,
} from 'discord.js';
import { ScandiumCommand } from '../utils/register.ts';
import { AsyncExec } from '../utils/exec.ts';

new ScandiumCommand<ChatInputCommandInteraction>(
	{
		name: 'shell',
		description: 'Execute shell command',
		options: [
			{
				name: 'command',
				description: 'shell command',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
		],
	},
	async (interaction) => {
		await interaction.deferReply({ ephemeral: true });

		const embed: APIEmbed = {
			title: 'Shell',
		};

		const output = await AsyncExec(
			interaction.options.getString('command', true)
		).catch((stderr) => {
			embed.color = 0xff0000;
			return stderr as string;
		});
		embed.color ||= 0x00ff00;
		embed.description = codeBlock(output);

		await interaction.editReply({ embeds: [embed] });
	},
	true
);
