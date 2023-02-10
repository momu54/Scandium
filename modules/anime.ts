import {
	APIActionRowComponent,
	APIEmbed,
	APIMessageActionRowComponent,
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Interaction,
	InteractionReplyOptions,
	JSONEncodable,
	MessagePayload,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { CreateCommand, CreateComponentHandler } from '../app.js';
import { ParseAnime, ParseAnimes, ParseSearchResults } from '../utils/animeparser.js';
import {
	OptionLocalizations,
	SubCommandLocalizations,
	Translate,
} from '../utils/translate.js';
import { GetColor } from '../utils/database.js';
import { AnimeListType, Animes } from '../typing.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'anime',
		description: 'Get anime data from https://ani.gamer.com.tw',
		options: [
			{
				name: 'recent',
				nameLocalizations: SubCommandLocalizations('anime', 'recent'),
				description: 'Get recent anime data from https://ani.gamer.com.tw',
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: 'search',
				nameLocalizations: SubCommandLocalizations('anime', 'search'),
				description: 'Search anime data from https://ani.gamer.com.tw',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'keyword',
						nameLocalizations: OptionLocalizations('anime', 'keyword'),
						description: 'Keyword to search',
						type: ApplicationCommandOptionType.String,
					},
				],
			},
		],
	},
	async (interaction, defer) => {
		switch (interaction.options.getSubcommand()) {
			case 'recent':
				await RecentCommandHandler(interaction, defer);
				break;
			case 'search':
				await SearchCommandHandler(interaction, defer);
				break;
		}
	},
);

async function RecentCommandHandler(
	interaction: ChatInputCommandInteraction,
	defer: () => Promise<void>,
) {
	await defer();
	const response = await GetAnimeListResponse(
		'https://ani.gamer.com.tw/',
		interaction,
		AnimeListType.Recent,
	);

	await interaction.editReply(response);
}

async function SearchCommandHandler(
	interaction: ChatInputCommandInteraction,
	defer: () => Promise<void>,
) {
	await defer();
	const keyword = await interaction.options.getString('keyword');
	const response = await GetAnimeListResponse(
		`https://ani.gamer.com.tw/search.php?keyword=${keyword}`,
		interaction,
		AnimeListType.Search,
	);

	await interaction.editReply(response);
}

async function GetAnimeListResponse(
	url: string,
	interaction: ChatInputCommandInteraction,
	mode: AnimeListType,
): Promise<InteractionReplyOptions | MessagePayload> {
	const res = await fetch(url, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
		},
	});
	const html = Buffer.from(await res.arrayBuffer()).toString('utf8');
	const animedata =
		mode == AnimeListType.Recent ? ParseAnimes(html) : ParseSearchResults(html);
	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'anime.title'),
		description: '',
		footer: {
			text: Translate(interaction.locale, 'anime.footer'),
		},
		color: await GetColor(interaction.user.id),
	};

	embed.description = animedata
		.map(
			(anime, index) =>
				`> **${index + 1}**. ${anime.name} ${
					anime.agelimit
						? `\`${Translate(interaction.locale, 'anime.AgeLimit')}\``
						: ''
				}`,
		)
		.join('\n');

	function GetCustomId(index: number) {
		return JSON.stringify({
			module: interaction.commandName,
			action: 'anime',
			index: index,
		});
	}

	const interactioresponse: {
		embeds: APIEmbed[];
		components: JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>[];
	} = {
		embeds: [embed],
		components: [],
	};
	const needtwomenu = animedata.length > 25;

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setPlaceholder(
				Translate(interaction.locale, 'anime.menu.anime', {
					range: `(1~${needtwomenu ? '25' : animedata.length})`,
				}),
			)
			.setCustomId(GetCustomId(0))
			.addOptions(GetAnimeInRange(animedata, interaction, 25)),
	);
	interactioresponse.components.push(row);

	if (needtwomenu) {
		const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder(
					Translate(interaction.locale, 'anime.menu.anime', {
						range: `(26~${animedata.length})`,
					}),
				)
				.setCustomId(GetCustomId(1))
				.setOptions(GetAnimeInRange(animedata, interaction, 50, 25)),
		);
		interactioresponse.components.push(row2);
	}
	return interactioresponse;
}

function GetAnimeInRange(
	animedata: Animes,
	interaction: Interaction,
	max: number,
	min: number = -1,
) {
	return animedata
		.filter((_, index) => min < index && index < max)
		.map((anime) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(
					`${anime.name.slice(0, 92)}${anime.name.length > 92 ? '...' : ''} ${
						anime.agelimit
							? `${Translate(interaction.locale, 'anime.AgeLimit')}`
							: ''
					}`,
				)
				.setValue(
					`${anime.name};${anime.thumbnail.replace(
						'https://p2.bahamut.com.tw/',
						'',
					)};${anime.url.split('sn=')[1]};${anime.url.includes(
						'animeRef.php',
					)}`,
				),
		);
}

CreateComponentHandler<StringSelectMenuInteraction>(
	'anime',
	async (interaction, defer, data) => {
		switch (data!.action) {
			case 'anime':
				const [name, thumbnailpath, sn, issearch] =
					interaction.values[0].split(';');

				await defer();

				const url = `https://ani.gamer.com.tw/${
					issearch ? 'animeRef.php' : 'animeVideo.php'
				}?sn=${sn}`;
				const res = await fetch(url, {
					headers: {
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
					},
				});

				const html = Buffer.from(await res.arrayBuffer()).toString('utf8');
				const {
					studio,
					agent,
					type,
					rating,
					episodes,
					director,
					supervisor,
					date,
					description,
				} = ParseAnime(html);

				const embed: APIEmbed = {
					title: name,
					description,
					fields: [
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.LastUpdate',
							),
							value: date,
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'anime.infomations.type'),
							value: type,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.director',
							),
							value: director,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.supervisor',
							),
							value: supervisor,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.agent',
							),
							value: agent,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.studio',
							),
							value: studio,
							inline: true,
						},
					],
					image: {
						url: `https://p2.bahamut.com.tw/${thumbnailpath}`,
					},
					footer: {
						text: Translate(interaction.locale, 'anime.footer'),
					},
					thumbnail: {
						url: rating,
					},
					color: await GetColor(interaction.user.id),
				};

				const rows = [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setLabel(Translate(interaction.locale, 'anime.PlayLatest'))
							.setURL(url)
							.setStyle(ButtonStyle.Link),
					),
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.setPlaceholder(
								Translate(interaction.locale, 'anime.menu.episodes'),
							)
							.setCustomId(
								JSON.stringify({
									module: 'anime',
									action: 'episode',
								}),
							)
							.addOptions(
								episodes.map((episode, index) =>
									new StringSelectMenuOptionBuilder()
										.setLabel((index + 1).toString())
										.setValue(episode),
								),
							),
					),
				];

				await interaction.editReply({ embeds: [embed], components: rows });
				break;

			case 'episode':
				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setLabel(
							Translate(interaction.locale, 'anime.play', {
								episode: (
									interaction.component.options.findIndex(
										(option) => option.value == interaction.values[0],
									) + 1
								).toString(),
							}),
						)
						.setStyle(ButtonStyle.Link)
						.setURL(
							`https://ani.gamer.com.tw/animeVideo.php?sn=${interaction.values[0]}`,
						),
				);
				await interaction.update({
					components: [row, interaction.message.components[1]],
				});
				break;
		}
	},
);
