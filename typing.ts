/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import {
	ApplicationCommandData,
	CommandInteraction,
	MessageComponentInteraction,
	ModalSubmitInteraction,
} from 'discord.js';

export interface InteractionCallBackDatas<
	InteractionType extends
		| CommandInteraction
		| MessageComponentInteraction
		| ModalSubmitInteraction,
> {
	[key: string]: InteractionCallbackData<InteractionType>;
}

export interface InteractionCallbackData<
	InteractionType extends
		| CommandInteraction
		| MessageComponentInteraction
		| ModalSubmitInteraction,
> {
	callback: InteractionCallback<InteractionType>;
	isadmincommand?: boolean;
	data?: ApplicationCommandData;
}

export type InteractionCallback<
	InteractionType extends
		| CommandInteraction
		| MessageComponentInteraction
		| ModalSubmitInteraction,
> = (
	interaction: InteractionType,
	defer: () => Promise<void>,
	data?: StringObject<string>,
) => Promise<any>;

export type TranslateVariables = StringObject<string>;

export type Config = StringObject<StringObject<StringObject<boolean | number>>>;

export type Languages = StringObject<any>;

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

interface OneOfAnimes {
	name: string;
	url: string;
	agelimit: boolean;
}

export enum AnimeListType {
	Recent,
	Search,
}

export type Animes = OneOfAnimes[];

export interface AnimeMenuData {
	sn: string;
	issearch: boolean;
}
