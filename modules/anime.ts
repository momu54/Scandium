/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import {
	APIActionRowComponent,
	APIEmbed,
	APIMessageActionRowComponent,
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	Interaction,
	InteractionReplyOptions,
	JSONEncodable,
	Locale,
	MessagePayload,
	ModalBuilder,
	ModalMessageModalSubmitInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
	StringSelectMenuOptionBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { CreateCommand, CreateComponentHandler, CreateModalHandler } from '../app.ts';
import { ParseAnime, ParseAnimes, ParseSearchResults } from '../utils/animeparser.ts';
import {
	OptionLocalizations,
	SubCommandLocalizations,
	Translate,
} from '../utils/translate.ts';
import {
	AddAnimeTodo,
	CheckAnimeTodo,
	ClearAnimeTodo,
	GetAnimeTodoList,
	GetColor,
	RemoveAnimeTodo,
} from '../utils/database.ts';
import {
	AnimeFromTodo,
	AnimeListType,
	AnimeMenuData,
	Animes,
	AnimesFromTodo,
	AnimesType,
	BaseAnimes,
	IsTodoAnime,
} from '../typing.ts';
import { CacheStorer } from '../utils/cache.ts';
import { ADD_EMOJI, DELETE_EMOJI, PLAY_EMOJI } from '../utils/emoji.ts';

const recentcache = new CacheStorer<Animes>(216000000);

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
						required: true,
					},
				],
			},
			{
				name: 'todo',
				nameLocalizations: SubCommandLocalizations('anime', 'todo'),
				description: 'Get anime todo list',
				type: ApplicationCommandOptionType.Subcommand,
			},
		],
	},
	async (interaction, defer) => {
		if (!process.env.intaiwan) {
			const embed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'anime.NotInTaiwan'),
				color: await GetColor(interaction.user.id),
			};

			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		switch (interaction.options.getSubcommand()) {
			case 'recent': {
				await RecentCommandHandler(interaction, defer);
				break;
			}
			case 'search': {
				await SearchCommandHandler(interaction, defer);
				break;
			}
			case 'todo': {
				await TodoCommandHandler(interaction);
				break;
			}

			// No Default
		}
	}
);

async function RecentCommandHandler(
	interaction: ChatInputCommandInteraction,
	defer: () => Promise<void>
) {
	await defer();
	const response = await FetchAndGetAnimeListResponse(
		'https://ani.gamer.com.tw/',
		interaction,
		AnimeListType.Recent
	);

	await interaction.editReply(response);
}

async function SearchCommandHandler(
	interaction: ChatInputCommandInteraction,
	defer: () => Promise<void>
) {
	await defer();
	const keyword = interaction.options.getString('keyword')!;
	const response = await FetchAndGetAnimeListResponse(
		`https://ani.gamer.com.tw/search.php?keyword=${keyword}`,
		interaction,
		AnimeListType.Search
	);

	await interaction.editReply(response);
}

async function FetchAndGetAnimeListResponse(
	url: string,
	interaction: ChatInputCommandInteraction,
	mode: AnimeListType
): Promise<InteractionReplyOptions | MessagePayload> {
	let animedata: Animes;
	if (!recentcache.alive || mode === AnimeListType.Search) {
		const res = await fetch(url, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
			},
		});
		const html = await res.text();
		animedata =
			mode === AnimeListType.Recent ? ParseAnimes(html) : ParseSearchResults(html);
		if (mode === AnimeListType.Recent) {
			recentcache.Update(animedata);
		}
	} else {
		animedata = recentcache.data!;
	}

	return await GetAnimeListResponse(interaction, animedata);
}

async function GetAnimeListResponse(
	interaction: Interaction,
	animedata: Animes
): Promise<InteractionReplyOptions | MessagePayload>;
async function GetAnimeListResponse(
	interaction: Interaction,
	animedata: AnimesFromTodo
): Promise<InteractionReplyOptions | MessagePayload>;
async function GetAnimeListResponse(
	interaction: Interaction,
	animedata: Animes | AnimesFromTodo
): Promise<InteractionReplyOptions | MessagePayload> {
	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'anime.title'),
		description: '',
		footer: {
			text: Translate(interaction.locale, 'anime.footer'),
		},
		color: await GetColor(interaction.user.id),
	};
	const istodo = IsTodoAnime(animedata);

	embed.description = animedata
		.map(
			(anime, index) =>
				`> **${index + 1}**. ${anime.name}${
					anime.agelimit
						? ` \`${Translate(interaction.locale, 'anime.AgeLimit')}\``
						: ''
				}${anime.type === AnimesType.Todo ? ` **[${anime.episode}]**` : ''}`
		)
		.join('\n');

	function GetCustomId(index: number) {
		return JSON.stringify({
			module: 'anime',
			action: 'anime',
			index,
			istodo,
		});
	}

	const interactioresponse: {
		embeds: APIEmbed[];
		components: JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>[];
	} = {
		embeds: [embed],
		components: istodo
			? [
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setLabel(Translate(interaction.locale, 'anime.ClearTodo'))
							.setEmoji(DELETE_EMOJI)
							.setStyle(ButtonStyle.Danger)
							.setCustomId(
								JSON.stringify({
									module: 'anime',
									action: 'ClearTodo',
								})
							)
					),
			  ]
			: [],
	};
	const needtwomenu = animedata.length > 25;

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		new StringSelectMenuBuilder()
			.setPlaceholder(
				Translate(interaction.locale, 'anime.menu.anime', {
					range: `(1~${needtwomenu ? '25' : animedata.length})`,
				})
			)
			.setCustomId(GetCustomId(0))
			.addOptions(GetAnimeInRange(animedata, interaction, 25, istodo))
	);
	interactioresponse.components.push(row);

	if (needtwomenu) {
		const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder(
					Translate(interaction.locale, 'anime.menu.anime', {
						range: `(26~${animedata.length})`,
					})
				)
				.setCustomId(GetCustomId(1))
				.setOptions(GetAnimeInRange(animedata, interaction, 50, istodo, 25))
		);
		interactioresponse.components.push(row2);
	}
	return interactioresponse;
}

function GetAnimeInRange(
	animedata: BaseAnimes,
	interaction: Interaction,
	max: number,
	istodo: boolean,
	min: number = -1
) {
	return animedata
		.filter((_, index) => min < index && index < max)
		.map((anime) =>
			new StringSelectMenuOptionBuilder()
				.setLabel(
					`${anime.name} ${
						anime.agelimit
							? `${Translate(interaction.locale, 'anime.AgeLimit')}`
							: ''
					}${istodo ? ` [${(anime as AnimeFromTodo).episode}]` : ''}`
				)
				.setValue(
					JSON.stringify({
						sn: anime.url.split('sn=')[1],
						issearch: anime.url.includes('animeRef.php'),
						episode: istodo ? (anime as AnimeFromTodo).episode : '-1',
					})
				)
		);
}

CreateComponentHandler<StringSelectMenuInteraction | ButtonInteraction>(
	'anime',
	async (interaction, defer, componentdata) => {
		switch (componentdata.action) {
			case 'anime': {
				if (interaction.componentType !== ComponentType.StringSelect) return;
				const { sn, issearch, episode } = JSON.parse(
					interaction.values[0]
				) as AnimeMenuData;

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

				const html = await res.text();
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
					thumbnail,
					name,
				} = ParseAnime(html);

				const embed: APIEmbed = {
					title: name,
					description,
					fields: [
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.LastUpdate'
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
								'anime.infomations.director'
							),
							value: director,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.supervisor'
							),
							value: supervisor,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.agent'
							),
							value: agent,
							inline: true,
						},
						{
							name: Translate(
								interaction.locale,
								'anime.infomations.studio'
							),
							value: studio,
							inline: true,
						},
					],
					image: {
						url: thumbnail,
					},
					footer: {
						text: Translate(interaction.locale, 'anime.footer'),
					},
					thumbnail: {
						url: rating,
					},
					color: await GetColor(interaction.user.id),
				};

				const latestsn = episodes.at(-1)!;

				const latestindex = episodes.length.toString();
				const neededindex = componentdata.istodo ? episode! : latestindex;
				const neededsn = componentdata.istodo ? sn : latestsn;

				const rows = [
					new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setLabel(
									Translate(interaction.locale, 'anime.play', {
										episode: neededindex,
									})
								)
								.setURL(
									`https://ani.gamer.com.tw/animeRef.php?sn=${neededsn}`
								)
								.setStyle(ButtonStyle.Link)
								.setEmoji(PLAY_EMOJI)
						)
						.addComponents(
							await GetTodoButton(
								neededindex,
								interaction.locale,
								neededsn,
								interaction.user.id
							)
						),
					new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
						new StringSelectMenuBuilder()
							.setPlaceholder(
								Translate(interaction.locale, 'anime.menu.episodes')
							)
							.setCustomId(
								JSON.stringify({
									module: 'anime',
									action: 'episode',
								})
							)
							.addOptions(
								episodes.map((episode, index) =>
									new StringSelectMenuOptionBuilder()
										.setLabel((index + 1).toString())
										.setValue(episode)
								)
							)
					),
				];

				await interaction.editReply({ embeds: [embed], components: rows });
				break;
			}
			case 'episode': {
				if (interaction.componentType !== ComponentType.StringSelect) return;

				const episode = (
					interaction.component.options.findIndex(
						(option) => option.value === interaction.values[0]
					) + 1
				).toString();

				const row = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setLabel(
								Translate(interaction.locale, 'anime.play', {
									episode,
								})
							)
							.setStyle(ButtonStyle.Link)
							.setURL(
								`https://ani.gamer.com.tw/animeVideo.php?sn=${interaction.values[0]}`
							)
							.setEmoji(PLAY_EMOJI)
					)
					.addComponents(
						await GetTodoButton(
							episode,
							interaction.locale,
							interaction.values[0],
							interaction.user.id
						)
					);

				await interaction.update({
					components: [row, interaction.message.components[1]],
				});
				break;
			}

			case 'todo': {
				const { sn, episode } = componentdata;

				if (interaction.componentType !== ComponentType.Button) return;

				if (interaction.component.style === ButtonStyle.Primary) {
					await AddAnimeTodo(
						interaction.user.id,
						interaction.message.embeds[0].title!,
						sn,
						episode
					);
				} else {
					await RemoveAnimeTodo(interaction.user.id, sn);
				}

				const row = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder(
							interaction.message.components[0].components[0].data
						)
					)
					.addComponents(
						await GetTodoButton(
							episode,
							interaction.locale,
							sn,
							interaction.user.id
						)
					);

				await interaction.update({
					components: [row, interaction.message.components[1]],
				});
				break;
			}
			case 'ClearTodo': {
				const warningtext = Translate(interaction.locale, 'global.warning');
				const modal = new ModalBuilder()
					.addComponents(
						new ActionRowBuilder<TextInputBuilder>().addComponents(
							new TextInputBuilder()
								.setCustomId(
									JSON.stringify({
										module: 'anime',
									})
								)
								.setLabel(warningtext)
								.setStyle(TextInputStyle.Paragraph)
								.setValue(
									Translate(
										interaction.locale,
										'anime.ClearTodoWarning'
									)
								)
						)
					)
					.setTitle(warningtext)
					.setCustomId(
						JSON.stringify({
							module: 'anime',
							action: 'ClearTodoConfirm',
						})
					);

				await interaction.showModal(modal);
				break;
			}

			// No Default
		}
	}
);

async function TodoCommandHandler(interaction: ChatInputCommandInteraction) {
	const animes = await GetAnimeTodoList(interaction.user.id);
	const response: MessagePayload | InteractionReplyOptions =
		animes.length === 0
			? await GetTodoEmptyResponse(interaction)
			: await GetAnimeListResponse(interaction, animes);
	await interaction.reply(response);
}

async function GetTodoButton(episode: string, locale: Locale, sn: string, user: string) {
	const button = new ButtonBuilder().setCustomId(
		JSON.stringify({
			module: 'anime',
			action: 'todo',
			sn,
			episode,
		})
	);
	if (await CheckAnimeTodo(user, sn)) {
		button
			.setEmoji(DELETE_EMOJI)
			.setLabel(
				Translate(locale, 'anime.DeleteTodo', {
					episode,
				})
			)
			.setStyle(ButtonStyle.Danger);
	} else {
		button
			.setEmoji(ADD_EMOJI)
			.setLabel(
				Translate(locale, 'anime.AddTodo', {
					episode,
				})
			)
			.setStyle(ButtonStyle.Primary);
	}
	return button;
}

async function GetTodoEmptyResponse(interaction: Interaction) {
	return {
		embeds: [
			{
				title: Translate(interaction.locale, 'anime.TodoEmpty'),
				color: await GetColor(interaction.user.id),
				footer: {
					text: Translate(interaction.locale, 'anime.footer'),
				},
			},
		],
		components: [],
	};
}

CreateModalHandler<ModalMessageModalSubmitInteraction>('anime', async (interaction) => {
	await ClearAnimeTodo(interaction.user.id);
	await interaction.update(await GetTodoEmptyResponse(interaction));
});
