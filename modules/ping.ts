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

import { CreateCommand, client } from '../app.js';
import { Translate } from '../utils/translate.js';
import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'ping',
		description: 'Get bot ping',
	},
	async (interaction, _defer) => {
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'ping.title'),
			description: Translate(interaction.locale, 'ping.desc', {
				ping: client.ws.ping.toString(),
			}),
		};

		await interaction.reply({
			embeds: [embed],
			ephemeral: true,
		});
	},
);
