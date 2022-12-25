import zh_tw from '../lang/zh_tw.json' assert { type: 'json' };
import en_us from '../lang/en_us.json' assert { type: 'json' };
import { TranslateVariables } from '../typing.ts';
import { get } from 'https://deno.land/x/lodash_es@v0.0.2/mod.ts';
import { Interaction } from 'https://deno.land/x/discordeno@17.0.1/mod.ts';

export function Translate(
	interaction: Interaction,
	key: string,
	variables?: TranslateVariables
) {
	let rawtext: string;
	switch (interaction.locale) {
		case 'zh-TW':
			rawtext = get(zh_tw, key);
			break;
		default:
			rawtext = get(en_us, key);
			break;
	}
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
		// console.log(text);
	}
	return text;
}
