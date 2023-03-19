/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/scandium/}
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

export const QUESTION_EMOJI: APIMessageComponentEmoji = {
	id: '1076750455016796190',
	name: 'fluent_question',
};

export const ADD_PERSON_EMOJI: APIMessageComponentEmoji = {
	id: '1081509100464115832',
	name: 'fluent_add_person',
};

export const DELETE_PERSON_EMOJI: APIMessageComponentEmoji = {
	id: '1081511181052817460',
	name: 'fluent_delete_person',
};

export const PERSON_EMOJI: APIMessageComponentEmoji = {
	id: '1081515590033879060',
	name: 'fluent_person',
};

export const ARROW_RIGHT_EMOJI: APIMessageComponentEmoji = {
	id: '1086926625410650173',
	name: 'fluent_arrow_right',
};

export const ARROW_LEFT_EMOJI: APIMessageComponentEmoji = {
	id: '1086930464146718771',
	name: 'fluent_arrow_left',
};

function ConvertEmojiToString(emoji: APIMessageComponentEmoji) {
	return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
}

export const ERROR_EMOJI_STRING = ConvertEmojiToString(ERROR_EMOJI);

export const LOADING_EMOJI_STRING = ConvertEmojiToString(LOADING_EMOJI);
