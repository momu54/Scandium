import {
	APIActionRowComponent,
	APIButtonComponent,
	APIEmbed,
	BaseMessageOptions,
	ButtonInteraction,
	ButtonStyle,
	ComponentType,
	Interaction,
} from 'discord.js';
import { CreateComponentHandler, CreateSubCommandHandler } from '../../app.ts';
import { GetColor } from '../../utils/database.ts';
import { Translate } from '../../utils/translate.ts';
import { GetLoginRequestResponse, GetOctokit } from '../../utils/github.ts';
import { ComponentData, DeferReplyMethod, RepoList } from '../../typing.ts';
import { ARROW_LEFT_EMOJI, ARROW_RIGHT_EMOJI } from '../../utils/emoji.ts';

CreateSubCommandHandler(
	{
		module: 'github',
		subcommandgroup: 'repo',
		subcommand: 'list',
	},
	async (interaction) => {
		const octokit = await GetOctokit(interaction.user.id);

		if (!octokit) {
			await interaction.reply(await GetLoginRequestResponse(interaction));
			return;
		}

		const repos = await octokit.repos.listForAuthenticatedUser({
			per_page: 10,
			page: 1,
		});

		await interaction.reply({
			...(await GetRepoListResponse(interaction, repos.data, 'list', '1')),
			ephemeral: true,
		});
	}
);

CreateSubCommandHandler(
	{
		module: 'github',
		subcommandgroup: 'repo',
		subcommand: 'search',
	},
	async (interaction, defer) => {
		await defer(true);
		const octokit = await GetOctokit(interaction.user.id);
		const query = interaction.options.getString('query', true);

		if (!octokit) {
			await interaction.reply(await GetLoginRequestResponse(interaction));
			return;
		}

		const repos = await octokit.search.repos({
			per_page: 10,
			page: 1,
			q: query,
		});

		await interaction.editReply(
			await GetRepoListResponse(interaction, repos.data.items, 'search', '1', query)
		);
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
			name: repo.full_name,
			value: repo.description || 'No description',
		})),
		footer: {
			text: Translate(interaction.locale, 'global.page', { page }),
		},
		color: await GetColor(interaction.user.id),
		author: {
			name: query,
		},
	};

	if (repos.length === 0) {
		embeds.fields!.push({
			name: Translate(interaction.locale, 'github.EmptyRepoPageName'),
			value: Translate(interaction.locale, 'github.EmptyRepoPageValue'),
		});
	}

	const row: APIActionRowComponent<APIButtonComponent> = {
		components: [
			{
				custom_id: JSON.stringify({
					module: 'github/repo',
					action: `goto`,
					method: action,
					page: `${pagenumber - 1}`,
				}),
				style: ButtonStyle.Primary,
				type: ComponentType.Button,
				emoji: ARROW_LEFT_EMOJI,
				disabled: page === '1',
			},
			{
				custom_id: JSON.stringify({
					module: 'github/repo',
					action: `goto`,
					method: action,
					page: `${pagenumber + 1}`,
				}),
				style: ButtonStyle.Primary,
				type: ComponentType.Button,
				emoji: ARROW_RIGHT_EMOJI,
				disabled: repos.length < 10,
			},
		],
		type: ComponentType.ActionRow,
	};

	return {
		embeds: [embeds],
		components: [row],
	};
}

async function GotoHandler(
	interaction: ButtonInteraction,
	defer: DeferReplyMethod,
	componentdata: ComponentData
) {
	const octokit = await GetOctokit(interaction.user.id);
	const pagenumber = Number(componentdata.page);

	if (!octokit) {
		await interaction.reply(await GetLoginRequestResponse(interaction));
		return;
	}

	const query = interaction.message.embeds[0].author?.name;

	await defer();

	const repos =
		componentdata.method === 'list'
			? (
					await octokit.repos.listForAuthenticatedUser({
						per_page: 10,
						page: pagenumber,
					})
			  ).data
			: (
					await octokit.search.repos({
						per_page: 10,
						page: pagenumber,
						q: query!,
					})
			  ).data.items;

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

CreateComponentHandler<ButtonInteraction>(
	'github/repo',
	async (interaction, defer, componentdata) => {
		switch (componentdata.action) {
			case 'goto':
				await GotoHandler(interaction, defer, componentdata);
				break;

			// No Default
		}
	}
);
