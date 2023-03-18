/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
 */

import {
	ApplicationCommandData,
	ChatInputCommandInteraction,
	CommandInteraction,
	Message,
	MessageComponentInteraction,
	MessageContextMenuCommandInteraction,
	ModalSubmitInteraction,
	UserContextMenuCommandInteraction,
} from 'discord.js';

export interface InteractionCallBackDatas<
	InteractionType extends AllowedInteractionType
> {
	[key: string]: InteractionCallbackData<InteractionType>;
}

export interface InteractionCallbackData<InteractionType extends AllowedInteractionType> {
	callback: InteractionCallback<InteractionType>;
	isadmincommand?: boolean;
	data?: ApplicationCommandData;
}

export type InteractionCallback<InteractionType extends AllowedInteractionType> = (
	interaction: InteractionType,
	defer: DeferReplyMethod,
	componentdata: InteractionType extends CommandInteraction
		? null
		: StringObject<string>
) => Promise<any>;

export type DeferReplyMethod = (ephemeral?: boolean) => Promise<void>;

export type TranslateVariables = StringObject<string>;

export type Config = StringObject<StringObject<StringObject<boolean | number>>>;

export type Languages = StringObject<typeof import('./lang/zh-TW.json')>;

export interface StringObject<ValueType> {
	[key: string]: ValueType;
}

export interface Anime {
	episodes: string[];
	rating: string;
	type: string;
	agent: string;
	studio: string;
	director: string;
	supervisor: string;
	date: string;
	description: string;
	thumbnail: string;
	name: string;
}

interface BaseAnime {
	name: string;
	url: string;
	agelimit: boolean;
}

export type BaseAnimes = BaseAnime[];

interface OneOfAnimes extends BaseAnime {
	type: AnimesType.Normal;
}

export enum AnimeListType {
	Recent,
	Search,
}

export enum AnimesType {
	Normal,
	Todo,
}

export type Animes = OneOfAnimes[];

export interface AnimeMenuData {
	sn: string;
	issearch: boolean;
	istodo: boolean;
	episode: string;
}

export interface TodoAnime {
	user: string;
	sn: string;
	name: string;
	episode: string;
}

export interface AnimeFromTodo extends BaseAnime {
	episode: string;
	type: AnimesType.Todo;
}

export type AnimesFromTodo = AnimeFromTodo[];

export function IsTodoAnime(
	animedata: Animes | AnimesFromTodo
): animedata is AnimesFromTodo {
	return animedata[0].type === AnimesType.Todo;
}

export interface AuthQueue {
	[user: string]: ((code: string) => void) | undefined;
}

export type RunCodeFunction = (msg: Message<boolean>) => unknown;

export type SubCommandHandlers<InteractionType extends AllowedInteractionType> =
	StringObject<StringObject<InteractionCallBackDatas<InteractionType>>>;

type AllowedInteractionType =
	| AllCommandInteraction
	| MessageComponentInteraction
	| ModalSubmitInteraction;

export type AllCommandInteraction =
	| ChatInputCommandInteraction
	| MessageContextMenuCommandInteraction
	| UserContextMenuCommandInteraction;

export interface SubCommandCallbackPath {
	module: string;
	subcommandgroup?: string;
	subcommand?: string;
}
