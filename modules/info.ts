import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { CreateCommand } from '../app.js';
import { Translate } from '../utils/translate.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'info',
		description: 'Show information about ME.',
	},
	async (interaction) => {
		const uptime = Math.floor(process.uptime());
		const hour = Math.floor(uptime / 3600);
		const minute = Math.floor((uptime - hour * 3600) / 60);
		const second = uptime - (hour * 3600 + minute * 60);
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'info.title'),
			fields: [
				{
					name: Translate(interaction.locale, 'info.memory.name'),
					value: `${process.memoryUsage().rss * 0.000001} MB`,
				},
				{
					name: Translate(interaction.locale, 'info.uptime.name'),
					value: Translate(interaction.locale, 'info.uptime.value', {
						hour: hour.toString(),
						minute: minute.toString(),
						second: second.toString(),
					}),
				},
				{
					name: 'Links',
					value:
						'[Github](https://github.com/momu54/me) | ' +
						'[Crowdin](https://crowdin.com/project/me-bot) | ' +
						'[???](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
				},
				{
					name: 'Developer',
					value: '[momu54](https://momu54.cf/)',
				},
			],
		};

		await interaction.reply({ embeds: [embed] });
	},
);
