import {
	Bot,
	Interaction,
	InteractionCallbackData,
	Message,
} from 'https://deno.land/x/discordeno@17.0.1/mod.ts';

export interface Commands {
	[key: string]: CommandCallback;
}

export type CommandCallback = (
	bot: Bot,
	interaction: Interaction,
	reply: ResponseMethods
) => Promise<void>;

export interface TranslateVariables {
	[key: string]: string;
}

export interface ResponseMethods {
	send(response: InteractionCallbackData): Promise<void>;
	edit(response: InteractionCallbackData): Promise<Message | undefined>;
	defer(): Promise<void>;
}
