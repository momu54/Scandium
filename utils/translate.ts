/*
                       _oo0oo_
                      o8888888o
                      88" . "88
                      (| -_- |)
                      0\  =  /0
                    ___/`---'\___
                  .' \\|     | '.
                 / \\|||  :  ||| \
                / _||||| -:- |||||- \
               |   | \\\  -  / |   |
               | \_|  ''\---/''  |_/ |
               \  .-\__  '-'  ___/-. /
             ___'. .'  /--.--\  `. .'___
          ."" '<  `.___\_<|>_/___.' >' "".
         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
         \  \ `_.   \_ __\ /__ _/   .-` /  /
     =====`-.____`.___ \_____/___.-`___.-'=====
                       `=---='


     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

               佛主保佑         永無BUG
*/

import { Languages, TranslateVariables } from '../typing.js';
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
	variables?: TranslateVariables,
): string {
	let rawtext = _.get(languages[locale], key);
	rawtext ||= _.get(languages['en-US'], key);
	if (!variables) return rawtext;
	return ReplaceVariables(rawtext, variables);
}

function ReplaceVariables(text: string, variables: TranslateVariables) {
	while (true) {
		const firstbracket = text.indexOf('{');
		if (firstbracket == -1) break;
		const lastbracket = text.indexOf('}');
		const variableinrawtext = text.slice(firstbracket, lastbracket + 1);
		const variablename = variableinrawtext.replace('{', '').replace('}', '');
		text = text.replace(variableinrawtext, variables[variablename]);
	}
	return text;
}

export function CommandLocalizations(command: string): LocalizationMap {
	const localizations: LocalizationMap = {};
	for (const language in languages) {
		localizations[language as Locale] = Translate(
			language as Locale,
			`${command}.title`,
		)?.toLowerCase();
	}
	return localizations;
}

await LoadLanguages();
