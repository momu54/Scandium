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
import { CreateCommand } from '../app.ts';
import { AsyncExec } from '../utils/exec.ts';

CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'sql',
		description: 'Execute SQL query',
		options: [
			{
				name: 'command',
				description: 'SQL query',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
		],
	},
	async (interaction) => {
		await interaction.deferReply({ ephemeral: true });

		const embed: APIEmbed = {
			title: 'SQL',
		};

		const output = await AsyncExec(
			`sqlite3 data.db "${interaction.options.getString('command', true)}"`
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
