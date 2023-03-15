/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { CheckUser, AddConfigUser, GetColor } from './utils/database.ts';
import {
	Client,
	Events,
	InteractionType,
	APIEmbed,
	ApplicationCommandData,
	Partials,
	IntentsBitField,
	CommandInteraction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from 'discord.js';
import { InteractionCallback, InteractionCallBackDatas, StringObject } from './typing.ts';
import { CommandLocalizations, Translate } from './utils/translate.ts';
import { readdir } from 'fs/promises';
import 'dotenv/config';
import { LOADING_EMOJI_STRING } from './utils/emoji.ts';
import { ErrorHandler } from './utils/error.ts';

export const client = new Client({
	intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.DirectMessages],
	partials: [Partials.Channel],
});

export const commandhandlers: InteractionCallBackDatas<CommandInteraction> = {};
const componenthandlers: InteractionCallBackDatas<MessageComponentInteraction> = {};
const modalhandlers: InteractionCallBackDatas<ModalSubmitInteraction> = {};

client.on(Events.ClientReady, async (readiedclient) => {
	console.log('[main/info] Ready!');
	console.log(
		`[main/info] Logined with ${readiedclient.user.tag} (${readiedclient.user.id})`
	);
	await LoadModules();
	await readiedclient.application.fetch();
});

client.on(Events.Debug, (debugmsg) => {
	if (!debugmsg.includes('Failed to find guild, or unknown type for channel'))
		console.log(`[discord.js/debug] ${debugmsg}`);
});

client.on(Events.Error, console.error);

client.on(Events.InteractionCreate, async (interaction) => {
	if (!(await CheckUser(interaction.user.id))) await AddConfigUser(interaction.user.id);
	const embed: APIEmbed = {
		title: `${LOADING_EMOJI_STRING} ${Translate(
			interaction.locale,
			'processing.title'
		)}`,
		description: Translate(interaction.locale, 'processing.desc'),
		color: await GetColor(interaction.user.id),
	};
	let data: StringObject<string>;

	try {
		switch (interaction.type) {
			case InteractionType.ApplicationCommand: {
				console.log(`[main/info] Command executed(${interaction.commandName})`);
				const savedcommand = commandhandlers[interaction.commandName];
				if (
					savedcommand.isadmincommand &&
					interaction.user.id !== interaction.client.application.owner?.id
				) {
					const errembed: APIEmbed = {
						title: Translate(interaction.locale, 'error.title'),
						description: Translate(
							interaction.locale,
							'global.PremissionDenied'
						),
						color: await GetColor(interaction.user.id),
					};
					await interaction.reply({ embeds: [errembed], ephemeral: true });
					return;
				}
				await savedcommand.callback(
					interaction,
					async (ephemeral: boolean = true) => {
						await interaction.reply({ embeds: [embed], ephemeral });
					},
					null
				);
				break;
			}
			case InteractionType.MessageComponent: {
				data = JSON.parse(interaction.customId);
				console.log(`[main/info] Component emitted(${data.module})`);
				await componenthandlers[data.module].callback(
					interaction,
					async () => {
						await interaction.update({ embeds: [embed], components: [] });
					},
					data
				);
				break;
			}
			case InteractionType.ModalSubmit: {
				data = JSON.parse(interaction.customId);
				console.log(`[main/info] Modal submitted(${data.module})`);
				await modalhandlers[data.module].callback(
					interaction,
					async () => {
						await interaction.reply({ embeds: [embed], components: [] });
					},
					data
				);
				break;
			}

			// No Default
		}
	} catch (error) {
		await ErrorHandler(interaction, error as Error);
	}
});

export function CreateCommand<InteractionType extends CommandInteraction>(
	command: ApplicationCommandData,
	callback: InteractionCallback<InteractionType>,
	isadmincommand: boolean = false
) {
	if (!isadmincommand) command.nameLocalizations ||= CommandLocalizations(command.name);
	commandhandlers[command.name] = {
		callback: callback as InteractionCallback<CommandInteraction>,
		isadmincommand,
		data: command,
	};
}

export function CreateComponentHandler<
	InteractionType extends MessageComponentInteraction
>(module: string, callback: InteractionCallback<InteractionType>) {
	componenthandlers[module] = {
		callback: callback as InteractionCallback<MessageComponentInteraction>,
	};
}

export function CreateModalHandler<InteractionType extends ModalSubmitInteraction>(
	module: string,
	callback: InteractionCallback<InteractionType>
) {
	modalhandlers[module] = {
		callback: callback as InteractionCallback<ModalSubmitInteraction>,
	};
}

async function GetModulesPath(directory = './modules') {
	const paths = (await readdir(directory)).map((path) => `${directory}/${path}`);

	const resultpaths: string[] = [];

	for (const path of paths) {
		if (path.endsWith('.sm')) {
			console.log(`[modules/info] Finded submodule ${path}`);
			resultpaths.push(...(await GetModulesPath(path)));
			continue;
		}
		if (!path.endsWith('.ts')) {
			console.log(`[modules/info] ${path} isn't typescript file, skipped`);
			continue;
		}
		console.log(`[main/info] Finded typescript file ${path}`);
		resultpaths.push(path);
	}

	return resultpaths;
}

async function LoadModules() {
	const paths = await GetModulesPath();
	const importtasks = paths.map(async (path) => {
		console.log(`[main/info] Start loading file ${path}`);
		await import(path);
		console.log(`[main/info] Success loading file ${path}`);
	});

	await Promise.all(importtasks);
}

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

await client.login(process.env.token);
