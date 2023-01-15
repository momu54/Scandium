import { ApplicationCommandType } from 'discord.js';

export interface Commands<InteractionType> {
	[key: string]: Command<InteractionType>;
}

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

export interface Command<InteractionType> {
	callback: CommandCallback<InteractionType>;
	type: ApplicationCommandType;
}

export type CommandCallback<InteractionType> = (
	interaction: InteractionType,
	defer: () => Promise<void>,
) => Promise<void>;

export interface TranslateVariables {
	[key: string]: string;
}

export type AnyInteraction = any;

export interface Config {
	[key: string]: {
		[key: string]: {
			[key: string]: boolean | number;
		};
	};
}

export interface Languages {
	[key: string]: any;
}
