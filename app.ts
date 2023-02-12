/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { CheckUser, AddUser, GetColor } from './utils/database.js';
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

client.on(Events.Debug, (debugmsg) => console.log(`[discord.js/info] ${debugmsg}`));

client.on(Events.Error, console.error);

client.on(Events.InteractionCreate, async (interaction) => {
	const embed: APIEmbed = {
		title: Translate(interaction.locale, 'processing.title'),
		description: Translate(interaction.locale, 'processing.desc'),
		color: await GetColor(interaction.user.id),
	};
	let data: StringObject<any>;

	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
			if (!(await CheckUser(interaction.user.id)))
				await AddUser(interaction.user.id);
			console.log(`[main/info] command executed(${interaction.commandName})`);
			const savedcommand = commands[interaction.commandName];
			if (savedcommand.isadmincommand && interaction.user.id != process.env.admin)
				return;
			await savedcommand.callback(interaction, async () => {
				await interaction.reply({ embeds: [embed] });
			});
			break;
		case InteractionType.MessageComponent:
			if (!(await CheckUser(interaction.user.id)))
				await AddUser(interaction.user.id);
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
			if (!(await CheckUser(interaction.user.id)))
				await AddUser(interaction.user.id);
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

	for (const file of files) {
		if (!file.endsWith('.ts')) continue;
		await import(`./modules/${file}`);
		console.log(`[main/info] Success loading file ./modules/${file}`);
	}
}

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

await client.login(process.env.token);
