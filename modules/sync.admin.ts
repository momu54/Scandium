/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { CreateCommand, client, commands } from '../app.ts';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'sync',
		description: 'Sync all commands',
	},
	async (interaction, defer) => {
		await defer();
		const commandsvalue = Object.values(commands);
		await interaction.client.application.commands.set(
			commandsvalue
				.filter((command) => !command.isadmincommand)
				.map((command) => command.data!)
		);
		await interaction.client.application.commands.set(
			commandsvalue
				.filter(
					(command) => command.isadmincommand && command.data!.name !== 'sync'
				)
				.map((command) => command.data!),
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

await client.application?.commands.create(commands.sync.data!, process.env.supportguild!);
