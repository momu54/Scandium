/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { randomUUID } from 'crypto';
import {
	ButtonInteraction,
	APIEmbed,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Interaction,
	BaseMessageOptions,
	Locale,
} from 'discord.js';
import { AuthQueue, DeferReplyMethod } from '../../typing.ts';
import { database } from '../../utils/database.ts';
import {
	ADD_PERSON_EMOJI,
	DELETE_PERSON_EMOJI,
	PERSON_EMOJI,
} from '../../utils/emoji.ts';
import { Translate } from '../../utils/translate.ts';
import { readFile } from 'fs/promises';
import { OAuthApp } from '@octokit/oauth-app';
import { setTimeout } from 'timers/promises';
import { ComponentHandler, SubCommandHandler } from '../../utils/register.ts';
import { Listen, app } from '../server.ts';

const html = await readFile('./login/index.html', 'utf8');
const authqueue: AuthQueue = {};
const oauthapp = new OAuthApp({
	clientId: process.env.clientid!,
	clientSecret: process.env.clientsecret!,
});
const AUTH_SCOPES = ['repo'].join(' ');

new SubCommandHandler(
	{
		module: 'github',
		subcommand: 'auth',
	},
	async (interaction, defer) => {
		const token = await database.GetGithubToken(interaction.user.id);
		const response = await GetAuthPlayLoad(interaction, defer, token);
		if (token) {
			await interaction.editReply(response);
		} else {
			await interaction.reply({
				...response,
				ephemeral: true,
			});
		}
	}
);

app.get<{
	Querystring: {
		state: string;
		code: string;
	};
}>('/github/:user', (req, reply) => {
	const { state, code } = req.query;
	if (!state || !code) {
		reply.code(400);
		return 'Bad Request';
	}
	reply.header('Content-Type', 'text/html');
	const { resolve, locale } = authqueue[state as string];
	resolve?.(code as string);
	return html
		.replace('{status}', `${resolve ? 'Success' : 'Timeout'}`)
		.replace(
			'{message}',
			Translate(locale, `github.AuthMessage.${resolve ? 'success' : 'failed'}`)
		);
});

await Listen();

export async function LoginHandler(interaction: ButtonInteraction) {
	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'github.login'),
		color: await database.GetColor(interaction.user.id),
		description: Translate(interaction.locale, 'github.LoggingIn'),
	};
	const uuid = randomUUID();
	const url = `https://github.com/login/oauth/authorize?client_id=${process.env.clientid}&redirect_uri=${process.env.callbackurl}/${interaction.user.id}&scope=${AUTH_SCOPES}&state=${uuid}`;
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setLabel(Translate(interaction.locale, 'github.login'))
			.setStyle(ButtonStyle.Link)
			.setEmoji(ADD_PERSON_EMOJI)
			.setURL(url)
	);

	await interaction.update({ embeds: [embed], components: [row] });
	const code = await WaitAuth(uuid, interaction.locale);

	if (code) {
		const { authentication } = await oauthapp.createToken({
			code,
			state: uuid,
		});
		const { token, scopes } = authentication;
		if (!scopes.includes('repo')) {
			const errembed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'github.MissingScope'),
				color: await database.GetColor(interaction.user.id),
			};
			await interaction.editReply({ embeds: [errembed], components: [] });
			return;
		}

		await database.SetGithubToken(interaction.user.id, authentication.token);
		const response = await GetAuthPlayLoad(
			interaction,
			() => Promise.resolve(),
			token
		);
		await interaction.editReply(response);
	} else {
		const errembed: APIEmbed = {
			title: Translate(interaction.locale, 'error.title'),
			description: Translate(interaction.locale, 'github.timeout'),
			color: await database.GetColor(interaction.user.id),
		};
		await interaction.editReply({ embeds: [errembed], components: [] });
	}
}

export async function LogoutHandler(
	interaction: ButtonInteraction,
	defer: DeferReplyMethod
) {
	await database.RemoveGithubToken(interaction.user.id);
	const response = await GetAuthPlayLoad(interaction, defer);
	await interaction.update(response);
}

function WaitAuth(uuid: string, locale: Locale): Promise<string | null> {
	// skipcq: JS-0031
	return new Promise(async (resolve) => {
		authqueue[uuid] = { resolve, locale };
		await setTimeout(36000000);
		resolve(null);
		// skipcq: JS-0320
		delete authqueue[uuid];
	});
}

async function GetAuthPlayLoad(
	interaction: Interaction,
	defer: DeferReplyMethod,
	token?: string
): Promise<BaseMessageOptions> {
	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'github.NotLogedIn'),
		color: await database.GetColor(interaction.user.id),
	};

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setLabel(Translate(interaction.locale, 'github.login'))
				.setStyle(ButtonStyle.Success)
				.setCustomId(
					JSON.stringify({
						module: 'github/auth',
						action: 'login',
					})
				)
				.setDisabled(!!token)
				.setEmoji(ADD_PERSON_EMOJI)
		)
		.addComponents(
			new ButtonBuilder()
				.setLabel(Translate(interaction.locale, 'github.logout'))
				.setStyle(ButtonStyle.Danger)
				.setCustomId(
					JSON.stringify({
						module: 'github/auth',
						action: 'logout',
					})
				)
				.setDisabled(!token)
				.setEmoji(DELETE_PERSON_EMOJI)
		)
		.addComponents(
			new ButtonBuilder()
				.setLabel(Translate(interaction.locale, 'github.profile'))
				.setStyle(ButtonStyle.Link)
				.setEmoji(PERSON_EMOJI)
				.setURL('https://github.com/momu54/')
				.setDisabled(!token)
		);

	if (token) {
		await defer(true);
		embed.description = Translate(interaction.locale, 'github.AlreadyAuth');

		const octokit = new Octokit({
			auth: token,
		});
		let user: RestEndpointMethodTypes['users']['getAuthenticated']['response']['data'];
		try {
			({ data: user } = await octokit.rest.users.getAuthenticated());

			embed.title = user.login;
			embed.thumbnail = {
				url: user.avatar_url,
			};
			row.components[2].setURL(user.html_url);
			if (user.bio)
				embed.fields = [
					{
						name: Translate(interaction.locale, 'github.bio'),
						value: user.bio,
					},
				];
		} catch {
			row.components.forEach((component, index) => {
				if (index > 0) {
					component.setDisabled(true);
				} else {
					component.setDisabled(false);
				}
			});

			await database.RemoveGithubToken(interaction.user.id);
		}
	}

	return {
		embeds: [embed],
		components: [row],
	};
}

new ComponentHandler<ButtonInteraction>(
	'github/auth',
	async (interaction, defer, componentdata) => {
		switch (componentdata!.action) {
			case 'login':
				await LoginHandler(interaction);
				break;
			case 'logout':
				await LogoutHandler(interaction, defer);
				break;

			// No Default
		}
	}
);
