/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import {
	MessageComponentInteraction,
	ModalSubmitInteraction,
	ChatInputCommandInteraction,
	ApplicationCommandData,
} from 'discord.js';
import {
	AllCommandInteraction,
	InteractionCallBackDatas,
	InteractionCallback,
	StringObject,
	SubCommandCallbackPath,
	SubCommandHandlers,
} from '../typing.ts';
import { CommandLocalizations } from './translate.ts';

export const commands: StringObject<ScandiumCommand<AllCommandInteraction>> = {};
export const componenthandlers: InteractionCallBackDatas<MessageComponentInteraction> =
	{};
export const modalhandlers: InteractionCallBackDatas<ModalSubmitInteraction> = {};
export const subcommandhandlers: SubCommandHandlers<ChatInputCommandInteraction> = {};

export class ScandiumCommand<InteractionType extends AllCommandInteraction> {
	constructor(
		command: ApplicationCommandData,
		callback?: InteractionCallback<InteractionType>,
		isadmincommand: boolean = false
	) {
		if (!isadmincommand) {
			command.nameLocalizations ||= CommandLocalizations(command.name);
		}
		commands[command.name] = {
			command,
			callback: callback as InteractionCallback<AllCommandInteraction>,
			isadmincommand,
		};

		this.command = command;
		this.callback = callback;
		this.isadmincommand = isadmincommand;
	}

	public command: ApplicationCommandData;
	public callback?: InteractionCallback<InteractionType>;
	public isadmincommand: boolean;
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

export function CreateSubCommandHandler(
	{ module, subcommandgroup, subcommand = '$main' }: SubCommandCallbackPath,
	callback: InteractionCallback<ChatInputCommandInteraction>
) {
	if (!subcommandhandlers[module]) subcommandhandlers[module] = {};
	if (!subcommandhandlers[module][subcommandgroup || subcommand])
		subcommandhandlers[module][subcommandgroup || subcommand] = {};
	subcommandhandlers[module][subcommandgroup || subcommand][subcommand] = {
		callback: callback as InteractionCallback<ChatInputCommandInteraction>,
	};
}
