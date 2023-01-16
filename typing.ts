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

import { ApplicationCommandType } from 'discord.js';

export interface Commands<InteractionType> {
	[key: string]: Command<InteractionType>;
}

export interface Command<InteractionType> {
	callback: CommandCallback<InteractionType>;
	type: ApplicationCommandType;
}

export type CommandCallback<InteractionType> = (
	interaction: InteractionType,
	defer: () => Promise<void>,
) => Promise<any>;

export type TranslateVariables = StringObject<string>;

export type AnyInteraction = any;

export type Config = StringObject<StringObject<StringObject<boolean | number>>>;

export type Languages = StringObject<any>;

export interface StringObject<ValueType> {
	[key: string]: ValueType;
}
