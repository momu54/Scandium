/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { ScandiumCommand, commands } from '../utils/register.ts';
import { client } from '../app.ts';

new ScandiumCommand<ChatInputCommandInteraction>(
	{
		name: 'sync',
		description: 'Sync all commands',
	},
	async (interaction) => {
		await interaction.deferReply();
		const commandsvalue = Object.values(commands);
		await interaction.client.application.commands.set(
			commandsvalue
				.filter((command) => !command.isadmincommand)
				.map((command) => command.command!)
		);
		await interaction.client.application.commands.set(
			commandsvalue
				.filter(
					(command) =>
						command.isadmincommand && command.command!.name !== 'sync'
				)
				.map((command) => command.command!),
			process.env.supportguild!
		);
		const embed: APIEmbed = {
			title: 'Sync',
			description: 'Commands synced',
			color: 0x00ff00,
		};
		await interaction.editReply({ embeds: [embed] });
	},
	true
);

await client.application?.commands.create(
	commands.sync.command!,
	process.env.supportguild!
);
