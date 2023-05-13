/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { APIEmbed, ChatInputCommandInteraction, codeBlock } from 'discord.js';
import { CreateCommand } from '../utils/register.ts';
import { Translate } from '../utils/translate.ts';
import { release, version } from 'os';
import PackageJson from '../package.json' assert { type: 'json' };
import { GetColor } from '../utils/database.ts';

CreateCommand<ChatInputCommandInteraction>(
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
					name: 'Node.js',
					value: process.version,
					inline: true,
				},
				{
					name: 'Discord.js',
					value: PackageJson.dependencies['discord.js'],
					inline: true,
				},
				{
					name: Translate(interaction.locale, 'info.GatewayPing.name'),
					value: Translate(interaction.locale, 'info.GatewayPing.value', {
						ping: interaction.client.ws.ping.toString(),
					}),
					inline: true,
				},
				{
					name: Translate(interaction.locale, 'info.os.name'),
					value: `${process.platform}\n${version}\n${release} | ${process.arch}`,
				},
				{
					name: Translate(interaction.locale, 'info.memory.name'),
					value: `${Math.floor(process.memoryUsage().rss * 0.000001)} MB`,
					inline: true,
				},
				{
					name: Translate(interaction.locale, 'info.uptime.name'),
					value: Translate(interaction.locale, 'info.uptime.value', {
						hour: hour.toString(),
						minute: minute.toString(),
						second: second.toString(),
					}),
					inline: true,
				},
				{
					name: Translate(interaction.locale, 'info.links.name'),
					value: '[Github](https://github.com/momu54/me) | [Crowdin](https://crowdin.com/project/me-bot) | [???](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
					inline: true,
				},
				{
					name: Translate(interaction.locale, 'info.developers.name'),
					value: '[momu54](https://momu54.cf/)',
					inline: true,
				},
				{
					name: Translate(interaction.locale, 'info.acknowledgements.name'),
					value: codeBlock(Object.keys(PackageJson.dependencies).join('\n')),
				},
			],
			color: await GetColor(interaction.user.id),
		};

		await interaction.reply({ embeds: [embed] });
	}
);
