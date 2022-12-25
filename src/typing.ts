import { CommandInteraction, ApplicationCommandType } from 'discord.js';

export interface Commands {
	[key: string]: Command;
}

export interface Command {
	callback: CommandCallback;
	type: ApplicationCommandType;
}

export type CommandCallback = (
	interaction: CommandInteraction,
	defer: () => Promise<void>
) => Promise<void>;

export interface TranslateVariables {
	[key: string]: string;
}
