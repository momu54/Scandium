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

import zh_tw from '../lang/zh_tw.json' assert { type: 'json' };
import en_us from '../lang/en_us.json' assert { type: 'json' };
import { TranslateVariables } from '../typing.js';
import _ from 'lodash';
import { Interaction } from 'discord.js';

export function Translate(
	interaction: Interaction,
	key: string,
	variables?: TranslateVariables,
) {
	let rawtext: string;
	switch (interaction.locale) {
		case 'zh-TW':
			rawtext = _.get(zh_tw, key);
			break;
		default:
			rawtext = _.get(en_us, key);
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
	}
	return text;
}
