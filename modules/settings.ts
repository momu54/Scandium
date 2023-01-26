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
import { CreateCommand } from '../app.js';
import { GetConfigs } from '../utils/database.js';
import { CommandLocalizations, Translate } from '../utils/translate.js';

await CreateCommand<ChatInputCommandInteraction>(
	{
		name: 'settings',
		description: 'Change the settings.',
		nameLocalizations: CommandLocalizations('settings'),
	},
	async (interaction) => {
		const userconfig = await GetConfigs(interaction.user.id);
		const embed: APIEmbed = {
			title: Translate(interaction.locale, 'settings.title'),
			description: Translate(interaction.locale, 'settings.desc'),
			fields: [],
		};
		let options: StringSelectMenuOptionBuilder[] = [];
		const keys = Object.keys(userconfig!).filter((key) => key != 'user');
		console.log(keys);
		const modules = [...new Set(keys.map((key) => key.split('_')[0]))];
		console.log(modules);
		for (const module of modules) {
			const thismodulekeys = keys.filter((key) => key.includes(module));
			let value = '';
			for (let index = 0; index < thismodulekeys.length; index++) {
				const key = thismodulekeys[index];
				value += `${Translate(
					interaction.locale,
					`${module}.settings.${key.split('_')[1]}`,
				)} = ${userconfig![key]}`;
			}
			embed.fields?.push({
				name: Translate(interaction.locale, `${module}.title`),
				value: value,
			});
			console.log(options.filter((option) => option.data.value != module));
			console.log(
				modules.map((module) =>
					new StringSelectMenuOptionBuilder().setLabel(module).setValue(module),
				),
			);
			options.push(
				new StringSelectMenuOptionBuilder()
					.setLabel(Translate(interaction.locale, `${module}.title`))
					.setValue(module),
			);
			console.log(options);
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
