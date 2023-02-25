/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { CheckUser, AddConfigUser, GetColor } from './utils/database.js';
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
import { InteractionCallback, InteractionCallBackDatas, StringObject } from './typing.js';
import { CommandLocalizations, Translate } from './utils/translate.js';
import { readdir } from 'fs/promises';
import 'dotenv/config';
import { LOADING_EMOJI_STRING } from './utils/emoji.js';
import { ErrorHandler } from './utils/error.js';

export const client = new Client({
	intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.DirectMessages],
	partials: [Partials.Channel],
});

export const commands: InteractionCallBackDatas<CommandInteraction> = {};
const componenthandlers: InteractionCallBackDatas<MessageComponentInteraction> = {};
const modalhandlers: InteractionCallBackDatas<ModalSubmitInteraction> = {};

client.on(Events.ClientReady, async () => {
	console.log('[main/info] Ready!');
	console.log(`[main/info] Logined with ${client.user!.tag} (${client.user!.id})`);
	await LoadModules();
});

client.on(Events.Debug, (debugmsg) => {
	if (!debugmsg.includes('Failed to find guild, or unknown type for channel'))
		console.log(`[discord.js/debug] ${debugmsg}`);
});

client.on(Events.Error, console.error);

client.on(Events.InteractionCreate, async (interaction) => {
	const embed: APIEmbed = {
		title: `${LOADING_EMOJI_STRING} ${Translate(
			interaction.locale,
			'processing.title',
		)}`,
		description: Translate(interaction.locale, 'processing.desc'),
		color: await GetColor(interaction.user.id),
	};
	let data: StringObject<string>;

	if (!(await CheckUser(interaction.user.id))) await AddConfigUser(interaction.user.id);

	try {
		switch (interaction.type) {
			case InteractionType.ApplicationCommand:
				console.log(`[main/info] Command executed(${interaction.commandName})`);
				const savedcommand = commands[interaction.commandName];
				if (
					savedcommand.isadmincommand &&
					interaction.user.id != process.env.admin
				)
					return;
				await savedcommand.callback(
					interaction,
					async () => {
						await interaction.reply({ embeds: [embed] });
					},
					null,
				);
				break;
			case InteractionType.MessageComponent:
				data = JSON.parse(interaction.customId);
				console.log(`[main/info] Component emitted(${data.module})`);
				await componenthandlers[data.module].callback(
					interaction,
					async () => {
						await interaction.update({ embeds: [embed], components: [] });
					},
					data,
				);
				break;
			case InteractionType.ModalSubmit:
				data = JSON.parse(interaction.customId);
				console.log(`[main/info] Modal submitted(${data.module})`);
				await modalhandlers[data.module].callback(
					interaction,
					async () => {
						await interaction.reply({ embeds: [embed], components: [] });
					},
					data,
				);
				break;
		}
	} catch (error) {
		await ErrorHandler(interaction, error as Error);
	}
});

export async function CreateCommand<InteractionType extends CommandInteraction>(
	command: ApplicationCommandData,
	callback: InteractionCallback<InteractionType>,
	isadmincommand: boolean = false,
) {
	if (!isadmincommand) command.nameLocalizations ||= CommandLocalizations(command.name);
	commands[command.name] = {
		callback: callback as InteractionCallback<CommandInteraction>,
		isadmincommand,
		data: command,
	};
}

export function CreateComponentHandler<
	InteractionType extends MessageComponentInteraction,
>(module: string, callback: InteractionCallback<InteractionType>) {
	componenthandlers[module] = {
		callback: callback as InteractionCallback<MessageComponentInteraction>,
	};
}

export function CreateModalHandler<InteractionType extends ModalSubmitInteraction>(
	module: string,
	callback: InteractionCallback<InteractionType>,
) {
	modalhandlers[module] = {
		callback: callback as InteractionCallback<ModalSubmitInteraction>,
	};
}

async function LoadModules() {
	const files = await readdir('./modules/');
	const importtasks = files.map((file) => {
		const path = `./modules/${file}`;
		if (!file.endsWith('.ts')) {
			console.log(`[main/info] ${path} isn't typescript file, skipped`);
			return new Promise((resolve) => resolve(null));
		}
		return (async () => {
			console.log(`[main/info] Start loading file ${path}`);
			await import(path);
			console.log(`[main/info] Success loading file ${path}`);
		})();
	});

	await Promise.all(importtasks);
}

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

await client.login(process.env.token);
