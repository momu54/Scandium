import {
	APIEmbed,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { CreateCommand, CreateComponentHandler } from '../app.js';
import { ParseAnime } from '../utils/animeparser.js';
import { Translate } from '../utils/translate.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'anime',
		description: 'Get anime data from https://ani.gamer.com.tw',
	},
	async (interaction) => {
		const res = await fetch('https://ani.gamer.com.tw/', {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
			},
		});
		const html = Buffer.from(await res.arrayBuffer()).toString('utf-8');
		const animedata = ParseAnime(html);
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'anime.title'),
			description: '',
			footer: {
				text: Translate(interaction.locale, 'anime.footer'),
			},
		};

		embed.description = animedata
			.map((anime, index) => `> ${index + 1}. ${anime.name}`)
			.join('\n');

		function GetCustomId(index: number) {
			return JSON.stringify({
				module: interaction.commandName,
				index: index,
			});
		}

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder(
					Translate(interaction.locale, 'anime.menu', {
						range: '(1~25)',
					}),
				)
				.setCustomId(GetCustomId(0))
				.addOptions(GetAnimeInRange(animedata, 25)),
		);

		const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder(
					Translate(interaction.locale, 'anime.menu', {
						range: '(26~50)',
					}),
				)
				.setCustomId(GetCustomId(1))
				.setOptions(GetAnimeInRange(animedata, 50, 25)),
		);

		await interaction.reply({
			embeds: [embed],
			components: [row, row2],
		});
	},
);

function GetAnimeInRange(
	animedata: {
		date: string;
		name: string;
		thumbnail: string;
		url: string;
	}[],
	max: number,
	min: number = -1,
) {
	return animedata
		.filter((_, index) => min < index && index < max)
		.map((anime) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(anime.name)
				.setValue(
					`${anime.date};${anime.name};${anime.thumbnail.replace(
						'https://p2.bahamut.com.tw/',
						'',
					)};${anime.url.replace('animeVideo.php?sn=', '')}`,
				),
		);
}

CreateComponentHandler<StringSelectMenuInteraction>('anime', async (interaction) => {
	const [date, name, thumbnailpath, sn] = interaction.values[0].split(';');

	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'anime.title'),
		description: Translate(interaction.locale, 'anime.SingleAnimeDesc', {
			name,
			date,
		}),
		image: {
			url: `https://p2.bahamut.com.tw/${thumbnailpath}`,
		},
		footer: {
			text: Translate(interaction.locale, 'anime.footer'),
		},
	};

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel(Translate(interaction.locale, 'anime.play'))
			.setURL(`https://ani.gamer.com.tw/animeVideo.php?sn=${sn}`)
			.setStyle(ButtonStyle.Link),
	);

	await interaction.update({ embeds: [embed], components: [row] });
});
