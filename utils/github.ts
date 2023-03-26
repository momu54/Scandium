import { Octokit } from '@octokit/rest';
import { GetColor, GetGithubToken } from './database.ts';
import { Interaction, InteractionReplyOptions, MessagePayload } from 'discord.js';
import { Translate } from './translate.ts';
import { LANGUAGE_EMOJI_MAP } from './emoji.ts';

export async function GetOctokit(user: string) {
	const token = await GetGithubToken(user);
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
				color: await GetColor(interaction.user.id),
			},
		],
		ephemeral: true,
	};
}

export function GetLanguageWithIcon(language: string | null) {
	if (!language) return null;

	return `${LANGUAGE_EMOJI_MAP[language] ?? ''} ${language}`;
}
