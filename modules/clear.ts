import { ChatInputCommandInteraction, ModalBuilder } from 'discord.js';
import { CreateCommand } from '../app.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'clear',
		description: 'Clear all commands',
	},
	async (interaction) => {
		if (interaction.user.id != '984620726436921364') return;
		await interaction.client.application.commands.set([]);
		const modal = new ModalBuilder().setTitle('Cleared').setCustomId(
			JSON.stringify({
				module: interaction.commandName,
			}),
		);
		await interaction.showModal(modal);
	},
	process.env.supportguild,
);
