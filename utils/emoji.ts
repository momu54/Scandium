/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { APIMessageComponentEmoji } from 'discord.js';

export const PLAY_EMOJI: APIMessageComponentEmoji = {
	id: '1076096711618986094',
	name: 'fluent_play',
};

export const ADD_EMOJI: APIMessageComponentEmoji = {
	id: '1076077325654962197',
	name: 'fluent_add_circle',
};

export const DELETE_EMOJI: APIMessageComponentEmoji = {
	id: '1076093835203068045',
	name: 'fluent_delete',
};

export const ERROR_EMOJI: APIMessageComponentEmoji = {
	id: '1076682276668198964',
	name: 'fluent_error',
};

export const LOADING_EMOJI: APIMessageComponentEmoji = {
	id: '1055809489686773821',
	name: 'Loading',
	animated: true,
};

function ConvertEmojiToString(emoji: APIMessageComponentEmoji) {
	return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

export const ERROR_EMOJI_STRING = ConvertEmojiToString(ERROR_EMOJI);

export const LOADING_EMOJI_STRING = ConvertEmojiToString(LOADING_EMOJI);
