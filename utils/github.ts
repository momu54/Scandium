/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { Octokit } from '@octokit/rest';
import { database } from './database.ts';
import {
	APIActionRowComponent,
	APIButtonComponent,
	APIEmbed,
	BaseMessageOptions,
	ButtonStyle,
	ComponentType,
	Interaction,
	InteractionReplyOptions,
	Locale,
	MessagePayload,
	inlineCode,
} from 'discord.js';
import { Translate } from './translate.ts';
import {
	BRANCH_EMOJI_STRING,
	LANGUAGE_EMOJI_MAP,
	QUESTION_EMOJI_STRING,
	STAR_EMOJI,
	STAR_EMOJI_FILLED,
	STATUS_EMOJI_MAP,
} from './emoji.ts';
import { RepoStatus } from '../typing.ts';
import { Endpoints } from '@octokit/types';
import { InlineLink } from './text.ts';

export async function GetOctokit(user: string) {
	const token = await database.GetGithubToken(user);
	if (!token) return null;
	return new Octokit({
		auth: token,
	});
}

export async function GetLoginRequestResponse(
	interaction: Interaction
): Promise<InteractionReplyOptions | MessagePayload> {
	return {
		embeds: [
			{
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'github.LoginRequest'),
				color: await database.GetColor(interaction.user.id),
			},
		],
		ephemeral: true,
	};
}

export function GetLanguageWithIcon(language: string | null, locale: Locale) {
	language ||= Translate(locale, 'github.OtherLanguage');

	return `${LANGUAGE_EMOJI_MAP[language] ?? QUESTION_EMOJI_STRING} ${language}`;
}

export function GetStatusWithIcon(
	locale: Locale,
	{ archived, private: isprivate }: RepoStatus
) {
	const status = archived ? 'archived' : isprivate ? 'private' : 'public';
	const translate = Translate(locale, `github.status.${status}`);

	return `${STATUS_EMOJI_MAP[status]} ${translate}`;
}

export async function GetRepoPlayload(
	octokit: Octokit,
	repo: Endpoints['GET /repos/{owner}/{repo}']['response']['data'],
	interaction: Interaction,
	starred?: boolean
): Promise<BaseMessageOptions> {
	const { data: branches } = await octokit.repos
		.listBranches({
			owner: repo.owner.login,
			repo: repo.name,
			per_page: 4,
		})
		.catch(() => ({ data: null }));

	const { data: commits } = await octokit.repos
		.listCommits({
			per_page: 5,
			owner: repo.owner.login,
			repo: repo.name,
		})
		.catch(() => ({ data: null }));

	starred ||= await octokit.activity
		.checkRepoIsStarredByAuthenticatedUser({
			owner: repo.owner.login,
			repo: repo.name,
		})
		.then(() => true)
		.catch(() => false);

	const embed: APIEmbed = {
		title: `${repo.owner.login}/${repo.name}`,
		url: repo.html_url,
		description:
			repo.description || Translate(interaction.locale, 'github.NoDescription'),
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
				name: Translate(interaction.locale, 'github.fork'),
				value: repo.forks_count.toString(),
				inline: true,
			},
			{
				name: Translate(interaction.locale, 'github.watcher'),
				value: repo.watchers_count.toString(),
				inline: true,
			},
		],
		image: {
			url: `https://opengraph.githubassets.com/eddbb7c789a899c80220d7b2e52832007cfd81362fee54746836c1ceb1b1014e/${repo.full_name}`,
		},
		author: {
			name: repo.owner.login,
			icon_url: repo.owner.avatar_url,
		},
		color: await database.GetColor(interaction.user.id),
	};

	const rows: APIActionRowComponent<APIButtonComponent>[] = [
		{
			components: [
				{
					type: ComponentType.Button,
					emoji: starred ? STAR_EMOJI_FILLED : STAR_EMOJI,
					custom_id: JSON.stringify({
						module: 'github/repo/star',
						user: interaction.user.id,
					}),
					style: ButtonStyle.Primary,
					label: repo.stargazers_count.toString(),
				},
			],
			type: ComponentType.ActionRow,
		},
		// {
		// 	components: [
		// 		{
		// 			type: ComponentType.Button,
		// 			emoji: ,
		// 			custom_id: JSON.stringify({
		// 				module: 'github/repo/star',
		// 				user: interaction.user.id,
		// 			}),
		// 			style: ButtonStyle.Primary,
		// 		},
		// 	],
		// 	type: ComponentType.ActionRow,
		// },
	];

	if (branches) {
		embed.fields?.push({
			name: Translate(interaction.locale, 'github.branch'),
			value: branches
				.map(
					(branch) =>
						`${BRANCH_EMOJI_STRING} ${InlineLink(
							inlineCode(branch.commit.sha.slice(0, 7)),
							`https://github.com/${repo.full_name}/commit/${branch.commit.sha}`
						)} ${branch.name}`
				)
				.join('\n'),
		});
	}
	if (commits) {
		embed.fields?.push({
			name: Translate(interaction.locale, 'github.commit'),
			value: commits
				.map(
					(commit) =>
						`${InlineLink(
							inlineCode(commit.sha.slice(0, 7)),
							commit.html_url
						)} ${commit.commit.message.split('\n')[0]}`
				)
				.join('\n'),
		});
	}

	return {
		embeds: [embed],
		components: rows,
	};
}
