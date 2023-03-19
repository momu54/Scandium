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
	ChatInputCommandInteraction,
} from 'discord.js';
import { AuthQueue, DeferReplyMethod } from '../../typing.ts';
import {
	GetColor,
	SetGithubToken,
	RemoveGithubToken,
	GetGithubToken,
} from '../../utils/database.ts';
import {
	ADD_PERSON_EMOJI,
	DELETE_PERSON_EMOJI,
	PERSON_EMOJI,
} from '../../utils/emoji.ts';
import { Translate } from '../../utils/translate.ts';
import fastify from 'fastify';
import { readFile } from 'fs/promises';
import { OAuthApp } from '@octokit/oauth-app';
import { setTimeout } from 'timers/promises';
import { CreateComponentHandler, CreateSubCommandHandler } from '../../app.ts';

const app = fastify({
	http2: true,
	https: {
		key: await readFile('./login/key.pem'),
		cert: await readFile('./login/cert.pem'),
	},
});
const html = await readFile('./login/index.html', 'utf8');
const authqueue: AuthQueue = {};
const oauthapp = new OAuthApp({
	clientId: process.env.clientid!,
	clientSecret: process.env.clientsecret!,
});
const AUTH_SCOPES = ['repo'].join(' ');

CreateSubCommandHandler(
	{
		module: 'github',
		subcommand: 'auth',
	},
	async (interaction: ChatInputCommandInteraction, defer: DeferReplyMethod) => {
		const token = await GetGithubToken(interaction.user.id);
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
	const resolve = authqueue[state as string];
	resolve?.(code as string);
	return html.replace('{status}', `${resolve ? 'Success' : 'Timeout'}`);
});

await app.listen({
	port: Number(process.env.callbackport),
	host: '::',
});
console.log('[github/login] Server started');

export async function LoginHandler(interaction: ButtonInteraction) {
	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'github.login'),
		color: await GetColor(interaction.user.id),
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
	const code = await WaitAuth(uuid);

	if (code) {
		const { authentication } = await oauthapp.createToken({
			code,
			state: interaction.user.id,
		});
		const { token, scopes } = authentication;
		if (!scopes.includes('repo')) {
			const errembed: APIEmbed = {
				title: Translate(interaction.locale, 'error.title'),
				description: Translate(interaction.locale, 'github.MissingScope'),
				color: await GetColor(interaction.user.id),
			};
			await interaction.editReply({ embeds: [errembed], components: [] });
			return;
		}

		await SetGithubToken(interaction.user.id, authentication.token);
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
			color: await GetColor(interaction.user.id),
		};
		await interaction.editReply({ embeds: [errembed], components: [] });
	}
}

export async function LogoutHandler(
	interaction: ButtonInteraction,
	defer: DeferReplyMethod
) {
	await RemoveGithubToken(interaction.user.id);
	const response = await GetAuthPlayLoad(interaction, defer);
	await interaction.update(response);
}

function WaitAuth(uuid: string): Promise<string | null> {
	// skipcq: JS-0031
	return new Promise(async (resolve) => {
		authqueue[uuid] = resolve;
		await setTimeout(36000000);
		resolve(null);
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
		color: await GetColor(interaction.user.id),
	};

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setLabel(Translate(interaction.locale, 'github.login'))
				.setStyle(ButtonStyle.Success)
				.setCustomId(
					JSON.stringify({
						module: 'github',
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
						module: 'github',
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

			await RemoveGithubToken(interaction.user.id);
		}
	}

	return {
		embeds: [embed],
		components: [row],
	};
}

CreateComponentHandler<ButtonInteraction>(
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
