/**
 * @author momu54
 * @license MIT
 * @see [Github]{@link https://github.com/momu54/me/}
 */

import { Languages, TranslateVariables } from '../typing.ts';
import _ from 'lodash';
import { LocalizationMap, Locale } from 'discord.js';
import { readdir } from 'fs/promises';
const languages: Languages = {};

async function LoadLanguages() {
	const files = await readdir('./lang/');

	for (const file of files) {
		if (!file.endsWith('.json')) continue;
		languages[file.replace('.json', '')] = (
			await import(`../lang/${file}`, {
				assert: {
					type: 'json',
				},
			})
		).default;
		console.log(`[main/translate] Success loading lang ./modules/${file}`);
	}
}

export function Translate(
	locale: Locale,
	key: string,
	variables?: TranslateVariables
): string {
	let rawtext = _.get(languages[locale], key);
	rawtext ||= _.get(languages['en-US'], key);
	if (!variables) return rawtext;
	return ReplaceVariables(rawtext, variables);
}

function ReplaceVariables(text: string, variables: TranslateVariables) {
	while (text.includes('{') && text.includes('}')) {
		const firstbracket = text.indexOf('{');
		const lastbracket = text.indexOf('}');
		const variableinrawtext = text.slice(firstbracket, lastbracket + 1);
		const variablename = variableinrawtext.replace('{', '').replace('}', '');
		text = text.replace(variableinrawtext, variables[variablename]);
	}
	return text;
}

export function CommandLocalizations(command: string): LocalizationMap {
	return GetAllTranslations(`${command}.title`);
}

export function SubCommandLocalizations(
	command: string,
	subcommand: string
): LocalizationMap {
	return GetAllTranslations(`${command}.subcmds.${subcommand}`);
}

export function OptionLocalizations(command: string, option: string): LocalizationMap {
	return GetAllTranslations(`${command}.options.${option}`);
}

function GetAllTranslations(key: string): LocalizationMap {
	const localizations: LocalizationMap = {};
	for (const language in languages) {
		localizations[language as Locale] = Translate(
			language as Locale,
			key
		)?.toLowerCase();
	}
	return localizations;
}

await LoadLanguages();
