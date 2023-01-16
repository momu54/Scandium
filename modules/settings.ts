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
	APIEmbed,
	ActionRowBuilder,
	ChatInputCommandInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import { CreateCommand, config } from '../app.js';
import { CommandLocalizations, Translate } from '../utils/translate.js';

CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'settings',
		description: 'Change the settings.',
		nameLocalizations: CommandLocalizations('settings'),
	},
	async (interaction) => {
		const userconfig = config[interaction.user.id];
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'settings.title'),
			description: Translate(interaction.locale, 'settings.desc'),
			fields: [],
		};
		let options: StringSelectMenuOptionBuilder[] = [];
		for (const moduleconfigkey in userconfig) {
			const moduleconfig = userconfig[moduleconfigkey];
			let values = '';
			const translatedkey = Translate(
				interaction.locale,
				`${moduleconfigkey}.title`,
			);
			for (const moduleconfigsubkey in moduleconfig) {
				const usermoduleconfigsubvalue = moduleconfig[moduleconfigsubkey];
				switch (typeof usermoduleconfigsubvalue) {
					case 'number':
						values += `${moduleconfigsubkey} - ${usermoduleconfigsubvalue.toString()}`;
						break;

					case 'boolean':
						values += `${moduleconfigsubkey} - ${
							usermoduleconfigsubvalue ? '✅' : '❌'
						}`;
						break;
				}
			}
			embed.fields?.push({
				name: translatedkey,
				value: values,
			});
			options.push(
				new StringSelectMenuOptionBuilder()
					.setValue(moduleconfigkey)
					.setLabel(translatedkey),
			);
		}

		const menu = new StringSelectMenuBuilder()
			.setPlaceholder(Translate(interaction.locale, 'settings.menu'))
			.setCustomId(
				JSON.stringify({
					module: interaction.commandName,
				}),
			)
			.addOptions(options);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
		await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });
	},
);
