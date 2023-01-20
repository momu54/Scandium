import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { CreateCommand } from '../app.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'clear',
		description: 'Clear all commands',
	},
	true,
	async (interaction) => {
		if (interaction.user.id != '984620726436921364') return;
		await interaction.client.application.commands.set([]);
		const embed: APIEmbed = {
			title: 'clear',
			description: 'Clear all commands',
			color: 0x00ff00,
		};
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
);
