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

import { APIEmbed, ChatInputCommandInteraction } from 'discord.js';
import { CreateCommand } from '../app.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'clear',
		description: 'Clear all commands',
	},
	async (interaction) => {
		await interaction.client.application.commands.set([]);
		const embed: APIEmbed = {
			title: 'clear',
			description: 'Clear all commands',
			color: 0x00ff00,
		};
		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
	true,
);
