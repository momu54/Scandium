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
	inlineCode,
} from 'discord.js';
import { CreateComponentHandler, CreateSubCommandHandler } from '../../app.ts';
import { GetColor } from '../../utils/database.ts';
import { Translate } from '../../utils/translate.ts';
import {
	GetLanguageWithIcon,
	GetLoginRequestResponse,
	GetOctokit,
	GetStatusWithIcon,
} from '../../utils/github.ts';
import { RepoList } from '../../typing.ts';
import {
	ARROW_LEFT_EMOJI,
	ARROW_RIGHT_EMOJI,
	BRANCH_EMOJI_STRING,
} from '../../utils/emoji.ts';

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
		color: await GetColor(interaction.user.id),
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
		description: [repo.language, `⭐ ${repo.stargazers_count}`, repo.license?.name]
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

CreateComponentHandler<ButtonInteraction>(
	'github/repo/goto',
	async (interaction, defer, componentdata) => {
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
);

CreateComponentHandler<StringSelectMenuInteraction>(
	'github/repo/choose',
	async (interaction, defer) => {
		const octokit = await GetOctokit(interaction.user.id);
		const { owner, name } = JSON.parse(interaction.values[0]);

		if (!octokit) {
			await interaction.reply(await GetLoginRequestResponse(interaction));
			return;
		}

		await defer();
		const { data: repo } = await octokit.repos.get({
			owner,
			repo: name,
		});

		const { data: branches } = await octokit.repos.listBranches({
			owner,
			repo: name,
		});

		await interaction.editReply({
			embeds: [
				{
					title: `${repo.owner.login}/${repo.name}`,
					url: repo.html_url,
					description:
						repo.description ||
						Translate(interaction.locale, 'github.NoDescription'),
					fields: [
						{
							name: Translate(interaction.locale, 'github.language'),
							value: GetLanguageWithIcon(repo.language, interaction.locale),
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'github.license'),
							value:
								repo.license?.name ||
								Translate(interaction.locale, 'github.OtherLicense'),
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'github.status.name'),
							value: GetStatusWithIcon(interaction.locale, {
								archived: repo.archived,
								private: repo.private,
							}),
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'github.star'),
							value: repo.stargazers_count.toString(),
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'github.fork'),
							value: repo.forks_count.toString(),
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'github.watcher'),
							value: repo.watchers_count.toString(),
							inline: true,
						},
						{
							name: Translate(interaction.locale, 'github.branch'),
							value: branches
								.map(
									(branch) =>
										`${BRANCH_EMOJI_STRING} ${inlineCode(
											branch.commit.sha.slice(0, 7)
										)} ${branch.name}`
								)
								.join('\n'),
							inline: true,
						},
					],
					image: {
						url: `https://opengraph.githubassets.com/eddbb7c789a899c80220d7b2e52832007cfd81362fee54746836c1ceb1b1014e/${repo.owner.login}/${repo.name}`,
					},
					author: {
						name: owner,
						icon_url: repo.owner.avatar_url,
					},
					color: await GetColor(interaction.user.id),
				},
			],
			components: [],
		});
	}
);
