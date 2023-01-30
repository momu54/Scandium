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
