/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import {
	APIActionRowComponent,
	APIButtonComponent,
	APIEmbed,
	APISelectMenuComponent,
	BaseMessageOptions,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	Interaction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { ComponentHandler, SubCommandHandler } from '../../utils/register.ts';
import { database } from '../../utils/database.ts';
import { Translate } from '../../utils/translate.ts';
import {
	GetLoginRequestResponse,
	GetOctokit,
	GetRepoPlayload,
} from '../../utils/github.ts';
import { RepoList } from '../../typing.ts';
import { ARROW_LEFT_EMOJI, ARROW_RIGHT_EMOJI } from '../../utils/emoji.ts';

new SubCommandHandler(
	{
		module: 'github',
		subcommandgroup: 'repo',
		subcommand: 'list',
	},
	async (interaction, defer) => {
		await defer(false);
		const octokit = await GetOctokit(interaction.user.id);

		if (!octokit) {
			await interaction.editReply(await GetLoginRequestResponse(interaction));
			return;
		}

		const repos = await octokit.repos.listForAuthenticatedUser({
			per_page: 10,
			page: 1,
		});

		await interaction.editReply(
			await GetRepoListResponse(interaction, repos.data, 'list', '1')
		);
	}
);

new SubCommandHandler(
	{
		module: 'github',
		subcommandgroup: 'repo',
		subcommand: 'starred',
	},
	async (interaction, defer) => {
		await defer(false);
		const octokit = await GetOctokit(interaction.user.id);

		if (!octokit) {
			await interaction.editReply(await GetLoginRequestResponse(interaction));
			return;
		}

		const repos = await octokit.activity.listReposStarredByAuthenticatedUser({
			per_page: 10,
			page: 1,
		});

		await interaction.editReply(
			await GetRepoListResponse(interaction, repos.data, 'starred', '1')
		);
	}
);

new SubCommandHandler(
	{
		module: 'github',
		subcommandgroup: 'repo',
		subcommand: 'search',
	},
	async (interaction, defer) => {
		await defer(false);
		const octokit = await GetOctokit(interaction.user.id);
		const query = interaction.options.getString('query', true);

		if (!octokit) {
			await interaction.editReply(await GetLoginRequestResponse(interaction));
			return;
		}

		const repos = await octokit.search.repos({
			per_page: 10,
			page: 1,
			q: query,
		});
		const res = await GetRepoListResponse(
			interaction,
			repos.data.items,
			'search',
			'1',
			query
		);

		await interaction.editReply(res);
	}
);

async function GetRepoListResponse(
	interaction: Interaction,
	repos: RepoList,
	action: string,
	page: string,
	query = ''
): Promise<BaseMessageOptions> {
	const pagenumber = Number(page);

	const embeds: APIEmbed = {
		title: Translate(interaction.locale, 'github.RepoList'),
		fields: repos.map((repo) => ({
			name:
				repo.full_name.length > 100
					? `${repo.full_name.slice(0, 97)}...`
					: repo.full_name,
			value:
				repo.description || Translate(interaction.locale, 'github.NoDescription'),
		})),
		footer: {
			text: Translate(interaction.locale, 'global.page', { page }),
		},
		color: await database.GetColor(interaction.user.id),
		author: {
			name: query,
		},
	};

	const repooptions = repos.map((repo) => ({
		label: repo.full_name,
		value: JSON.stringify({
			owner: repo.owner?.login,
			name: repo.name,
		}),
		description: [`⭐ ${repo.stargazers_count}`, repo.language, repo.license?.name]
			.filter((info) => info)
			.join(' | '),
	}));

	const rows: APIActionRowComponent<APIButtonComponent | APISelectMenuComponent>[] = [
		{
			components: [
				{
					custom_id: JSON.stringify({
						module: 'github/repo/goto',
						method: action,
						page: `${pagenumber - 1}`,
						user: interaction.user.id,
					}),
					style: ButtonStyle.Primary,
					type: ComponentType.Button,
					emoji: ARROW_LEFT_EMOJI,
					disabled: page === '1',
				},
				{
					custom_id: JSON.stringify({
						module: 'github/repo/goto',
						method: action,
						page: `${pagenumber + 1}`,
						user: interaction.user.id,
					}),
					style: ButtonStyle.Primary,
					type: ComponentType.Button,
					emoji: ARROW_RIGHT_EMOJI,
					disabled: repos.length < 10,
				},
			],
			type: ComponentType.ActionRow,
		},
		{
			components: [
				{
					custom_id: JSON.stringify({
						module: 'github/repo/choose',
						user: interaction.user.id,
					}),
					type: ComponentType.StringSelect,
					options:
						repooptions.length === 0
							? [
									{
										label: 'null',
										value: 'null',
									},
							  ]
							: repooptions,
					placeholder: Translate(interaction.locale, 'github.SelectRepo'),
					disabled: repooptions.length === 0,
				},
			],
			type: ComponentType.ActionRow,
		},
	];

	if (repos.length === 0) {
		embeds.fields!.push({
			name: Translate(interaction.locale, 'github.EmptyRepoPageName'),
			value: Translate(interaction.locale, 'github.EmptyRepoPageValue'),
		});
		rows.pop();
	}

	return {
		embeds: [embeds],
		components: rows,
	};
}

new ComponentHandler<ButtonInteraction>(
	'github/repo/goto',
	async (interaction, defer, componentdata) => {
		const octokit = await GetOctokit(interaction.user.id);
		const pagenumber = Number(componentdata.page);
		const { user } = componentdata;

		if (!octokit) {
			await interaction.reply(await GetLoginRequestResponse(interaction));
			return;
		}
		if (user !== interaction.user.id) {
			const errembed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'global.InvalidUser'),
			};

			await interaction.reply({
				embeds: [errembed],
				ephemeral: true,
			});
			return;
		}

		const query = interaction.message.embeds[0].author?.name;

		await defer();

		let repos: RepoList = [];
		switch (componentdata.method) {
			case 'list':
				repos = (
					await octokit.repos.listForAuthenticatedUser({
						per_page: 10,
						page: pagenumber,
					})
				).data;
				break;

			case 'search':
				repos = (
					await octokit.search.repos({
						per_page: 10,
						page: pagenumber,
						q: query!,
					})
				).data.items;
				break;

			case 'starred':
				repos = (
					await octokit.activity.listReposStarredByAuthenticatedUser({
						per_page: 10,
						page: pagenumber,
					})
				).data;
				break;

			// No Default
		}

		await interaction.editReply(
			await GetRepoListResponse(
				interaction,
				repos,
				componentdata.method,
				componentdata.page,
				query
			)
		);
	}
);

new ComponentHandler<StringSelectMenuInteraction>(
	'github/repo/choose',
	async (interaction, defer, componentdata) => {
		const octokit = await GetOctokit(interaction.user.id);
		const { owner, name } = JSON.parse(interaction.values[0]);
		const { user } = componentdata;

		if (!octokit) {
			await interaction.reply(await GetLoginRequestResponse(interaction));
			return;
		}
		if (user !== interaction.user.id) {
			const errembed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'global.InvalidUser'),
			};

			await interaction.reply({
				embeds: [errembed],
				ephemeral: true,
			});
			return;
		}

		await defer();
		const { data: repo } = await octokit.repos.get({
			owner,
			repo: name,
		});

		const response: BaseMessageOptions = await GetRepoPlayload(
			octokit,
			repo,
			interaction
		);

		if (repo.private) {
			await interaction.deleteReply();
			await interaction.followUp({
				...response,
				ephemeral: true,
			});
		} else {
			await interaction.editReply(response);
		}
	}
);

new ComponentHandler<ButtonInteraction>(
	'github/repo/star',
	async (interaction, defer, componentdata) => {
		const octokit = await GetOctokit(interaction.user.id);
		const [owner, name] = interaction.message.embeds[0].title!.split('/');
		const { user } = componentdata;

		if (!octokit) {
			await interaction.reply(await GetLoginRequestResponse(interaction));
			return;
		}
		if (user !== interaction.user.id) {
			const errembed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'global.InvalidUser'),
			};

			await interaction.reply({
				embeds: [errembed],
				ephemeral: true,
			});
			return;
		}

		await defer();

		const starred = await octokit.activity
			.checkRepoIsStarredByAuthenticatedUser({
				owner,
				repo: name,
			})
			.then(() => true)
			.catch(() => false);

		await octokit.activity[
			starred ? 'unstarRepoForAuthenticatedUser' : 'starRepoForAuthenticatedUser'
		]({
			owner,
			repo: name,
		});

		const { data: repo } = await octokit.repos.get({
			owner,
			repo: name,
		});

		await interaction.editReply(
			await GetRepoPlayload(octokit, repo, interaction, starred)
		);
	}
);
